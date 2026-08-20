import { useState, useEffect } from 'react';
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
  BarChart, Bar,
} from 'recharts';
import {
  FaUsers, FaUserCheck, FaUserTimes, FaBriefcase, FaBox, FaConciergeBell,
  FaImages, FaVideo, FaEye, FaClock, FaArrowRight, FaCrown, FaGift,
  FaHeadset, FaExclamationTriangle, FaDownload,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../api/config';

const StatCard = ({ icon: Icon, label, value, color, sublabel }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition">
    <div className="flex items-center justify-between mb-3">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
        <Icon className="text-lg text-white" />
      </div>
    </div>
    <div className="text-2xl font-bold text-slate-800">{value}</div>
    <div className="text-sm text-slate-500 mt-1">{label}</div>
    {sublabel && <div className="text-xs text-slate-400 mt-0.5">{sublabel}</div>}
  </div>
);

const SuperAdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await fetch(`${API_BASE_URL}/superadmin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to load dashboard');
      setData(result.dashboard);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-5 animate-pulse">
              <div className="h-10 w-10 bg-slate-200 rounded-lg mb-3"></div>
              <div className="h-6 bg-slate-200 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-slate-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  const s = data.stats;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard icon={FaUsers} label="Total Users" value={s.totalUsers} color="bg-blue-500" sublabel={`${s.activeUsers} active`} />
        <StatCard icon={FaUserTimes} label="Blocked Users" value={s.blockedUsers} color="bg-red-500" />
        <StatCard icon={FaBriefcase} label="Total Businesses" value={s.totalBusinesses} color="bg-indigo-500" sublabel={`${s.publishedBusinesses} published`} />
        <StatCard icon={FaBriefcase} label="Suspended" value={s.suspendedBusinesses} color="bg-orange-500" />
        <StatCard icon={FaGift} label="Free Users" value={s.freeUsers || 0} color="bg-slate-500" />
        <StatCard icon={FaCrown} label="Pro Users" value={s.proUsers || 0} color="bg-purple-500" sublabel={`${s.activeSubs || 0} active subs`} />
        <StatCard icon={FaClock} label="Expiring Soon" value={s.expiringSoon || 0} color="bg-amber-500" sublabel="Within 30 days" />
        <StatCard icon={FaHeadset} label="Open Tickets" value={s.openTickets || 0} color="bg-cyan-500" sublabel={`${s.highPriorityTickets || 0} high priority`} />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link to="/superadmin/users" className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
          <FaUsers className="text-indigo-500" /> Manage Users
        </Link>
        <Link to="/superadmin/support" className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
          <FaHeadset className="text-cyan-500" /> View Support Tickets
        </Link>
        <Link to="/superadmin/subscriptions" className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
          <FaCrown className="text-purple-500" /> Manage Subscriptions
        </Link>
        <Link to="/superadmin/users" className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
          <FaDownload className="text-green-500" /> Export Users
        </Link>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth - 7 days */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-1">User Growth (7 Days)</h3>
          <p className="text-sm text-slate-500 mb-4">New user registrations</p>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data.userGrowth7Days}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2} fill="url(#colorUsers)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Growth */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-1">Monthly Growth (6 Months)</h3>
          <p className="text-sm text-slate-500 mb-4">User registrations per month</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.userGrowth6Months}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="users" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Businesses & Recent Businesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Businesses */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Top Visited Businesses</h3>
          {data.topBusinesses.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No visitor data yet</p>
          ) : (
            <div className="space-y-3">
              {data.topBusinesses.map((biz, i) => (
                <div key={biz._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{biz.businessName}</p>
                    <p className="text-xs text-slate-500 truncate">/{biz.slug}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-indigo-600">{biz.visitCount}</div>
                    <div className="text-xs text-slate-400">visits</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Businesses */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Recent Businesses</h3>
            <Link to="/superadmin/businesses" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View all <FaArrowRight className="text-xs" />
            </Link>
          </div>
          {data.recentBusinesses.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No businesses yet</p>
          ) : (
            <div className="space-y-3">
              {data.recentBusinesses.map((biz) => (
                <div key={biz._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 overflow-hidden">
                    {biz.logo ? (
                      <img src={biz.logo} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <FaBriefcase className="text-slate-400 text-sm" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{biz.businessName}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {biz.userId?.name || 'Unknown'} • {new Date(biz.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {biz.isSuspended && (
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full font-medium">Suspended</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default SuperAdminDashboard;
