import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaHome, FaBox, FaConciergeBell, FaImages, FaVideo,
  FaShareAlt, FaQrcode, FaMapMarkerAlt, FaChartBar,
  FaCreditCard, FaSignOutAlt, FaBars, FaTimes, FaUser,
  FaBell, FaChevronDown, FaBriefcase
} from 'react-icons/fa';

const Dashboard = () => {
  const { business, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const [hasViewedNotifications, setHasViewedNotifications] = useState(false);

  const menuItems = [
    { path: '/dashboard', icon: FaHome, label: 'Dashboard' },
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#eef5ff_0,#f8fbff_36%,#f5f2ff_100%)] text-slate-900 flex">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-[#151936] text-white rounded-xl shadow-lg"
      >
        {sidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-[280px] overflow-y-auto bg-[linear-gradient(180deg,#6657f1_0%,#5546dc_48%,#4535c6_100%)] text-white border-r border-white/10 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 shadow-[18px_0_50px_rgba(85,70,220,0.24)]`}>
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-lg shadow-[#5f70ff]/35 overflow-hidden">
            {business?.logo ? (
              <img src={business.logo} alt="Logo" className="h-full w-full object-contain p-2" />
            ) : (
              <FaBriefcase className="text-lg text-[#6657f1]" />
            )}
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight">My Business</h1>
            {business && (
              <p className="text-xs text-white/62 truncate max-w-[165px]">{business.name || 'Digital Card'}</p>
            )}
            {!business && <p className="text-xs text-white/62">Digital Card</p>}
          </div>
        </div>

        <nav className="px-4 pb-24 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-[#5546dc] shadow-lg shadow-[#3327a5]/20'
                    : 'text-white/82 hover:bg-white/14 hover:text-white'
                }`}
              >
                <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${isActive ? 'bg-[#6657f1]/12 text-[#5546dc]' : 'text-white/72 group-hover:bg-white/12 group-hover:text-white'}`}>
                  <Icon className="text-base" />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 bg-[#4535c6]/95 border-t border-white/10 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-[#ff7f7f] transition hover:bg-red-500/10"
          >
            <FaSignOutAlt />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="mb-7 flex items-center justify-between gap-4 rounded-2xl bg-white/80 px-5 py-4 shadow-[0_18px_40px_rgba(35,45,85,0.08)] ring-1 ring-slate-200/80 backdrop-blur">
            <div className="pl-12 lg:pl-0">
              <h2 className="text-2xl font-black tracking-tight text-[#11142f]">Dashboard</h2>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  alert('Notifications:\n1. New product added\n2. Service updated\n3. Gallery photo uploaded');
                  setHasViewedNotifications(true);
                  setNotificationCount(0);
                }}
                className="relative hidden h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 sm:flex hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <FaBell />
                {!hasViewedNotifications && notificationCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff5959] text-[10px] font-bold text-white">{notificationCount}</span>
                )}
              </button>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-full bg-white shadow-md ring-2 ring-[#6657f1]/20 p-0.5">
                  {business?.logo ? (
                    <img src={business.logo} alt="Logo" className="h-full w-full object-contain p-1.5" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-[#6657f1] to-[#5546dc] text-sm font-black text-white">
                      {(business?.name || 'JD').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-bold text-[#11142f]">{business?.name || 'John Doe'}</p>
                  <p className="text-xs text-slate-500">Business Owner</p>
                </div>
                <FaChevronDown className="hidden text-xs text-slate-500 sm:block" />
              </div>
            </div>
          </header>
          <Outlet />
        </div>
      </main>

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
