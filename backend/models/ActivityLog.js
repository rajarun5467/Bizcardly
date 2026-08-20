const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    adminName: {
      type: String,
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    userName: {
      type: String,
      default: null,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'user_blocked',
        'user_unblocked',
        'user_deleted',
        'user_password_reset',
        'business_suspended',
        'business_activated',
        'business_deleted',
        'business_updated',
        'content_deleted',
        'settings_updated',
        'admin_login',
        'subscription_assigned',
        'subscription_changed',
        'subscription_cancelled',
        'subscription_extended',
        'subscription_reactivated',
        'subscription_request_submitted',
        'subscription_request_approved',
        'subscription_request_rejected',
        'bulk_user_block',
        'bulk_user_unblock',
        'bulk_user_delete',
        'bulk_subscription_assign',
        'data_exported',
        'ticket_status_changed',
        'ticket_priority_changed',
        'ticket_closed',
        'ticket_replied',
        'ticket_created',
        'user_registered',
        'user_login',
        'business_created',
        'product_added',
        'service_added',
        'gallery_uploaded',
        'video_added',
      ],
    },
    targetType: {
      type: String,
      enum: ['user', 'business', 'product', 'service', 'gallery', 'video', 'settings', 'subscription', 'ticket', 'export'],
      default: null,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ action: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
