import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaPhone, FaEnvelope, FaGlobe, FaMapMarkerAlt, FaShareAlt,
  FaWhatsapp, FaFacebook, FaInstagram, FaTwitter, FaLinkedin,
  FaBox, FaConciergeBell, FaImages, FaVideo, FaUserLock
} from 'react-icons/fa';
import { API_BASE_URL } from '../api/config';

const API_ORIGIN = API_BASE_URL.replace(/\/api$/, '');

const assetUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path) || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }
  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
};

const paymentQrUrl = (business) => assetUrl(business?.paymentQr || business?.paymentQR);

const BusinessCard = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    fetchBusiness();
    recordVisit();
  }, [slug]);

  const fetchBusiness = async () => {
    try {
      const res = await fetch(`${API_ORIGIN}/api/business/slug/${slug}`);
      const data = await res.json();
      if (res.ok) {
        setBusiness({
          ...data.business,
          products: data.products || [],
          services: data.services || [],
          gallery: data.gallery || [],
          videos: data.videos || [],
        });
      }
    } catch (err) {
      console.error('Failed to fetch business:', err);
    } finally {
      setLoading(false);
    }
  };

  const recordVisit = async () => {
    try {
      await fetch(`${API_ORIGIN}/api/visitors/${slug}`, { method: 'POST' });
    } catch (err) {
      console.error('Failed to record visit:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: business?.name,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleCall = () => {
    const phoneNumber = (business?.phone || business?.contactNumber || '6394518942').replace(/[^\d+]/g, '');
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  const handleEmail = () => {
    const email = business?.email;
    if (email) {
      window.open(`mailto:${email}`, '_self');
    } else {
      alert('Email address not available');
    }
  };

  const handleWhatsapp = () => {
    const whatsappNumber = business?.whatsapp || business?.socialLinks?.whatsapp;
    if (whatsappNumber) {
      window.open(`https://wa.me/${whatsappNumber.replace(/[^\d]/g, '')}`);
    }
  };

  const handleMaps = () => {
    if (business?.location?.latitude && business?.location?.longitude) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${business.location.latitude},${business.location.longitude}`
      );
    } else if (business?.location?.mapUrl) {
      window.open(business.location.mapUrl);
    }
  };

  const handleFrontCardClick = (e) => {
    if (e.target.closest('button, a, iframe')) return;
    setIsFlipped(true);
  };

  const handleBackCardClick = (e) => {
    if (e.target.closest('button, a, iframe')) return;
    setIsFlipped(false);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Business not found</h1>
          <p className="text-gray-600 mt-2">The business card you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const socialButtons = [
    { key: 'whatsapp', icon: FaWhatsapp, color: 'bg-[#1fc86a]', action: handleWhatsapp },
    { key: 'facebook', icon: FaFacebook, color: 'bg-[#1877f2]', action: () => business.socialLinks?.facebook && window.open(business.socialLinks.facebook) },
    { key: 'instagram', icon: FaInstagram, color: 'bg-[#f13a76]', action: () => business.socialLinks?.instagram && window.open(business.socialLinks.instagram) },
    { key: 'twitter', icon: FaTwitter, color: 'bg-[#1da1f2]', action: () => business.socialLinks?.twitter && window.open(business.socialLinks.twitter) },
    { key: 'linkedin', icon: FaLinkedin, color: 'bg-[#0a66c2]', action: () => business.socialLinks?.linkedin && window.open(business.socialLinks.linkedin) },
  ].filter(btn => btn.key === 'whatsapp' ? (business.whatsapp || business.socialLinks?.whatsapp) : business.socialLinks?.[btn.key]);

  const aboutText = business.description || 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.';
  const businessTitle = business.name || 'Your Business';
  const businessTagline = business.tagline || 'Tagline Goes Here';
  const businessStats = { views: business.views || 12458, leads: business.leads || 256 };
  const galleryPreview = assetUrl(business.gallery?.[0]?.imageUrl || business.gallery?.[0]?.image);
  const paymentQr = paymentQrUrl(business);
  const adminCounts = [
    { label: 'Products', value: business.products?.length || 0, icon: FaBox },
    { label: 'Services', value: business.services?.length || 0, icon: FaConciergeBell },
    { label: 'Photos', value: business.gallery?.length || 0, icon: FaImages },
    { label: 'Videos', value: business.videos?.length || 0, icon: FaVideo },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f5] via-[#fdf6f3] to-[#ede6df] px-2 py-3 sm:py-4">
      <div className="mx-auto flex max-w-[390px] justify-center [perspective:1200px]">
        <div className={`relative w-full transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
        <div
          onClick={handleFrontCardClick}
          className="relative w-full cursor-pointer overflow-hidden rounded-[24px] bg-white shadow-[0_18px_45px_rgba(20,12,34,0.18)] ring-1 ring-[#e0d9cf] [backface-visibility:hidden]"
        >
          <div className="absolute -left-16 top-10 h-28 w-28 rounded-full bg-[#7c38f4]/5" />
          <div className="absolute -right-14 bottom-10 h-32 w-32 rounded-full bg-[#5d2ad7]/5" />

          <div className="relative overflow-hidden rounded-b-[28px] bg-gradient-to-br from-[#6d28d9] via-[#5d2ad7] to-[#a78bfa] px-4 pb-11 pt-4">
            <div className="mb-3 flex items-center justify-start">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-white/15 backdrop-blur-sm text-[0.68rem] font-bold text-white border border-white/20">
                  {business.logo ? (
                    <img src={assetUrl(business.logo)} alt={`${businessTitle} logo`} className="h-full w-full object-cover" />
                  ) : (
                    businessTitle.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="text-[8px] font-bold uppercase tracking-[0.28em] text-white/75">Bizcardly</span>
              </div>
            </div>

            <div className="flex items-start justify-between gap-3">
              <div className="max-w-[50%]">
                <h1 className="text-[1.55rem] font-black leading-[1.05] tracking-[-0.03em] text-white">
                  Hello,<br />
                  <span className="text-white/90">We are</span><br />
                  <span className="text-white/90">here</span>
                </h1>
                <p className="mt-2 text-white/75 text-[0.62rem] font-semibold leading-snug">to help your business succeed</p>
                <div className="mt-2.5 h-1 w-12 rounded-full bg-gradient-to-r from-white to-white/40" />
              </div>

              <div className="relative flex-shrink-0">
                {business.profileImage ? (
                  <img src={assetUrl(business.profileImage)} alt={business.name} className="h-24 w-24 rounded-full border-[5px] border-white object-cover shadow-[0_12px_28px_rgba(20,12,34,0.32)]" />
                ) : business.logo ? (
                  <img src={assetUrl(business.logo)} alt={business.name} className="h-24 w-24 rounded-full border-[5px] border-white object-cover shadow-[0_12px_28px_rgba(20,12,34,0.32)]" />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border-[5px] border-white bg-gradient-to-br from-[#f3e8ff] to-[#e9d5ff] text-4xl font-black text-[#5d2ad7] shadow-[0_12px_28px_rgba(20,12,34,0.32)]">
                    {businessTitle.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="relative -mt-6 rounded-t-[26px] bg-white px-4 pb-4 pt-5">
            <div className="rounded-[18px] bg-gradient-to-br from-white to-[#faf9f8] px-4 py-3 shadow-[0_10px_24px_rgba(28,22,41,0.1)] ring-1 ring-[#ebe9e7]">
              <h2 className="text-center text-base font-black tracking-[-0.015em] text-slate-950">{businessTitle}</h2>
              <p className="mt-1 text-center text-[0.62rem] font-bold text-[#7c3aed] uppercase tracking-[0.14em]">{businessTagline}</p>

              <div className="mt-3 flex items-center justify-center gap-3">
                {socialButtons.length > 0 ? (
                  socialButtons.map((btn) => {
                    const Icon = btn.icon;
                    return (
                      <button
                        key={btn.key}
                        onClick={btn.action}
                        className={`${btn.color} flex h-9 w-9 items-center justify-center rounded-full text-sm text-white shadow-md transition duration-200 hover:scale-110 hover:shadow-lg active:scale-95`}
                        title={btn.key}
                      >
                        <Icon className="text-base" />
                      </button>
                    );
                  })
                ) : (
                  <div className="flex gap-3.5">
                    <button onClick={handleCall} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1fc86a] text-white shadow-md hover:scale-110 transition duration-200"><FaPhone className="text-xs" /></button>
                    <button onClick={handleEmail} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2563eb] text-white shadow-md hover:scale-110 transition duration-200"><FaEnvelope className="text-xs" /></button>
                    <button onClick={handleMaps} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ef4444] text-white shadow-md hover:scale-110 transition duration-200"><FaMapMarkerAlt className="text-xs" /></button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 rounded-[18px] bg-gradient-to-br from-white to-[#faf9f8] px-4 py-3 text-center shadow-[0_10px_24px_rgba(28,22,41,0.1)] ring-1 ring-[#ebe9e7]">
              <div className="mb-2 flex items-center justify-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#ede9fe] to-[#f3e8ff] text-[#6d28d9]">
                  <FaGlobe className="text-[0.8rem]" />
                </div>
                <h3 className="text-[0.74rem] font-black uppercase tracking-[0.16em] text-slate-900">About Us</h3>
              </div>
              <p className="mx-auto line-clamp-3 max-w-[300px] text-center text-[0.7rem] leading-[1.45] text-slate-700">{aboutText}</p>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-[18px] bg-gradient-to-br from-white to-[#faf9f8] px-3 py-3 shadow-[0_10px_24px_rgba(28,22,41,0.1)] ring-1 ring-[#ebe9e7] text-center hover:shadow-[0_12px_28px_rgba(28,22,41,0.13)] transition duration-200">
                <div className="flex items-center justify-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#eef2ff] to-[#e9d5ff] text-[#6d28d9] text-sm font-bold">
                    <FaPhone className="text-[0.7rem]" />
                  </div>
                  <div className="text-[1.05rem] font-black text-slate-950">{businessStats.views.toLocaleString()}</div>
                </div>
                <div className="mt-1 text-[0.55rem] font-bold uppercase tracking-[0.14em] text-slate-600">Total Views</div>
              </div>
              <div className="rounded-[18px] bg-gradient-to-br from-white to-[#faf9f8] px-3 py-3 shadow-[0_10px_24px_rgba(28,22,41,0.1)] ring-1 ring-[#ebe9e7] text-center hover:shadow-[0_12px_28px_rgba(28,22,41,0.13)] transition duration-200">
                <div className="flex items-center justify-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#f3e8ff] to-[#ede9fe] text-[#7c3aed] text-sm font-bold">
                    <FaEnvelope className="text-[0.7rem]" />
                  </div>
                  <div className="text-[1.05rem] font-black text-slate-950">{businessStats.leads.toLocaleString()}</div>
                </div>
                <div className="mt-1 text-[0.55rem] font-bold uppercase tracking-[0.14em] text-slate-600">Today's Views</div>
              </div>
            </div>

            {(business.products?.length > 0 || business.services?.length > 0 || business.gallery?.length > 0 || business.videos?.length > 0) && (
              <div className="mt-3 rounded-[18px] bg-gradient-to-br from-white to-[#faf9f8] p-3 shadow-[0_10px_24px_rgba(28,22,41,0.1)] ring-1 ring-[#ebe9e7]">
                <h3 className="text-[0.7rem] font-black uppercase tracking-[0.17em] text-slate-900 mb-2.5">Our Services</h3>

                <div className="grid grid-cols-3 gap-2">
                  {business.products?.length > 0 && (
                    <button onClick={() => setActiveTab('products')} className={`rounded-[14px] p-2 text-center transition ${activeTab === 'products' ? 'bg-gradient-to-br from-[#5d2ad7] to-[#8b5cf6] text-white shadow-md' : 'bg-[#faf8f5] text-slate-700 hover:bg-[#f5f3f0]'}`}>
                      <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-lg"><FaBox className="text-xs" /></div>
                      <div className="text-[0.58rem] font-bold">Products</div>
                    </button>
                  )}
                  {business.services?.length > 0 && (
                    <button onClick={() => setActiveTab('services')} className={`rounded-[14px] p-2 text-center transition ${activeTab === 'services' ? 'bg-gradient-to-br from-[#5d2ad7] to-[#8b5cf6] text-white shadow-md' : 'bg-[#faf8f5] text-slate-700 hover:bg-[#f5f3f0]'}`}>
                      <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-lg"><FaConciergeBell className="text-xs" /></div>
                      <div className="text-[0.58rem] font-bold">Services</div>
                    </button>
                  )}
                  {business.videos?.length > 0 && (
                    <button onClick={() => setActiveTab('videos')} className={`rounded-[14px] p-2 text-center transition ${activeTab === 'videos' ? 'bg-gradient-to-br from-[#5d2ad7] to-[#8b5cf6] text-white shadow-md' : 'bg-[#faf8f5] text-slate-700 hover:bg-[#f5f3f0]'}`}>
                      <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-lg"><FaVideo className="text-xs" /></div>
                      <div className="text-[0.58rem] font-bold">Videos</div>
                    </button>
                  )}
                </div>

                <div className="mt-2.5 space-y-2">
                  {activeTab === 'products' && business.products?.slice(0, 1).map((product) => (
                    <div key={product._id} className="flex items-center gap-2 rounded-[12px] bg-[#faf8f5] p-2 hover:bg-[#f5f3f0] transition">
                      {product.image && <img src={assetUrl(product.image)} alt={product.name} className="h-9 w-9 rounded-[10px] object-cover shadow-sm" />}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[0.68rem] font-bold text-slate-800">{product.name}</div>
                        <div className="text-[0.62rem] text-[#5d2ad7] font-bold">Rs. {product.price}</div>
                      </div>
                    </div>
                  ))}

                  {activeTab === 'services' && business.services?.slice(0, 1).map((service) => (
                    <div key={service._id} className="rounded-[12px] bg-[#faf8f5] p-2 hover:bg-[#f5f3f0] transition">
                      <div className="truncate text-[0.68rem] font-bold text-slate-800">{service.name}</div>
                      <div className="text-[0.62rem] text-[#5d2ad7] font-bold">Rs. {service.price}</div>
                    </div>
                  ))}

                  {activeTab === 'videos' && business.videos?.slice(0, 1).map((video) => (
                    <div key={video._id} className="overflow-hidden rounded-[12px] bg-[#faf8f5] shadow-sm">
                      <iframe src={`https://www.youtube.com/embed/${video.youtubeId}`} title={video.title} className="h-20 w-full" allowFullScreen />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsFlipped(true)}
              className="mt-3 flex w-full items-center justify-between rounded-full bg-gradient-to-r from-[#faf8f5] to-[#f5f3f0] px-4 py-2.5 text-slate-700 shadow-sm border border-[#e0d9cf] hover:shadow-md transition duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#f3e8ff] to-[#ede9fe] text-[0.65rem] font-bold text-[#6d28d9] border border-[#e9d5ff]">i</div>
                <div className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-slate-700">View back side</div>
              </div>
              <span className="text-base opacity-70">›</span>
            </button>

            <div className="mt-3 pb-1 text-center">
              <p className="text-[0.56rem] font-bold uppercase tracking-[0.2em] text-slate-500">Powered by Bizcardly</p>
            </div>
          </div>
        </div>

        <div
          onClick={handleBackCardClick}
          className="absolute inset-0 w-full cursor-pointer overflow-y-auto rounded-[24px] bg-gradient-to-br from-[#201047] via-[#4c1d95] to-[#7c3aed] p-4 text-white shadow-[0_18px_45px_rgba(20,12,34,0.18)] ring-1 ring-[#e0d9cf] [backface-visibility:hidden] [transform:rotateY(180deg)]"
        >
          <div className="absolute -left-14 top-10 h-28 w-28 rounded-full bg-white/10" />
          <div className="absolute -right-16 bottom-16 h-36 w-36 rounded-full bg-[#f06ab4]/15" />

          <div className="relative flex h-full flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/25 bg-white/15 text-sm font-black">
                  {business.logo ? (
                    <img src={assetUrl(business.logo)} alt={`${businessTitle} logo`} className="h-full w-full object-cover" />
                  ) : (
                    businessTitle.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="text-[0.58rem] font-bold uppercase tracking-[0.2em] text-white/65">Bizcardly</p>
                  <h2 className="max-w-[190px] truncate text-base font-black">{businessTitle}</h2>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white shadow-sm hover:bg-white/20"
                  title="Share"
                >
                  <FaShareAlt className="text-xs" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsFlipped(false)}
                  className="rounded-full border border-white/25 bg-white/10 px-3 py-2 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-white shadow-sm hover:bg-white/20"
                >
                  Front
                </button>
              </div>
            </div>

            <div className="mt-4 rounded-[20px] border border-white/15 bg-white/10 p-3 shadow-[0_16px_35px_rgba(0,0,0,0.18)] backdrop-blur-sm">
              <p className="text-center text-[0.62rem] font-bold uppercase tracking-[0.18em] text-white/65">Admin Panel Details</p>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {adminCounts.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-[12px] bg-white px-2 py-2 text-center text-slate-950 shadow-sm">
                      <Icon className="mx-auto mb-1 text-[0.72rem] text-[#6d28d9]" />
                      <div className="text-sm font-black">{item.value}</div>
                      <div className="text-[0.48rem] font-bold uppercase tracking-[0.08em] text-slate-500">{item.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-[16px] bg-white p-3 text-slate-900 shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-slate-500">
                  <FaBox className="text-[#6d28d9]" />
                  Latest Product
                </div>
                <p className="truncate text-[0.72rem] font-black">{business.products?.[0]?.name || 'No product added'}</p>
                <p className="mt-1 line-clamp-2 text-[0.58rem] leading-snug text-slate-500">{business.products?.[0]?.description || 'Add products from admin panel.'}</p>
              </div>
              <div className="rounded-[16px] bg-white p-3 text-slate-900 shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-slate-500">
                  <FaConciergeBell className="text-[#7c3aed]" />
                  Top Service
                </div>
                <p className="truncate text-[0.72rem] font-black">{business.services?.[0]?.name || 'No service added'}</p>
                <p className="mt-1 line-clamp-2 text-[0.58rem] leading-snug text-slate-500">{business.services?.[0]?.description || 'Add services from admin panel.'}</p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="overflow-hidden rounded-[16px] bg-white text-slate-900 shadow-sm">
                {galleryPreview ? (
                    <img src={galleryPreview} alt="Gallery preview" className="h-20 w-full object-cover" />
                ) : (
                  <div className="flex h-20 items-center justify-center bg-[#f3e8ff] text-[#6d28d9]"><FaImages /></div>
                )}
                <div className="px-3 py-2">
                  <p className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-slate-500">Gallery</p>
                  <p className="text-[0.68rem] font-black">{business.gallery?.length || 0} photos</p>
                </div>
              </div>
              <div className="rounded-[16px] bg-white p-3 text-slate-900 shadow-sm">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#fee2e2] text-[#ef4444]">
                  <FaVideo className="text-xs" />
                </div>
                <p className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-slate-500">Video</p>
                <p className="mt-1 line-clamp-2 text-[0.68rem] font-black leading-tight">{business.videos?.[0]?.title || 'No video added'}</p>
              </div>
            </div>

            <div className="mt-3 rounded-[16px] bg-white p-3 text-slate-900 shadow-sm">
              <div className="grid grid-cols-2 gap-2">
                <button onClick={handleMaps} className="min-w-0 rounded-[12px] bg-[#faf8f5] px-3 py-2 text-left">
                  <span className="block text-[0.55rem] font-bold uppercase tracking-[0.14em] text-slate-500">Location</span>
                  <span className="block truncate text-[0.68rem] font-black">{business.location?.mapUrl || business.address || 'Map not added'}</span>
                </button>
                <a href={business.website || business.socialLinks?.website || '#'} target="_blank" rel="noopener noreferrer" className="min-w-0 rounded-[12px] bg-[#faf8f5] px-3 py-2 text-left">
                  <span className="block text-[0.55rem] font-bold uppercase tracking-[0.14em] text-slate-500">Website</span>
                  <span className="block truncate text-[0.68rem] font-black">{business.website || business.socialLinks?.website || 'Not added'}</span>
                </a>
              </div>
              <div className="mt-2 flex justify-center gap-2">
                {socialButtons.length > 0 ? socialButtons.map((btn) => {
                  const Icon = btn.icon;
                  return (
                    <button key={btn.key} onClick={btn.action} className={`${btn.color} flex h-8 w-8 items-center justify-center rounded-full text-white shadow-sm`}>
                      <Icon className="text-xs" />
                    </button>
                  );
                }) : (
                  <span className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-slate-400">No social links added</span>
                )}
              </div>
            </div>

            <div className="mt-3 rounded-[18px] bg-white p-3 text-slate-900 shadow-[0_12px_30px_rgba(0,0,0,0.16)]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[12px] border-2 border-[#e5e0d8] bg-white p-2 shadow-sm">
                    {paymentQr ? (
                      <img src={paymentQr} alt="QR" className="h-full w-full rounded-[10px] object-cover" />
                    ) : (
                      <div className="grid h-full w-full grid-cols-4 gap-1 rounded-[8px] bg-[#faf8f5] p-1">
                        {Array.from({ length: 16 }).map((_, i) => (
                          <div key={i} className={i % 2 === 0 ? 'bg-slate-900 rounded' : 'bg-white'} />
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-[0.68rem] font-black uppercase tracking-[0.12em] text-slate-800">Scan & Pay</div>
                    <div className="mt-0.5 max-w-[110px] truncate text-[0.58rem] font-medium text-slate-500">{business.upiId || 'upi@bizcardly'}</div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button onClick={handleCall} className="rounded-full bg-gradient-to-br from-[#ede9fe] to-[#f3e8ff] px-4 py-2.5 text-[0.64rem] font-bold text-[#6d28d9] transition duration-200 hover:from-[#e9d5ff] hover:to-[#ede9fe] hover:shadow-md">Contact <span className="ml-0.5">-&gt;</span></button>
                  <button onClick={handleWhatsapp} className="rounded-full bg-gradient-to-br from-[#1fc86a] to-[#16a34a] px-4 py-2.5 text-[0.64rem] font-bold text-white transition duration-200 hover:from-[#16a34a] hover:to-[#15803d] hover:shadow-lg">WhatsApp <span className="ml-0.5">-&gt;</span></button>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <button
                onClick={() => navigate('/login')}
                className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-white/30 bg-white/10 px-4 py-3 text-[0.64rem] font-bold uppercase tracking-[0.14em] text-white transition duration-200 hover:bg-white/20 hover:shadow-md"
              >
                <FaUserLock className="text-xs" />
                Admin Login
              </button>
            </div>

          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessCard;
