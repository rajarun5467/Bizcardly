import { useState, useEffect } from 'react';
import { FaSearch, FaClock, FaChevronLeft, FaChevronRight, FaClipboardList } from 'react-icons/fa';
import { API_BASE_URL } from '../../api/config';

const actionColors = {
  user_blocked: 'bg-red-100 text-red-700',
  user_unblocked: 'bg-green-100 text-green-700',
  user_deleted: 'bg-red-100 text-red-700',
  user_password_reset: 'bg-amber-100 text-amber-700',
  business_suspended: 'bg-orange-100 text-orange-700',
  business_activated: 'bg-green-100 text-green-700',
  business_deleted: 'bg-red-100 text-red-700',
  business_updated: 'bg-blue-100 text-blue-700',
  content_deleted: 'bg-red-100 text-red-700',
  settings_updated: 'bg-purple-100 text-purple-700',
  admin_login: 'bg-slate-100 text-slate-600',
};

const SuperAdminActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, pagination.limit, actionFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('superadmin_token');
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        action: actionFilter,
      });
      if (search) params.append('search', search);

      const res = await fetch(`${API_BASE_URL}/superadmin/activity-logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Activity logs error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchLogs();
  };

  const actionOptions = [
    { value: 'all', label: 'All Actions' },
    { value: 'user_blocked', label: 'User Blocked' },
    { value: 'user_unblocked', label: 'User Unblocked' },
    { value: 'user_deleted', label: 'User Deleted' },
    { value: 'user_password_reset', label: 'Password Reset' },
    { value: 'business_suspended', label: 'Business Suspended' },
    { value: 'business_activated', label: 'Business Activated' },
    { value: 'business_deleted', label: 'Business Deleted' },
    { value: 'content_deleted', label: 'Content Deleted' },
    { value: 'settings_updated', label: 'Settings Updated' },
    { value: 'admin_login', label: 'Admin Login' },
  ];

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
              placeholder="Search by description or admin name..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-900 text-sm"
            />
          </form>
          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPagination({ ...pagination, page: 1 }); }}
            className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 text-sm bg-white"
          >
            {actionOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <FaClipboardList className="text-4xl text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No activity logs found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <div key={log._id} className="flex items-start gap-3 p-4 hover:bg-slate-50 transition">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 flex-shrink-0">
                  <FaClock className="text-slate-400 text-xs" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${actionColors[log.action] || 'bg-slate-100 text-slate-600'}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-slate-700 mt-1">{log.description}</p>
                  <p className="text-xs text-slate-400 mt-0.5">by {log.adminName}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
            <p className="text-sm text-slate-500">Page {pagination.page} of {pagination.totalPages} ({pagination.total} logs)</p>
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
    </div>
  );
};

export default SuperAdminActivityLogs;
