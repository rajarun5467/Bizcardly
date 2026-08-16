import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FaPlus, FaTrash, FaVideo, FaYoutube } from 'react-icons/fa';

const Videos = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', url: '' });
  const [loading, setLoading] = useState(false);

  const fetchVideos = async () => {
    try {
      const { data } = await api.get('/videos');
      setVideos(data.videos || []);
    } catch (err) {
      toast.error('Failed to fetch videos');
    }
  };

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('bizcardly_token');
      if (token) {
        fetchVideos();
      } else {
        console.log('Videos: No token found');
      }
    }
  }, [user]);

  const getYoutubeId = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted');
    console.log('Form data:', formData);
    
    const youtubeId = getYoutubeId(formData.url);
    console.log('YouTube ID:', youtubeId);
    
    if (!youtubeId) {
      console.log('Invalid YouTube URL');
      return toast.error('Please enter a valid YouTube URL');
    }
    
    setLoading(true);
    try {
      console.log('Submitting video:', { title: formData.title, videoUrl: formData.url, youtubeId });
      const res = await api.post('/videos', { title: formData.title, videoUrl: formData.url, youtubeId });
      const result = res.data;
      console.log('Video upload response:', result);
      if (!result.success) throw new Error(result.message || 'Failed to add video');
      toast.success('Video added successfully!');
      setShowModal(false);
      setFormData({ title: '', url: '' });
      fetchVideos();
    } catch (err) {
      console.error('Video upload error:', err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    try {
      await api.delete(`/videos/${id}`);
      toast.success('Video deleted!');
      fetchVideos();
    } catch (err) {
      toast.error('Failed to delete video');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Videos</h2>
          <p className="text-gray-600">Add YouTube videos to showcase your work</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <FaPlus />
          Add Video
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {videos.map((video) => (
          <div key={video._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="aspect-video bg-gray-100">
              <iframe
                src={`https://www.youtube.com/embed/${video.youtubeId}`}
                title={video.title}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
            <div className="p-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">{video.title}</h3>
              <button
                onClick={() => handleDelete(video._id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {videos.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <FaYoutube className="text-gray-300 text-5xl mx-auto mb-4" />
          <p className="text-gray-500">No videos yet. Add your first YouTube video!</p>
        </div>
      )}

      {/* Add Video Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Add YouTube Video</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Video Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="My awesome video"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">YouTube URL *</label>
                <div className="relative">
                  <FaYoutube className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setFormData({ title: '', url: '' }); }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Videos;
