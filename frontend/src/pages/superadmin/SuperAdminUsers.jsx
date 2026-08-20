import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaSearch, FaBan, FaCheckCircle, FaTrash, FaEye, FaKey,
  FaChevronLeft, FaChevronRight, FaUserCircle, FaDownload,
  FaFileCsv, FaFileExcel, FaCrown, FaGift,
} from 'react-icons/fa';
import { API_BASE_URL } from '../../api/config';
import toast from 'react-hot-toast';

const ConfirmModal = ({ open, onClose, onConfirm, title, message, confirmText, confirmColor }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-sm text-slate-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition font-medium">
            Cancel
          </button>
          <button onClick={onConfirm} className={`px-4 py-2 rounded-lg text-white transition font-medium ${confirmColor}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const ResetPasswordModal = ({ open, onClose, onConfirm }) => {
  const [newPassword, setNewPassword] = useState('');
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-2">Reset User Password</h3>
        <p className="text-sm text-slate-600 mb-4">Enter a new password for this user (min 6 characters).</p>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New password"
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-900 mb-4"
        />
        <div className="flex gap-3 justify-end">
          <button onClick={() => { setNewPassword(''); onClose(); }} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition font-medium">
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(newPassword); setNewPassword(''); }}
            disabled={newPassword.length < 6}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition font-medium disabled:opacity-50"
          >
            Reset Password
          </button>
        </div>
      </div>
    </div>
  );
};

const SuperAdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modal, setModal] = useState({ type: null, user: null });
  const [selectedIds, setSelectedIds] = useState([]);
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, pagination.limit, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('superadmin_token');
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter,
      });
      if (search) params.append('search', search);

      const res = await fetch(`${API_BASE_URL}/superadmin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUsers(data.users);
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
    fetchUsers();
  };

  const handleBlockUnblock = async (user) => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await fetch(`${API_BASE_URL}/superadmin/users/${user._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isBlocked: !user.isBlocked }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(data.message);
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
    setModal({ type: null, user: null });
  };

  const handleDelete = async (user) => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await fetch(`${API_BASE_URL}/superadmin/users/${user._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(data.message);
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
    setModal({ type: null, user: null });
  };

  const handleResetPassword = async (password) => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await fetch(`${API_BASE_URL}/superadmin/users/${modal.user._id}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(data.message);
    } catch (err) {
      toast.error(err.message);
    }
    setModal({ type: null, user: null });
  };

  // Bulk actions
  const toggleSelectUser = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === users.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(users.map((u) => u._id));
    }
  };

  const handleBulkAction = async (action, plan) => {
    try {
      const token = localStorage.getItem('superadmin_token');
      let endpoint, body;
      if (action === 'block') { endpoint = '/users/bulk/block'; body = { userIds: selectedIds }; }
      else if (action === 'unblock') { endpoint = '/users/bulk/unblock'; body = { userIds: selectedIds }; }
      else if (action === 'delete') { endpoint = '/users/bulk/delete'; body = { userIds: selectedIds }; }
      else if (action === 'assign-plan') { endpoint = '/users/bulk/assign-plan'; body = { userIds: selectedIds, plan }; }

      const res = await fetch(`${API_BASE_URL}/superadmin${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(data.message);
      setSelectedIds([]);
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
    setModal({ type: null, user: null });
  };

  const handleExport = async (format, scope) => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const params = new URLSearchParams({ format });
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (search) params.append('search', search);

      const body = scope === 'selected' ? { userIds: selectedIds } : {};

      const res = await fetch(`${API_BASE_URL}/superadmin/export/users?${params}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const contentDisposition = res.headers.get('Content-Disposition');
      a.download = contentDisposition ? contentDisposition.split('filename=')[1] : `users_export.${format === 'excel' ? 'xls' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setExportOpen(false);
      toast.success('Export downloaded');
    } catch (err) {
      toast.error(err.message);
    }
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
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-900 text-sm"
            />
          </form>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPagination({ ...pagination, page: 1 }); }}
            className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 text-sm bg-white"
          >
            <option value="all">All Users</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
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
          <div className="relative">
            <button onClick={() => setExportOpen(!exportOpen)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <FaDownload /> Export
            </button>
            {exportOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-20 w-56">
                <button onClick={() => handleExport('csv', 'all')} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"><FaFileCsv className="text-green-600" /> Export All (CSV)</button>
                <button onClick={() => handleExport('excel', 'all')} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"><FaFileExcel className="text-green-700" /> Export All (Excel)</button>
                {selectedIds.length > 0 && (
                  <>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button onClick={() => handleExport('csv', 'selected')} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"><FaFileCsv className="text-green-600" /> Export Selected ({selectedIds.length}) CSV</button>
                    <button onClick={() => handleExport('excel', 'selected')} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"><FaFileExcel className="text-green-700" /> Export Selected ({selectedIds.length}) Excel</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedIds.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-indigo-700">{selectedIds.length} user(s) selected</span>
          <div className="flex flex-wrap gap-2 ml-auto">
            <button onClick={() => setModal({ type: 'bulk_block' })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-orange-600 text-xs font-medium hover:bg-orange-50 border border-orange-200"><FaBan /> Block</button>
            <button onClick={() => setModal({ type: 'bulk_unblock' })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-green-600 text-xs font-medium hover:bg-green-50 border border-green-200"><FaCheckCircle /> Unblock</button>
            <button onClick={() => setModal({ type: 'bulk_delete' })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-red-600 text-xs font-medium hover:bg-red-50 border border-red-200"><FaTrash /> Delete</button>
            <button onClick={() => setModal({ type: 'bulk_plan_free' })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-slate-600 text-xs font-medium hover:bg-slate-50 border border-slate-200"><FaGift /> Free Plan</button>
            <button onClick={() => setModal({ type: 'bulk_plan_pro' })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-purple-600 text-xs font-medium hover:bg-purple-50 border border-purple-200"><FaCrown /> Pro Plan</button>
            <button onClick={() => setSelectedIds([])} className="px-3 py-1.5 rounded-lg text-slate-500 text-xs hover:bg-slate-100">Clear</button>
          </div>
        </div>
      )}
      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <FaUserCircle className="text-4xl text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 w-10">
                    <input type="checkbox" checked={selectedIds.length === users.length && users.length > 0} onChange={toggleSelectAll} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">User</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Business</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden lg:table-cell">Joined</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user._id} className={`hover:bg-slate-50 transition ${selectedIds.includes(user._id) ? 'bg-indigo-50/50' : ''}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selectedIds.includes(user._id)} onChange={() => toggleSelectUser(user._id)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 truncate">{user.name}</p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {user.business ? (
                        <div>
                          <p className="text-slate-700 truncate">{user.business.businessName}</p>
                          <p className="text-xs text-slate-400">/{user.business.slug}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">No business</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {user.isBlocked ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          <FaBan className="text-[10px]" /> Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <FaCheckCircle className="text-[10px]" /> Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-slate-500 text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/superadmin/users/${user._id}`}
                          className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-600 transition"
                          title="View Details"
                        >
                          <FaEye className="text-sm" />
                        </Link>
                        <button
                          onClick={() => setModal({ type: 'reset', user })}
                          className="p-2 rounded-lg hover:bg-amber-50 text-amber-600 transition"
                          title="Reset Password"
                        >
                          <FaKey className="text-sm" />
                        </button>
                        <button
                          onClick={() => setModal({ type: 'block', user })}
                          className={`p-2 rounded-lg transition ${user.isBlocked ? 'hover:bg-green-50 text-green-600' : 'hover:bg-orange-50 text-orange-600'}`}
                          title={user.isBlocked ? 'Unblock' : 'Block'}
                        >
                          {user.isBlocked ? <FaCheckCircle className="text-sm" /> : <FaBan className="text-sm" />}
                        </button>
                        <button
                          onClick={() => setModal({ type: 'delete', user })}
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
            <p className="text-sm text-slate-500">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} users)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
              >
                <FaChevronLeft className="text-xs" />
              </button>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
              >
                <FaChevronRight className="text-xs" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ConfirmModal
        open={modal.type === 'block'}
        onClose={() => setModal({ type: null, user: null })}
        onConfirm={() => handleBlockUnblock(modal.user)}
        title={modal.user?.isBlocked ? 'Unblock User' : 'Block User'}
        message={`Are you sure you want to ${modal.user?.isBlocked ? 'unblock' : 'block'} ${modal.user?.name}? ${modal.user?.isBlocked ? 'They will be able to login again.' : 'They will not be able to login.'}`}
        confirmText={modal.user?.isBlocked ? 'Unblock' : 'Block'}
        confirmColor={modal.user?.isBlocked ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}
      />
      <ConfirmModal
        open={modal.type === 'delete'}
        onClose={() => setModal({ type: null, user: null })}
        onConfirm={() => handleDelete(modal.user)}
        title="Delete User"
        message={`Are you sure you want to delete ${modal.user?.name}? This will permanently delete the user, their business profile, products, services, gallery, videos, and all visitor data. This action cannot be undone.`}
        confirmText="Delete Permanently"
        confirmColor="bg-red-600 hover:bg-red-700"
      />
      <ResetPasswordModal
        open={modal.type === 'reset'}
        onClose={() => setModal({ type: null, user: null })}
        onConfirm={handleResetPassword}
      />
      <ConfirmModal
        open={modal.type === 'bulk_delete'}
        onClose={() => setModal({ type: null, user: null })}
        onConfirm={() => handleBulkAction('delete')}
        title="Delete Selected Users"
        message={`You are about to delete ${selectedIds.length} user(s) and their associated business data. This action cannot be undone.`}
        confirmText={`Delete ${selectedIds.length} User(s)`}
        confirmColor="bg-red-600 hover:bg-red-700"
      />
      <ConfirmModal
        open={modal.type === 'bulk_block'}
        onClose={() => setModal({ type: null, user: null })}
        onConfirm={() => handleBulkAction('block')}
        title="Block Selected Users"
        message={`Are you sure you want to block ${selectedIds.length} user(s)? They will not be able to login.`}
        confirmText={`Block ${selectedIds.length} User(s)`}
        confirmColor="bg-orange-600 hover:bg-orange-700"
      />
      <ConfirmModal
        open={modal.type === 'bulk_unblock'}
        onClose={() => setModal({ type: null, user: null })}
        onConfirm={() => handleBulkAction('unblock')}
        title="Unblock Selected Users"
        message={`Are you sure you want to unblock ${selectedIds.length} user(s)?`}
        confirmText={`Unblock ${selectedIds.length} User(s)`}
        confirmColor="bg-green-600 hover:bg-green-700"
      />
      <ConfirmModal
        open={modal.type === 'bulk_plan_free'}
        onClose={() => setModal({ type: null, user: null })}
        onConfirm={() => handleBulkAction('assign-plan', 'Free')}
        title="Assign Free Plan"
        message={`Assign Free plan to ${selectedIds.length} user(s)?`}
        confirmText="Assign Free"
        confirmColor="bg-slate-600 hover:bg-slate-700"
      />
      <ConfirmModal
        open={modal.type === 'bulk_plan_pro'}
        onClose={() => setModal({ type: null, user: null })}
        onConfirm={() => handleBulkAction('assign-plan', 'Pro')}
        title="Assign Pro Plan"
        message={`Assign Pro plan to ${selectedIds.length} user(s)? This will give them premium features.`}
        confirmText="Assign Pro"
        confirmColor="bg-purple-600 hover:bg-purple-700"
      />
    </div>
  );
};

export default SuperAdminUsers;
