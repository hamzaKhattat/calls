// src/controllers/auth.controller.js

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/database');
const config = require('../config/config');

const authController = {
  async login(req, res) {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required' });
      }
      
      const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
      
      if (rows.length === 0) {
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
      }
      
      const user = rows[0];
      
      const match = await bcrypt.compare(password, user.password);
      
      if (!match) {
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
      }
      
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );
      
      res.status(200).json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
          }
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Login failed' });
    }
  },
  
  async register(req, res) {
    try {
      const { username, password, email, role = 'user' } = req.body;
      
      if (!username || !password || !email) {
        return res.status(400).json({ success: false, message: 'Username, password, and email are required' });
      }
      
      // Check if username or email already exists
      const [existingRows] = await db.query(
        'SELECT * FROM users WHERE username = ? OR email = ?',
        [username, email]
      );
      
      if (existingRows.length > 0) {
        return res.status(409).json({ success: false, message: 'Username or email already exists' });
      }
      
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // Insert the new user
      await db.query(
        'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
        [username, hashedPassword, email, role]
      );
      
      res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ success: false, message: 'Registration failed' });
    }
  },
  
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Current password and new password are required' });
      }
      
      // Get the user
      const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
      
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      const user = rows[0];
      
      // Verify current password
      const match = await bcrypt.compare(currentPassword, user.password);
      
      if (!match) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect' });
      }
      
      // Hash the new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      
      // Update the password
      await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
      
      res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ success: false, message: 'Failed to change password' });
    }
  }
};

module.exports = authController;