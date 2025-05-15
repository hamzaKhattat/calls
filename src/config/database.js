/**
 * database.js
 * Database configuration and utility methods for the Call Generator and Dynamic Routing System
 */

const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

/**
 * Create a MySQL connection pool using environment variables
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'call_generator',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
  queueLimit: 0,
  timezone: '+00:00', // Store all timestamps in UTC
  charset: 'utf8mb4', // Support full UTF-8 character set
  debug: process.env.NODE_ENV === 'development' && process.env.DB_DEBUG === 'true',
  multipleStatements: process.env.DB_ALLOW_MULTIPLE_STATEMENTS === 'true'
});

// Log pool creation
logger.info(`Database pool created with connection limit: ${pool.config.connectionLimit}`);

/**
 * Database wrapper with enhanced functionality
 */
const db = {
  /**
   * Get a connection from the pool
   * @returns {Promise<mysql.PoolConnection>} Database connection
   */
  getConnection: async () => {
    try {
      const connection = await pool.getConnection();
      logger.debug('Database connection acquired');
      return connection;
    } catch (error) {
      logger.error(`Error acquiring database connection: ${error.message}`, { stack: error.stack });
      
      // Check if the error is related to pool connection limit
      if (error.code === 'ER_CON_COUNT_ERROR') {
        logger.warn('Connection pool limit reached. Consider increasing DB_CONNECTION_LIMIT');
      }
      
      throw error;
    }
  },

  /**
   * Execute a query with parameters
   * @param {string} sql - SQL query
   * @param {Array|Object} params - Query parameters
   * @returns {Promise<Array>} Query results [rows, fields]
   */
  query: async (sql, params = []) => {
    try {
      // Track query execution time
      const startTime = process.hrtime();
      
      // Execute the query
      const [rows, fields] = await pool.query(sql, params);
      
      // Calculate execution time
      const hrend = process.hrtime(startTime);
      const executionTime = hrend[0] * 1000 + hrend[1] / 1000000;
      
      // Log slow queries for performance monitoring
      if (executionTime > 500) {
        logger.warn(`Slow query (${executionTime.toFixed(2)}ms): ${sql.substring(0, 100)}${sql.length > 100 ? '...' : ''}`);
      } else {
        logger.debug(`Query executed (${executionTime.toFixed(2)}ms): ${sql.substring(0, 100)}${sql.length > 100 ? '...' : ''}`);
      }
      
      return [rows, fields];
    } catch (error) {
      logger.error(`Query error: ${error.message}`, { 
        stack: error.stack,
        query: sql.substring(0, 200),
        params: JSON.stringify(params).substring(0, 200)
      });
      
      // Enhance error with query information
      error.query = sql;
      error.params = params;
      
      throw error;
    }
  },

  /**
   * Execute a query and get only the rows
   * @param {string} sql - SQL query
   * @param {Array|Object} params - Query parameters
   * @returns {Promise<Array>} Query results (rows only)
   */
  queryRows: async (sql, params = []) => {
    const [rows] = await db.query(sql, params);
    return rows;
  },

  /**
   * Execute a query and get the first row
   * @param {string} sql - SQL query
   * @param {Array|Object} params - Query parameters
   * @returns {Promise<Object|null>} First row or null if no rows
   */
  queryOne: async (sql, params = []) => {
    const [rows] = await db.query(sql, params);
    return rows.length > 0 ? rows[0] : null;
  },

  /**
   * Execute a query and get the value of the first column of the first row
   * @param {string} sql - SQL query
   * @param {Array|Object} params - Query parameters
   * @returns {Promise<any|null>} Value or null if no rows
   */
  queryValue: async (sql, params = []) => {
    const row = await db.queryOne(sql, params);
    if (!row) return null;
    
    const keys = Object.keys(row);
    if (keys.length === 0) return null;
    
    return row[keys[0]];
  },

  /**
   * Execute a count query
   * @param {string} table - Table name
   * @param {string} [where=''] - WHERE clause
   * @param {Array} [params=[]] - Query parameters
   * @returns {Promise<number>} Count result
   */
  count: async (table, where = '', params = []) => {
    const whereClause = where ? `WHERE ${where}` : '';
    const sql = `SELECT COUNT(*) AS count FROM ${table} ${whereClause}`;
    const result = await db.queryOne(sql, params);
    return result ? parseInt(result.count, 10) : 0;
  },

  /**
   * Begin a transaction
   * @returns {Promise<mysql.PoolConnection>} Connection with transaction
   */
  beginTransaction: async () => {
    try {
      const connection = await db.getConnection();
      await connection.beginTransaction();
      logger.debug('Transaction started');
      return connection;
    } catch (error) {
      logger.error(`Begin transaction error: ${error.message}`, { stack: error.stack });
      throw error;
    }
  },

  /**
   * Execute multiple queries in a transaction
   * @param {Function} callback - Async function containing the transaction queries
   * @returns {Promise<any>} Result of the callback function
   */
  transaction: async (callback) => {
    let connection;
    try {
      connection = await db.getConnection();
      await connection.beginTransaction();
      logger.debug('Transaction started');
      
      const result = await callback(connection);
      
      await connection.commit();
      logger.debug('Transaction committed');
      return result;
    } catch (error) {
      logger.error(`Transaction error: ${error.message}`, { stack: error.stack });
      
      if (connection) {
        try {
          await connection.rollback();
          logger.debug('Transaction rolled back');
        } catch (rollbackError) {
          logger.error(`Transaction rollback error: ${rollbackError.message}`, { stack: rollbackError.stack });
        }
      }
      
      throw error;
    } finally {
      if (connection) {
        connection.release();
        logger.debug('Transaction connection released');
      }
    }
  },

  /**
   * Insert a record into a table
   * @param {string} table - Table name
   * @param {Object} data - Data to insert
   * @returns {Promise<number>} Inserted ID
   */
  insert: async (table, data) => {
    try {
      const [result] = await pool.query(`INSERT INTO ${table} SET ?`, data);
      return result.insertId;
    } catch (error) {
      logger.error(`Insert error: ${error.message}`, { 
        stack: error.stack,
        table,
        data: JSON.stringify(data).substring(0, 200)
      });
      throw error;
    }
  },

  /**
   * Insert multiple records into a table
   * @param {string} table - Table name
   * @param {Array<Object>} records - Array of records to insert
   * @param {number} [batchSize=100] - Number of records to insert in each batch
   * @returns {Promise<number>} Number of inserted records
   */
  insertBatch: async (table, records, batchSize = 100) => {
    if (!records || records.length === 0) return 0;
    
    // Get column names from the first record
    const columns = Object.keys(records[0]);
    if (columns.length === 0) return 0;
    
    // Process in batches to avoid query size limits
    let insertedCount = 0;
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      // Build placeholders
      const valuePlaceholders = batch.map(() => 
        `(${columns.map(() => '?').join(',')})`
      ).join(',');
      
      // Build query
      const sql = `INSERT INTO ${table} (${columns.join(',')}) VALUES ${valuePlaceholders}`;
      
      // Flatten values
      const values = batch.flatMap(record => columns.map(col => record[col]));
      
      try {
        const [result] = await pool.query(sql, values);
        insertedCount += result.affectedRows;
      } catch (error) {
        logger.error(`Batch insert error: ${error.message}`, { 
          stack: error.stack,
          table,
          batchSize,
          recordCount: batch.length
        });
        throw error;
      }
    }
    
    return insertedCount;
  },

  /**
   * Update records in a table
   * @param {string} table - Table name
   * @param {Object} data - Data to update
   * @param {string} where - WHERE clause
   * @param {Array} [params=[]] - WHERE parameters
   * @returns {Promise<number>} Number of affected rows
   */
  update: async (table, data, where, params = []) => {
    try {
      const [result] = await pool.query(`UPDATE ${table} SET ? WHERE ${where}`, [data, ...params]);
      return result.affectedRows;
    } catch (error) {
      logger.error(`Update error: ${error.message}`, { 
        stack: error.stack,
        table,
        data: JSON.stringify(data).substring(0, 200),
        where
      });
      throw error;
    }
  },

  /**
   * Delete records from a table
   * @param {string} table - Table name
   * @param {string} where - WHERE clause
   * @param {Array} [params=[]] - WHERE parameters
   * @returns {Promise<number>} Number of affected rows
   */
  delete: async (table, where, params = []) => {
    try {
      const [result] = await pool.query(`DELETE FROM ${table} WHERE ${where}`, params);
      return result.affectedRows;
    } catch (error) {
      logger.error(`Delete error: ${error.message}`, { 
        stack: error.stack,
        table,
        where
      });
      throw error;
    }
  },

  /**
   * Execute a stored procedure
   * @param {string} procedure - Procedure name
   * @param {Array} [params=[]] - Procedure parameters
   * @returns {Promise<Array>} Procedure results
   */
  call: async (procedure, params = []) => {
    try {
      // Build the procedure call with the correct number of parameter placeholders
      const placeholders = Array(params.length).fill('?').join(',');
      const sql = `CALL ${procedure}(${placeholders})`;
      
      const [results] = await pool.query(sql, params);
      return results;
    } catch (error) {
      logger.error(`Stored procedure error: ${error.message}`, { 
        stack: error.stack,
        procedure,
        params: JSON.stringify(params).substring(0, 200)
      });
      throw error;
    }
  },

  /**
   * Check if a table exists
   * @param {string} tableName - Table name
   * @returns {Promise<boolean>} True if table exists
   */
  tableExists: async (tableName) => {
    try {
      const sql = `
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = ? AND table_name = ?
      `;
      
      const result = await db.queryOne(sql, [process.env.DB_NAME || 'call_generator', tableName]);
      return result && result.count > 0;
    } catch (error) {
      logger.error(`Error checking if table exists: ${error.message}`, { stack: error.stack });
      throw error;
    }
  },

  /**
   * Get database server information
   * @returns {Promise<Object>} Database server information
   */
  getServerInfo: async () => {
    try {
      const [versionResult] = await pool.query('SELECT VERSION() as version');
      const [variablesResult] = await pool.query(`
        SHOW VARIABLES WHERE Variable_name IN (
          'max_connections', 'wait_timeout', 'interactive_timeout',
          'max_allowed_packet', 'character_set_database', 'character_set_server'
        )
      `);
      
      // Convert variables to an object
      const variables = {};
      variablesResult.forEach(row => {
        variables[row.Variable_name] = row.Value;
      });
      
      return {
        version: versionResult[0].version,
        variables
      };
    } catch (error) {
      logger.error(`Error getting database server info: ${error.message}`, { stack: error.stack });
      throw error;
    }
  },

  /**
   * Get pool statistics
   * @returns {Object} Pool statistics
   */
  getPoolStats: () => {
    return {
      connectionLimit: pool.config.connectionLimit,
      queueLimit: pool.config.queueLimit,
      activeConnections: pool._allConnections.length,
      freeConnections: pool._freeConnections.length,
      acquiringConnections: pool._acquiringConnections.length
    };
  },

  /**
   * End the connection pool (for graceful shutdown)
   * @returns {Promise<void>}
   */
  end: async () => {
    try {
      await pool.end();
      logger.info('Database connection pool closed');
    } catch (error) {
      logger.error(`Error closing database connection pool: ${error.message}`, { stack: error.stack });
      throw error;
    }
  },

  // Export the pool for direct access if needed
  pool
};

// Export the database interface
module.exports = db;