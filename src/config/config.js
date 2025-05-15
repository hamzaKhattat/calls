// src/config/config.js

module.exports = {
  port: process.env.PORT || 3000,
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'call_generator'
  },
  
  asterisk: {
    host: process.env.ASTERISK_HOST || 'localhost',
    port: process.env.ASTERISK_PORT || 5038,
    username: process.env.ASTERISK_USERNAME || 'admin',
    password: process.env.ASTERISK_PASSWORD || 'admin'
  },
  
  servers: {
    S1: {
      name: 'External Server 1',
      trunk: 'trunk_s1',
      ip: process.env.SERVER_S1_IP || '192.168.1.101'
    },
    S2: {
      name: 'Our Server',
      trunk: 'trunk_s2',
      ip: process.env.SERVER_S2_IP || '192.168.1.102'
    },
    S3: {
      name: 'External Server 3',
      trunk: 'trunk_s3',
      ip: process.env.SERVER_S3_IP || '192.168.1.103'
    },
    S4: {
      name: 'Final Server',
      trunk: 'trunk_s4',
      ip: process.env.SERVER_S4_IP || '192.168.1.104'
    },
    Sx: {
      name: 'Intermediate Server',
      trunk: 'trunk_sx',
      ip: process.env.SERVER_SX_IP || '192.168.1.105'
    }
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  }
};