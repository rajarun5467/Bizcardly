const express = require('express');
const router = express.Router();
const { recordVisit, getAnalytics } = require('../controllers/visitorController');
const protect = require('../middleware/auth');

router.post('/:slug', recordVisit); // Public - record visit by slug
router.get('/analytics', protect, getAnalytics); // Private - get analytics

module.exports = router;
