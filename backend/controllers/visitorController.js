const Visitor = require('../models/Visitor');
const Business = require('../models/Business');
const crypto = require('crypto');

// @desc   Record a visit to a business profile
// @route  POST /api/visitors/:slug
// @access Public
exports.recordVisit = async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Find business by slug
    const Business = require('../models/Business');
    const business = await Business.findOne({ slug });
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    const businessId = business._id;

    // Get IP and hash it for privacy
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex');

    // Prevent duplicate visits within 1 hour from same IP
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentVisit = await Visitor.findOne({
      businessId,
      ipHash,
      visitedAt: { $gte: oneHourAgo },
    });

    if (!recentVisit) {
      await Visitor.create({ businessId, ipHash });
    }

    res.json({ success: true, message: 'Visit recorded' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get analytics for current user's business
// @route  GET /api/analytics
// @access Private
exports.getAnalytics = async (req, res) => {
  try {
    const business = await Business.findOne({ userId: req.user._id });
    if (!business) return res.status(404).json({ success: false, message: 'Business not found' });

    const businessId = business._id;
    const now = new Date();

    // Date ranges
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, today, week, month] = await Promise.all([
      Visitor.countDocuments({ businessId }),
      Visitor.countDocuments({ businessId, visitedAt: { $gte: startOfToday } }),
      Visitor.countDocuments({ businessId, visitedAt: { $gte: startOfWeek } }),
      Visitor.countDocuments({ businessId, visitedAt: { $gte: startOfMonth } }),
    ]);

    // Last 7 days breakdown for chart
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayStart.getDate() + 1);

      const count = await Visitor.countDocuments({
        businessId,
        visitedAt: { $gte: dayStart, $lt: dayEnd },
      });

      last7Days.push({
        date: dayStart.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        views: count,
      });
    }

    res.json({
      success: true,
      analytics: { total, today, week, month, last7Days },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
