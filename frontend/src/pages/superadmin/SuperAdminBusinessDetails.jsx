import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft, FaBan, FaCheckCircle, FaTrash, FaEye,
  FaBox, FaConciergeBell, FaImages, FaVideo, FaEye as FaVisitors,
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaGlobe,
} from 'react-icons/fa';
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { API_BASE_URL } from '../../api/config';
import toast from 'react-hot-toast';

const ConfirmModal = ({ open, onClose, onConfirm, title, message, confirmText, confirmColor }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-sm text-slate-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition font-medium">Cancel</button>
          <button onClick={onConfirm} className={`px-4 py-2 rounded-lg text-white transition font-medium ${confirmColor}`}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

const SuperAdminBusinessDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    fetchBusiness();
  }, [id]);

  const fetchBusiness = async () => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await fetch(`${API_BASE_URL}/superadmin/businesses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      setData(result);
    } catch (err) {
      toast.error(err.message);
      navigate('/superadmin/businesses');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendActivate = async () => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await fetch(`${API_BASE_URL}/superadmin/businesses/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isSuspended: !data.business.isSuspended }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      toast.success(result.message);
      fetchBusiness();
    } catch (err) {
      toast.error(err.message);
    }
    setModal(null);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await fetch(`${API_BASE_URL}/superadmin/businesses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      toast.success(result.message);
      navigate('/superadmin/businesses');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse"></div>
        <div className="h-64 bg-slate-100 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  if (!data) return null;
  const { business, products, services, gallery, videos, analytics } = data;

  return (
    <div className="space-y-5">
      <Link to="/superadmin/businesses" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 transition">
        <FaArrowLeft /> Back to Businesses
      </Link>

      {/* Business Profile */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100 overflow-hidden">
            {business.logo ? (
              <img src={business.logo} alt="" className="h-full w-full object-cover" />
            ) : (
              <FaBox className="text-slate-400 text-xl" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-800">{business.businessName}</h2>
            <p className="text-sm text-slate-500 mt-1">/{business.slug}</p>
            <p className="text-xs text-slate-400 mt-1">Owner: {business.userId?.name} ({business.userId?.email})</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {business.isSuspended ? (
              <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Suspended</span>
            ) : (
              <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Active</span>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 border-t border-slate-100 pt-4">
          {business.phone && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <FaPhone className="text-slate-400" /> {business.phone}
            </div>
          )}
          {business.email && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <FaEnvelope className="text-slate-400" /> {business.email}
            </div>
          )}
          {business.website && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <FaGlobe className="text-slate-400" /> <a href={business.website} target="_blank" rel="noreferrer" className="hover:text-indigo-600 truncate">{business.website}</a>
            </div>
          )}
          {business.address && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <FaMapMarkerAlt className="text-slate-400" /> <span className="truncate">{business.address}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 border-t border-slate-100 mt-4 pt-4">
          <a href={`/listing/${(business.category || 'uncategorized').toLowerCase().replace(/\s+/g, '-')}/${business.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition text-sm font-medium">
            <FaEye /> View Public Card
          </a>
          <button onClick={() => setModal('suspend')} className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm font-medium ${business.isSuspended ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}>
            {business.isSuspended ? <><FaCheckCircle /> Activate</> : <><FaBan /> Suspend</>}
          </button>
          <button onClick={() => setModal('delete')} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition text-sm font-medium">
            <FaTrash /> Delete Business
          </button>
        </div>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Visitors', value: analytics.totalVisitors, color: 'bg-green-500', icon: FaVisitors },
          { label: "Today's Visitors", value: analytics.todayVisitors, color: 'bg-blue-500', icon: FaEye },
          { label: 'This Week', value: analytics.weekVisitors, color: 'bg-indigo-500', icon: FaEye },
          { label: 'This Month', value: analytics.monthVisitors, color: 'bg-purple-500', icon: FaEye },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${stat.color} mb-3`}>
                <Icon className="text-white text-sm" />
              </div>
              <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Visitor Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Visitor Trend (7 Days)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={analytics.last7Days}>
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" allowDecimals={false} />
            <Tooltip />
            <Area type="monotone" dataKey="views" stroke="#10b981" strokeWidth={2} fill="url(#colorViews)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Content Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Products', value: products.length, icon: FaBox, color: 'bg-purple-500' },
          { label: 'Services', value: services.length, icon: FaConciergeBell, color: 'bg-pink-500' },
          { label: 'Gallery', value: gallery.length, icon: FaImages, color: 'bg-teal-500' },
          { label: 'Videos', value: videos.length, icon: FaVideo, color: 'bg-indigo-500' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 text-center">
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${stat.color} mb-2`}>
                <Icon className="text-white text-sm" />
              </div>
              <div className="text-xl font-bold text-slate-800">{stat.value}</div>
              <div className="text-xs text-slate-500">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Products List */}
      {products.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Products ({products.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {products.map((p) => (
              <div key={p._id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                {p.image && <img src={p.image} alt="" className="h-10 w-10 rounded-lg object-cover" />}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 truncate">{p.name}</p>
                  <p className="text-xs text-slate-500">Rs. {p.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gallery Preview */}
      {gallery.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Gallery ({gallery.length})</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {gallery.slice(0, 12).map((g) => (
              <div key={g._id} className="aspect-square rounded-lg overflow-hidden bg-slate-100">
                <img src={g.imageUrl} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmModal
        open={modal === 'suspend'}
        onClose={() => setModal(null)}
        onConfirm={handleSuspendActivate}
        title={business.isSuspended ? 'Activate Business' : 'Suspend Business'}
        message={`Are you sure you want to ${business.isSuspended ? 'activate' : 'suspend'} ${business.businessName}?`}
        confirmText={business.isSuspended ? 'Activate' : 'Suspend'}
        confirmColor={business.isSuspended ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}
      />
      <ConfirmModal
        open={modal === 'delete'}
        onClose={() => setModal(null)}
        onConfirm={handleDelete}
        title="Delete Business"
        message={`Are you sure you want to delete ${business.businessName}? This will permanently delete all products, services, gallery, videos, and visitor data. This cannot be undone.`}
        confirmText="Delete Permanently"
        confirmColor="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
};

export default SuperAdminBusinessDetails;
