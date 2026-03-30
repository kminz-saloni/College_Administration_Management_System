/**
 * Monitoring & Health Check Endpoints
 * Provides APIs for performance monitoring and health status
 * 
 * File: Backend/routes/monitoring.js
 * 
 * Usage in server.js:
 * const monitoringRoutes = require('./routes/monitoring');
 * app.use('/api/monitoring', monitoringRoutes);
 */

const express = require('express');
const router = express.Router();
const logger = require('../config/logger');

/**
 * GET /api/monitoring/health
 * Returns application health status
 */
router.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.APP_VERSION || '1.0.0',
      memory: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
      },
      cpu: {
        loadAverage: os.loadavg(),
        cpuCount: os.cpus().length,
      },
    };

    // Check database connection
    const dbHealth = await checkDatabaseHealth();
    health.database = dbHealth;

    // Determine overall health
    if (dbHealth.connected) {
      health.status = 'healthy';
    } else {
      health.status = 'degraded';
    }

    res.json(health);
  } catch (error) {
    logger.error('Health check failed', error);
    res.status(503).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/monitoring/metrics
 * Returns performance metrics
 */
router.get('/metrics', (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      memory: {
        heapUsed: process.memoryUsage().heapUsed / 1024 / 1024,
        heapTotal: process.memoryUsage().heapTotal / 1024 / 1024,
        percentUsed: (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal * 100).toFixed(2),
      },
      process: {
        uptime: process.uptime(),
        pid: process.pid,
        cpuUsage: process.cpuUsage(),
      },
      node: {
        version: process.version,
      },
    };

    res.json(metrics);
  } catch (error) {
    logger.error('Metrics retrieval failed', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

/**
 * GET /api/monitoring/status
 * Returns detailed service status
 */
router.get('/status', async (req, res) => {
  try {
    const status = {
      timestamp: new Date().toISOString(),
      services: {
        api: 'online',
        database: 'checking...',
        cache: 'checking...',
      },
    };

    // Check database
    try {
      const dbHealth = await checkDatabaseHealth();
      status.services.database = dbHealth.connected ? 'online' : 'offline';
    } catch (error) {
      status.services.database = 'error';
    }

    // Redis check (if available)
    try {
      // This would be implemented if Redis is added
      status.services.cache = 'configured';
    } catch (error) {
      status.services.cache = 'not configured';
    }

    res.json(status);
  } catch (error) {
    logger.error('Status check failed', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

/**
 * GET /api/monitoring/ready
 * Kubernetes-style readiness probe
 * Returns 200 if service is ready to handle requests
 */
router.get('/ready', async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    
    if (dbHealth.connected) {
      res.status(200).json({ ready: true });
    } else {
      res.status(503).json({ ready: false, reason: 'database_unavailable' });
    }
  } catch (error) {
    res.status(503).json({ ready: false, reason: error.message });
  }
});

/**
 * GET /api/monitoring/live
 * Kubernetes-style liveness probe
 * Returns 200 if process is alive, 500 if should restart
 */
router.get('/live', (req, res) => {
  try {
    // Check if process is responsive
    const pid = process.pid;
    const uptime = process.uptime();
    
    // Fail if uptime is suspiciously low (might indicate frequent restarts)
    if (uptime < 10) {
      res.status(500).json({ 
        live: false, 
        reason: 'recent_restart',
        uptime 
      });
    } else {
      res.status(200).json({ live: true, uptime, pid });
    }
  } catch (error) {
    res.status(500).json({
      live: false,
      reason: error.message,
    });
  }
});

/**
 * Helper: Check database connection health
 */
async function checkDatabaseHealth() {
  try {
    // This assumes MongoDB connection is available globally
    // Adjust based on your actual database setup
    const mongoose = require('mongoose');
    
    const connection = mongoose.connection;
    const isConnected = connection.readyState === 1; // 1 = connected
    
    return {
      connected: isConnected,
      state: getConnectionStateName(connection.readyState),
      db: connection.name || 'unknown',
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
    };
  }
}

/**
 * Helper: Get human-readable connection state
 */
function getConnectionStateName(readyState) {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[readyState] || 'unknown';
}

/**
 * GET /api/monitoring/version
 * Returns application version and build info
 */
router.get('/version', (req, res) => {
  res.json({
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV,
    buildTime: process.env.BUILD_TIME || 'unknown',
    gitCommit: process.env.GIT_COMMIT || 'unknown',
  });
});

/**
 * POST /api/monitoring/simulate-error
 * Simulates an error for testing error tracking (dev only)
 */
router.post('/simulate-error', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      error: 'Not allowed in production',
    });
  }

  const error = new Error('Simulated error for testing error tracking');
  error.statusCode = 500;

  throw error;
});

module.exports = router;
