import { useState, useEffect } from 'react';
import {
  FaHeadset, FaPlus, FaPaperPlane, FaTicketAlt, FaUser, FaShieldAlt,
  FaChevronLeft, FaChevronRight, FaTimes,
} from 'react-icons/fa';
import { API_BASE_URL } from '../api/config';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const statusColors = {
  'Open': 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  'Waiting for User': 'bg-purple-100 text-purple-700',
  'Resolved': 'bg-green-100 text-green-700',
  'Closed': 'bg-slate-100 text-slate-600',
};

const categories = ['Technical Issue', 'Account Issue', 'Billing', 'Business Card Issue', 'Feature Request', 'Other'];

const Support = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [formData, setFormData] = useState({ category: '', subject: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [pagination.page, statusFilter]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('bizcardly_token');
      const params = new URLSearchParams({ page: pagination.page, limit: pagination.limit, status: statusFilter });
      const res = await fetch(`${API_BASE_URL}/support?${params}`, {
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

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.subject || !formData.description) {
      toast.error('All fields are required');
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('bizcardly_token');
      const res = await fetch(`${API_BASE_URL}/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Ticket created successfully');
      setShowCreate(false);
      setFormData({ category: '', subject: '', description: '' });
      fetchTickets();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fetchTicketDetails = async (id) => {
    try {
      const token = localStorage.getItem('bizcardly_token');
      const res = await fetch(`${API_BASE_URL}/support/${id}`, {
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
      const token = localStorage.getItem('bizcardly_token');
      const res = await fetch(`${API_BASE_URL}/support/${selectedTicket._id}/reply`, {
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

  if (selectedTicket) {
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedTicket(null)} className="text-sm text-indigo-600 hover:underline">← Back to tickets</button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{selectedTicket.ticketId}</h1>
          <p className="text-sm text-slate-500 mt-1">{selectedTicket.subject}</p>
          <div className="flex gap-2 mt-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[selectedTicket.status]}`}>{selectedTicket.status}</span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">{selectedTicket.category}</span>
          </div>
        </div>

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
                <div className={`rounded-xl p-3 text-sm ${msg.senderRole === 'superadmin' ? 'bg-indigo-50 text-slate-700' : 'bg-slate-50 text-slate-700'}`}>{msg.message}</div>
              </div>
            </div>
          ))}
        </div>

        {selectedTicket.status !== 'Closed' && selectedTicket.status !== 'Resolved' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex gap-3">
              <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type your reply..." rows={3} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-400 resize-none" />
              <button onClick={handleReply} className="self-end px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 flex items-center gap-2"><FaPaperPlane /> Send</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Support</h1>
          <p className="text-sm text-slate-500 mt-1">Get help and manage your tickets</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 text-sm">
          <FaPlus /> New Ticket
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-3 items-center">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPagination({ ...pagination, page: 1 }); }} className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm">
          <option value="all">All Status</option>
          {['Open', 'In Progress', 'Waiting for User', 'Resolved', 'Closed'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Tickets */}
      <div className="grid gap-4">
        {loading && <div className="text-center py-12 text-slate-400">Loading tickets...</div>}
        {!loading && tickets.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <FaHeadset className="text-4xl text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No support tickets yet</p>
            <button onClick={() => setShowCreate(true)} className="mt-4 text-sm text-indigo-600 hover:underline">Create your first ticket</button>
          </div>
        )}
        {tickets.map((t) => (
          <div key={t._id} onClick={() => fetchTicketDetails(t._id)} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md cursor-pointer transition">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FaTicketAlt className="text-indigo-500 text-sm" />
                  <span className="font-mono text-xs text-indigo-600">{t.ticketId}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[t.status]}`}>{t.status}</span>
                </div>
                <p className="font-medium text-slate-800">{t.subject}</p>
                <p className="text-xs text-slate-500 mt-1">{t.category} · {new Date(t.createdAt).toLocaleDateString()}</p>
              </div>
              <FaChevronRight className="text-slate-300" />
            </div>
          </div>
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">{pagination.total} total tickets</span>
          <div className="flex gap-2">
            <button onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })} disabled={pagination.page === 1} className="p-2 rounded-lg border border-slate-200 disabled:opacity-40"><FaChevronLeft /></button>
            <span className="px-3 py-2 text-sm text-slate-600">{pagination.page} / {pagination.totalPages}</span>
            <button onClick={() => setPagination({ ...pagination, page: Math.min(pagination.totalPages, pagination.page + 1) })} disabled={pagination.page === pagination.totalPages} className="p-2 rounded-lg border border-slate-200 disabled:opacity-40"><FaChevronRight /></button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Create Support Ticket</h3>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600"><FaTimes /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Category</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-400">
                  <option value="">Select category...</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Subject</label>
                <input type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} placeholder="Brief summary of your issue" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe your issue in detail..." rows={4} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-400 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50">{submitting ? 'Creating...' : 'Create Ticket'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;
