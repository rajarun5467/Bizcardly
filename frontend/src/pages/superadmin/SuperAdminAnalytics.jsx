import { useState, useEffect } from 'react';
import {
  Area, AreaChart, BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { FaEye, FaBox, FaConciergeBell, FaImages, FaVideo, FaTrophy } from 'react-icons/fa';
import { API_BASE_URL } from '../../api/config';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
    <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${color} mb-3`}>
      <Icon className="text-white text-sm" />
    </div>
    <div className="text-2xl font-bold text-slate-800">{value}</div>
    <div className="text-sm text-slate-500">{label}</div>
  </div>
);

const SuperAdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await fetch(`${API_BASE_URL}/superadmin/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      setData(result.analytics);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-5 animate-pulse">
              <div className="h-10 w-10 bg-slate-200 rounded-lg mb-3"></div>
              <div className="h-6 bg-slate-200 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-slate-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
        <div className="h-80 bg-slate-100 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600 font-medium">{error}</div>;
  }

  const v = data.visitors;
  const c = data.contentStats;

  return (
    <div className="space-y-6">
      {/* Visitor Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={FaEye} label="Total Visits" value={v.total} color="bg-green-500" />
        <StatCard icon={FaEye} label="Today" value={v.today} color="bg-blue-500" />
        <StatCard icon={FaEye} label="This Week" value={v.week} color="bg-indigo-500" />
        <StatCard icon={FaEye} label="This Month" value={v.month} color="bg-purple-500" />
      </div>

      {/* Visitor Trend 30 Days */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-1">Visitor Trend (30 Days)</h3>
        <p className="text-sm text-slate-500 mb-4">Platform-wide visitor activity</p>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data.visitorTrend30Days}>
            <defs>
              <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" interval={4} />
            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" allowDecimals={false} />
            <Tooltip />
            <Area type="monotone" dataKey="views" stroke="#10b981" strokeWidth={2} fill="url(#colorVisits)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* User Registrations & Content Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Daily Registrations (7 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.dailyRegistrations}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="users" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Content Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <StatCard icon={FaBox} label="Products" value={c.totalProducts} color="bg-purple-500" />
            <StatCard icon={FaConciergeBell} label="Services" value={c.totalServices} color="bg-pink-500" />
            <StatCard icon={FaImages} label="Gallery" value={c.totalGallery} color="bg-teal-500" />
            <StatCard icon={FaVideo} label="Videos" value={c.totalVideos} color="bg-indigo-500" />
          </div>
        </div>
      </div>

      {/* Top 10 Businesses */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FaTrophy className="text-amber-500" />
          <h3 className="text-lg font-semibold text-slate-800">Top 10 Businesses by Visitors</h3>
        </div>
        {data.topBusinesses.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No visitor data yet</p>
        ) : (
          <div className="space-y-2">
            {data.topBusinesses.map((biz, i) => (
              <div key={biz._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${i < 3 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
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
    </div>
  );
};

export default SuperAdminAnalytics;
