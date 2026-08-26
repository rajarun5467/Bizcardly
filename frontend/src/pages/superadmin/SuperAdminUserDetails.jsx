import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft, FaBan, FaCheckCircle, FaTrash, FaEye, FaKey,
  FaEnvelope, FaCalendarAlt, FaBriefcase, FaBox, FaConciergeBell,
  FaImages, FaVideo, FaEye as FaVisitors,
} from 'react-icons/fa';
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

const SuperAdminUserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await fetch(`${API_BASE_URL}/superadmin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      setData(result);
    } catch (err) {
      toast.error(err.message);
      navigate('/superadmin/users');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUnblock = async () => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await fetch(`${API_BASE_URL}/superadmin/users/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isBlocked: !data.user.isBlocked }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      toast.success(result.message);
      fetchUser();
    } catch (err) {
      toast.error(err.message);
    }
    setModal(null);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await fetch(`${API_BASE_URL}/superadmin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      toast.success(result.message);
      navigate('/superadmin/users');
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

  const { user, business, businessStats } = data;

  return (
    <div className="space-y-5">
      {/* Back link */}
      <Link to="/superadmin/users" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 transition">
        <FaArrowLeft /> Back to Users
      </Link>

      {/* User Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-2xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-800">{user.name}</h2>
            <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
              <FaEnvelope className="text-xs" /> {user.email}
            </p>
            <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
              <FaCalendarAlt /> Joined {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.isBlocked ? (
              <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Blocked</span>
            ) : (
              <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Active</span>
            )}
            <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 capitalize">{user.role}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          {business && (
            <Link
              to={`/listing/${(business.category || 'uncategorized').toLowerCase().replace(/\s+/g, '-')}/${business.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition text-sm font-medium"
            >
              <FaEye /> View Public Card
            </Link>
          )}
          {business && (
            <Link
              to={`/superadmin/businesses/${business._id}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition text-sm font-medium"
            >
              <FaBriefcase /> View Business
            </Link>
          )}
          <button
            onClick={() => setModal('block')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm font-medium ${user.isBlocked ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}
          >
            {user.isBlocked ? <><FaCheckCircle /> Unblock</> : <><FaBan /> Block</>}
          </button>
          <button
            onClick={() => setModal('delete')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition text-sm font-medium"
          >
            <FaTrash /> Delete User
          </button>
        </div>
      </div>

      {/* Business Info */}
      {business && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Business Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500 font-medium">Business Name</label>
              <p className="text-sm text-slate-800 mt-1">{business.businessName}</p>
            </div>
            <div>
              <label className="text-xs text-slate-500 font-medium">Slug</label>
              <p className="text-sm text-slate-800 mt-1">/{business.slug}</p>
            </div>
            <div>
              <label className="text-xs text-slate-500 font-medium">Status</label>
              <div className="mt-1 flex gap-2">
                {business.isSuspended ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Suspended</span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Active</span>
                )}
                {business.isPublished ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Published</span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">Unpublished</span>
                )}
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500 font-medium">Created</label>
              <p className="text-sm text-slate-800 mt-1">{new Date(business.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Content Stats */}
      {businessStats && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Content Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { icon: FaBox, label: 'Products', value: businessStats.products, color: 'bg-purple-500' },
              { icon: FaConciergeBell, label: 'Services', value: businessStats.services, color: 'bg-pink-500' },
              { icon: FaImages, label: 'Gallery', value: businessStats.gallery, color: 'bg-teal-500' },
              { icon: FaVideo, label: 'Videos', value: businessStats.videos, color: 'bg-indigo-500' },
              { icon: FaVisitors, label: 'Visitors', value: businessStats.visitors, color: 'bg-green-500' },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center p-4 rounded-xl bg-slate-50">
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${stat.color} mb-2`}>
                    <Icon className="text-white text-sm" />
                  </div>
                  <div className="text-xl font-bold text-slate-800">{stat.value}</div>
                  <div className="text-xs text-slate-500">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      <ConfirmModal
        open={modal === 'block'}
        onClose={() => setModal(null)}
        onConfirm={handleBlockUnblock}
        title={user.isBlocked ? 'Unblock User' : 'Block User'}
        message={`Are you sure you want to ${user.isBlocked ? 'unblock' : 'block'} ${user.name}?`}
        confirmText={user.isBlocked ? 'Unblock' : 'Block'}
        confirmColor={user.isBlocked ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}
      />
      <ConfirmModal
        open={modal === 'delete'}
        onClose={() => setModal(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${user.name}? This will permanently delete the user and all associated data including business profile, products, services, gallery, videos, and visitor records. This cannot be undone.`}
        confirmText="Delete Permanently"
        confirmColor="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
};

export default SuperAdminUserDetails;
