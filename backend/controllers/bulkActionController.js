const mongoose = require('mongoose');
const User = require('../models/User');
const Business = require('../models/Business');
const Product = require('../models/Product');
const Service = require('../models/Service');
const Gallery = require('../models/Gallery');
const Video = require('../models/Video');
const { Subscription } = require('../models/Subscription');
const ActivityLog = require('../models/ActivityLog');
const { logActivity } = require('./subscriptionController');

exports.bulkBlockUsers = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { userIds } = req.body;
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No user IDs provided' });
    }

    const validIds = userIds.filter((id) => mongoose.isValidObjectId(id));
    if (validIds.length !== userIds.length) {
      return res.status(400).json({ success: false, message: 'One or more invalid user IDs' });
    }

    if (validIds.includes(req.user._id.toString())) {
      return res.status(400).json({ success: false, message: 'Cannot block your own account' });
    }

    const users = await User.find({ _id: { $in: validIds }, role: { $ne: 'superadmin' } }).select('name email');
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'No valid users found' });
    }

    await User.updateMany(
      { _id: { $in: users.map((u) => u._id) } },
      { isBlocked: true }
    );

    await logActivity(
      req.user._id, req.user.name, 'bulk_user_block', 'user', null,
      `SuperAdmin ${req.user.name} blocked ${users.length} user(s): ${users.map((u) => u.name).join(', ')}`
    );

    res.json({
      success: true,
      message: `Successfully blocked ${users.length} user(s)`,
      affected: users.length,
      skipped: validIds.length - users.length,
    });
  } catch (error) {
    console.error('Bulk block error:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

exports.bulkUnblockUsers = async (req, res) => {
  try {
    const { userIds } = req.body;
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No user IDs provided' });
    }

    const validIds = userIds.filter((id) => mongoose.isValidObjectId(id));
    if (validIds.length !== userIds.length) {
      return res.status(400).json({ success: false, message: 'One or more invalid user IDs' });
    }

    const users = await User.find({ _id: { $in: validIds }, role: { $ne: 'superadmin' } }).select('name');
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'No valid users found' });
    }

    await User.updateMany(
      { _id: { $in: users.map((u) => u._id) } },
      { isBlocked: false }
    );

    await logActivity(
      req.user._id, req.user.name, 'bulk_user_unblock', 'user', null,
      `SuperAdmin ${req.user.name} unblocked ${users.length} user(s): ${users.map((u) => u.name).join(', ')}`
    );

    res.json({
      success: true,
      message: `Successfully unblocked ${users.length} user(s)`,
      affected: users.length,
    });
  } catch (error) {
    console.error('Bulk unblock error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.bulkDeleteUsers = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { userIds } = req.body;
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No user IDs provided' });
    }

    const validIds = userIds.filter((id) => mongoose.isValidObjectId(id));
    if (validIds.length !== userIds.length) {
      return res.status(400).json({ success: false, message: 'One or more invalid user IDs' });
    }

    if (validIds.includes(req.user._id.toString())) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    const users = await User.find({ _id: { $in: validIds }, role: { $ne: 'superadmin' } }).select('name email');
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'No valid users found' });
    }

    const userIdsToDelete = users.map((u) => u._id);

    await session.startTransaction();

    await Product.deleteMany({ businessId: { $in: await Business.find({ userId: { $in: userIdsToDelete } }).distinct('_id') } }).session(session);
    await Service.deleteMany({ businessId: { $in: await Business.find({ userId: { $in: userIdsToDelete } }).distinct('_id') } }).session(session);
    await Gallery.deleteMany({ businessId: { $in: await Business.find({ userId: { $in: userIdsToDelete } }).distinct('_id') } }).session(session);
    await Video.deleteMany({ businessId: { $in: await Business.find({ userId: { $in: userIdsToDelete } }).distinct('_id') } }).session(session);
    await Business.deleteMany({ userId: { $in: userIdsToDelete } }).session(session);
    await Subscription.deleteMany({ userId: { $in: userIdsToDelete } }).session(session);
    await User.deleteMany({ _id: { $in: userIdsToDelete } }).session(session);

    await session.commitTransaction();

    await logActivity(
      req.user._id, req.user.name, 'bulk_user_delete', 'user', null,
      `SuperAdmin ${req.user.name} deleted ${users.length} user(s) and their data: ${users.map((u) => u.name).join(', ')}`
    );

    res.json({
      success: true,
      message: `Successfully deleted ${users.length} user(s) and their associated data`,
      affected: users.length,
      skipped: validIds.length - users.length,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Bulk delete error:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

exports.bulkAssignPlan = async (req, res) => {
  try {
    const { userIds, plan } = req.body;
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No user IDs provided' });
    }
    if (!['Free', 'Pro'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid plan' });
    }

    const validIds = userIds.filter((id) => mongoose.isValidObjectId(id));
    if (validIds.length !== userIds.length) {
      return res.status(400).json({ success: false, message: 'One or more invalid user IDs' });
    }

    if (validIds.includes(req.user._id.toString())) {
      return res.status(400).json({ success: false, message: 'Cannot assign plan to your own account' });
    }

    const users = await User.find({ _id: { $in: validIds }, role: { $ne: 'superadmin' } }).select('name');
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'No valid users found' });
    }

    const now = new Date();
    let expiryDate = null;
    if (plan === 'Pro') {
      expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    }

    const ops = users.map((u) => ({
      updateOne: {
        filter: { userId: u._id },
        update: { plan, status: 'active', expiryDate, assignedBy: req.user._id },
        upsert: true,
      },
    }));

    await Subscription.bulkWrite(ops);

    await logActivity(
      req.user._id, req.user.name, 'bulk_subscription_assign', 'subscription', null,
      `SuperAdmin ${req.user.name} assigned ${plan} plan to ${users.length} user(s): ${users.map((u) => u.name).join(', ')}`
    );

    res.json({
      success: true,
      message: `Successfully assigned ${plan} plan to ${users.length} user(s)`,
      affected: users.length,
    });
  } catch (error) {
    console.error('Bulk assign plan error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
