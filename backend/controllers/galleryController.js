const cloudinary = require('../config/cloudinary');
const Gallery = require('../models/Gallery');
const Business = require('../models/Business');
const { checkPlanLimit } = require('../utils/subscriptionUtils');

const getBusinessId = async (userId) => {
  const business = await Business.findOne({ userId });
  if (!business) throw new Error('Business not found');
  return business._id;
};


const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    console.log('☁️  Uploading to Cloudinary...');
    
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'bizcardly/gallery',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary error:', error);
          console.error('   Code:', error.http_code);
          console.error('   Message:', error.message);
          
          // Provide helpful error messages
          if (error.http_code === 401 || error.http_code === 403) {
            reject(new Error('Cloudinary authentication failed - invalid credentials'));
          } else if (error.message?.includes('too large')) {
            reject(new Error('File size too large for Cloudinary'));
          } else {
            reject(new Error(`Cloudinary error: ${error.message}`));
          }
        } else {
          console.log('✅ Cloudinary upload successful');
          console.log('   Public ID:', result.public_id);
          console.log('   URL:', result.secure_url);
          resolve(result);
        }
      }
    );

    stream.on('error', (error) => {
      console.error('❌ Stream error:', error);
      reject(new Error(`Upload stream error: ${error.message}`));
    });

    stream.end(fileBuffer);
  });
};
// @desc   Upload gallery images
// @route  POST /api/gallery
// @access Private
exports.uploadGallery = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      console.error('❌ Gallery upload failed: No files provided');
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one image',
      });
    }

    // Debug logs
    console.log(`📤 Upload started: ${req.files.length} file(s)`);
    console.log(`🔐 User ID: ${req.user._id}`);

    const businessId = await getBusinessId(req.user._id);
    console.log(`🏢 Business ID: ${businessId}`);

    const currentCount = await Gallery.countDocuments({ businessId });
    const limitCheck = await checkPlanLimit(req.user._id, 'gallery', currentCount + req.files.length - 1);
    if (!limitCheck.allowed) {
      return res.status(403).json({ success: false, message: limitCheck.message, limitReached: true });
    }

    const galleryItems = await Promise.all(
      req.files.map(async (file, index) => {
        if (!file || !file.buffer) {
          throw new Error(`Invalid uploaded image at index ${index}`);
        }

        console.log(`📸 Processing file ${index + 1}: ${file.originalname} (${file.size} bytes)`);

        const result = await uploadToCloudinary(file.buffer);
        
        console.log(`✅ Uploaded to Cloudinary: ${result.secure_url}`);

        const galleryItem = await Gallery.create({
          businessId,
          imageUrl: result.secure_url,
        });

        return galleryItem;
      })
    );

    console.log(`✅ Gallery upload successful: ${galleryItems.length} image(s) saved`);

    res.status(201).json({
      success: true,
      message: 'Images uploaded successfully',
      gallery: galleryItems,
    });
  } catch (error) {
    console.error('❌ Gallery upload error:', error.message);
    console.error('Stack trace:', error.stack);

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload images',
      debug: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

// @desc   Get all gallery images
// @route  GET /api/gallery
// @access Private
exports.getGallery = async (req, res) => {
  try {
    const businessId = await getBusinessId(req.user._id);
    const gallery = await Gallery.find({ businessId }).sort({ createdAt: -1 });
    res.json({ success: true, gallery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Delete gallery image
// @route  DELETE /api/gallery/:id
// @access Private
exports.deleteGallery = async (req, res) => {
  try {
    const businessId = await getBusinessId(req.user._id);
    const image = await Gallery.findOneAndDelete({ _id: req.params.id, businessId });
    if (!image) return res.status(404).json({ success: false, message: 'Image not found' });
    res.json({ success: true, message: 'Image deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
