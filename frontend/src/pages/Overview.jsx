import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../api/config';
import {
  FaArrowRight, FaBox, FaChartLine, FaCog, FaConciergeBell, FaCreditCard,
  FaEye, FaImages, FaMapMarkerAlt, FaMousePointer, FaQrcode, FaShareAlt,
  FaStar, FaUserTie, FaUsers, FaVideo
} from 'react-icons/fa';
import {
  Area, AreaChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';

const Overview = () => {
  const { business, refreshBusiness } = useAuth();
  const [stats, setStats] = useState({ products: 0, services: 0, gallery: 0, videos: 0 });
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    if (!business) {
      refreshBusiness();
    }

    const fetchStats = async () => {
      try {
        console.log('📊 Fetching dashboard stats...');
        const token = localStorage.getItem('bizcardly_token');
        const [productsRes, servicesRes, galleryRes, videosRes, analyticsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/products`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/services`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/gallery`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/videos`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/visitors/analytics`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const [products, services, gallery, videos, analyticsData] = await Promise.all([
          productsRes.json(),
          servicesRes.json(),
          galleryRes.json(),
          videosRes.json(),
          analyticsRes.json(),
        ]);

        console.log('✅ Stats loaded:', {
          products: products.products?.length || 0,
          services: services.services?.length || 0,
          gallery: gallery.gallery?.length || 0,
          videos: videos.videos?.length || 0,
        });

        setStats({
          products: products.products?.length || 0,
          services: services.services?.length || 0,
          gallery: gallery.gallery?.length || 0,
          videos: videos.videos?.length || 0,
        });

        if (analyticsData.success && analyticsData.analytics) {
          setAnalytics(analyticsData.analytics);
        }
      } catch (err) {
        console.error('❌ Failed to fetch stats:', err);
      }
    };

    fetchStats();
  }, [business, refreshBusiness]);

  const metricCards = [
    { icon: FaUsers, label: 'Total Visitors', value: analytics?.total ?? 0, color: 'text-[#7557f4]', bg: 'bg-[#efeaff]' },
    { icon: FaEye, label: "Today's Views", value: analytics?.today ?? 0, color: 'text-[#20aa69]', bg: 'bg-[#e5f8ee]' },
    { icon: FaChartLine, label: 'This Week', value: analytics?.week ?? 0, color: 'text-[#ff8b22]', bg: 'bg-[#fff0df]' },
    { icon: FaMousePointer, label: 'This Month', value: analytics?.month ?? 0, color: 'text-[#2d8cff]', bg: 'bg-[#eaf3ff]' },
  ];

  const manageCards = [
    { icon: FaUserTie, label: 'Business Profile', path: '/dashboard/profile', description: 'Manage your business information, contact details and branding.', color: 'text-[#2299ff]', bg: 'bg-[#e9f5ff]' },
    { icon: FaBox, label: 'Products', path: '/dashboard/products', description: `Add, edit and manage ${stats.products || 'your'} products and categories.`, color: 'text-[#1bb86d]', bg: 'bg-[#e8f8ef]' },
    { icon: FaConciergeBell, label: 'Services', path: '/dashboard/services', description: `Add and manage ${stats.services || 'the'} services you offer to customers.`, color: 'text-[#ff912d]', bg: 'bg-[#fff0df]' },
    { icon: FaImages, label: 'Gallery', path: '/dashboard/gallery', description: 'Upload and manage your business images and photos.', color: 'text-[#8c61ff]', bg: 'bg-[#f1ebff]' },
    { icon: FaVideo, label: 'Videos', path: '/dashboard/videos', description: 'Add and manage videos about your business.', color: 'text-[#f05252]', bg: 'bg-[#ffe9e9]' },
    { icon: FaStar, label: 'Reviews', path: '/dashboard/analytics', description: 'Manage customer reviews and testimonials.', color: 'text-[#ffad23]', bg: 'bg-[#fff5df]' },
    { icon: FaShareAlt, label: 'Social Links', path: '/dashboard/social', description: 'Manage your social media links and handles.', color: 'text-[#2c8cff]', bg: 'bg-[#eaf3ff]' },
    { icon: FaCreditCard, label: 'Payment QR', path: '/dashboard/payment', description: 'Update and manage your payment QR codes.', color: 'text-[#22b36d]', bg: 'bg-[#e8f8ef]' },
    { icon: FaMapMarkerAlt, label: 'Location', path: '/dashboard/location', description: 'Manage your business address and location.', color: 'text-[#8c61ff]', bg: 'bg-[#f1ebff]' },
    { icon: FaChartLine, label: 'Visitor Analytics', path: '/dashboard/analytics', description: 'View detailed analytics and visitor insights.', color: 'text-[#2d8cff]', bg: 'bg-[#eaf3ff]' },
    { icon: FaQrcode, label: 'QR Code', path: '/dashboard/qrcode', description: 'Generate and download your digital card QR code.', color: 'text-[#ee5eb7]', bg: 'bg-[#ffeaf6]' },
    { icon: FaCog, label: 'Settings', path: '/dashboard/profile', description: 'Manage account settings and preferences.', color: 'text-[#64748b]', bg: 'bg-[#eef1f5]' },
  ];

  const visitorData = (analytics?.last7Days || []).map(d => ({ day: d.date, visitors: d.views }));

  const trafficData = [
    { name: 'Direct', value: 45, color: '#5b7cff' },
    { name: 'QR Code', value: 25, color: '#45c985' },
    { name: 'Social Media', value: 20, color: '#ff9c3d' },
    { name: 'Others', value: 10, color: '#8a69f6' },
  ];

  if (!business) {
    return (
      <div className="rounded-lg bg-white p-8 shadow-[0_18px_45px_rgba(35,45,85,0.08)] ring-1 ring-slate-200">
        <h2 className="text-3xl font-black text-[#11142f]">Welcome to Bizcardly!</h2>
        <p className="mt-3 text-base text-slate-600">Let's set up your business profile first.</p>
        <Link
          to="/dashboard/profile"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#151936] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-200 transition hover:-translate-y-0.5"
        >
          Create Business Profile <FaArrowRight />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="rounded-lg bg-white p-5 shadow-[0_12px_28px_rgba(40,51,92,0.08)] ring-1 ring-slate-200/80">
              <div className="flex items-center gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${metric.bg}`}>
                  <Icon className={`text-2xl ${metric.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{metric.label}</p>
                  <h3 className="mt-1 text-2xl font-black text-[#11142f]">{metric.value}</h3>
                  <p className="mt-2 text-xs text-slate-500">Real-time visitor data</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-lg font-black text-[#11142f]">Manage Your Digital Card</h3>
          {business.slug && (
            <a
              href={`${window.location.origin}/business/${business.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#151936] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5"
            >
              <FaQrcode />
              View Card
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {manageCards.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={`${action.label}-${action.path}`}
                to={action.path}
                className="group min-h-[128px] rounded-lg bg-white p-4 shadow-[0_12px_26px_rgba(40,51,92,0.07)] ring-1 ring-slate-200/80 transition hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(82,91,170,0.16)]"
              >
                <div className="flex h-full gap-3">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${action.bg}`}>
                    <Icon className={`text-xl ${action.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-black text-[#11142f]">{action.label}</h4>
                    <p className="mt-3 text-xs leading-5 text-slate-500">{action.description}</p>
                    <FaArrowRight className="ml-auto mt-1 text-sm text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#5b57f1]" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.9fr]">
        <div className="rounded-lg bg-white p-5 shadow-[0_12px_28px_rgba(40,51,92,0.08)] ring-1 ring-slate-200/80">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-black text-[#11142f]">Visitor Analytics Overview</h3>
            <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 outline-none focus:ring-2 focus:ring-[#6657f1]/20">
              <option>This Month</option>
              <option>Last Month</option>
            </select>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visitorData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="visitorFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#6761f4" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#6761f4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#edf0f6" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(value) => `${value / 1000}K`} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, borderColor: '#e2e8f0', boxShadow: '0 12px 28px rgba(15,23,42,0.12)' }} />
                <Area type="monotone" dataKey="visitors" stroke="#6761f4" strokeWidth={3} fill="url(#visitorFill)" dot={{ r: 3, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg bg-white p-5 shadow-[0_12px_28px_rgba(40,51,92,0.08)] ring-1 ring-slate-200/80">
          <h3 className="mb-4 text-base font-black text-[#11142f]">Top Traffic Sources</h3>
          <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[150px_1fr]">
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={trafficData} innerRadius={50} outerRadius={72} paddingAngle={2} dataKey="value">
                    {trafficData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {trafficData.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                  <span className="font-black text-[#11142f]">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
