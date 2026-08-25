const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { submitReview, getReviews, deleteReview } = require('../controllers/reviewController');

router.post('/:businessId', submitReview); // Public - submit review
router.get('/', protect, getReviews); // Private - get reviews for business owner
router.delete('/:id', protect, deleteReview); // Private - delete a review

module.exports = router;
