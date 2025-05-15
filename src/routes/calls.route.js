const express = require('express');
const router = express.Router();
const callsController = require('../controllers/calls.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Apply authentication middleware to all routes
router.use(authMiddleware.authenticate);

// Call generator control
router.post('/start', callsController.startCallGenerator);
router.post('/stop', callsController.stopCallGenerator);
router.get('/status', callsController.getGeneratorStatus);

// Call data management
router.post('/upload', callsController.uploadPhoneNumbers);
router.get('/list', callsController.listCalls);
router.get('/:id', callsController.getCallDetails);

module.exports = router;