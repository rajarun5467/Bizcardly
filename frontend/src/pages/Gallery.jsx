import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FaPlus, FaTrash, FaImages } from 'react-icons/fa';

const Gallery = () => {
  const { user } = useAuth();
  const [gallery, setGallery] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchGallery = async () => {
    try {
      const { data } = await api.get('/gallery');
      setGallery(data.gallery || []);
    } catch (err) {
      toast.error('Failed to fetch gallery');
    }
  };

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('bizcardly_token');
      if (token) {
        fetchGallery();
      } else {
        console.log('Gallery: No token found');
      }
    }
  }, [user]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return toast.error('Please select at least one image');
    setLoading(true);
    try {
      const data = new FormData();
      selectedFiles.forEach(file => data.append('images', file));

      const res = await api.post('/gallery', data);
      const result = res.data;
      if (!result.success) throw new Error(result.message || 'Failed to upload');
      toast.success('Images uploaded successfully!');
      setShowModal(false);
      setSelectedFiles([]);
      setPreviews([]);
      fetchGallery();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    try {
      await api.delete(`/gallery/${id}`);
      toast.success('Image deleted!');
      fetchGallery();
    } catch (err) {
      toast.error('Failed to delete image');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between animate-slide-in-left">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gallery</h2>
          <p className="text-gray-600">Showcase your work with photos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition hover-lift shadow-lg"
        >
          <FaPlus />
          Upload Photos
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-staggered">
        {gallery.map((item) => (
          <div key={item._id} className="relative group overflow-hidden rounded-xl">
            <img
              src={item.imageUrl}
              alt="Gallery"
              className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300 shadow-sm cursor-pointer"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <button
                onClick={() => handleDelete(item._id)}
                className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full transition flex items-center justify-center transform hover-scale shadow-lg"
              >
                <FaTrash size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {gallery.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl animate-fade-in">
          <FaImages className="text-gray-300 text-5xl mx-auto mb-4 animate-bounce-subtle" />
          <p className="text-gray-500">No photos yet. Upload your first photo!</p>
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 animate-fade-in" onClick={() => { setShowModal(false); setSelectedFiles([]); setPreviews([]); }}></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 animate-scale-in shadow-2xl">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Upload Photos</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition group cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="galleryUpload"
                  />
                  <label htmlFor="galleryUpload" className="cursor-pointer block">
                    <FaImages className="text-gray-400 text-3xl mx-auto mb-2 group-hover:text-indigo-400 transition" />
                    <p className="text-gray-600">Click to select images</p>
                    <p className="text-gray-400 text-sm mt-1">You can select multiple files</p>
                  </label>
                </div>
                {previews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 animate-fade-in">
                    {previews.map((preview, idx) => (
                      <img key={idx} src={preview} alt={`Preview ${idx}`} className="w-full h-20 object-cover rounded border-2 border-indigo-200 hover:border-indigo-600 transition" />
                    ))}
                  </div>
                )}
                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setSelectedFiles([]); setPreviews([]); }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition hover-scale"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 hover-scale shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                        Uploading...
                      </span>
                    ) : (
                      'Upload'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Gallery;
