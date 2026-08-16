import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FaUpload, FaSave, FaBuilding, FaPhone, FaEnvelope, FaGlobe, FaMapMarkerAlt, FaEdit, FaTimes } from 'react-icons/fa';

const Profile = () => {
  const { business, refreshBusiness } = useAuth();
  const [isEditMode, setIsEditMode] = useState(!business);
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    logo: null,
  });
  const [logoPreview, setLogoPreview] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (business) {
      setFormData({
        name: business.name || '',
        tagline: business.tagline || '',
        description: business.description || '',
        phone: business.phone || '',
        email: business.email || '',
        website: business.website || '',
        address: business.address || '',
        logo: null,
      });
      if (business.logo) {
        setLogoPreview(business.logo);
      }
    }
  }, [business]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, logo: file });
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('bizcardly_token');
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      const data = new FormData();
      
      // Add text fields
      data.append('name', formData.name || '');
      data.append('tagline', formData.tagline || '');
      data.append('description', formData.description || '');
      data.append('phone', formData.phone || '');
      data.append('email', formData.email || '');
      data.append('website', formData.website || '');
      data.append('address', formData.address || '');
      
      // Only add logo if it's a new file (File object)
      if (formData.logo && formData.logo instanceof File) {
        data.append('logo', formData.logo);
      }

      console.log('Submitting profile data...', {
        method: business ? 'PUT' : 'POST',
        token: token ? 'Present' : 'Missing',
      });

      const res = await fetch('http://localhost:5000/api/business', {
        method: business ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: data,
      });

      const result = await res.json();
      console.log('Response:', result, 'Status:', res.status);
      
      if (!res.ok) {
        throw new Error(result.message || `Failed to save profile (${res.status})`);
      }
      
      toast.success('Profile saved successfully!');
      await refreshBusiness();
      setIsEditMode(false);
    } catch (err) {
      console.error('Profile save error:', err);
      toast.error(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  // VIEW MODE - Display saved data
  if (!isEditMode && business) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between animate-slide-in-left">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Business Profile</h2>
            <p className="text-gray-600">Your business information</p>
          </div>
          <button
            onClick={() => setIsEditMode(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition hover-lift shadow-lg"
          >
            <FaEdit />
            Edit Profile
          </button>
        </div>

        {/* Logo & Name Card */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-md p-8 animate-slide-in-up hover:shadow-lg transition">
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 rounded-xl bg-white flex items-center justify-center overflow-hidden border-2 border-indigo-200 shadow-md">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <FaBuilding className="text-gray-300 text-4xl" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-1">{business.name || 'Business Name'}</h1>
              <p className="text-lg text-indigo-600 font-semibold mb-2">{business.tagline || 'Add a tagline'}</p>
              <p className="text-gray-600">{business.slug}</p>
            </div>
          </div>
        </div>

        {/* Description Card */}
        {business.description && (
          <div className="bg-white rounded-xl shadow-md p-6 animate-staggered hover:shadow-lg transition">
            <h3 className="text-lg font-bold text-gray-800 mb-3">About</h3>
            <p className="text-gray-600 leading-relaxed">{business.description}</p>
          </div>
        )}

        {/* Contact Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-staggered">
          {business.phone && (
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition group">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                  <FaPhone className="text-indigo-600" />
                </div>
                <h4 className="font-semibold text-gray-800">Phone</h4>
              </div>
              <p className="text-gray-600 ml-13">{business.phone}</p>
            </div>
          )}

          {business.email && (
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition group">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                  <FaEnvelope className="text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-800">Email</h4>
              </div>
              <p className="text-gray-600 ml-13 break-all">{business.email}</p>
            </div>
          )}

          {business.website && (
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition group">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                  <FaGlobe className="text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-800">Website</h4>
              </div>
              <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 ml-13 break-all">
                {business.website}
              </a>
            </div>
          )}

          {business.address && (
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition group">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                  <FaMapMarkerAlt className="text-red-600" />
                </div>
                <h4 className="font-semibold text-gray-800">Address</h4>
              </div>
              <p className="text-gray-600 ml-13">{business.address}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // EDIT MODE - Show form
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between animate-slide-in-left">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Edit Business Profile</h2>
          <p className="text-gray-600">Update your business information</p>
        </div>
        <button
          onClick={() => setIsEditMode(false)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition hover-lift"
        >
          <FaTimes />
          Cancel
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 animate-slide-in-up">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo Upload */}
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 hover:border-indigo-400 transition group">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              ) : (
                <FaBuilding className="text-gray-400 text-4xl group-hover:text-indigo-400 transition" />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Logo</label>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700 transition hover-lift shadow-lg">
                <FaUpload />
                <span>Upload Logo</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-staggered">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition hover:border-gray-400"
                placeholder="Your Business Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition hover:border-gray-400"
                placeholder="Your tagline"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition hover:border-gray-400"
              placeholder="Tell customers about your business..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-staggered">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <div className="relative group">
                <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition hover:border-gray-400"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative group">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition hover:border-gray-400"
                  placeholder="contact@business.com"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-staggered">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
              <div className="relative group">
                <FaGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition" />
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition hover:border-gray-400"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <div className="relative group">
                <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition hover:border-gray-400"
                  placeholder="123 Main Street, City"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsEditMode(false)}
              className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition hover-lift"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 hover-lift shadow-lg hover:shadow-xl"
            >
              <FaSave />
              {loading ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
