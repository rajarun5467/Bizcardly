import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaSearch, FaChevronLeft, FaChevronRight, FaCrown, FaGift, FaBan,
  FaCheckCircle, FaTimesCircle, FaCalendarAlt, FaClock, FaPlus, FaInbox,
} from 'react-icons/fa';
import { API_BASE_URL } from '../../api/config';
import toast from 'react-hot-toast';

const ConfirmModal = ({ open, onClose, onConfirm, title, message, confirmText, confirmColor }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-sm text-slate-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50">Cancel</button>
          <button onClick={onConfirm} className={`flex-1 py-2.5 rounded-lg text-white font-medium ${confirmColor}`}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

const SuperAdminSubscriptions = () => {
  const [activeTab, setActiveTab] = useState('subscriptions');
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modal, setModal] = useState(null);

  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsPagination, setRequestsPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [requestStatusFilter, setRequestStatusFilter] = useState('pending');
  const [requestModal, setRequestModal] = useState(null);
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    if (activeTab === 'subscriptions') fetchSubscriptions();
  }, [pagination.page, pagination.limit, planFilter, statusFilter, activeTab]);

  useEffect(() => {
    if (activeTab === 'requests') fetchRequests();
  }, [requestsPagination.page, requestStatusFilter, activeTab]);

  const fetchRequests = async () => {
    setRequestsLoading(true);
    try {
      const token = localStorage.getItem('superadmin_token');
      const params = new URLSearchParams({
        page: requestsPagination.page,
        limit: requestsPagination.limit,
        status: requestStatusFilter,
      });
      const res = await fetch(`${API_BASE_URL}/superadmin/subscription-requests?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setRequests(data.requests);
      setRequestsPagination(data.pagination);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleApproveRequest = async (id) => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await fetch(`${API_BASE_URL}/superadmin/subscription-requests/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ adminNote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(data.message);
      fetchRequests();
    } catch (err) {
      toast.error(err.message);
    }
    setRequestModal(null);
    setAdminNote('');
  };

  const handleRejectRequest = async (id) => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await fetch(`${API_BASE_URL}/superadmin/subscription-requests/${id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ adminNote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(data.message);
      fetchRequests();
    } catch (err) {
      toast.error(err.message);
    }
    setRequestModal(null);
    setAdminNote('');
  };

  const requestStatusBadge = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      cancelled: 'bg-slate-100 text-slate-600',
    };
    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${colors[status] || colors.cancelled}`}>{status}</span>;
  };

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('superadmin_token');
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        plan: planFilter,
        status: statusFilter,
      });
      if (search) params.append('search', search);

      const res = await fetch(`${API_BASE_URL}/superadmin/subscriptions?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSubscriptions(data.subscriptions);
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
    fetchSubscriptions();
  };

  const handleAssignPlan = async (userId, plan) => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await fetch(`${API_BASE_URL}/superadmin/subscriptions/${userId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(data.message);
      fetchSubscriptions();
    } catch (err) {
      toast.error(err.message);
    }
    setModal(null);
  };

  const handleExtend = async (userId, days) => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await fetch(`${API_BASE_URL}/superadmin/subscriptions/${userId}/extend`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ extendDays: days }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(data.message);
      fetchSubscriptions();
    } catch (err) {
      toast.error(err.message);
    }
    setModal(null);
  };

  const handleCancel = async (userId) => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await fetch(`${API_BASE_URL}/superadmin/subscriptions/${userId}/cancel`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(data.message);
      fetchSubscriptions();
    } catch (err) {
      toast.error(err.message);
    }
    setModal(null);
  };

  const handleReactivate = async (userId) => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await fetch(`${API_BASE_URL}/superadmin/subscriptions/${userId}/reactivate`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(data.message);
      fetchSubscriptions();
    } catch (err) {
      toast.error(err.message);
    }
    setModal(null);
  };

  const planBadge = (plan) => (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${plan === 'Pro' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
      {plan === 'Pro' ? <FaCrown className="text-xs" /> : <FaGift className="text-xs" />} {plan}
    </span>
  );

  const statusBadge = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-slate-100 text-slate-600',
      cancelled: 'bg-red-100 text-red-700',
      expired: 'bg-amber-100 text-amber-700',
    };
    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[status] || colors.inactive}`}>{status}</span>;
  };

  if (activeTab === 'subscriptions' && loading && subscriptions.length === 0) {
    return <div className="flex items-center justify-center h-96"><div className="text-slate-400">Loading subscriptions...</div></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Subscription Management</h1>
        <p className="text-sm text-slate-500 mt-1">Manage user plans, subscriptions, and upgrade requests</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${activeTab === 'subscriptions' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Subscriptions
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition flex items-center gap-2 ${activeTab === 'requests' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <FaInbox /> Upgrade Requests
        </button>
      </div>

      {activeTab === 'requests' ? (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-wrap gap-3 items-center">
            <select
              value={requestStatusFilter}
              onChange={(e) => { setRequestStatusFilter(e.target.value); setRequestsPagination({ ...requestsPagination, page: 1 }); }}
              className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-400"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">User</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Current → Requested</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Amount</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Transaction Ref</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Proof</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Submitted</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requestsLoading ? (
                    <tr><td colSpan="8" className="text-center py-12 text-slate-400">Loading requests...</td></tr>
                  ) : requests.length === 0 ? (
                    <tr><td colSpan="8" className="text-center py-12 text-slate-400">No requests found</td></tr>
                  ) : (
                    requests.map((r) => (
                      <tr key={r._id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-800">{r.userId?.name || 'N/A'}</p>
                          <p className="text-xs text-slate-500">{r.userId?.email || ''}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{r.currentPlan} → <span className="font-semibold text-indigo-600">{r.requestedPlan}</span></td>
                        <td className="px-4 py-3 text-slate-600">₹{r.amount}</td>
                        <td className="px-4 py-3 text-slate-600">{r.transactionRef}</td>
                        <td className="px-4 py-3">
                          {r.paymentProof ? (
                            <a href={r.paymentProof} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-xs font-medium">View Screenshot</a>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">{requestStatusBadge(r.status)}</td>
                        <td className="px-4 py-3 text-slate-600">{new Date(r.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          {r.status === 'pending' ? (
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => setRequestModal({ type: 'approve', id: r._id, name: r.userId?.name, plan: r.requestedPlan, proof: r.paymentProof, amount: r.amount, transactionRef: r.transactionRef })}
                                className="px-2.5 py-1.5 rounded-lg bg-green-50 text-green-600 text-xs font-medium hover:bg-green-100"
                              >
                                <FaCheckCircle className="inline" /> Approve
                              </button>
                              <button
                                onClick={() => setRequestModal({ type: 'reject', id: r._id, name: r.userId?.name, plan: r.requestedPlan, proof: r.paymentProof, amount: r.amount, transactionRef: r.transactionRef })}
                                className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100"
                              >
                                <FaTimesCircle className="inline" /> Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">{r.adminNote || '-'}</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {requestsPagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
                <span className="text-xs text-slate-500">{requestsPagination.total} total requests</span>
                <div className="flex gap-2">
                  <button onClick={() => setRequestsPagination({ ...requestsPagination, page: Math.max(1, requestsPagination.page - 1) })} disabled={requestsPagination.page === 1} className="p-2 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"><FaChevronLeft /></button>
                  <span className="px-3 py-2 text-sm text-slate-600">{requestsPagination.page} / {requestsPagination.totalPages}</span>
                  <button onClick={() => setRequestsPagination({ ...requestsPagination, page: Math.min(requestsPagination.totalPages, requestsPagination.page + 1) })} disabled={requestsPagination.page === requestsPagination.totalPages} className="p-2 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"><FaChevronRight /></button>
                </div>
              </div>
            )}
          </div>

          {requestModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  {requestModal.type === 'approve' ? 'Approve' : 'Reject'} {requestModal.name}'s Request
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  {requestModal.type === 'approve'
                    ? `This will activate the ${requestModal.plan} plan for ${requestModal.name}.`
                    : `This request will be marked as rejected. ${requestModal.name}'s current plan will not change.`}
                </p>

                {requestModal.proof && (
                  <div className="mb-4 rounded-lg border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 flex items-center justify-between">
                      <span>Payment Proof</span>
                      <span className="text-slate-500">₹{requestModal.amount} | {requestModal.transactionRef}</span>
                    </div>
                    <a href={requestModal.proof} target="_blank" rel="noopener noreferrer">
                      <img src={requestModal.proof} alt="Payment proof" className="w-full max-h-48 object-contain bg-slate-50" />
                    </a>
                  </div>
                )}
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                  placeholder="Optional note (visible to the user)"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm mb-4 focus:outline-none focus:border-indigo-400 resize-none"
                />
                <div className="flex gap-3">
                  <button onClick={() => { setRequestModal(null); setAdminNote(''); }} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50">Cancel</button>
                  <button
                    onClick={() => requestModal.type === 'approve' ? handleApproveRequest(requestModal.id) : handleRejectRequest(requestModal.id)}
                    className={`flex-1 py-2.5 rounded-lg text-white font-medium ${requestModal.type === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                  >
                    {requestModal.type === 'approve' ? 'Approve' : 'Reject'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-wrap gap-3 items-center">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-400"
            />
          </div>
        </form>
        <select value={planFilter} onChange={(e) => { setPlanFilter(e.target.value); setPagination({ ...pagination, page: 1 }); }} className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-400">
          <option value="all">All Plans</option>
          <option value="Free">Free</option>
          <option value="Pro">Pro</option>
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPagination({ ...pagination, page: 1 }); }} className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-400">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="cancelled">Cancelled</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">User</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Plan</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Start Date</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Expiry Date</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subscriptions.map((sub) => (
                <tr key={sub._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{sub.user?.name || 'N/A'}</p>
                    <p className="text-xs text-slate-500">{sub.user?.email || ''}</p>
                  </td>
                  <td className="px-4 py-3">{planBadge(sub.plan)}</td>
                  <td className="px-4 py-3">{statusBadge(sub.status)}</td>
                  <td className="px-4 py-3 text-slate-600">{sub.startDate ? new Date(sub.startDate).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-4 py-3 text-slate-600">{sub.expiryDate ? new Date(sub.expiryDate).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      {sub.plan !== 'Pro' && (
                        <button onClick={() => setModal({ type: 'assign', userId: sub.user?._id, plan: 'Pro', name: sub.user?.name })} className="px-2.5 py-1.5 rounded-lg bg-purple-50 text-purple-600 text-xs font-medium hover:bg-purple-100" title="Upgrade to Pro">
                          <FaCrown className="inline" /> Upgrade
                        </button>
                      )}
                      {sub.plan !== 'Free' && (
                        <button onClick={() => setModal({ type: 'assign', userId: sub.user?._id, plan: 'Free', name: sub.user?.name })} className="px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-600 text-xs font-medium hover:bg-slate-100" title="Downgrade to Free">
                          <FaGift className="inline" /> Downgrade
                        </button>
                      )}
                      {sub.plan === 'Pro' && sub.status === 'active' && (
                        <button onClick={() => setModal({ type: 'extend', userId: sub.user?._id, name: sub.user?.name })} className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100" title="Extend">
                          <FaPlus className="inline" /> Extend
                        </button>
                      )}
                      {sub.status === 'active' && (
                        <button onClick={() => setModal({ type: 'cancel', userId: sub.user?._id, name: sub.user?.name })} className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100" title="Cancel">
                          <FaBan className="inline" /> Cancel
                        </button>
                      )}
                      {sub.status !== 'active' && (
                        <button onClick={() => setModal({ type: 'reactivate', userId: sub.user?._id, name: sub.user?.name })} className="px-2.5 py-1.5 rounded-lg bg-green-50 text-green-600 text-xs font-medium hover:bg-green-100" title="Reactivate">
                          <FaCheckCircle className="inline" /> Reactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {subscriptions.length === 0 && (
                <tr><td colSpan="6" className="text-center py-12 text-slate-400">No subscriptions found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
            <span className="text-xs text-slate-500">{pagination.total} total subscriptions</span>
            <div className="flex gap-2">
              <button onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })} disabled={pagination.page === 1} className="p-2 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"><FaChevronLeft /></button>
              <span className="px-3 py-2 text-sm text-slate-600">{pagination.page} / {pagination.totalPages}</span>
              <button onClick={() => setPagination({ ...pagination, page: Math.min(pagination.totalPages, pagination.page + 1) })} disabled={pagination.page === pagination.totalPages} className="p-2 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"><FaChevronRight /></button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        open={modal?.type === 'assign'}
        onClose={() => setModal(null)}
        onConfirm={() => handleAssignPlan(modal.userId, modal.plan)}
        title={`${modal?.plan === 'Pro' ? 'Upgrade' : 'Downgrade'} ${modal?.name || 'User'}`}
        message={`Are you sure you want to ${modal?.plan === 'Pro' ? 'upgrade' : 'downgrade'} ${modal?.name} to the ${modal?.plan} plan?`}
        confirmText={modal?.plan === 'Pro' ? 'Upgrade' : 'Downgrade'}
        confirmColor={modal?.plan === 'Pro' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-slate-600 hover:bg-slate-700'}
      />

      <ConfirmModal
        open={modal?.type === 'extend'}
        onClose={() => setModal(null)}
        onConfirm={() => handleExtend(modal.userId, 30)}
        title={`Extend ${modal?.name}'s Subscription`}
        message={`Extend ${modal?.name}'s Pro subscription by 30 days?`}
        confirmText="Extend 30 Days"
        confirmColor="bg-blue-600 hover:bg-blue-700"
      />

      <ConfirmModal
        open={modal?.type === 'cancel'}
        onClose={() => setModal(null)}
        onConfirm={() => handleCancel(modal.userId)}
        title={`Cancel ${modal?.name}'s Subscription`}
        message={`Are you sure you want to cancel ${modal?.name}'s subscription? They will lose Pro access.`}
        confirmText="Cancel Subscription"
        confirmColor="bg-red-600 hover:bg-red-700"
      />

      <ConfirmModal
        open={modal?.type === 'reactivate'}
        onClose={() => setModal(null)}
        onConfirm={() => handleReactivate(modal.userId)}
        title={`Reactivate ${modal?.name}'s Subscription`}
        message={`Reactivate ${modal?.name}'s subscription?`}
        confirmText="Reactivate"
        confirmColor="bg-green-600 hover:bg-green-700"
      />
        </>
      )}
    </div>
  );
};

export default SuperAdminSubscriptions;
