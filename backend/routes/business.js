const express = require('express');
const router = express.Router();
const { getBusiness, updateBusiness, getPublicBusiness, updateSocialLinks, updatePayment, updateLocation } = require('../controllers/businessController');
const protect = require('../middleware/auth');
const { uploadFields, uploadPayment } = require('../middleware/upload');

router.get('/', protect, getBusiness);
router.post('/', protect, uploadFields, updateBusiness);
router.put('/', protect, uploadFields, updateBusiness);
router.put('/social', protect, updateSocialLinks);
router.put('/payment', protect, uploadPayment, updatePayment);
router.put('/location', protect, updateLocation);
router.get('/slug/:slug', getPublicBusiness); // Public - no auth

module.exports = router;
