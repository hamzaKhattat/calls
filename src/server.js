// src/server.js

/**
 * Call Generator and Dynamic Routing System
 * Main server entry point
 */

require('dotenv').config();
const http = require('http');
const app = require('./app');
const db = require('./config/database');
const asterisk = require('./config/asterisk');
const callGenerator = require('./services/call.service');
const callRoutingService = require('./services/callRouting.service');
const logger = require('./utils/logger');

// Server configuration
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

/**
 * Initialize server and services
 */
async function initialize() {
  logger.info('Starting Call Generator and Dynamic Routing System');
  
  try {
    // Test database connection
    logger.info('Testing database connection...');
    const connection = await db.getConnection();
    logger.info('Database connection established successfully');
    connection.release();
    
    // Connect to Asterisk (if enabled)
    if (process.env.ASTERISK_ENABLED === 'true') {
      logger.info('Connecting to Asterisk...');
      try {
        await asterisk.connect();
        logger.info('Asterisk connection established successfully');
      } catch (error) {
        logger.error(`Asterisk connection failed: ${error.message}`);
        logger.warn('System will start without Asterisk integration');
      }
    } else {
      logger.info('Asterisk integration disabled');
    }
    
    // Initialize services (optional startup configuration)
    if (process.env.AUTO_INITIALIZE_SERVICES === 'true') {
      try {
        logger.info('Initializing Call Generator service...');
        await callGenerator.initialize();
        logger.info('Call Generator service initialized');
      
        logger.info('Initializing Call Routing service...');
        await callRoutingService.initialize();
        logger.info('Call Routing service initialized');
      } catch (error) {
        logger.error(`Service initialization failed: ${error.message}`);
        logger.warn('Services will need to be initialized manually');
      }
    }
    
    // Start server
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info('Call Generator and Dynamic Routing System is ready');
    });
  } catch (error) {
    logger.error(`Server initialization failed: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Handle graceful shutdown
 */
function shutdown() {
  logger.info('Shutdown signal received. Shutting down gracefully...');
  
  // Create a shutdown timeout to ensure the process exits even if cleanup hangs
  const shutdownTimeout = setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000); // 30 seconds timeout
  
  // Close the HTTP server
  server.close(async () => {
    logger.info('HTTP server closed');
    
    try {
      // Stop services
      if (callGenerator.running) {
        logger.info('Stopping Call Generator...');
        await callGenerator.stop();
        logger.info('Call Generator stopped');
      }
      
      // Disconnect from Asterisk
      if (asterisk.connected) {
        logger.info('Disconnecting from Asterisk...');
        await asterisk.disconnect();
        logger.info('Asterisk disconnected');
      }
      
      // Close database connections
      logger.info('Closing database connections...');
      await db.end();
      logger.info('Database connections closed');
      
      // Clear the shutdown timeout
      clearTimeout(shutdownTimeout);
      
      logger.info('Shutdown complete. Exiting...');
      process.exit(0);
    } catch (error) {
      logger.error(`Error during shutdown: ${error.message}`);
      clearTimeout(shutdownTimeout);
      process.exit(1);
    }
  });
}

// Register signal handlers for graceful shutdown
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error(`Uncaught exception: ${error.message}`);
  logger.error(error.stack);
  
  // Exit the process to allow process manager to restart it
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled promise rejection: ${reason}`);
  // Do not exit the process for unhandled rejections, just log them
});

// Start the server
initialize();