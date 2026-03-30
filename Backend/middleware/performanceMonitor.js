/**
 * Performance Monitoring Middleware
 * Tracks request latency, success rates, and performance metrics
 * 
 * File: Backend/middleware/performanceMonitor.js
 */

const logger = require('../config/logger');

/**
 * Performance monitoring middleware
 * Tracks request duration and logs slow requests
 */
const performanceMonitor = (req, res, next) => {
  const startTime = Date.now();
  const startMemory = process.memoryUsage().heapUsed / 1024 / 1024; // MB
  
  // Override res.json to capture response
  const originalJson = res.json.bind(res);
  
  res.json = function(data) {
    const duration = Date.now() - startTime;
    const endMemory = process.memoryUsage().heapUsed / 1024 / 1024; // MB
    const memoryDelta = (endMemory - startMemory).toFixed(2);
    
    const metric = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      memoryDelta,
      userRole: req.user?.role || 'anonymous',
      userId: req.user?._id || null,
      query: req.query,
    };
    
    // Log slow requests
    if (duration > 1000) {
      logger.warn('Slow endpoint detected', {
        ...metric,
        severity: duration > 5000 ? 'error' : 'warn',
      });
    }
    
    // Log all requests in production debug
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`${req.method} ${req.path}`, {
        duration: `${duration}ms`,
        memory: `${memoryDelta}MB`,
        status: res.statusCode,
      });
    }
    
    // Store high-value metrics (optional: to database for analysis)
    if (duration > 500 || res.statusCode >= 400) {
      storePerformanceMetric(metric).catch(err => {
        logger.error('Failed to store performance metric', err);
      });
    }
    
    return originalJson.apply(this, arguments);
  };
  
  next();
};

/**
 * Store performance metrics for analysis
 * Can be enhanced to persist to database or external service
 */
async function storePerformanceMetric(metric) {
  try {
    // For MVP: just log
    if (metric.duration > 2000 || metric.statusCode >= 500) {
      logger.warn('Critical performance metric', metric);
    }
    
    // TODO: In production, store to MongoDB collection
    // const metricsCollection = db.collection('performance_metrics');
    // await metricsCollection.insertOne(metric);
  } catch (error) {
    logger.error('Error storing performance metric', error);
  }
}

/**
 * Error rate monitoring middleware
 * Tracks error count and error rate
 */
let errorCount = 0;
let errorRateWindow = new Date();

const errorRateMonitor = (err, req, res, next) => {
  errorCount++;
  
  // Check error rate every minute
  const now = new Date();
  if (now - errorRateWindow > 60000) {
    const errorRate = (errorCount / 60).toFixed(2); // errors per second
    
    if (errorRate > 0.05) { // More than 5% error rate
      logger.error('High error rate detected', {
        errorRate: `${errorRate} errors/sec`,
        total: errorCount,
      });
    }
    
    errorCount = 0;
    errorRateWindow = now;
  }
  
  next(err);
};

/**
 * Memory leak detection middleware
 * Warns if memory usage increases significantly
 */
let lastMemory = process.memoryUsage().heapUsed / 1024 / 1024;

const memoryLeakDetector = (req, res, next) => {
  const currentMemory = process.memoryUsage().heapUsed / 1024 / 1024;
  const memoryIncrease = currentMemory - lastMemory;
  
  // Warn if memory increased by more than 50MB
  if (memoryIncrease > 50) {
    logger.warn('Potential memory leak detected', {
      lastMemory: `${lastMemory.toFixed(2)}MB`,
      currentMemory: `${currentMemory.toFixed(2)}MB`,
      increase: `${memoryIncrease.toFixed(2)}MB`,
    });
  }
  
  lastMemory = currentMemory;
  next();
};

module.exports = {
  performanceMonitor,
  errorRateMonitor,
  memoryLeakDetector,
};
