import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FaUpload, FaSave, FaCreditCard } from 'react-icons/fa';
import { API_BASE_URL } from '../api/config';

const API_ORIGIN = API_BASE_URL.replace(/\/api$/, '');

const assetUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path) || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }
  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
};

const Payment = () => {
  const { business, refreshBusiness } = useAuth();
  const [upiId, setUpiId] = useState('');
  const [qrImage, setQrImage] = useState(null);
  const [qrPreview, setQrPreview] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (business) {
      setUpiId(business.upiId || '');
      if (business.paymentQr) {
        setQrPreview(assetUrl(business.paymentQr));
      }
    }
  }, [business]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setQrImage(file);
      setQrPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append('upiId', upiId);
      if (qrImage) data.append('paymentQr', qrImage);

      const res = await api.put('/business/payment', data);
      const result = res.data;
      if (!result.success) throw new Error(result.message || 'Failed to save');
      toast.success('Payment details saved!');
      refreshBusiness();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Payment QR Code</h2>
        <p className="text-gray-600">Add your UPI ID and payment QR code</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID</label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="yourname@upi"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment QR Code Image</label>
            <div className="flex items-center gap-6">
              <div className="w-40 h-40 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                {qrPreview ? (
                  <img src={qrPreview} alt="QR Code" className="w-full h-full object-cover" />
                ) : (
                  <FaCreditCard className="text-gray-400 text-4xl" />
                )}
              </div>
              <div>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700 transition">
                  <FaUpload />
                  <span>Upload QR Code</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                <p className="text-gray-500 text-sm mt-2">Upload your payment QR code image</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
          >
            <FaSave />
            {loading ? 'Saving...' : 'Save Payment Details'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Payment;
