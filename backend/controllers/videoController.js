const Video = require('../models/Video');
const Business = require('../models/Business');
const { checkPlanLimit } = require('../utils/subscriptionUtils');

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
    console.log('🎬 Adding video...');
    console.log('   User ID:', req.user?._id);
    console.log('   Request body:', req.body);
    
    if (!req.user || !req.user._id) {
      console.error('❌ User not authenticated');
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    
    const businessId = await getBusinessId(req.user._id);
    console.log(`🏢 Business ID: ${businessId}`);

    const currentCount = await Video.countDocuments({ businessId });
    const limitCheck = await checkPlanLimit(req.user._id, 'video', currentCount);
    if (!limitCheck.allowed) {
      return res.status(403).json({ success: false, message: limitCheck.message, limitReached: true });
    }

    const { title, videoUrl, youtubeId } = req.body;

    if (!title || !videoUrl) {
      console.error('❌ Title or URL missing');
      return res.status(400).json({ success: false, message: 'Title and video URL are required' });
    }

    const extractedYoutubeId = youtubeId || getYouTubeId(videoUrl);
    if (!extractedYoutubeId) {
      console.error('❌ Could not extract YouTube ID from URL:', videoUrl);
      return res.status(400).json({ success: false, message: 'Invalid YouTube URL format' });
    }
    console.log('🔗 YouTube ID extracted:', extractedYoutubeId);

    const thumbnail = `https://img.youtube.com/vi/${extractedYoutubeId}/hqdefault.jpg`;

    const video = await Video.create({
      businessId,
      title,
      videoUrl,
      youtubeId: extractedYoutubeId,
      thumbnail,
    });

    console.log(`✅ Video created successfully: ${video._id}`);
    console.log(`   Title: ${video.title}`);
    console.log(`   YouTube ID: ${video.youtubeId}`);
    res.status(201).json({ success: true, message: 'Video added', video });
  } catch (error) {
    console.error('❌ Add video error:', error.message);
    console.error('   Stack trace:', error.stack);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get all videos
// @route  GET /api/videos
// @access Private
exports.getVideos = async (req, res) => {
  try {
    console.log('📥 Fetching videos...');
    
    const businessId = await getBusinessId(req.user._id);
    console.log(`🏢 Business ID: ${businessId}`);
    
    const videos = await Video.find({ businessId }).sort({ createdAt: -1 });
    
    console.log(`✅ Found ${videos.length} video(s)`);
    if (videos.length > 0) {
      videos.forEach((video, idx) => {
        console.log(`  ${idx + 1}. ${video.title} - YouTube ID: ${video.youtubeId}`);
      });
    }
    
    res.json({ success: true, videos });
  } catch (error) {
    console.error('❌ Get videos error:', error.message);
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
