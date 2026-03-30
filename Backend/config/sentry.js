/**
 * Sentry Error Tracking Configuration
 * Integrates error tracking and performance monitoring
 * 
 * File: Backend/config/sentry.js
 * 
 * Installation:
 * npm install @sentry/node @sentry/tracing
 * 
 * Usage in server.js:
 * const initSentry = require('./config/sentry');
 * initSentry(app);
 */

const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');

/**
 * Initialize Sentry error tracking
 * @param {Express.Application} app - Express app instance
 */
const initSentry = (app) => {
  const dsn = process.env.SENTRY_DSN;
  
  if (!dsn) {
    console.warn('⚠️  SENTRY_DSN not configured. Error tracking disabled.');
    console.warn('To enable Sentry:');
    console.warn('1. Create account at sentry.io');
    console.warn('2. Create new project for Node.js');
    console.warn('3. Add SENTRY_DSN to .env');
    return null;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    
    // Performance monitoring config
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Integrations for automatic error capture
    integrations: [
      // HTTP client error tracking
      new Sentry.Integrations.Http({ tracing: true }),
      
      // Express middleware for request tracking
      new Tracing.Integrations.Express({
        app: true,
        request: true,
        transaction: 'fn_name', // or 'path'
      }),
      
      // Unhandled exception tracking
      new Sentry.Integrations.OnUncaughtException(),
      
      // Unhandled promise rejection tracking
      new Sentry.Integrations.OnUnhandledRejection(),
      
      // Node.js-specific integrations
      new Sentry.Integrations.NodeFetcher(),
      
      // Mongo integration if available
      ...(process.env.ENABLE_MONGO_INTEGRATION === 'true' ? [
        new Sentry.Integrations.Mongo(),
      ] : []),
    ],
    
    // Release version for tracking deployments
    release: process.env.APP_VERSION || '1.0.0',
    
    // Allowed URLs for error capture
    allowUrls: [
      /http:\/\/localhost/,
      /http:\/\/127\.0\.0\.1/,
      /https:\/\/college-admin\.com/, // Update with actual domain
    ],
  });

  // Request handler must be first
  app.use(Sentry.Handlers.requestHandler());
  
  // Tracing middleware
  app.use(Sentry.Handlers.tracingHandler());

  return Sentry;
};

/**
 * Error handler middleware for Express
 * Captures errors and sends to Sentry
 */
const errorHandler = (err, req, res, next) => {
  if (Sentry) {
    Sentry.captureException(err, {
      tags: {
        endpoint: req.path,
        method: req.method,
        userId: req.user?._id,
        userRole: req.user?.role,
      },
      extra: {
        query: req.query,
        body: req.body, // Be careful with sensitive data
        ip: req.ip,
      },
      level: 'error',
    });
  }

  // Pass to Express error handler
  next(err);
};

/**
 * Helper to capture custom exceptions
 * Usage: captureException(error, 'Payment Processing', { paymentId: '123' })
 */
const captureException = (error, context = 'Unknown', extra = {}) => {
  if (!Sentry) return;

  Sentry.captureException(error, {
    contexts: {
      custom: {
        context,
        ...extra,
      },
    },
    tags: {
      context,
    },
  });
};

/**
 * Helper to capture messages (non-errors)
 * Usage: captureMessage('Payment processed', 'info', { paymentId: '123' })
 */
const captureMessage = (message, level = 'info', extra = {}) => {
  if (!Sentry) return;

  Sentry.captureMessage(message, {
    level,
    extra,
  });
};

/**
 * Set user context for error tracking
 * Call this after user authentication
 */
const setUserContext = (userId, email, role) => {
  if (!Sentry) return;

  Sentry.setUser({
    id: userId,
    email,
    username: role,
  });
};

/**
 * Clear user context on logout
 */
const clearUserContext = () => {
  if (!Sentry) return;
  Sentry.setUser(null);
};

module.exports = {
  initSentry,
  errorHandler: Sentry?.Handlers?.errorHandler?.() || errorHandler,
  captureException,
  captureMessage,
  setUserContext,
  clearUserContext,
};
