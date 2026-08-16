const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Gallery', gallerySchema);
