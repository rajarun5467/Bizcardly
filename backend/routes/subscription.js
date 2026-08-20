const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const {
  getMySubscription,
  getMyUsage,
  getPublicPlans,
  getPaymentInfo,
} = require('../controllers/subscriptionController');
const {
  createRequest,
  getMyRequests,
} = require('../controllers/subscriptionRequestController');

// Public
router.get('/plans', getPublicPlans);

// Private (user self-service)
router.get('/me', protect, getMySubscription);
router.get('/usage', protect, getMyUsage);
router.get('/payment-info', protect, getPaymentInfo);
router.post('/request', protect, uploadSingle, createRequest);
router.get('/my-requests', protect, getMyRequests);

module.exports = router;
