const express = require('express');
const router = express.Router();
const { uploadGallery, getGallery, deleteGallery } = require('../controllers/galleryController');
const protect = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');

router.post('/', protect, uploadMultiple, uploadGallery);
router.get('/', protect, getGallery);
router.delete('/:id', protect, deleteGallery);

module.exports = router;
