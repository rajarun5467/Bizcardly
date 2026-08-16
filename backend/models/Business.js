const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: {
      type: String,
      trim: true,
    },
    businessName: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: String,
      default: '',
    },
    tagline: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    about: {
      type: String,
      default: '',
    },
    logo: {
      type: String,
      default: '',
    },
    profileImage: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    whatsapp: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    mapUrl: {
      type: String,
      default: '',
    },
    location: {
      latitude: { type: String, default: '' },
      longitude: { type: String, default: '' },
      mapUrl: { type: String, default: '' },
    },
    socialLinks: {
      instagram: { type: String, default: '' },
      facebook: { type: String, default: '' },
      youtube: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
      whatsapp: { type: String, default: '' },
      website: { type: String, default: '' },
    },
    upiId: {
      type: String,
      default: '',
    },
    paymentQr: {
      type: String,
      default: '',
    },
    paymentQR: {
      type: String,
      default: '',
    },
    openingHours: {
      type: String,
      default: '',
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Business', businessSchema);
