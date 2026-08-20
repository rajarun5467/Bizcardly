import { useState, useEffect } from 'react';
import {
  FaSearch, FaChevronLeft, FaChevronRight, FaHeadset, FaTicketAlt,
  FaExclamationCircle, FaPaperPlane, FaUser, FaShieldAlt,
} from 'react-icons/fa';
import { API_BASE_URL } from '../../api/config';
import toast from 'react-hot-toast';

const statusColors = {
  'Open': 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  'Waiting for User': 'bg-purple-100 text-purple-700',
  'Resolved': 'bg-green-100 text-green-700',
  'Closed': 'bg-slate-100 text-slate-600',
};

const priorityColors = {
  'Low': 'bg-slate-100 text-slate-600',
  'Medium': 'bg-blue-100 text-blue-700',
  'High': 'bg-orange-100 text-orange-700',
  'Urgent': 'bg-red-100 text-red-700',
};

const SuperAdminSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchTickets();
  }, [pagination.page, pagination.limit, statusFilter, categoryFilter, priorityFilter]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('superadmin_token');
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter,
        category: categoryFilter,
        priority: priorityFilter,
      });
      if (search) params.append('search', search);

      const res = await fetch(`${API_BASE_URL}/superadmin/support/tickets?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setTickets(data.tickets);
      setPagination(data.pagination);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetails = async (id) => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await fetch(`${API_BASE_URL}/superadmin/support/tickets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSelectedTicket(data.ticket);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await fetch(`${API_BASE_URL}/superadmin/support/tickets/${selectedTicket._id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: replyText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Reply sent');
      setReplyText('');
      fetchTicketDetails(selectedTicket._id);
      fetchTickets();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await fetch(`${API_BASE_URL}/superadmin/support/tickets/${selectedTicket._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(`Status changed to ${status}`);
      fetchTicketDetails(selectedTicket._id);
      fetchTickets();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handlePriorityChange = async (priority) => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await fetch(`${API_BASE_URL}/superadmin/support/tickets/${selectedTicket._id}/priority`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ priority }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(`Priority changed to ${priority}`);
      fetchTicketDetails(selectedTicket._id);
      fetchTickets();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchTickets();
  };

  if (selectedTicket) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <button onClick={() => setSelectedTicket(null)} className="text-sm text-indigo-600 hover:underline mb-2">← Back to tickets</button>
            <h1 className="text-2xl font-bold text-slate-800">{selectedTicket.ticketId}</h1>
            <p className="text-sm text-slate-500 mt-1">{selectedTicket.subject}</p>
          </div>
          <div className="flex gap-2">
            <select value={selectedTicket.status} onChange={(e) => handleStatusChange(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm">
              {['Open', 'In Progress', 'Waiting for User', 'Resolved', 'Closed'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={selectedTicket.priority} onChange={(e) => handlePriorityChange(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm">
              {['Low', 'Medium', 'High', 'Urgent'].map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-slate-400">User:</span> <span className="font-medium text-slate-700">{selectedTicket.userName}</span></div>
            <div><span className="text-slate-400">Email:</span> <span className="font-medium text-slate-700">{selectedTicket.userEmail}</span></div>
            <div><span className="text-slate-400">Category:</span> <span className="font-medium text-slate-700">{selectedTicket.category}</span></div>
            <div><span className="text-slate-400">Created:</span> <span className="font-medium text-slate-700">{new Date(selectedTicket.createdAt).toLocaleString()}</span></div>
          </div>
        </div>

        {/* Conversation */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-4 max-h-[500px] overflow-y-auto">
          {selectedTicket.messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.senderRole === 'superadmin' ? 'flex-row-reverse' : ''}`}>
              <div className={`flex h-9 w-9 items-center justify-center rounded-full flex-shrink-0 ${msg.senderRole === 'superadmin' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                {msg.senderRole === 'superadmin' ? <FaShieldAlt /> : <FaUser />}
              </div>
              <div className={`max-w-[70%] ${msg.senderRole === 'superadmin' ? 'items-end' : ''}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-slate-700">{msg.senderName}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${msg.senderRole === 'superadmin' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>{msg.senderRole}</span>
                  <span className="text-xs text-slate-400">{new Date(msg.createdAt).toLocaleString()}</span>
                </div>
                <div className={`rounded-xl p-3 text-sm ${msg.senderRole === 'superadmin' ? 'bg-indigo-50 text-slate-700' : 'bg-slate-50 text-slate-700'}`}>
                  {msg.message}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reply */}
        {selectedTicket.status !== 'Closed' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex gap-3">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                rows={3}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-400 resize-none"
              />
              <button onClick={handleReply} className="self-end px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 flex items-center gap-2">
                <FaPaperPlane /> Send
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Support Tickets</h1>
        <p className="text-sm text-slate-500 mt-1">Manage user support requests</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-wrap gap-3 items-center">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by ticket ID, subject, name, email..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-400" />
          </div>
        </form>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPagination({ ...pagination, page: 1 }); }} className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm">
          <option value="all">All Status</option>
          {['Open', 'In Progress', 'Waiting for User', 'Resolved', 'Closed'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPagination({ ...pagination, page: 1 }); }} className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm">
          <option value="all">All Categories</option>
          {['Technical Issue', 'Account Issue', 'Billing', 'Business Card Issue', 'Feature Request', 'Other'].map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPagination({ ...pagination, page: 1 }); }} className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm">
          <option value="all">All Priority</option>
          {['Low', 'Medium', 'High', 'Urgent'].map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Ticket ID</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">User</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Subject</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Priority</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.map((t) => (
                <tr key={t._id} onClick={() => fetchTicketDetails(t._id)} className="hover:bg-slate-50 cursor-pointer">
                  <td className="px-4 py-3 font-mono text-xs text-indigo-600">{t.ticketId}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{t.userName}</p>
                    <p className="text-xs text-slate-500">{t.userEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-700 max-w-[200px] truncate">{t.subject}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{t.category}</td>
                  <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[t.status]}`}>{t.status}</span></td>
                  <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${priorityColors[t.priority]}`}>{t.priority}</span></td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr><td colSpan="7" className="text-center py-12 text-slate-400">No tickets found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
            <span className="text-xs text-slate-500">{pagination.total} total tickets</span>
            <div className="flex gap-2">
              <button onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })} disabled={pagination.page === 1} className="p-2 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"><FaChevronLeft /></button>
              <span className="px-3 py-2 text-sm text-slate-600">{pagination.page} / {pagination.totalPages}</span>
              <button onClick={() => setPagination({ ...pagination, page: Math.min(pagination.totalPages, pagination.page + 1) })} disabled={pagination.page === pagination.totalPages} className="p-2 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"><FaChevronRight /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminSupport;
