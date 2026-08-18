import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../api/config';
import {
  FaBuilding, FaEdit, FaEnvelope, FaGlobe, FaImage, FaMapMarkerAlt,
  FaPhone, FaRegTrashAlt, FaSave, FaUpload, FaWhatsapp
} from 'react-icons/fa';

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm outline-none transition hover:border-[#b9b4ff] focus:border-[#6657f1] focus:ring-4 focus:ring-[#6657f1]/10';

const iconInputClass =
  'w-full rounded-lg border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-medium text-slate-700 shadow-sm outline-none transition hover:border-[#b9b4ff] focus:border-[#6657f1] focus:ring-4 focus:ring-[#6657f1]/10';

const cardClass =
  'rounded-xl bg-white p-5 shadow-[0_12px_28px_rgba(40,51,92,0.08)] ring-1 ring-slate-200/80';

const MapPreview = () => null;

const assetUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads/')) return `${API_BASE_URL.replace('/api', '')}${url}`;
  return url;
};

const Profile = () => {
  const { business, refreshBusiness } = useAuth();
  const [editingSection, setEditingSection] = useState(null); // 'business-info', 'contact-info', 'address-info', or null
  const [showModal, setShowModal] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    phone: '',
    whatsapp: '',
    email: '',
    website: '',
    address: '',
    logo: null,
    profileImage: null,
  });
  const [logoPreview, setLogoPreview] = useState('');
  const [profilePreview, setProfilePreview] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (business) {
      setFormData({
        name: business.name || business.businessName || '',
        tagline: business.tagline || '',
        description: business.description || business.about || '',
        phone: business.phone || '',
        whatsapp: business.whatsapp || business.socialLinks?.whatsapp || '',
        email: business.email || '',
        website: business.website || business.socialLinks?.website || '',
        address: business.address || '',
        logo: null,
        profileImage: null,
      });
      setLogoPreview(business.logo || '');
      setProfilePreview(business.profileImage || '');
      if (!hasInitialized) {
        setEditingSection(null);
        setHasInitialized(true);
      }
    }
  }, [business, hasInitialized]);

  const updateField = (name, value) => {
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleImageChange = (field, setPreview) => (e) => {
    const file = e.target.files[0];
    if (file) {
      updateField(field, file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = (field, setPreview) => {
    updateField(field, null);
    setPreview('');
  };

  const openEditForm = (section) => {
    setEditingSection(section);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log('📋 Starting profile update');

    try {
      const token = localStorage.getItem('bizcardly_token');
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      console.log('📦 Preparing form data...');
      const data = new FormData();
      data.append('name', formData.name || '');
      data.append('businessName', formData.name || '');
      data.append('tagline', formData.tagline || '');
      data.append('description', formData.description || '');
      data.append('about', formData.description || '');
      data.append('phone', formData.phone || '');
      data.append('whatsapp', formData.whatsapp || '');
      data.append('email', formData.email || '');
      data.append('website', formData.website || '');
      data.append('address', formData.address || '');

      if (formData.logo && formData.logo instanceof File) {
        console.log(`  Logo: ${formData.logo.name} (${formData.logo.size} bytes)`);
        data.append('logo', formData.logo);
      }

      if (formData.profileImage && formData.profileImage instanceof File) {
        console.log(`  Profile Image: ${formData.profileImage.name} (${formData.profileImage.size} bytes)`);
        data.append('profileImage', formData.profileImage);
      }

      console.log('📤 Sending profile update request...');
      const res = await fetch(`${API_BASE_URL}/business`, {
        method: business ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      const result = await res.json();
      console.log('✅ Profile response:', result);
      
      if (!res.ok) {
        throw new Error(result.message || `Failed to save profile (${res.status})`);
      }

      toast.success('Business profile saved!');
      await refreshBusiness();
      setEditingSection(null);
      setShowModal(false);
      setHasInitialized(true);
    } catch (err) {
      console.error('❌ Profile save error:', err);
      toast.error(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  if (!business) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className={cardClass}>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0efff] text-[#6657f1]">
              <FaBuilding />
            </div>
            <h2 className="text-lg font-black text-[#11142f]">Business Profile</h2>
          </div>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No business profile created yet</p>
            <button
              type="button"
              onClick={() => openEditForm('business-info')}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#6657f1] to-[#5546dc] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#6657f1]/25 transition hover:-translate-y-0.5"
            >
              <FaEdit />
              Create Business Profile
            </button>
          </div>
        </div>

        {/* Edit Modal */}
        {showModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => { setShowModal(false); setEditingSection(null); }}
          >
            <div 
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-800">Create Business Profile</h3>
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setEditingSection(null); }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">Business Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      className={inputClass}
                      placeholder="Raj Tech Solutions"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">Tagline <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.tagline}
                      onChange={(e) => updateField('tagline', e.target.value)}
                      className={inputClass}
                      placeholder="Smart Technology, Better Business."
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">Description <span className="text-red-500">*</span></label>
                  <textarea
                    required
                    maxLength={500}
                    rows={4}
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    className={`${inputClass} resize-none leading-6`}
                    placeholder="Describe your business..."
                  />
                  <p className="mt-1 text-right text-xs font-medium text-slate-500">{formData.description.length} / 500</p>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setEditingSection(null); }}
                    className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#6657f1] to-[#5546dc] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#6657f1]/25 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FaSave />
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in sm:space-y-5">
      <section className={`${cardClass} overflow-hidden`}>
        <div className="mb-4 flex items-center gap-3 sm:mb-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0efff] text-[#6657f1]">
            <FaImage />
          </div>
          <h2 className="text-base font-black text-[#11142f] sm:text-lg">Business Information</h2>
        </div>

        <div className="mb-5 grid gap-4 sm:mb-6 sm:gap-5 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-[#f8fbff] to-white p-3 sm:p-4">
            <p className="mb-3 text-sm font-bold text-slate-700">Logo</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-slate-200 sm:h-32 sm:w-32">
                {business.logo ? (
                  <img 
                    src={assetUrl(business.logo)} 
                    alt="Logo" 
                    className="h-full w-full object-contain p-2"
                    onLoad={() => console.log(`✅ Logo loaded: ${business._id}`)}
                    onError={(e) => {
                      console.error(`❌ Logo failed to load: ${business._id}`, e);
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3C/svg%3E';
                    }}
                  />
                ) : (
                  <FaBuilding className="text-3xl text-slate-300 sm:text-4xl" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-[#11142f]">Business Logo</p>
                <p className="mt-1 text-xs font-medium text-slate-500">Shown on your digital card</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-[#f8f7ff] to-white p-3 sm:p-4">
            <p className="mb-3 text-sm font-bold text-slate-700">Profile Image</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex h-36 w-36 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e8e4ff] ring-1 ring-[#d6d1ff] sm:h-48 sm:w-48">
                {business.profileImage ? (
                  <img 
                    src={assetUrl(business.profileImage)} 
                    alt="Profile" 
                    className="h-full w-full object-cover"
                    onLoad={() => console.log(`✅ Profile image loaded: ${business._id}`)}
                    onError={(e) => {
                      console.error(`❌ Profile image failed to load: ${business._id}`, e);
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Ccircle cx="100" cy="100" r="100" fill="%23e8e4ff"/%3E%3C/svg%3E';
                    }}
                  />
                ) : (
                  <FaBuilding className="text-4xl text-[#6657f1]/45 sm:text-5xl" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-[#11142f] break-words">{business.name || business.businessName || 'Business Owner'}</p>
                <p className="mt-1 text-xs font-medium text-slate-500">Public profile photo</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
          <div>
            <p className="mb-2 text-sm font-bold text-slate-700">Business Name</p>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700 sm:px-4">{business.name || business.businessName || '-'}</div>
          </div>
          <div>
            <p className="mb-2 text-sm font-bold text-slate-700">Tagline</p>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700 sm:px-4">{business.tagline || '-'}</div>
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-sm font-bold text-slate-700">Description</p>
          <div className="min-h-[100px] rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium leading-6 text-slate-700 sm:min-h-[120px] sm:px-4">
            {business.description || business.about || '-'}
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => openEditForm('business-info')}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6657f1] to-[#5546dc] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#6657f1]/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#6657f1]/40 active:scale-95 sm:w-auto"
            >
              <FaEdit />
              Edit
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-2">
        <section className={cardClass}>
          <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0efff] text-[#6657f1]">
                <FaPhone />
              </div>
              <h2 className="text-base font-black text-[#11142f] sm:text-lg">Contact Information</h2>
            </div>
            <button
              type="button"
              onClick={() => openEditForm('contact-info')}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#bdb7ff] bg-white px-5 py-3 text-sm font-bold text-[#6657f1] shadow-md transition-all duration-200 hover:bg-[#f6f4ff] hover:border-[#6657f1] hover:shadow-lg active:scale-95 sm:w-auto"
            >
              <FaEdit />
              Edit
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            <div>
              <p className="mb-2 text-sm font-bold text-slate-700">Phone</p>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700 sm:px-4">{business.phone || '-'}</div>
            </div>
            <div>
              <p className="mb-2 text-sm font-bold text-slate-700">WhatsApp</p>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700 sm:px-4">{business.whatsapp || business.socialLinks?.whatsapp || '-'}</div>
            </div>
            <div>
              <p className="mb-2 text-sm font-bold text-slate-700">Email</p>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700 sm:px-4 break-all">{business.email || '-'}</div>
            </div>
            <div>
              <p className="mb-2 text-sm font-bold text-slate-700">Website</p>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700 sm:px-4">
                {business.website || business.socialLinks?.website ? (
                  <a href={business.website || business.socialLinks?.website} target="_blank" rel="noopener noreferrer" className="break-all text-[#6657f1]">
                    {business.website || business.socialLinks?.website}
                  </a>
                ) : (
                  '-'
                )}
              </div>
            </div>
          </div>
        </section>

        <section className={cardClass}>
          <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0efff] text-[#6657f1]">
                <FaMapMarkerAlt />
              </div>
              <h2 className="text-base font-black text-[#11142f] sm:text-lg">Business Address</h2>
            </div>
            <button
              type="button"
              onClick={() => openEditForm('address-info')}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#bdb7ff] bg-white px-5 py-3 text-sm font-bold text-[#6657f1] shadow-md transition-all duration-200 hover:bg-[#f6f4ff] hover:border-[#6657f1] hover:shadow-lg active:scale-95 sm:w-auto"
            >
              <FaEdit />
              Edit
            </button>
          </div>
          <p className="mb-2 text-sm font-bold text-slate-700">Address</p>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700 sm:px-4">{business.address || '-'}</div>
          <MapPreview />
        </section>
      </div>

      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => { setShowModal(false); setEditingSection(null); }}
        >
          <div 
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {editingSection === 'business-info' && 'Edit Business Information'}
                    {editingSection === 'contact-info' && 'Edit Contact Information'}
                    {editingSection === 'address-info' && 'Edit Business Address'}
                    {!editingSection && 'Edit Information'}
                  </h3>
                  <p className="text-sm text-gray-600">Update your business details</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingSection(null); }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>

              {editingSection === 'business-info' && (
                <>
                  <div className="mb-6 grid gap-5 lg:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-[#f8f7ff] to-white p-4">
                      <label className="mb-3 block text-sm font-bold text-slate-700">Profile Image <span className="text-red-500">*</span></label>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap">
                        <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e8e4ff] ring-1 ring-[#d6d1ff]">
                          {profilePreview ? (
                            <img src={profilePreview} alt="Profile preview" className="h-full w-full object-cover" />
                          ) : (
                            <FaBuilding className="text-4xl text-[#6657f1]/45" />
                          )}
                        </div>
                        <div className="flex w-full max-w-[220px] flex-col gap-3 sm:w-auto">
                          <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#bdb7ff] bg-white px-4 py-3 text-sm font-bold text-[#6657f1] transition hover:bg-[#f6f4ff] sm:w-[150px]">
                            <FaUpload />
                            Change Image
                            <input type="file" accept="image/*" onChange={handleImageChange('profileImage', setProfilePreview)} className="hidden" />
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage('profileImage', setProfilePreview)}
                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-3 text-sm font-bold text-red-500 transition hover:bg-red-50 sm:w-[150px]"
                          >
                            <FaRegTrashAlt />
                            Remove
                          </button>
                          <p className="text-xs font-medium text-slate-500">JPG, PNG or WEBP. Max size 2MB.</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-[#f8fbff] to-white p-4">
                      <label className="mb-3 block text-sm font-bold text-slate-700">Logo <span className="text-red-500">*</span></label>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap">
                        <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
                          {logoPreview ? (
                            <img src={logoPreview} alt="Logo preview" className="h-full w-full object-contain p-2" />
                          ) : (
                            <FaBuilding className="text-4xl text-slate-300" />
                          )}
                        </div>
                        <div className="flex w-full max-w-[220px] flex-col gap-3 sm:w-auto">
                          <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#bdb7ff] bg-white px-4 py-3 text-sm font-bold text-[#6657f1] transition hover:bg-[#f6f4ff] sm:w-[150px]">
                            <FaUpload />
                            Upload Logo
                            <input type="file" accept="image/*" onChange={handleImageChange('logo', setLogoPreview)} className="hidden" />
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage('logo', setLogoPreview)}
                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-3 text-sm font-bold text-red-500 transition hover:bg-red-50 sm:w-[150px]"
                          >
                            <FaRegTrashAlt />
                            Remove
                          </button>
                          <p className="text-xs font-medium text-slate-500">PNG, SVG or JPG. Max size 2MB.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">Business Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        className={inputClass}
                        placeholder="Raj Tech Solutions"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">Tagline <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={formData.tagline}
                        onChange={(e) => updateField('tagline', e.target.value)}
                        className={inputClass}
                        placeholder="Smart Technology, Better Business."
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">Description <span className="text-red-500">*</span></label>
                    <textarea
                      required
                      maxLength={500}
                      rows={4}
                      value={formData.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      className={`${inputClass} resize-none leading-6`}
                      placeholder="Describe your business..."
                    />
                    <p className="mt-1 text-right text-xs font-medium text-slate-500">{formData.description.length} / 500</p>
                  </div>
                </>
              )}

              {editingSection === 'contact-info' && (
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">Phone <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        className={iconInputClass}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">WhatsApp <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <FaWhatsapp className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="tel"
                        required
                        value={formData.whatsapp}
                        onChange={(e) => updateField('whatsapp', e.target.value)}
                        className={iconInputClass}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">Email <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        className={iconInputClass}
                        placeholder="contact@rajtechsolutions.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">Website <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <FaGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="url"
                        required
                        value={formData.website}
                        onChange={(e) => updateField('website', e.target.value)}
                        className={iconInputClass}
                        placeholder="https://www.rajtechsolutions.com"
                      />
                    </div>
                  </div>
                </div>
              )}

              {editingSection === 'address-info' && (
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">Address <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      className={`${inputClass} pr-11`}
                      placeholder="Lucknow, Uttar Pradesh, India"
                    />
                    <FaMapMarkerAlt className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  </div>
                </div>
              )}

              {!editingSection && (
                <div className="text-center py-8 text-gray-500">
                  <p>No section selected for editing</p>
                  <p className="text-xs text-gray-400">EditingSection: {editingSection}</p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingSection(null); }}
                  className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#6657f1] to-[#5546dc] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#6657f1]/25 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FaSave />
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
