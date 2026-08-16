const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
  },
  visitedAt: {
    type: Date,
    default: Date.now,
  },
  ipHash: {
    type: String,
    default: '',
  },
});

// Index for fast analytics queries
visitorSchema.index({ businessId: 1, visitedAt: -1 });

module.exports = mongoose.model('Visitor', visitorSchema);
