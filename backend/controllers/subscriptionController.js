const { Subscription, Plan } = require('../models/Subscription');
const User = require('../models/User');
const Business = require('../models/Business');
const Product = require('../models/Product');
const Service = require('../models/Service');
const Gallery = require('../models/Gallery');
const Video = require('../models/Video');
const ActivityLog = require('../models/ActivityLog');
const PlatformSetting = require('../models/PlatformSetting');
const {
  getAllPlans,
  getPlan,
  ensureSubscription,
  getSubscriptionWithLimits,
  invalidatePlanCache,
} = require('../utils/subscriptionUtils');

const logActivity = async (adminId, adminName, action, targetType, targetId, description, userId = null, userName = null) => {
  try {
    await ActivityLog.create({ adminId, adminName, action, targetType, targetId, description, userId, userName });
  } catch (e) {
    console.error('Activity log error:', e.message);
  }
};

exports.getSubscriptions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { search, plan, status } = req.query;

    const matchStage = {};
    if (plan && plan !== 'all') matchStage.plan = plan;
    if (status && status !== 'all') matchStage.status = status;

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'businesses',
          localField: 'userId',
          foreignField: 'userId',
          as: 'business',
        },
      },
      { $unwind: { path: '$business', preserveNullAndEmptyArrays: true } },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'user.name': { $regex: search, $options: 'i' } },
            { 'user.email': { $regex: search, $options: 'i' } },
          ],
        },
      });
    }

    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await Subscription.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    pipeline.push({ $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: limit });

    const subscriptions = await Subscription.aggregate(pipeline);

    res.json({
      success: true,
      subscriptions: subscriptions.map((s) => ({
        _id: s._id,
        plan: s.plan,
        status: s.status,
        startDate: s.startDate,
        expiryDate: s.expiryDate,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        user: { _id: s.user._id, name: s.user.name, email: s.user.email, isBlocked: s.user.isBlocked },
        business: s.business ? { _id: s.business._id, businessName: s.business.businessName, slug: s.business.slug } : null,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserSubscription = async (req, res) => {
  try {
    const sub = await ensureSubscription(req.params.userId);
    const user = await User.findById(req.params.userId).select('name email');
    const business = await Business.findOne({ userId: req.params.userId }).select('businessName slug');
    const plan = await getPlan(sub.plan);

    res.json({
      success: true,
      subscription: {
        ...sub.toObject(),
        user,
        business,
        limits: plan?.limits || {},
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.assignPlan = async (req, res) => {
  try {
    const { userId } = req.params;
    const { plan, extendDays } = req.body;

    const planConfig = await getPlan(plan);
    if (!planConfig || planConfig.name !== plan) {
      return res.status(400).json({ success: false, message: 'Invalid plan' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'superadmin') return res.status(400).json({ success: false, message: 'Cannot modify SuperAdmin subscription' });

    let sub = await Subscription.findOne({ userId });
    const oldPlan = sub?.plan || 'None';
    const now = new Date();

    let expiryDate = null;
    if (plan !== 'Free') {
      const baseDate = sub?.expiryDate && sub.expiryDate > now ? sub.expiryDate : now;
      expiryDate = new Date(baseDate);
      if (extendDays) {
        expiryDate.setDate(expiryDate.getDate() + extendDays);
      } else {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      }
    }

    if (!sub) {
      sub = await Subscription.create({
        userId,
        plan,
        status: 'active',
        startDate: now,
        expiryDate,
        assignedBy: req.user._id,
      });
    } else {
      sub.plan = plan;
      sub.status = 'active';
      sub.expiryDate = expiryDate;
      sub.assignedBy = req.user._id;
      if (plan === 'Pro' && !sub.startDate) sub.startDate = now;
      await sub.save();
    }

    const action = oldPlan === 'None' ? 'subscription_assigned' : 'subscription_changed';
    await logActivity(
      req.user._id, req.user.name, action, 'subscription', sub._id,
      `SuperAdmin ${req.user.name} ${oldPlan === 'None' ? 'assigned' : 'changed'} ${user.name}'s plan from ${oldPlan} to ${plan}`,
      user._id, user.name
    );

    res.json({ success: true, message: `Plan ${oldPlan === 'None' ? 'assigned' : 'updated'} to ${plan}`, subscription: sub });
  } catch (error) {
    console.error('Assign plan error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.extendSubscription = async (req, res) => {
  try {
    const { userId } = req.params;
    const { extendDays } = req.body;

    if (!extendDays || extendDays <= 0) {
      return res.status(400).json({ success: false, message: 'extendDays must be a positive number' });
    }

    const sub = await Subscription.findOne({ userId });
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });

    const now = new Date();
    const baseDate = sub.expiryDate && sub.expiryDate > now ? sub.expiryDate : now;
    sub.expiryDate = new Date(baseDate);
    sub.expiryDate.setDate(sub.expiryDate.getDate() + extendDays);
    sub.status = 'active';
    await sub.save();

    const user = await User.findById(userId).select('name');
    await logActivity(
      req.user._id, req.user.name, 'subscription_extended', 'subscription', sub._id,
      `SuperAdmin ${req.user.name} extended ${user?.name || 'user'}'s subscription by ${extendDays} days`,
      userId, user?.name
    );

    res.json({ success: true, message: `Subscription extended by ${extendDays} days`, subscription: sub });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.cancelSubscription = async (req, res) => {
  try {
    const { userId } = req.params;
    const sub = await Subscription.findOne({ userId });
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });

    sub.status = 'cancelled';
    await sub.save();

    const user = await User.findById(userId).select('name');
    await logActivity(
      req.user._id, req.user.name, 'subscription_cancelled', 'subscription', sub._id,
      `SuperAdmin ${req.user.name} cancelled ${user?.name || 'user'}'s subscription`,
      userId, user?.name
    );

    res.json({ success: true, message: 'Subscription cancelled', subscription: sub });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.reactivateSubscription = async (req, res) => {
  try {
    const { userId } = req.params;
    const sub = await Subscription.findOne({ userId });
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });

    sub.status = 'active';
    if (sub.plan !== 'Free' && (!sub.expiryDate || sub.expiryDate < new Date())) {
      sub.expiryDate = new Date();
      sub.expiryDate.setMonth(sub.expiryDate.getMonth() + 1);
    }
    await sub.save();

    const user = await User.findById(userId).select('name');
    await logActivity(
      req.user._id, req.user.name, 'subscription_reactivated', 'subscription', sub._id,
      `SuperAdmin ${req.user.name} reactivated ${user?.name || 'user'}'s subscription`,
      userId, user?.name
    );

    res.json({ success: true, message: 'Subscription reactivated', subscription: sub });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSubscriptionStats = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysLater = new Date(now);
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

    const SubscriptionRequest = require('../models/SubscriptionRequest');

    const [freeUsers, proUsers, activeSubs, expiringSoon, cancelledSubs, pendingRequests] = await Promise.all([
      Subscription.countDocuments({ plan: 'Free', status: 'active' }),
      Subscription.countDocuments({ plan: 'Pro', status: 'active' }),
      Subscription.countDocuments({ status: 'active' }),
      Subscription.countDocuments({ plan: 'Pro', status: 'active', expiryDate: { $gte: now, $lte: thirtyDaysLater } }),
      Subscription.countDocuments({ status: 'cancelled' }),
      SubscriptionRequest.countDocuments({ status: 'pending' }),
    ]);

    res.json({ success: true, stats: { freeUsers, proUsers, activeSubs, expiringSoon, cancelledSubs, pendingRequests } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get all plans (DB-backed source of truth)
// @route  GET /api/superadmin/subscriptions/plans  |  GET /api/subscription/plans
// @access SuperAdmin (management) / Public-ish (read via user route)
exports.getPlans = async (req, res) => {
  try {
    const plans = await getAllPlans();
    res.json({ success: true, plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update a plan's price/limits/features (SuperAdmin plan management)
// @route  PUT /api/superadmin/subscriptions/plans/:id
// @access SuperAdmin
exports.updatePlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    const { price, billingDuration, limits, isActive } = req.body;

    if (plan.name === 'Free' && isActive === false) {
      return res.status(400).json({ success: false, message: 'The Free plan cannot be disabled' });
    }

    if (price !== undefined) plan.price = price;
    if (billingDuration !== undefined) plan.billingDuration = billingDuration;
    if (isActive !== undefined) plan.isActive = isActive;
    if (limits && typeof limits === 'object') {
      plan.limits = {
        productLimit: limits.productLimit ?? plan.limits.productLimit,
        serviceLimit: limits.serviceLimit ?? plan.limits.serviceLimit,
        galleryImageLimit: limits.galleryImageLimit ?? plan.limits.galleryImageLimit,
        videoLimit: limits.videoLimit ?? plan.limits.videoLimit,
        customFeatures: Array.isArray(limits.customFeatures) ? limits.customFeatures : plan.limits.customFeatures,
      };
    }

    await plan.save();
    invalidatePlanCache();

    await logActivity(
      req.user._id, req.user.name, 'settings_updated', 'subscription', plan._id,
      `SuperAdmin ${req.user.name} updated the ${plan.name} plan configuration`
    );

    res.json({ success: true, message: `${plan.name} plan updated`, plan });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== User-facing (self-service) endpoints =====

// @desc   Get my current subscription + plan details
// @route  GET /api/subscription/me
// @access Private
exports.getMySubscription = async (req, res) => {
  try {
    const subscription = await ensureSubscription(req.user._id);
    const plan = await getPlan(subscription.plan);
    res.json({ success: true, subscription, plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get my current usage vs plan limits
// @route  GET /api/subscription/usage
// @access Private
exports.getMyUsage = async (req, res) => {
  try {
    const business = await Business.findOne({ userId: req.user._id });
    if (!business) return res.status(404).json({ success: false, message: 'Business not found' });

    const { subscription, plan, limits } = await getSubscriptionWithLimits(req.user._id);

    const [productCount, serviceCount, galleryCount, videoCount] = await Promise.all([
      Product.countDocuments({ businessId: business._id }),
      Service.countDocuments({ businessId: business._id }),
      Gallery.countDocuments({ businessId: business._id }),
      Video.countDocuments({ businessId: business._id }),
    ]);

    res.json({
      success: true,
      subscription,
      plan,
      usage: {
        products: { used: productCount, limit: limits.productLimit },
        services: { used: serviceCount, limit: limits.serviceLimit },
        gallery: { used: galleryCount, limit: limits.galleryImageLimit },
        videos: { used: videoCount, limit: limits.videoLimit },
      },
      features: limits.customFeatures || [],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get platform payment QR code + UPI ID (for manual upgrade payments)
// @route  GET /api/subscription/payment-info
// @access Private
exports.getPaymentInfo = async (req, res) => {
  try {
    let settings = await PlatformSetting.findOne();
    if (!settings) settings = await PlatformSetting.create({});
    res.json({
      success: true,
      paymentQrCode: settings.paymentQrCode || '',
      paymentUpiId: settings.paymentUpiId || '',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get all active plans for pricing display (user-facing, no auth required)
// @route  GET /api/subscription/plans
// @access Public
exports.getPublicPlans = async (req, res) => {
  try {
    const plans = await getAllPlans();
    res.json({ success: true, plans: plans.filter((p) => p.isActive) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.ensureSubscription = ensureSubscription;
module.exports.logActivity = logActivity;
