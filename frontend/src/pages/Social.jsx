import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaWhatsapp, FaSave } from 'react-icons/fa';

const Social = () => {
  const { business, refreshBusiness } = useAuth();
  const [formData, setFormData] = useState({
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    whatsapp: '',
  });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [hasSavedLinks, setHasSavedLinks] = useState(false);

  useEffect(() => {
    if (business && business.socialLinks) {
      const savedLinks = {
        facebook: business.socialLinks.facebook || '',
        instagram: business.socialLinks.instagram || '',
        twitter: business.socialLinks.twitter || '',
        linkedin: business.socialLinks.linkedin || '',
        whatsapp: business.socialLinks.whatsapp || '',
      };
      setFormData(savedLinks);
      setHasSavedLinks(Boolean(Object.values(savedLinks).some((value) => value && value.toString().trim())));
      setShowModal(false);
    }
  }, [business]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/business/social', formData);
      const result = res.data;
      if (!result.success) throw new Error(result.message || 'Failed to save');
      toast.success('Social links saved successfully!');
      setHasSavedLinks(Boolean(Object.values(formData).some((value) => value && value.toString().trim())));
      setShowModal(false);
      await refreshBusiness();
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to save social links';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setShowModal(true);
  };

  const socialFields = [
    { key: 'facebook', icon: FaFacebook, label: 'Facebook', placeholder: 'https://facebook.com/yourpage' },
    { key: 'instagram', icon: FaInstagram, label: 'Instagram', placeholder: 'https://instagram.com/yourhandle' },
    { key: 'twitter', icon: FaTwitter, label: 'Twitter/X', placeholder: 'https://twitter.com/yourhandle' },
    { key: 'linkedin', icon: FaLinkedin, label: 'LinkedIn', placeholder: 'https://linkedin.com/in/yourprofile' },
    { key: 'whatsapp', icon: FaWhatsapp, label: 'WhatsApp', placeholder: '919876543210' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Social Links</h2>
        <p className="text-gray-600">Connect your social media accounts</p>
      </div>

      {hasSavedLinks && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-indigo-100">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-sm font-semibold text-indigo-600">Saved Links</p>
              <h3 className="text-lg font-bold text-gray-800">Social accounts connected</h3>
            </div>
            <button
              type="button"
              onClick={handleEditClick}
              className="px-4 py-2 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 font-medium hover:bg-indigo-100 transition"
            >
              Edit
            </button>
          </div>

          <div className="space-y-3">
            {socialFields.map((field) => {
              const value = formData[field.key];
              if (!value) return null;

              return (
                <div key={field.key} className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 p-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <field.icon className="text-indigo-600" />
                    <span className="text-sm font-medium text-gray-700">{field.label}</span>
                  </div>
                  <span className="text-sm text-gray-600 truncate max-w-[60%] break-all">{value}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!hasSavedLinks && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No social links added yet</p>
            <button
              type="button"
              onClick={handleEditClick}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition mx-auto"
            >
              <FaSave />
              Add Social Links
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl animate-in slide-in-from-bottom-4 zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {hasSavedLinks ? 'Edit Social Links' : 'Add Social Links'}
                  </h3>
                  <p className="text-sm text-gray-600">Connect your social media accounts</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>

              {socialFields.map((field) => {
                const Icon = field.icon;
                return (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
                    <div className="relative">
                      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={field.key === 'whatsapp' ? 'tel' : 'url'}
                        value={formData[field.key]}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        placeholder={field.placeholder}
                      />
                    </div>
                  </div>
                );
              })}

              <div className="flex items-center gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-3 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  <FaSave />
                  {loading ? 'Saving...' : hasSavedLinks ? 'Update Links' : 'Save Links'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Social;
