import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaSearch, FaBan, FaCheckCircle, FaTrash, FaEye, FaBriefcase,
  FaChevronLeft, FaChevronRight,
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

const SuperAdminBusinesses = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modal, setModal] = useState({ type: null, business: null });

  useEffect(() => {
    fetchBusinesses();
  }, [pagination.page, pagination.limit, statusFilter]);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('superadmin_token');
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter,
      });
      if (search) params.append('search', search);

      const res = await fetch(`${API_BASE_URL}/superadmin/businesses?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setBusinesses(data.businesses);
      setPagination(data.pagination);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchBusinesses();
  };

  const handleSuspendActivate = async (business) => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await fetch(`${API_BASE_URL}/superadmin/businesses/${business._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isSuspended: !business.isSuspended }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(data.message);
      fetchBusinesses();
    } catch (err) {
      toast.error(err.message);
    }
    setModal({ type: null, business: null });
  };

  const handleDelete = async (business) => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await fetch(`${API_BASE_URL}/superadmin/businesses/${business._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(data.message);
      fetchBusinesses();
    } catch (err) {
      toast.error(err.message);
    }
    setModal({ type: null, business: null });
  };

  return (
    <div className="space-y-5">
      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by business name or slug..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-900 text-sm"
            />
          </form>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPagination({ ...pagination, page: 1 }); }}
            className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 text-sm bg-white"
          >
            <option value="all">All Businesses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="published">Published</option>
            <option value="unpublished">Unpublished</option>
          </select>
          <select
            value={pagination.limit}
            onChange={(e) => setPagination({ ...pagination, limit: parseInt(e.target.value), page: 1 })}
            className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 text-sm bg-white"
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : businesses.length === 0 ? (
          <div className="p-12 text-center">
            <FaBriefcase className="text-4xl text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No businesses found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Business</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Owner</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden lg:table-cell">Visitors</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden lg:table-cell">Created</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {businesses.map((biz) => (
                  <tr key={biz._id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 overflow-hidden">
                          {biz.logo ? (
                            <img src={biz.logo} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <FaBriefcase className="text-slate-400 text-sm" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 truncate">{biz.businessName}</p>
                          <p className="text-xs text-slate-500 truncate">/{biz.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-slate-700 truncate">{biz.userId?.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-400 truncate">{biz.userId?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      {biz.isSuspended ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          <FaBan className="text-[10px]" /> Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <FaCheckCircle className="text-[10px]" /> Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-slate-600">{biz.visitorCount}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-slate-500 text-xs">{new Date(biz.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/superadmin/businesses/${biz._id}`} className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-600 transition" title="View Details">
                          <FaEye className="text-sm" />
                        </Link>
                        <a href={`/business/${biz.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition" title="Open Public Card">
                          <FaEye className="text-sm" />
                        </a>
                        <button
                          onClick={() => setModal({ type: 'suspend', business: biz })}
                          className={`p-2 rounded-lg transition ${biz.isSuspended ? 'hover:bg-green-50 text-green-600' : 'hover:bg-orange-50 text-orange-600'}`}
                          title={biz.isSuspended ? 'Activate' : 'Suspend'}
                        >
                          {biz.isSuspended ? <FaCheckCircle className="text-sm" /> : <FaBan className="text-sm" />}
                        </button>
                        <button
                          onClick={() => setModal({ type: 'delete', business: biz })}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition"
                          title="Delete"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
            <p className="text-sm text-slate-500">Page {pagination.page} of {pagination.totalPages} ({pagination.total} businesses)</p>
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
        open={modal.type === 'suspend'}
        onClose={() => setModal({ type: null, business: null })}
        onConfirm={() => handleSuspendActivate(modal.business)}
        title={modal.business?.isSuspended ? 'Activate Business' : 'Suspend Business'}
        message={`Are you sure you want to ${modal.business?.isSuspended ? 'activate' : 'suspend'} ${modal.business?.businessName}? ${modal.business?.isSuspended ? 'The public card will be visible again.' : 'The public card will show a suspended message.'}`}
        confirmText={modal.business?.isSuspended ? 'Activate' : 'Suspend'}
        confirmColor={modal.business?.isSuspended ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}
      />
      <ConfirmModal
        open={modal.type === 'delete'}
        onClose={() => setModal({ type: null, business: null })}
        onConfirm={() => handleDelete(modal.business)}
        title="Delete Business"
        message={`Are you sure you want to delete ${modal.business?.businessName}? This will permanently delete the business, all products, services, gallery, videos, and visitor data. This cannot be undone.`}
        confirmText="Delete Permanently"
        confirmColor="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
};

export default SuperAdminBusinesses;
