// src/routes/routing.routes.js

const express = require('express');
const router = express.Router();
const routingController = require('../controllers/routing.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Apply authentication middleware to all routes
router.use(authMiddleware.authenticate);

// Initialization
router.post('/initialize', routingController.initialize);

// Call handling
router.post('/incoming-call', routingController.handleIncomingCall);
router.post('/return-call', routingController.handleReturnCall);
router.post('/validate-call/:callId', routingController.validateCall);

// DID management
router.post('/upload-dids', routingController.uploadDids);
router.get('/dids', routingController.listDids);
router.get('/dids-status', routingController.getDidStatus);

// Routed calls
router.get('/routed-calls', routingController.listRoutedCalls);

module.exports = router;