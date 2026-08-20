const mongoose = require('mongoose');

const subscriptionRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    currentPlan: {
      type: String,
      required: true,
    },
    requestedPlan: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'BankTransfer', 'Other'],
      default: 'UPI',
    },
    transactionRef: {
      type: String,
      required: true,
      trim: true,
    },
    paymentProof: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },
    adminNote: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

subscriptionRequestSchema.index({ userId: 1, status: 1 });
subscriptionRequestSchema.index({ status: 1 });
subscriptionRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SubscriptionRequest', subscriptionRequestSchema);
