import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaEye, FaCalendarDay, FaCalendarWeek, FaCalendarAlt } from 'react-icons/fa';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('bizcardly_token');
      const res = await fetch('https://bizcardly.onrender.com/api/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) setAnalytics(data.analytics);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Analytics</h2>
          <p className="text-gray-600">Track your business card views</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-shimmer">
              <div className="h-12 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return <div className="text-center py-12 text-gray-500 animate-fade-in">No analytics data available</div>;
  }

  const stats = [
    { label: 'Total Views', value: analytics.total, icon: FaEye, color: 'bg-blue-500' },
    { label: 'Today', value: analytics.today, icon: FaCalendarDay, color: 'bg-green-500' },
    { label: 'This Week', value: analytics.week, icon: FaCalendarWeek, color: 'bg-purple-500' },
    { label: 'This Month', value: analytics.month, icon: FaCalendarAlt, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-slide-in-left">
        <h2 className="text-2xl font-bold text-gray-800">Analytics</h2>
        <p className="text-gray-600">Track your business card views</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-staggered">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6 hover-lift transition group">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition transform`}>
                  <Icon className="text-white text-xl" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-800">{stat.value}</h3>
              <p className="text-gray-600 text-sm mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 animate-slide-in-up hover:shadow-lg transition">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Views Over Last 7 Days</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.last7Days}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
              <Line type="monotone" dataKey="views" stroke="#4f46e5" strokeWidth={2} dot={{ fill: '#4f46e5', r: 5 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
