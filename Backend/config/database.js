/**
 * Database Configuration
 * MongoDB Atlas connection setup
 * Per SRS 7.3: Database model is designed using MongoDB, leveraging its schema-less flexibility
 */

const mongoose = require('mongoose');
const config = require('./environment');
const logger = require('../utils/logger');

/**
 * Connect to MongoDB Atlas
 */
const connectDatabase = async () => {
  try {
    logger.info('Connecting to MongoDB Atlas...');

    const connection = await mongoose.connect(config.database.mongoUri, {
      ...config.database.options,
    });

    logger.info(`MongoDB connected: ${connection.connection.host}`);
    logger.info(`Database: ${connection.connection.name}`);

    return connection;
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB
 */
const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
  } catch (error) {
    logger.error(`MongoDB disconnection error: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Handle connection events
 */
mongoose.connection.on('connected', () => {
  logger.info('Mongoose connection established');
});

mongoose.connection.on('error', (err) => {
  logger.error(`Mongoose connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  logger.info('Mongoose connection disconnected');
});

// Handle application termination
process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

module.exports = {
  connectDatabase,
  disconnectDatabase,
};
