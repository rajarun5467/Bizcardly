const SubscriptionRequest = require('../models/SubscriptionRequest');
const { Subscription } = require('../models/Subscription');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { ensureSubscription, getPlan } = require('../utils/subscriptionUtils');
const { logActivity } = require('./subscriptionController');
const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = (fileBuffer, folder = 'bizcardly/subscription-proofs') => {
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

// ===== User side =====

// @desc   Submit a subscription upgrade request (manual payment)
// @route  POST /api/subscription/request
// @access Private
exports.createRequest = async (req, res) => {
  try {
    const { requestedPlan, paymentMethod, transactionRef } = req.body;

    if (!requestedPlan || !transactionRef || !transactionRef.trim()) {
      return res.status(400).json({ success: false, message: 'Requested plan and transaction reference (UPI ID) are required' });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ success: false, message: 'Please upload a payment screenshot as proof' });
    }

    const plan = await getPlan(requestedPlan);
    if (!plan || plan.name !== requestedPlan) {
      return res.status(400).json({ success: false, message: 'Invalid plan selected' });
    }
    if (plan.name === 'Free') {
      return res.status(400).json({ success: false, message: 'Cannot request the Free plan' });
    }

    const existingPending = await SubscriptionRequest.findOne({
      userId: req.user._id,
      requestedPlan,
      status: 'pending',
    });
    if (existingPending) {
      return res.status(400).json({ success: false, message: 'You already have a pending request for this plan' });
    }

    const sub = await ensureSubscription(req.user._id);

    const proofResult = await uploadToCloudinary(req.file.buffer);

    const request = await SubscriptionRequest.create({
      userId: req.user._id,
      currentPlan: sub.plan,
      requestedPlan,
      amount: plan.price,
      paymentMethod: paymentMethod || 'UPI',
      transactionRef: transactionRef.trim(),
      paymentProof: proofResult.secure_url,
      status: 'pending',
    });

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      action: 'subscription_request_submitted',
      targetType: 'subscription',
      targetId: request._id,
      description: `${req.user.name} submitted a subscription upgrade request to the ${requestedPlan} plan`,
    });

    res.status(201).json({
      success: true,
      message: 'Subscription request submitted. SuperAdmin will review it shortly.',
      request,
    });
  } catch (error) {
    console.error('Create subscription request error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get my subscription request history
// @route  GET /api/subscription/my-requests
// @access Private
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await SubscriptionRequest.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== SuperAdmin side =====

// @desc   Get all subscription requests (filter/search/paginate)
// @route  GET /api/superadmin/subscription-requests
// @access SuperAdmin
exports.getAllRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { search, status, plan } = req.query;

    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (plan && plan !== 'all') filter.requestedPlan = plan;

    if (search) {
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');
      filter.userId = { $in: users.map((u) => u._id) };
    }

    const total = await SubscriptionRequest.countDocuments(filter);
    const requests = await SubscriptionRequest.find(filter)
      .populate('userId', 'name email')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      requests,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get single request details
// @route  GET /api/superadmin/subscription-requests/:id
// @access SuperAdmin
exports.getRequestById = async (req, res) => {
  try {
    const request = await SubscriptionRequest.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('reviewedBy', 'name');
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    res.json({ success: true, request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Approve a subscription request -> activates the plan for the user
// @route  PATCH /api/superadmin/subscription-requests/:id/approve
// @access SuperAdmin
exports.approveRequest = async (req, res) => {
  try {
    const { adminNote } = req.body;
    const request = await SubscriptionRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Request has already been ${request.status}` });
    }

    const user = await User.findById(request.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const plan = await getPlan(request.requestedPlan);
    const now = new Date();

    let sub = await Subscription.findOne({ userId: request.userId });

    let expiryDate = null;
    if (plan.billingDuration === 'monthly') {
      const baseDate = sub?.expiryDate && sub.expiryDate > now && sub.plan === request.requestedPlan ? sub.expiryDate : now;
      expiryDate = new Date(baseDate);
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else if (plan.billingDuration === 'yearly') {
      expiryDate = new Date(now);
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }

    if (!sub) {
      sub = await Subscription.create({
        userId: request.userId,
        plan: request.requestedPlan,
        status: 'active',
        startDate: now,
        expiryDate,
        assignedBy: req.user._id,
        paymentMethod: request.paymentMethod,
        transactionId: request.transactionRef,
      });
    } else {
      sub.plan = request.requestedPlan;
      sub.status = 'active';
      sub.expiryDate = expiryDate;
      sub.assignedBy = req.user._id;
      sub.paymentMethod = request.paymentMethod;
      sub.transactionId = request.transactionRef;
      if (!sub.startDate) sub.startDate = now;
      await sub.save();
    }

    request.status = 'approved';
    request.adminNote = adminNote || '';
    request.reviewedBy = req.user._id;
    request.reviewedAt = now;
    await request.save();

    await logActivity(
      req.user._id, req.user.name, 'subscription_request_approved', 'subscription', sub._id,
      `SuperAdmin ${req.user.name} approved ${user.name}'s subscription request and activated the ${plan.name} plan`,
      user._id, user.name
    );

    res.json({
      success: true,
      message: `Request approved. ${user.name} has been upgraded to the ${plan.name} plan.`,
      subscription: sub,
      request,
    });
  } catch (error) {
    console.error('Approve subscription request error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Reject a subscription request -> existing subscription is left untouched
// @route  PATCH /api/superadmin/subscription-requests/:id/reject
// @access SuperAdmin
exports.rejectRequest = async (req, res) => {
  try {
    const { adminNote } = req.body;
    const request = await SubscriptionRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Request has already been ${request.status}` });
    }

    const user = await User.findById(request.userId).select('name');

    request.status = 'rejected';
    request.adminNote = adminNote || '';
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    await logActivity(
      req.user._id, req.user.name, 'subscription_request_rejected', 'subscription', request._id,
      `SuperAdmin ${req.user.name} rejected ${user?.name || 'a user'}'s subscription request for the ${request.requestedPlan} plan`,
      request.userId, user?.name
    );

    res.json({ success: true, message: 'Request rejected', request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
