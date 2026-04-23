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
const { seedSubjects } = require('./services/seederService');
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
 * Phase 2: Authentication routes ✓
 * Phase 3: Dashboard, Users, Classes ✓
 * Phase 4: Attendance ✓
 * Phase 5: Videos ✓
 * Phase 6: Events & Notifications ✓
 * Phase 7: Payments ✓
 * Phase 8: Analytics & Reporting ✓
 */

// Phase 2: Authentication routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Phase 3: Dashboard, Users, Classes routes
const dashboardRoutes = require('./routes/dashboard');
const usersRoutes = require('./routes/users');
const classesRoutes = require('./routes/classes');
const subjectsRoutes = require('./routes/subjects');

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/subjects', subjectsRoutes);

// Phase 4: Attendance routes
const attendanceRoutes = require('./routes/attendance');
app.use('/api/attendance', attendanceRoutes);

// Phase 5: Videos routes
const videosRoutes = require('./routes/videos');
app.use('/api/videos', videosRoutes);

// Phase 6: Events & Notifications routes
const eventsRoutes = require('./routes/events');
const notificationsRoutes = require('./routes/notifications');
app.use('/api/events', eventsRoutes);
app.use('/api/notifications', notificationsRoutes);

// Phase 7: Payments routes
const paymentsRoutes = require('./routes/payments');
app.use('/api/payments', paymentsRoutes);

// Phase 8: Analytics & Reporting routes
const analyticsRoutes = require('./routes/analytics');
app.use('/api/analytics', analyticsRoutes);

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
    // Connect to database (skip in test environment)
    if (config.app.env !== 'test') {
      logger.info('Starting College Admin Backend Application...');
      await connectDatabase();

      // Seed default subjects if none exist
      try {
        await seedSubjects();
      } catch (seedError) {
        logger.warn('Could not seed subjects on startup (may already exist)', { error: seedError.message });
      }
    }

    // Start Express server
    // Listen on 0.0.0.0 to accept both IPv4 and IPv6 connections
    const server = app.listen(config.app.port, '0.0.0.0', () => {
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
