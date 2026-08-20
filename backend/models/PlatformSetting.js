const mongoose = require('mongoose');

const platformSettingSchema = new mongoose.Schema(
  {
    platformName: {
      type: String,
      default: 'BizCardly',
    },
    registrationsEnabled: {
      type: Boolean,
      default: true,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    maxUploadSize: {
      type: Number,
      default: 10,
    },
    allowedFileTypes: {
      type: [String],
      default: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    },
    defaultCardTemplate: {
      type: String,
      default: 'classic',
    },
    paymentQrCode: {
      type: String,
      default: '',
    },
    paymentUpiId: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PlatformSetting', platformSettingSchema);
