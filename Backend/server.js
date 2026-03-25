/**
 * Express Server Entry Point
 * Initializes Express app with middleware and database connection
 * Per SRS 2.1 & 2.4: Server-side application operates on Node.js runtime
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config/environment');
const { connectDatabase } = require('./config/database');
const { requestLogger, notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

/**
 * Middleware Setup
 */

// Request logging
app.use(requestLogger);

// CORS Configuration (Per SRS 3.4: HTTPS and secure communication)
app.use(cors({
  origin: config.security.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parser
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// HTTP request logger (Morgan)
app.use(morgan(config.logging.format));

// Security headers (basic)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

/**
 * Health Check Endpoint
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend API is operational',
    timestamp: new Date().toISOString(),
    environment: config.app.env,
    uptime: process.uptime(),
  });
});

/**
 * Version Endpoint
 */
app.get('/api/version', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      version: '1.0.0',
      name: 'College Administration Management System - Backend',
      environment: config.app.env,
    },
  });
});

/**
 * Routes
 * Phase 2: Authentication routes
 * Phase 3+: Dashboard, Classes, Attendance, Videos, Events, Payments, Analytics
 */
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Additional routes will be added in subsequent phases:
// app.use('/api/dashboard', require('./routes/dashboard'));
// app.use('/api/users', require('./routes/users'));
// app.use('/api/classes', require('./routes/classes'));
// app.use('/api/attendance', require('./routes/attendance'));
// app.use('/api/videos', require('./routes/videos'));
// app.use('/api/events', require('./routes/events'));
// app.use('/api/payments', require('./routes/payments'));
// app.use('/api/analytics', require('./routes/analytics'));

/**
 * Error Handling
 */

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

/**
 * Start Server
 */
const startServer = async () => {
  try {
    // Connect to database
    logger.info('Starting College Admin Backend Application...');
    await connectDatabase();

    // Start Express server
    const server = app.listen(config.app.port, () => {
      logger.info(`✓ Server running on port ${config.app.port}`);
      logger.info(`✓ Environment: ${config.app.env}`);
      logger.info(`✓ API URL: ${config.app.backendUrl}`);
      logger.info(`✓ Frontend URL: ${config.app.frontendUrl}`);
      logger.info('✓ All middleware initialized');
      logger.info('✓ Ready to accept requests');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });

    return server;
  } catch (error) {
    logger.fatal(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Start server if this is the main module
 */
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
