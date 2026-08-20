import { useState, useEffect } from 'react';
import { FaTrash, FaBox, FaConciergeBell, FaImages, FaVideo, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { API_BASE_URL } from '../../api/config';
import toast from 'react-hot-toast';

const ConfirmModal = ({ open, onClose, onConfirm, title, message }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-sm text-slate-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition font-medium">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition font-medium">Delete</button>
        </div>
      </div>
    </div>
  );
};

const SuperAdminModeration = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [modal, setModal] = useState(null);

  useEffect(() => {
    fetchContent();
  }, [activeTab, pagination.page]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('superadmin_token');
      const params = new URLSearchParams({ type: activeTab, page: pagination.page, limit: pagination.limit });
      const res = await fetch(`${API_BASE_URL}/superadmin/moderation?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setItems(data.items);
      setPagination(data.pagination);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const { type, id } = modal;
    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await fetch(`${API_BASE_URL}/superadmin/moderation/${type}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(data.message);
      fetchContent();
    } catch (err) {
      toast.error(err.message);
    }
    setModal(null);
  };

  const tabs = [
    { key: 'products', label: 'Products', icon: FaBox },
    { key: 'services', label: 'Services', icon: FaConciergeBell },
    { key: 'gallery', label: 'Gallery', icon: FaImages },
    { key: 'videos', label: 'Videos', icon: FaVideo },
  ];

  const typeSingular = (t) => t.replace(/s$/, '');

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setPagination({ ...pagination, page: 1 }); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                  activeTab === tab.key ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="text-sm" /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No {activeTab} found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item._id} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition">
                <div className="flex items-start gap-3 mb-3">
                  {(activeTab === 'products' || activeTab === 'services') && item.image && (
                    <img src={item.image} alt="" className="h-14 w-14 rounded-lg object-cover flex-shrink-0" />
                  )}
                  {activeTab === 'gallery' && item.imageUrl && (
                    <img src={item.imageUrl} alt="" className="h-14 w-14 rounded-lg object-cover flex-shrink-0" />
                  )}
                  {activeTab === 'videos' && item.thumbnail && (
                    <img src={item.thumbnail} alt="" className="h-14 w-14 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {item.name || item.title || 'Untitled'}
                    </p>
                    {item.price != null && item.price > 0 && (
                      <p className="text-xs text-indigo-600 font-medium">Rs. {item.price}</p>
                    )}
                    {item.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">{item.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="min-w-0">
                    <p className="text-xs text-slate-600 truncate">
                      {item.businessId?.businessName || 'Unknown'}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {item.businessId?.userId?.name || ''} • {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setModal({ type: typeSingular(activeTab), id: item._id, name: item.name || item.title || 'this item' })}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition flex-shrink-0"
                    title="Delete"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-500">Page {pagination.page} of {pagination.totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })} disabled={pagination.page === 1} className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition disabled:opacity-50">
                <FaChevronLeft className="text-xs" />
              </button>
              <button onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })} disabled={pagination.page === pagination.totalPages} className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition disabled:opacity-50">
                <FaChevronRight className="text-xs" />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!modal}
        onClose={() => setModal(null)}
        onConfirm={handleDelete}
        title="Delete Content"
        message={`Are you sure you want to delete "${modal?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default SuperAdminModeration;
