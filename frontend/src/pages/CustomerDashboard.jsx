import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('customer_token');
    const savedUser = localStorage.getItem('customer_user');
    if (!token || !savedUser) {
      navigate('/customer/login');
      return;
    }
    try {
      setCustomer(JSON.parse(savedUser));
    } catch {
      localStorage.removeItem('customer_token');
      localStorage.removeItem('customer_user');
      navigate('/customer/login');
    }
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_user');
    navigate('/customer/login');
  };

  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
            <FaUser />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Customer Portal</h1>
            <p className="text-xs text-slate-500">Welcome back</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition"
        >
          <FaSignOutAlt /> Logout
        </button>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">My Profile</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-xl bg-slate-50">
              <p className="text-slate-500 mb-1">Name</p>
              <p className="font-semibold text-slate-800 text-base">{customer.name}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50">
              <p className="text-slate-500 mb-1">Mobile</p>
              <p className="font-semibold text-slate-800 text-base">{customer.mobile}</p>
            </div>
            {customer.email && (
              <div className="p-4 rounded-xl bg-slate-50">
                <p className="text-slate-500 mb-1">Email</p>
                <p className="font-semibold text-slate-800 text-base">{customer.email}</p>
              </div>
            )}
            <div className="p-4 rounded-xl bg-green-50">
              <p className="text-slate-500 mb-1">Status</p>
              <p className="font-semibold text-green-700 text-base">Approved</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;
