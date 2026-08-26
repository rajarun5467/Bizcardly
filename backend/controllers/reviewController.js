const Review = require('../models/Review');
const Business = require('../models/Business');

// @desc   Submit a review for a business (public)
// @route  POST /api/reviews/:businessId
// @access Public
exports.submitReview = async (req, res) => {
  try {
    const { name, email, rating, review } = req.body;
    const { businessId } = req.params;

    if (!name || !rating || !review) {
      return res.status(400).json({ success: false, message: 'Name, rating, and review are required.' });
    }

    const normalizedEmail = email ? email.trim().toLowerCase() : '';
    if (!normalizedEmail) {
      return res.status(400).json({ success: false, message: 'Please provide an email address.' });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found.' });
    }

    const existingReview = await Review.findOne({ businessId: business._id, email: normalizedEmail });
    if (existingReview) {
      return res.status(409).json({ success: false, message: 'You have already submitted a review using this email address. Only one review is allowed per email.' });
    }

    const newReview = await Review.create({
      businessId: business._id,
      name,
      email: normalizedEmail,
      rating: Number(rating),
      review,
    });

    res.status(201).json({ success: true, review: newReview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get public reviews for a business
// @route  GET /api/reviews/:businessId
// @access Public
exports.getReviewsByBusiness = async (req, res) => {
  try {
    const reviews = await Review.find({ businessId: req.params.businessId })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({ success: true, reviews, count: reviews.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get all reviews for the logged-in user's business
// @route  GET /api/reviews
// @access Private
exports.getReviews = async (req, res) => {
  try {
    const business = await Business.findOne({ userId: req.user._id });
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found.' });
    }

    const reviews = await Review.find({ businessId: business._id }).sort({ createdAt: -1 });
    res.json({ success: true, reviews, count: reviews.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Delete a review
// @route  DELETE /api/reviews/:id
// @access Private
exports.deleteReview = async (req, res) => {
  try {
    const business = await Business.findOne({ userId: req.user._id });
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found.' });
    }

    const review = await Review.findOne({ _id: req.params.id, businessId: business._id });
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    await review.deleteOne();
    res.json({ success: true, message: 'Review deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
