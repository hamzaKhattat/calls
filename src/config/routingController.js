// src/controllers/routing.controller.js

const callRoutingService = require('../services/callRouting.service');
const csvParser = require('../utils/csvParser');
const db = require('../config/database');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');

const routingController = {
  async initialize(req, res) {
    try {
      await callRoutingService.initialize();
      res.status(200).json({ success: true, message: 'Call routing service initialized successfully' });
    } catch (error) {
      console.error('Error initializing call routing service:', error);
      res.status(500).json({ success: false, message: 'Failed to initialize call routing service' });
    }
  },

  async handleIncomingCall(req, res) {
    try {
      const { ani, dnis } = req.body;
      
      if (!ani || !dnis) {
        return res.status(400).json({ success: false, message: 'ANI and DNIS are required' });
      }
      
      const result = await callRoutingService.handleIncomingCall(ani, dnis);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error('Error handling incoming call:', error);
      res.status(500).json({ success: false, message: 'Failed to handle incoming call' });
    }
  },

  async handleReturnCall(req, res) {
    try {
      const { ani, did } = req.body;
      
      if (!ani || !did) {
        return res.status(400).json({ success: false, message: 'ANI and DID are required' });
      }
      
      const result = await callRoutingService.handleReturnCall(ani, did);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error('Error handling return call:', error);
      res.status(500).json({ success: false, message: 'Failed to handle return call' });
    }
  },

  async validateCall(req, res) {
    try {
      const { callId } = req.params;
      
      if (!callId) {
        return res.status(400).json({ success: false, message: 'Call ID is required' });
      }
      
      const result = await callRoutingService.validateCall(callId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error('Error validating call:', error);
      res.status(500).json({ success: false, message: 'Failed to validate call' });
    }
  },

  async uploadDids(req, res) {
    upload.single('file')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: 'File upload failed' });
      }

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      try {
        const { results, errors } = await csvParser.parseDids(req.file.path);

        if (errors.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Some DIDs are invalid',
            errors
          });
        }

        const result = await callRoutingService.uploadDids(results);
        res.status(200).json({
          success: true,
          message: `${result.count} DIDs uploaded successfully`
        });
      } catch (error) {
        console.error('Error processing CSV file:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to process CSV file'
        });
      } finally {
        // Clean up the uploaded file
        fs.unlinkSync(req.file.path);
      }
    });
  },

  async listDids(req, res) {
    try {
      const { page = 1, limit = 50, inUse } = req.query;
      
      let query = 'SELECT * FROM dids WHERE 1=1';
      const queryParams = [];
      
      if (inUse !== undefined) {
        query += ' AND in_use = ?';
        queryParams.push(inUse === 'true' || inUse === '1');
      }
      
      query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
      queryParams.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
      
      const [rows] = await db.query(query, queryParams);
      
      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) as total FROM dids WHERE 1=1';
      const countParams = [];
      
      if (inUse !== undefined) {
        countQuery += ' AND in_use = ?';
        countParams.push(inUse === 'true' || inUse === '1');
      }
      
      const [countRows] = await db.query(countQuery, countParams);
      
      res.status(200).json({
        success: true,
        data: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countRows[0].total,
          pages: Math.ceil(countRows[0].total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Error listing DIDs:', error);
      res.status(500).json({ success: false, message: 'Failed to list DIDs' });
    }
  },

  async getDidStatus(req, res) {
    try {
      const result = await callRoutingService.getDidsStatus();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error('Error getting DIDs status:', error);
      res.status(500).json({ success: false, message: 'Failed to get DIDs status' });
    }
  },

  async listRoutedCalls(req, res) {
    try {
      const { page = 1, limit = 50, status, startDate, endDate } = req.query;
      
      let query = 'SELECT * FROM routed_calls WHERE 1=1';
      const queryParams = [];
      
      if (status) {
        query += ' AND status = ?';
        queryParams.push(status);
      }
      
      if (startDate) {
        query += ' AND created_at >= ?';
        queryParams.push(startDate);
      }
      
      if (endDate) {
        query += ' AND created_at <= ?';
        queryParams.push(endDate);
      }
      
      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      queryParams.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
      
      const [rows] = await db.query(query, queryParams);
      
      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) as total FROM routed_calls WHERE 1=1';
      const countParams = [];
      
      if (status) {
        countQuery += ' AND status = ?';
        countParams.push(status);
      }
      
      if (startDate) {
        countQuery += ' AND created_at >= ?';
        countParams.push(startDate);
      }
      
      if (endDate) {
        countQuery += ' AND created_at <= ?';
        countParams.push(endDate);
      }
      
      const [countRows] = await db.query(countQuery, countParams);
      
      res.status(200).json({
        success: true,
        data: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countRows[0].total,
          pages: Math.ceil(countRows[0].total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Error listing routed calls:', error);
      res.status(500).json({ success: false, message: 'Failed to list routed calls' });
    }
  }
};

module.exports = routingController;