import { useState, useEffect } from 'react';
import {
  FaEnvelope, FaPhone, FaUser, FaClock, FaTrashAlt, FaCheckCircle,
  FaCircle, FaInbox, FaHeadset, FaEye, FaSync
} from 'react-icons/fa';
import { API_BASE_URL } from '../api/config';
import toast from 'react-hot-toast';

const Enquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('bizcardly_token');
      if (!token) {
        setError('You are not logged in.');
        setLoading(false);
        return;
      }
      const res = await fetch(`${API_BASE_URL}/enquiries`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setEnquiries(data.enquiries);
      } else {
        setError(data.message || 'Failed to load enquiries.');
        toast.error(data.message || 'Failed to load enquiries.');
      }
    } catch (err) {
      setError('Network error. Please refresh or try again later.');
      toast.error('Network error. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('bizcardly_token');
      const res = await fetch(`${API_BASE_URL}/enquiries/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setEnquiries(enquiries.map(e => e._id === id ? { ...e, status } : e));
        toast.success(`Marked as ${status}`);
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this enquiry?')) return;
    try {
      const token = localStorage.getItem('bizcardly_token');
      const res = await fetch(`${API_BASE_URL}/enquiries/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setEnquiries(enquiries.filter(e => e._id !== id));
        toast.success('Enquiry deleted');
      }
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusBadge = (status) => {
    const styles = {
      new: { color: 'text-red-500', bg: 'bg-red-50', icon: FaInbox },
      read: { color: 'text-blue-500', bg: 'bg-blue-50', icon: FaEye },
      replied: { color: 'text-green-500', bg: 'bg-green-50', icon: FaCheckCircle },
    };
    const s = styles[status] || styles.new;
    const Icon = s.icon;
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${s.bg} ${s.color}`}>
        <Icon className="text-[10px]" /> {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Enquiries</h2>
          <p className="text-gray-600">Customer contact form submissions</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-shimmer">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const newCount = enquiries.filter(e => e.status === 'new').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between animate-slide-in-left">
        <div>
          <h2 className="text-2xl font-black text-[#11142f]">Enquiries</h2>
          <p className="text-gray-600">Customer contact form submissions</p>
        </div>
        <button
          onClick={fetchEnquiries}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          title="Refresh enquiries"
        >
          <FaSync /> Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 ring-1 ring-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg bg-white p-5 shadow-[0_12px_28px_rgba(40,51,92,0.08)] ring-1 ring-slate-200/80">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#efeaff]">
              <FaHeadset className="text-2xl text-[#7557f4]" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Enquiries</p>
              <h3 className="mt-1 text-2xl font-black text-[#11142f]">{enquiries.length}</h3>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-5 shadow-[0_12px_28px_rgba(40,51,92,0.08)] ring-1 ring-slate-200/80">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ffe9e9]">
              <FaInbox className="text-2xl text-[#f05252]" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">New</p>
              <h3 className="mt-1 text-2xl font-black text-[#11142f]">{newCount}</h3>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-5 shadow-[0_12px_28px_rgba(40,51,92,0.08)] ring-1 ring-slate-200/80">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f8ef]">
              <FaCheckCircle className="text-2xl text-[#1bb86d]" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Replied</p>
              <h3 className="mt-1 text-2xl font-black text-[#11142f]">{enquiries.filter(e => e.status === 'replied').length}</h3>
            </div>
          </div>
        </div>
      </div>

      {enquiries.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow-sm ring-1 ring-slate-200/80">
          <FaHeadset className="mx-auto text-4xl text-slate-300 mb-4" />
          <p className="text-slate-500">No enquiries yet. Contact form submissions will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {enquiries.map(enquiry => (
            <div
              key={enquiry._id}
              className="rounded-lg bg-white p-5 shadow-[0_12px_28px_rgba(40,51,92,0.08)] ring-1 ring-slate-200/80 transition hover:shadow-[0_18px_34px_rgba(82,91,170,0.16)]"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    {statusBadge(enquiry.status)}
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <FaClock className="text-[10px]" /> {formatDate(enquiry.createdAt)}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-[#11142f] mb-1 flex items-center gap-2">
                    <FaUser className="text-slate-400" /> {enquiry.name}
                  </h3>

                  <div className="flex flex-wrap gap-4 text-sm text-slate-600 mt-2">
                    <span className="flex items-center gap-1">
                      <FaPhone className="text-xs text-[#7557f4]" /> {enquiry.phone}
                    </span>
                    {enquiry.email && (
                      <span className="flex items-center gap-1">
                        <FaEnvelope className="text-xs text-[#7557f4]" /> {enquiry.email}
                      </span>
                    )}
                    {enquiry.subject && (
                      <span className="flex items-center gap-1">
                        <FaCircle className="text-[6px] text-slate-400" /> {enquiry.subject}
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-slate-600 bg-slate-50 rounded-lg p-3">
                    {enquiry.message}
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:items-end">
                  <div className="flex gap-2">
                    <select
                      value={enquiry.status}
                      onChange={e => updateStatus(enquiry._id, e.target.value)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 outline-none focus:ring-2 focus:ring-[#6657f1]/20"
                    >
                      <option value="new">New</option>
                      <option value="read">Read</option>
                      <option value="replied">Replied</option>
                    </select>
                    <button
                      onClick={() => handleDelete(enquiry._id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition rounded-lg hover:bg-red-50"
                      title="Delete enquiry"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Enquiries;
