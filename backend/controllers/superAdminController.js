const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Business = require('../models/Business');
const Product = require('../models/Product');
const Service = require('../models/Service');
const Gallery = require('../models/Gallery');
const Video = require('../models/Video');
const Visitor = require('../models/Visitor');
const ActivityLog = require('../models/ActivityLog');
const PlatformSetting = require('../models/PlatformSetting');
const { Subscription } = require('../models/Subscription');
const SupportTicket = require('../models/SupportTicket');
const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = (fileBuffer, folder = 'bizcardly/platform') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

// Helper: log activity
const logActivity = async (adminId, adminName, action, targetType, targetId, description) => {
  try {
    await ActivityLog.create({ adminId, adminName, action, targetType, targetId, description });
  } catch (err) {
    console.error('Failed to log activity:', err.message);
  }
};

// Helper: get or create platform settings
const getSettings = async () => {
  let settings = await PlatformSetting.findOne();
  if (!settings) {
    settings = await PlatformSetting.create({});
  }
  return settings;
};

// @desc   SuperAdmin login
// @route  POST /api/superadmin/login
// @access Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Access denied. SuperAdmin privileges required.' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Your account has been blocked.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    await logActivity(user._id, user.name, 'admin_login', null, null, `SuperAdmin ${user.name} logged in`);

    res.json({
      success: true,
      message: 'SuperAdmin login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('SuperAdmin login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get dashboard stats
// @route  GET /api/superadmin/dashboard
// @access SuperAdmin
exports.getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysLater = new Date(now);
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

    const [
      totalUsers,
      blockedUsers,
      activeUsers,
      totalBusinesses,
      suspendedBusinesses,
      publishedBusinesses,
      totalProducts,
      totalServices,
      totalGallery,
      totalVideos,
      totalVisitors,
      freeUsers,
      proUsers,
      activeSubs,
      expiringSoon,
      openTickets,
      highPriorityTickets,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', isBlocked: true }),
      User.countDocuments({ role: 'user', isBlocked: false }),
      Business.countDocuments(),
      Business.countDocuments({ isSuspended: true }),
      Business.countDocuments({ isPublished: true, isSuspended: false }),
      Product.countDocuments(),
      Service.countDocuments(),
      Gallery.countDocuments(),
      Video.countDocuments(),
      Visitor.countDocuments(),
      Subscription.countDocuments({ plan: 'Free', status: 'active' }),
      Subscription.countDocuments({ plan: 'Pro', status: 'active' }),
      Subscription.countDocuments({ status: 'active' }),
      Subscription.countDocuments({ plan: 'Pro', status: 'active', expiryDate: { $gte: now, $lte: thirtyDaysLater } }),
      SupportTicket.countDocuments({ status: 'Open' }),
      SupportTicket.countDocuments({ priority: 'High', status: { $in: ['Open', 'In Progress'] } }),
    ]);

    // User growth - last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayStart.getDate() + 1);

      const count = await User.countDocuments({
        role: 'user',
        createdAt: { $gte: dayStart, $lt: dayEnd },
      });

      last7Days.push({
        date: dayStart.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        users: count,
      });
    }

    // Monthly growth - last 6 months
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const count = await User.countDocuments({
        role: 'user',
        createdAt: { $gte: date, $lt: nextMonth },
      });

      last6Months.push({
        month: date.toLocaleDateString('en-IN', { month: 'short' }),
        users: count,
      });
    }

    // Most visited businesses (top 5)
    const topBusinesses = await Visitor.aggregate([
      {
        $group: {
          _id: '$businessId',
          visitCount: { $sum: 1 },
        },
      },
      { $sort: { visitCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'businesses',
          localField: '_id',
          foreignField: '_id',
          as: 'business',
        },
      },
      { $unwind: '$business' },
      {
        $project: {
          businessName: '$business.businessName',
          slug: '$business.slug',
          logo: '$business.logo',
          visitCount: 1,
        },
      },
    ]);

    // Recently created businesses (last 5)
    const recentBusinesses = await Business.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name email')
      .select('businessName slug logo createdAt isSuspended');

    // Recent activity logs (last 10)
    const recentActivity = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('adminName userName action targetType description createdAt');

    res.json({
      success: true,
      dashboard: {
        stats: {
          totalUsers,
          blockedUsers,
          activeUsers,
          totalBusinesses,
          suspendedBusinesses,
          publishedBusinesses,
          totalProducts,
          totalServices,
          totalGallery,
          totalVideos,
          totalVisitors,
          freeUsers,
          proUsers,
          activeSubs,
          expiringSoon,
          openTickets,
          highPriorityTickets,
        },
        userGrowth7Days: last7Days,
        userGrowth6Months: last6Months,
        topBusinesses,
        recentBusinesses,
        recentActivity,
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get all users with pagination, search, filters
// @route  GET /api/superadmin/users
// @access SuperAdmin
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search, status, role } = req.query;

    let query = {};

    if (role && role !== 'all') {
      query.role = role;
    } else {
      query.role = 'user';
    }

    if (status === 'blocked') query.isBlocked = true;
    if (status === 'active') query.isBlocked = false;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-password'),
      User.countDocuments(query),
    ]);

    // Get business info for each user
    const userIds = users.map((u) => u._id);
    const businesses = await Business.find({ userId: { $in: userIds } }).select('userId businessName slug isSuspended');

    const usersWithBusiness = users.map((user) => {
      const biz = businesses.find((b) => b.userId.toString() === user._id.toString());
      return {
        ...user.toObject(),
        business: biz || null,
      };
    });

    res.json({
      success: true,
      users: usersWithBusiness,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get single user details
// @route  GET /api/superadmin/users/:id
// @access SuperAdmin
exports.getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const business = await Business.findOne({ userId: user._id });

    let businessStats = null;
    if (business) {
      const [products, services, gallery, videos, visitors] = await Promise.all([
        Product.countDocuments({ businessId: business._id }),
        Service.countDocuments({ businessId: business._id }),
        Gallery.countDocuments({ businessId: business._id }),
        Video.countDocuments({ businessId: business._id }),
        Visitor.countDocuments({ businessId: business._id }),
      ]);
      businessStats = { products, services, gallery, videos, visitors };
    }

    res.json({
      success: true,
      user,
      business,
      businessStats,
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Block/Unblock user
// @route  PATCH /api/superadmin/users/:id/status
// @access SuperAdmin
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'superadmin') {
      return res.status(400).json({ success: false, message: 'Cannot block a SuperAdmin account' });
    }

    user.isBlocked = isBlocked;
    await user.save();

    const action = isBlocked ? 'user_blocked' : 'user_unblocked';
    const description = `${isBlocked ? 'Blocked' : 'Unblocked'} user ${user.name} (${user.email})`;
    await logActivity(req.user._id, req.user.name, action, 'user', user._id, description);

    res.json({
      success: true,
      message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
      user: { id: user._id, name: user.name, email: user.email, isBlocked: user.isBlocked },
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Delete user and all associated data
// @route  DELETE /api/superadmin/users/:id
// @access SuperAdmin
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'superadmin') {
      return res.status(400).json({ success: false, message: 'Cannot delete a SuperAdmin account' });
    }

    const business = await Business.findOne({ userId: user._id });

    if (business) {
      await Promise.all([
        Product.deleteMany({ businessId: business._id }),
        Service.deleteMany({ businessId: business._id }),
        Gallery.deleteMany({ businessId: business._id }),
        Video.deleteMany({ businessId: business._id }),
        Visitor.deleteMany({ businessId: business._id }),
        Business.deleteOne({ _id: business._id }),
      ]);
    }

    await User.deleteOne({ _id: user._id });

    await logActivity(req.user._id, req.user.name, 'user_deleted', 'user', user._id, `Deleted user ${user.name} (${user.email}) and all associated data`);

    res.json({
      success: true,
      message: 'User and all associated data deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Reset user password
// @route  PATCH /api/superadmin/users/:id/password
// @access SuperAdmin
exports.resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'superadmin') {
      return res.status(400).json({ success: false, message: 'Cannot reset a SuperAdmin password' });
    }

    user.password = newPassword;
    await user.save();

    await logActivity(req.user._id, req.user.name, 'user_password_reset', 'user', user._id, `Reset password for user ${user.name} (${user.email})`);

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get all businesses
// @route  GET /api/superadmin/businesses
// @access SuperAdmin
exports.getBusinesses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search, status } = req.query;

    let query = {};

    if (status === 'suspended') query.isSuspended = true;
    if (status === 'active') query.isSuspended = false;
    if (status === 'published') { query.isPublished = true; query.isSuspended = false; }
    if (status === 'unpublished') query.isPublished = false;

    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
      ];
    }

    const [businesses, total] = await Promise.all([
      Business.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email')
        .select('-socialLinks -location -paymentQr -paymentQR'),
      Business.countDocuments(query),
    ]);

    // Get visitor counts for each business
    const businessIds = businesses.map((b) => b._id);
    const visitorCounts = await Visitor.aggregate([
      { $match: { businessId: { $in: businessIds } } },
      { $group: { _id: '$businessId', count: { $sum: 1 } } },
    ]);

    const businessesWithVisitors = businesses.map((biz) => {
      const vc = visitorCounts.find((v) => v._id.toString() === biz._id.toString());
      return {
        ...biz.toObject(),
        visitorCount: vc ? vc.count : 0,
      };
    });

    res.json({
      success: true,
      businesses: businessesWithVisitors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get businesses error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get single business details
// @route  GET /api/superadmin/businesses/:id
// @access SuperAdmin
exports.getBusinessDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid business ID' });
    }

    const business = await Business.findById(id).populate('userId', 'name email role isBlocked');
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    const [products, services, gallery, videos] = await Promise.all([
      Product.find({ businessId: business._id }).sort({ createdAt: -1 }),
      Service.find({ businessId: business._id }).sort({ createdAt: -1 }),
      Gallery.find({ businessId: business._id }).sort({ createdAt: -1 }),
      Video.find({ businessId: business._id }).sort({ createdAt: -1 }),
    ]);

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalVisitors, todayVisitors, weekVisitors, monthVisitors] = await Promise.all([
      Visitor.countDocuments({ businessId: business._id }),
      Visitor.countDocuments({ businessId: business._id, visitedAt: { $gte: startOfToday } }),
      Visitor.countDocuments({ businessId: business._id, visitedAt: { $gte: startOfWeek } }),
      Visitor.countDocuments({ businessId: business._id, visitedAt: { $gte: startOfMonth } }),
    ]);

    // Last 7 days visitor trend
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayStart.getDate() + 1);

      const count = await Visitor.countDocuments({
        businessId: business._id,
        visitedAt: { $gte: dayStart, $lt: dayEnd },
      });

      last7Days.push({
        date: dayStart.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        views: count,
      });
    }

    res.json({
      success: true,
      business,
      products,
      services,
      gallery,
      videos,
      analytics: {
        totalVisitors,
        todayVisitors,
        weekVisitors,
        monthVisitors,
        last7Days,
      },
    });
  } catch (error) {
    console.error('Get business details error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Suspend/Activate business
// @route  PATCH /api/superadmin/businesses/:id/status
// @access SuperAdmin
exports.updateBusinessStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isSuspended } = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid business ID' });
    }

    const business = await Business.findById(id);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    business.isSuspended = isSuspended;
    await business.save();

    const action = isSuspended ? 'business_suspended' : 'business_activated';
    const description = `${isSuspended ? 'Suspended' : 'Activated'} business ${business.businessName} (${business.slug})`;
    await logActivity(req.user._id, req.user.name, action, 'business', business._id, description);

    res.json({
      success: true,
      message: `Business ${isSuspended ? 'suspended' : 'activated'} successfully`,
      business: { id: business._id, businessName: business.businessName, isSuspended: business.isSuspended },
    });
  } catch (error) {
    console.error('Update business status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Delete business and all associated data
// @route  DELETE /api/superadmin/businesses/:id
// @access SuperAdmin
exports.deleteBusiness = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid business ID' });
    }

    const business = await Business.findById(id);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    await Promise.all([
      Product.deleteMany({ businessId: business._id }),
      Service.deleteMany({ businessId: business._id }),
      Gallery.deleteMany({ businessId: business._id }),
      Video.deleteMany({ businessId: business._id }),
      Visitor.deleteMany({ businessId: business._id }),
      Business.deleteOne({ _id: business._id }),
    ]);

    await logActivity(req.user._id, req.user.name, 'business_deleted', 'business', business._id, `Deleted business ${business.businessName} (${business.slug}) and all associated data`);

    res.json({
      success: true,
      message: 'Business and all associated data deleted successfully',
    });
  } catch (error) {
    console.error('Delete business error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get platform analytics
// @route  GET /api/superadmin/analytics
// @access SuperAdmin
exports.getAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOf30Days = new Date(now);
    startOf30Days.setDate(now.getDate() - 30);

    const [totalVisitors, todayVisitors, weekVisitors, monthVisitors, last30DaysVisitors] = await Promise.all([
      Visitor.countDocuments(),
      Visitor.countDocuments({ visitedAt: { $gte: startOfToday } }),
      Visitor.countDocuments({ visitedAt: { $gte: startOfWeek } }),
      Visitor.countDocuments({ visitedAt: { $gte: startOfMonth } }),
      Visitor.countDocuments({ visitedAt: { $gte: startOf30Days } }),
    ]);

    // Last 30 days visitor trend
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayStart.getDate() + 1);

      const count = await Visitor.countDocuments({
        visitedAt: { $gte: dayStart, $lt: dayEnd },
      });

      last30Days.push({
        date: dayStart.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        views: count,
      });
    }

    // Top 10 businesses by visitors
    const topBusinesses = await Visitor.aggregate([
      {
        $group: {
          _id: '$businessId',
          visitCount: { $sum: 1 },
        },
      },
      { $sort: { visitCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'businesses',
          localField: '_id',
          foreignField: '_id',
          as: 'business',
        },
      },
      { $unwind: '$business' },
      {
        $project: {
          businessName: '$business.businessName',
          slug: '$business.slug',
          logo: '$business.logo',
          visitCount: 1,
        },
      },
    ]);

    // User registrations - daily last 7 days
    const dailyRegistrations = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayStart.getDate() + 1);

      const count = await User.countDocuments({
        role: 'user',
        createdAt: { $gte: dayStart, $lt: dayEnd },
      });

      dailyRegistrations.push({
        date: dayStart.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        users: count,
      });
    }

    // Content stats
    const [totalProducts, totalServices, totalGallery, totalVideos] = await Promise.all([
      Product.countDocuments(),
      Service.countDocuments(),
      Gallery.countDocuments(),
      Video.countDocuments(),
    ]);

    res.json({
      success: true,
      analytics: {
        visitors: { total: totalVisitors, today: todayVisitors, week: weekVisitors, month: monthVisitors, last30Days: last30DaysVisitors },
        visitorTrend30Days: last30Days,
        topBusinesses,
        dailyRegistrations,
        contentStats: { totalProducts, totalServices, totalGallery, totalVideos },
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get content for moderation
// @route  GET /api/superadmin/moderation
// @access SuperAdmin
exports.getModerationContent = async (req, res) => {
  try {
    const { type } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let results = [];
    let total = 0;

    if (!type || type === 'products') {
      const [items, count] = await Promise.all([
        Product.find()
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate({
            path: 'businessId',
            select: 'businessName slug userId',
            populate: { path: 'userId', select: 'name email' },
          }),
        Product.countDocuments(),
      ]);
      results = items;
      total = count;
    } else if (type === 'services') {
      const [items, count] = await Promise.all([
        Service.find()
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate({
            path: 'businessId',
            select: 'businessName slug userId',
            populate: { path: 'userId', select: 'name email' },
          }),
        Service.countDocuments(),
      ]);
      results = items;
      total = count;
    } else if (type === 'gallery') {
      const [items, count] = await Promise.all([
        Gallery.find()
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate({
            path: 'businessId',
            select: 'businessName slug userId',
            populate: { path: 'userId', select: 'name email' },
          }),
        Gallery.countDocuments(),
      ]);
      results = items;
      total = count;
    } else if (type === 'videos') {
      const [items, count] = await Promise.all([
        Video.find()
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate({
            path: 'businessId',
            select: 'businessName slug userId',
            populate: { path: 'userId', select: 'name email' },
          }),
        Video.countDocuments(),
      ]);
      results = items;
      total = count;
    }

    res.json({
      success: true,
      items: results,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Moderation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Delete content (moderation)
// @route  DELETE /api/superadmin/moderation/:type/:id
// @access SuperAdmin
exports.deleteContent = async (req, res) => {
  try {
    const { type, id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid content ID' });
    }

    let item = null;
    let itemName = '';

    if (type === 'product') {
      item = await Product.findById(id);
      if (item) { itemName = item.name; await Product.deleteOne({ _id: id }); }
    } else if (type === 'service') {
      item = await Service.findById(id);
      if (item) { itemName = item.name; await Service.deleteOne({ _id: id }); }
    } else if (type === 'gallery') {
      item = await Gallery.findById(id);
      if (item) { await Gallery.deleteOne({ _id: id }); }
    } else if (type === 'video') {
      item = await Video.findById(id);
      if (item) { itemName = item.title; await Video.deleteOne({ _id: id }); }
    } else {
      return res.status(400).json({ success: false, message: 'Invalid content type' });
    }

    if (!item) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    await logActivity(req.user._id, req.user.name, 'content_deleted', type, id, `Deleted ${type} "${itemName || id}"`);

    res.json({
      success: true,
      message: `${type} deleted successfully`,
    });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get platform settings
// @route  GET /api/superadmin/settings
// @access SuperAdmin
exports.getSettings = async (req, res) => {
  try {
    const settings = await getSettings();
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update platform settings
// @route  PUT /api/superadmin/settings
// @access SuperAdmin
exports.updateSettings = async (req, res) => {
  try {
    const { platformName, registrationsEnabled, maintenanceMode, maxUploadSize, allowedFileTypes, defaultCardTemplate, paymentUpiId } = req.body;

    let settings = await getSettings();

    if (platformName !== undefined) settings.platformName = platformName;
    if (registrationsEnabled !== undefined) settings.registrationsEnabled = registrationsEnabled === 'true' || registrationsEnabled === true;
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode === 'true' || maintenanceMode === true;
    if (maxUploadSize !== undefined) settings.maxUploadSize = parseInt(maxUploadSize);
    if (allowedFileTypes !== undefined) {
      settings.allowedFileTypes = typeof allowedFileTypes === 'string' ? JSON.parse(allowedFileTypes) : allowedFileTypes;
    }
    if (defaultCardTemplate !== undefined) settings.defaultCardTemplate = defaultCardTemplate;
    if (paymentUpiId !== undefined) settings.paymentUpiId = paymentUpiId;

    if (req.file && req.file.buffer) {
      const qrResult = await uploadToCloudinary(req.file.buffer, 'bizcardly/platform/payment');
      settings.paymentQrCode = qrResult.secure_url;
    }

    await settings.save();

    const changes = [];
    if (platformName !== undefined) changes.push(`platform name to "${platformName}"`);
    if (registrationsEnabled !== undefined) changes.push(`registrations ${registrationsEnabled ? 'enabled' : 'disabled'}`);
    if (maintenanceMode !== undefined) changes.push(`maintenance mode ${maintenanceMode ? 'enabled' : 'disabled'}`);
    if (maxUploadSize !== undefined) changes.push(`max upload size to ${maxUploadSize}MB`);

    if (changes.length > 0) {
      await logActivity(req.user._id, req.user.name, 'settings_updated', 'settings', null, `Updated settings: ${changes.join(', ')}`);
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings,
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get activity logs
// @route  GET /api/superadmin/activity-logs
// @access SuperAdmin
exports.getActivityLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { action, search } = req.query;

    let query = {};

    if (action && action !== 'all') {
      query.action = action;
    }

    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { adminName: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
      ];
    }

    const [logs, total] = await Promise.all([
      ActivityLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ActivityLog.countDocuments(query),
    ]);

    res.json({
      success: true,
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get current superadmin
// @route  GET /api/superadmin/me
// @access SuperAdmin
exports.getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
