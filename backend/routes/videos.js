const express = require('express');
const router = express.Router();
const { addVideo, getVideos, deleteVideo } = require('../controllers/videoController');
const protect = require('../middleware/auth');

router.post('/', protect, addVideo);
router.get('/', protect, getVideos);
router.delete('/:id', protect, deleteVideo);

module.exports = router;
