import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  FaPhone, FaEnvelope, FaGlobe, FaMapMarkerAlt, FaShareAlt,
  FaWhatsapp, FaFacebook, FaInstagram, FaTwitter, FaLinkedin,
  FaBox, FaConciergeBell, FaImages, FaVideo, FaArrowLeft
} from 'react-icons/fa';

const BusinessCard = () => {
  const { slug } = useParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    fetchBusiness();
    recordVisit();
  }, [slug]);

  const fetchBusiness = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/business/slug/${slug}`);
      const data = await res.json();
      if (res.ok) setBusiness(data.business);
    } catch (err) {
      console.error('Failed to fetch business:', err);
    } finally {
      setLoading(false);
    }
  };

  const recordVisit = async () => {
    try {
      await fetch(`http://localhost:5000/api/visitors/${slug}`, { method: 'POST' });
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
    if (business?.phone) window.open(`tel:${business.phone}`);
  };

  const handleEmail = () => {
    if (business?.email) window.open(`mailto:${business.email}`);
  };

  const handleWhatsapp = () => {
    if (business?.socialLinks?.whatsapp) {
      window.open(`https://wa.me/${business.socialLinks.whatsapp}`);
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
    { key: 'whatsapp', icon: FaWhatsapp, color: 'bg-green-500', action: handleWhatsapp },
    { key: 'facebook', icon: FaFacebook, color: 'bg-blue-600', action: () => window.open(business.socialLinks?.facebook) },
    { key: 'instagram', icon: FaInstagram, color: 'bg-pink-600', action: () => window.open(business.socialLinks?.instagram) },
    { key: 'twitter', icon: FaTwitter, color: 'bg-sky-500', action: () => window.open(business.socialLinks?.twitter) },
    { key: 'linkedin', icon: FaLinkedin, color: 'bg-blue-700', action: () => window.open(business.socialLinks?.linkedin) },
  ].filter(btn => business.socialLinks?.[btn.key]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => window.history.back()} className="p-2 hover:bg-gray-100 rounded-lg">
            <FaArrowLeft className="text-gray-600" />
          </button>
          <h1 className="font-semibold text-gray-800">{business.name}</h1>
          <button onClick={handleShare} className="p-2 hover:bg-gray-100 rounded-lg">
            <FaShareAlt className="text-gray-600" />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Profile Section */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {business.logo && (
            <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
              <img src={business.logo} alt={business.name} className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover" />
            </div>
          )}
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800">{business.name}</h2>
            {business.tagline && <p className="text-indigo-600 font-medium mt-1">{business.tagline}</p>}
            {business.description && <p className="text-gray-600 mt-3">{business.description}</p>}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-3">
          <button onClick={handleCall} className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center gap-2 hover:shadow-md transition">
            <FaPhone className="text-green-500 text-xl" />
            <span className="text-xs text-gray-600">Call</span>
          </button>
          <button onClick={handleEmail} className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center gap-2 hover:shadow-md transition">
            <FaEnvelope className="text-blue-500 text-xl" />
            <span className="text-xs text-gray-600">Email</span>
          </button>
          <button onClick={handleWhatsapp} className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center gap-2 hover:shadow-md transition">
            <FaWhatsapp className="text-green-600 text-xl" />
            <span className="text-xs text-gray-600">WhatsApp</span>
          </button>
          <button onClick={handleMaps} className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center gap-2 hover:shadow-md transition">
            <FaMapMarkerAlt className="text-red-500 text-xl" />
            <span className="text-xs text-gray-600">Maps</span>
          </button>
        </div>

        {/* Social Links */}
        {socialButtons.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Connect on Social</h3>
            <div className="flex gap-3">
              {socialButtons.map((btn) => {
                const Icon = btn.icon;
                return (
                  <button
                    key={btn.key}
                    onClick={btn.action}
                    className={`${btn.color} text-white p-3 rounded-xl hover:opacity-90 transition`}
                  >
                    <Icon size={20} />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tabs */}
        {(business.products?.length > 0 || business.services?.length > 0 || business.gallery?.length > 0 || business.videos?.length > 0) && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex border-b">
              {business.products?.length > 0 && (
                <button
                  onClick={() => setActiveTab('products')}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition ${activeTab === 'products' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600'}`}
                >
                  <FaBox className="inline mr-1" /> Products
                </button>
              )}
              {business.services?.length > 0 && (
                <button
                  onClick={() => setActiveTab('services')}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition ${activeTab === 'services' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600'}`}
                >
                  <FaConciergeBell className="inline mr-1" /> Services
                </button>
              )}
              {business.gallery?.length > 0 && (
                <button
                  onClick={() => setActiveTab('gallery')}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition ${activeTab === 'gallery' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600'}`}
                >
                  <FaImages className="inline mr-1" /> Gallery
                </button>
              )}
              {business.videos?.length > 0 && (
                <button
                  onClick={() => setActiveTab('videos')}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition ${activeTab === 'videos' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600'}`}
                >
                  <FaVideo className="inline mr-1" /> Videos
                </button>
              )}
            </div>

            <div className="p-4">
              {activeTab === 'products' && business.products?.map((product) => (
                <div key={product._id} className="flex gap-4 py-3 border-b last:border-0">
                  {product.image && <img src={product.image} alt={product.name} className="w-20 h-20 rounded-lg object-cover" />}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{product.name}</h4>
                    <p className="text-indigo-600 font-bold">₹{product.price}</p>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>
                  </div>
                </div>
              ))}

              {activeTab === 'services' && business.services?.map((service) => (
                <div key={service._id} className="py-3 border-b last:border-0">
                  <h4 className="font-semibold text-gray-800">{service.name}</h4>
                  <p className="text-indigo-600 font-bold">₹{service.price}</p>
                  <p className="text-gray-600 text-sm mt-1">{service.description}</p>
                </div>
              ))}

              {activeTab === 'gallery' && (
                <div className="grid grid-cols-3 gap-2">
                  {business.gallery?.map((item) => (
                    <img key={item._id} src={item.image} alt="Gallery" className="w-full h-24 object-cover rounded-lg" />
                  ))}
                </div>
              )}

              {activeTab === 'videos' && (
                <div className="space-y-3">
                  {business.videos?.map((video) => (
                    <div key={video._id} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <iframe src={`https://www.youtube.com/embed/${video.youtubeId}`} title={video.title} className="w-full h-full" allowFullScreen />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment QR */}
        {business.paymentQr && (
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <h3 className="font-semibold text-gray-800 mb-3">Scan to Pay</h3>
            <img src={business.paymentQr} alt="Payment QR" className="w-48 h-48 mx-auto" />
            {business.upiId && <p className="text-gray-600 mt-2">UPI: {business.upiId}</p>}
          </div>
        )}

        {/* Website Link */}
        {business.website && (
          <a
            href={business.website}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition"
          >
            <FaGlobe className="text-indigo-600 text-xl" />
            <div>
              <p className="font-semibold text-gray-800">Visit Website</p>
              <p className="text-gray-500 text-sm">{business.website}</p>
            </div>
          </a>
        )}

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">Powered by Bizcardly</p>
        </div>
      </div>
    </div>
  );
};

export default BusinessCard;
