import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaBox, FaConciergeBell, FaImages, FaVideo, FaArrowRight, FaQrcode, FaChartLine } from 'react-icons/fa';

const Overview = () => {
  const { business, refreshBusiness } = useAuth();
  const [stats, setStats] = useState({ products: 0, services: 0, gallery: 0, videos: 0 });

  useEffect(() => {
    if (!business) {
      refreshBusiness();
    }
    // Fetch stats
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('bizcardly_token');
        const [productsRes, servicesRes, galleryRes, videosRes] = await Promise.all([
          fetch('http://localhost:5000/api/products', {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch('http://localhost:5000/api/services', {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch('http://localhost:5000/api/gallery', {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch('http://localhost:5000/api/videos', {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
        ]);
        const [products, services, gallery, videos] = await Promise.all([
          productsRes.json(),
          servicesRes.json(),
          galleryRes.json(),
          videosRes.json(),
        ]);
        setStats({
          products: products.products?.length || 0,
          services: services.services?.length || 0,
          gallery: gallery.gallery?.length || 0,
          videos: videos.videos?.length || 0,
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };
    fetchStats();
  }, [business]);

  const quickActions = [
    { icon: FaBox, label: 'Add Product', path: '/dashboard/products', count: stats.products },
    { icon: FaConciergeBell, label: 'Add Service', path: '/dashboard/services', count: stats.services },
    { icon: FaImages, label: 'Upload Photo', path: '/dashboard/gallery', count: stats.gallery },
    { icon: FaVideo, label: 'Add Video', path: '/dashboard/videos', count: stats.videos },
  ];

  if (!business) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to Bizcardly!</h2>
        <p className="text-gray-600 mb-6">Let's set up your business profile first.</p>
        <Link
          to="/dashboard/profile"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition hover-lift"
        >
          Create Business Profile <FaArrowRight />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between animate-slide-in-left">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Welcome back!</h2>
          <p className="text-gray-600">Here's what's happening with {business.name}</p>
        </div>
        {business.slug && (
          <a
            href={`${window.location.origin}/business/${business.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition hover-lift"
          >
            <FaQrcode />
            View Card
          </a>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-staggered">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.path}
              to={action.path}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition group hover-lift"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition transform group-hover:scale-110">
                  <Icon className="text-indigo-600 text-xl" />
                </div>
                <span className="text-2xl font-bold text-gray-800">{action.count}</span>
              </div>
              <h3 className="font-semibold text-gray-800">{action.label}</h3>
            </Link>
          );
        })}
      </div>

      {/* Quick Setup Checklist */}
      <div className="bg-white rounded-xl shadow-sm p-6 animate-slide-in-up">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaChartLine />
          Setup Progress
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 transition">
            <span className="text-gray-700">Business Profile</span>
            <span className={`font-semibold ${business.name ? 'text-green-600' : 'text-gray-400'}`}>
              {business.name ? '✓ Complete' : 'Pending'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 transition">
            <span className="text-gray-700">Products</span>
            <span className={`font-semibold ${stats.products > 0 ? 'text-green-600' : 'text-gray-400'}`}>
              {stats.products > 0 ? `✓ ${stats.products} Added` : 'Not added'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 transition">
            <span className="text-gray-700">Services</span>
            <span className={`font-semibold ${stats.services > 0 ? 'text-green-600' : 'text-gray-400'}`}>
              {stats.services > 0 ? `✓ ${stats.services} Added` : 'Not added'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 transition">
            <span className="text-gray-700">Gallery</span>
            <span className={`font-semibold ${stats.gallery > 0 ? 'text-green-600' : 'text-gray-400'}`}>
              {stats.gallery > 0 ? `✓ ${stats.gallery} Added` : 'Not added'}
            </span>
          </div>
        </div>
      </div>

      {/* Public Card Link */}
      {business.slug && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white animate-rotate-in hover:shadow-2xl transition">
          <h3 className="text-lg font-semibold mb-2">Your Digital Business Card is Live!</h3>
          <p className="text-indigo-100 mb-4">Share this link with your customers:</p>
          <div className="flex items-center gap-2 bg-white/20 rounded-lg p-3 backdrop-blur-sm">
            <code className="flex-1 text-sm">{window.location.origin}/business/{business.slug}</code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/business/${business.slug}`);
                toast.success('Link copied to clipboard!');
              }}
              className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition text-sm font-medium hover-scale"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;
