// src/app.js

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const config = require('./config/config');

// Routes
const authRoutes = require('./routes/auth.routes');
const callsRoutes = require('./routes/calls.routes');
const routingRoutes = require('./routes/routing.routes');
const configRoutes = require('./routes/config.routes');
const reportsRoutes = require('./routes/reports.routes');

// Create Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/calls', callsRoutes);
app.use('/api/routing', routingRoutes);
app.use('/api/config', configRoutes);
app.use('/api/reports', reportsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;