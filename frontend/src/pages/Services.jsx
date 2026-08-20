import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaRupeeSign, FaConciergeBell } from 'react-icons/fa';
import UsageIndicator from '../components/UsageIndicator';

const Services = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState(null);

  const fetchUsage = async () => {
    try {
      const { data } = await api.get('/subscription/usage');
      setUsage(data.usage);
    } catch (err) {
      console.error('Failed to fetch usage:', err.message);
    }
  };

  const fetchServices = async () => {
    try {
      console.log('📥 Fetching services...');
      const { data } = await api.get('/services');
      console.log('✅ Services fetched:', data.services?.length || 0, 'services');
      
      if (data.services?.length > 0) {
        data.services.forEach((item, idx) => {
          console.log(`  ${idx + 1}. ID: ${item._id}, Name: ${item.name}, Price: ${item.price}`);
        });
      }
      
      setServices(data.services || []);
    } catch (err) {
      console.error('❌ Fetch services error:', err.message);
      toast.error('Failed to fetch services');
    }
  };

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('bizcardly_token');
      if (token) {
        fetchServices();
        fetchUsage();
      } else {
        console.log('Services: No token found');
      }
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log('📋 Starting service submission');
    
    try {
      console.log('📤 Sending request to /services');
      const res = await api.post('/services', formData);
      const result = res.data;
      
      console.log('✅ Response received:', result);
      if (!result.success) throw new Error(result.message || 'Failed to save service');
      
      toast.success(editingService ? 'Service updated!' : 'Service added!');
      setShowModal(false);
      resetForm();
      fetchServices();
      fetchUsage();
    } catch (err) {
      console.error('❌ Service save error:', err.message);
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      price: service.price,
      description: service.description,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await api.delete(`/services/${id}`);
      toast.success('Service deleted!');
      fetchServices();
      fetchUsage();
    } catch (err) {
      toast.error('Failed to delete service');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', description: '' });
    setEditingService(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between animate-slide-in-left">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Services</h2>
          <p className="text-gray-600">Manage your service offerings</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          disabled={usage?.services?.limit != null && usage.services.limit >= 0 && usage.services.used >= usage.services.limit}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition hover-lift shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaPlus />
          Add Service
        </button>
      </div>

      <UsageIndicator usage={usage} resourceKey="services" label="Services" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-staggered">
        {services.map((service) => (
          <div key={service._id} className="bg-white rounded-xl shadow-sm p-6 hover-lift transition group">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition transform group-hover:scale-110">
              <FaConciergeBell className="text-purple-600 text-xl" />
            </div>
            <h3 className="font-semibold text-gray-800 group-hover:text-indigo-600 transition">{service.name}</h3>
            <p className="text-indigo-600 font-bold mt-1 flex items-center gap-1">
              <FaRupeeSign />
              {service.price}
            </p>
            <p className="text-gray-600 text-sm mt-2 line-clamp-2">{service.description}</p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleEdit(service)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-indigo-100 hover:text-indigo-600 transition hover-scale"
              >
                <FaEdit /> Edit
              </button>
              <button
                onClick={() => handleDelete(service._id)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition hover-scale"
              >
                <FaTrash /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {services.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl animate-fade-in">
          <FaConciergeBell className="text-gray-300 text-5xl mx-auto mb-4 animate-bounce-subtle" />
          <p className="text-gray-500">No services yet. Add your first service!</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 animate-fade-in" onClick={() => { setShowModal(false); resetForm(); }}></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 animate-scale-in shadow-2xl">
              <h3 className="text-xl font-bold mb-4 text-gray-800">{editingService ? 'Edit Service' : 'Add Service'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition hover:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                  <div className="relative">
                    <FaRupeeSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition hover:border-gray-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition hover:border-gray-400"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition hover-scale"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 hover-scale shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                        Saving...
                      </span>
                    ) : (
                      'Save'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Services;
