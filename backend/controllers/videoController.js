const Video = require('../models/Video');
const Business = require('../models/Business');

const getBusinessId = async (userId) => {
  const business = await Business.findOne({ userId });
  if (!business) throw new Error('Business not found');
  return business._id;
};

// Extract YouTube video ID from URL
const getYouTubeId = (url) => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// @desc   Add video
// @route  POST /api/videos
// @access Private
exports.addVideo = async (req, res) => {
  try {
    console.log('Add video request body:', req.body);
    const businessId = await getBusinessId(req.user._id);
    const { title, videoUrl, youtubeId } = req.body;

    if (!title || !videoUrl) {
      return res.status(400).json({ success: false, message: 'Title and video URL are required' });
    }

    const extractedYoutubeId = youtubeId || getYouTubeId(videoUrl);
    console.log('YouTube ID extracted:', extractedYoutubeId);

    const thumbnail = extractedYoutubeId ? `https://img.youtube.com/vi/${extractedYoutubeId}/hqdefault.jpg` : '';

    const video = await Video.create({
      businessId,
      title,
      videoUrl,
      youtubeId: extractedYoutubeId,
      thumbnail,
    });

    console.log('Video created:', video);
    res.status(201).json({ success: true, message: 'Video added', video });
  } catch (error) {
    console.error('Add video error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get all videos
// @route  GET /api/videos
// @access Private
exports.getVideos = async (req, res) => {
  try {
    const businessId = await getBusinessId(req.user._id);
    const videos = await Video.find({ businessId }).sort({ createdAt: -1 });
    res.json({ success: true, videos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Delete video
// @route  DELETE /api/videos/:id
// @access Private
exports.deleteVideo = async (req, res) => {
  try {
    const businessId = await getBusinessId(req.user._id);
    const video = await Video.findOneAndDelete({ _id: req.params.id, businessId });
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
    res.json({ success: true, message: 'Video deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
