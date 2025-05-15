const callGenerator = require('../services/call.service');
const csvParser = require('../utils/csvParser');
const db = require('../config/database');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const callsController = {
  async startCallGenerator(req, res) {
    try {
      await callGenerator.initialize();
      await callGenerator.start();
      res.status(200).json({ success: true, message: 'Call generator started successfully' });
    } catch (error) {
      console.error('Error starting call generator:', error);
      res.status(500).json({ success: false, message: 'Failed to start call generator' });
    }
  },

  async stopCallGenerator(req, res) {
    try {
      await callGenerator.stop();
      res.status(200).json({ success: true, message: 'Call generator stopped successfully' });
    } catch (error) {
      console.error('Error stopping call generator:', error);
      res.status(500).json({ success: false, message: 'Failed to stop call generator' });
    }
  },

  async getGeneratorStatus(req, res) {
    try {
      const status = {
        running: callGenerator.running,
        activeCallCount: callGenerator.activeCallCount,
        configuration: callGenerator.config
      };
      res.status(200).json(status);
    } catch (error) {
      console.error('Error getting generator status:', error);
      res.status(500).json({ success: false, message: 'Failed to get generator status' });
    }
  },

  async uploadPhoneNumbers(req, res) {
    upload.single('file')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: 'File upload failed' });
      }

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      try {
        const { results, errors } = await csvParser.parsePhoneNumbers(req.file.path);

        if (errors.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Some phone numbers are invalid',
            errors
          });
        }

        const result = await csvParser.savePhoneNumbers(results);
        res.status(200).json({
          success: true,
          message: `${result.count} phone numbers uploaded successfully`
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

  async listCalls(req, res) {
    try {
      const { page = 1, limit = 50, status, startDate, endDate } = req.query;
      
      let query = 'SELECT * FROM calls WHERE 1=1';
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
      let countQuery = 'SELECT COUNT(*) as total FROM calls WHERE 1=1';
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
      console.error('Error listing calls:', error);
      res.status(500).json({ success: false, message: 'Failed to list calls' });
    }
  },

  async getCallDetails(req, res) {
    try {
      const { id } = req.params;
      
      const [rows] = await db.query('SELECT * FROM calls WHERE id = ?', [id]);
      
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Call not found' });
      }
      
      res.status(200).json({
        success: true,
        data: rows[0]
      });
    } catch (error) {
      console.error('Error getting call details:', error);
      res.status(500).json({ success: false, message: 'Failed to get call details' });
    }
  }
};

module.exports = callsController;