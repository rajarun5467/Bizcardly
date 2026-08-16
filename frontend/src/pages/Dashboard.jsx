import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaHome, FaBox, FaConciergeBell, FaImages, FaVideo,
  FaShareAlt, FaQrcode, FaMapMarkerAlt, FaChartBar,
  FaCreditCard, FaSignOutAlt, FaBars, FaTimes, FaUser
} from 'react-icons/fa';

const Dashboard = () => {
  const { user, business, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { path: '/dashboard', icon: FaHome, label: 'Overview' },
    { path: '/dashboard/profile', icon: FaUser, label: 'Business Profile' },
    { path: '/dashboard/products', icon: FaBox, label: 'Products' },
    { path: '/dashboard/services', icon: FaConciergeBell, label: 'Services' },
    { path: '/dashboard/gallery', icon: FaImages, label: 'Gallery' },
    { path: '/dashboard/videos', icon: FaVideo, label: 'Videos' },
    { path: '/dashboard/social', icon: FaShareAlt, label: 'Social Links' },
    { path: '/dashboard/payment', icon: FaCreditCard, label: 'Payment QR' },
    { path: '/dashboard/location', icon: FaMapMarkerAlt, label: 'Location' },
    { path: '/dashboard/analytics', icon: FaChartBar, label: 'Analytics' },
    { path: '/dashboard/qrcode', icon: FaQrcode, label: 'QR Code' },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {sidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 animate-slide-in-left`}>
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Bizcardly</h1>
          {business && (
            <p className="text-sm text-gray-500 mt-1 truncate">{business.name}</p>
          )}
        </div>
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-0 p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
