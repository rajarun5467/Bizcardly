const mongoose = require('mongoose');

const planLimitsSchema = new mongoose.Schema({
  productLimit: { type: Number, default: 10 },
  serviceLimit: { type: Number, default: 10 },
  galleryImageLimit: { type: Number, default: 20 },
  videoLimit: { type: Number, default: 5 },
  customFeatures: { type: [String], default: [] },
});

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    billingDuration: {
      type: String,
      enum: ['monthly', 'yearly', 'lifetime', 'free'],
      default: 'free',
    },
    limits: {
      type: planLimitsSchema,
      default: () => ({}),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    plan: {
      type: String,
      enum: ['Free', 'Pro'],
      default: 'Free',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'expired'],
      default: 'active',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    paymentMethod: {
      type: String,
      default: 'manual',
    },
    transactionId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ plan: 1 });
subscriptionSchema.index({ expiryDate: 1 });

module.exports = {
  Subscription: mongoose.model('Subscription', subscriptionSchema),
  Plan: mongoose.model('Plan', planSchema),
};
