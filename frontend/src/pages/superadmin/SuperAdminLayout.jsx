import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaHome, FaUsers, FaBriefcase, FaChartBar, FaShieldAlt,
  FaCog, FaSignOutAlt, FaBars, FaTimes, FaBell, FaChevronDown,
  FaClipboardList, FaCrown, FaHeadset, FaUserPlus,
} from 'react-icons/fa';
import { API_BASE_URL } from '../../api/config';
import toast from 'react-hot-toast';

const SuperAdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('superadmin_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.role !== 'superadmin') {
        navigate('/superadmin/login');
        return;
      }
      setAdmin(user);
    } else {
      navigate('/superadmin/login');
    }
  }, [navigate]);

  const menuItems = [
    { path: '/superadmin/dashboard', icon: FaHome, label: 'Dashboard' },
    { path: '/superadmin/users', icon: FaUsers, label: 'Users' },
    { path: '/superadmin/customers', icon: FaUserPlus, label: 'Customers' },
    { path: '/superadmin/businesses', icon: FaBriefcase, label: 'Businesses' },
    { path: '/superadmin/subscriptions', icon: FaCrown, label: 'Subscriptions' },
    { path: '/superadmin/analytics', icon: FaChartBar, label: 'Analytics' },
    { path: '/superadmin/moderation', icon: FaShieldAlt, label: 'Moderation' },
    { path: '/superadmin/support', icon: FaHeadset, label: 'Support Tickets' },
    { path: '/superadmin/activity-logs', icon: FaClipboardList, label: 'Activity Logs' },
    { path: '/superadmin/settings', icon: FaCog, label: 'Settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('superadmin_token');
    localStorage.removeItem('superadmin_user');
    toast.success('Logged out successfully');
    navigate('/');
  };

  const getPageTitle = () => {
    const item = menuItems.find((m) => location.pathname.startsWith(m.path));
    return item ? item.label : 'SuperAdmin';
  };

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-slate-900 text-white rounded-xl shadow-lg"
      >
        {sidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-[260px] overflow-y-auto bg-slate-900 text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 flex flex-col`}>
        <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-700/50">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
            <FaShieldAlt className="text-lg text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">SuperAdmin</h1>
            <p className="text-xs text-slate-400">BizCardly Platform</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`text-base ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-700/50 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-red-400 transition hover:bg-red-500/10"
          >
            <FaSignOutAlt />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <header className="mb-6 flex items-center justify-between gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm border border-slate-200">
            <div className="pl-12 lg:pl-0">
              <h2 className="text-xl font-bold text-slate-800">{getPageTitle()}</h2>
              <p className="text-sm text-slate-500 mt-0.5">SuperAdmin Panel</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-slate-100 transition"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
                    {admin.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-slate-800">{admin.name}</p>
                    <p className="text-xs text-slate-500">{admin.email}</p>
                  </div>
                  <FaChevronDown className="text-xs text-slate-400" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                    <button
                      onClick={() => { setProfileOpen(false); handleLogout(); }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page content */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SuperAdminLayout;
