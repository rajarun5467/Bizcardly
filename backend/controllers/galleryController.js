const Gallery = require('../models/Gallery');
const Business = require('../models/Business');

const getBusinessId = async (userId) => {
  const business = await Business.findOne({ userId });
  if (!business) throw new Error('Business not found');
  return business._id;
};

// @desc   Upload gallery images
// @route  POST /api/gallery
// @access Private
exports.uploadGallery = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload at least one image' });
    }
    const businessId = await getBusinessId(req.user._id);
    
    // Create multiple gallery entries for each uploaded image
    const galleryItems = await Promise.all(
      req.files.map(file => 
        Gallery.create({ 
          businessId, 
          imageUrl: `/uploads/${file.filename}` 
        })
      )
    );
    
    res.status(201).json({ success: true, message: 'Images uploaded successfully', gallery: galleryItems });
  } catch (error) {
    console.error('Gallery upload error:', error);
    res.status(500).json({ success: false, message: error.message });
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
