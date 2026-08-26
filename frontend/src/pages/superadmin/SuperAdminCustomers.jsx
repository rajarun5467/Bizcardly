import { useState, useEffect } from 'react';
import { FaPhone, FaUser, FaEnvelope, FaCheckCircle, FaTrash, FaUserCircle } from 'react-icons/fa';
import { API_BASE_URL } from '../../api/config';
import toast from 'react-hot-toast';

const SuperAdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchCustomers();
  }, [statusFilter]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await fetch(`${API_BASE_URL}/customers?status=${statusFilter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setCustomers(data.customers);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (customer) => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await fetch(`${API_BASE_URL}/customers/${customer._id}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(data.message);
      fetchCustomers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (customer) => {
    if (!window.confirm(`Delete customer ${customer.name}?`)) return;
    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await fetch(`${API_BASE_URL}/customers/${customer._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(data.message);
      fetchCustomers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Customer Approvals</h3>
            <p className="text-sm text-slate-500">Approve customers to allow login</p>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 text-sm bg-white"
          >
            <option value="all">All Customers</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center">
            <FaUserCircle className="text-4xl text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Customer</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Mobile</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden lg:table-cell">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-bold">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 truncate">{customer.name}</p>
                          <p className="text-xs text-slate-500">{new Date(customer.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="flex items-center gap-1 text-slate-600">
                        <FaPhone className="text-xs text-indigo-500" /> {customer.mobile}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-slate-500 text-xs">
                      {customer.email ? (
                        <span className="flex items-center gap-1">
                          <FaEnvelope className="text-indigo-500" /> {customer.email}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {customer.isApproved ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <FaCheckCircle className="text-[10px]" /> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          <FaUser className="text-[10px]" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {!customer.isApproved && (
                          <button
                            onClick={() => handleApprove(customer)}
                            className="p-2 rounded-lg hover:bg-green-50 text-green-600 transition"
                            title="Approve"
                          >
                            <FaCheckCircle className="text-sm" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(customer)}
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
      </div>
    </div>
  );
};

export default SuperAdminCustomers;
