import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  FaCrown, FaCheckCircle, FaTimesCircle, FaBox, FaConciergeBell,
  FaImages, FaVideo, FaHistory, FaArrowUp, FaClock, FaQrcode, FaCamera,
} from 'react-icons/fa';

const FEATURE_LABELS = {
  remove_branding: 'Remove "Powered by BizCardly" branding',
  priority_support: 'Priority support (faster ticket response)',
  custom_templates: 'Access to premium card templates',
  advanced_analytics: 'Advanced visitor analytics',
};

const STATUS_BADGE = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-600',
};

const UsageBar = ({ icon: Icon, label, used, limit }) => {
  const unlimited = limit == null || limit < 0;
  const pct = unlimited ? 0 : Math.min(100, Math.round((used / Math.max(limit, 1)) * 100));
  const isFull = !unlimited && used >= limit;
  const isNear = !unlimited && !isFull && pct >= 80;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-gray-700 font-medium">
          <Icon className="text-indigo-500" />
          <span>{label}</span>
        </div>
        <span className={`text-sm font-semibold ${isFull ? 'text-red-600' : isNear ? 'text-amber-600' : 'text-gray-500'}`}>
          {used} / {unlimited ? '∞' : limit}
        </span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isFull ? 'bg-red-500' : isNear ? 'bg-amber-500' : 'bg-indigo-500'}`}
          style={{ width: unlimited ? '8%' : `${pct}%` }}
        />
      </div>
      {isFull && <p className="text-xs text-red-600 mt-1">Limit reached. Upgrade to add more.</p>}
    </div>
  );
};

const Subscription = () => {
  const [loading, setLoading] = useState(true);
  const [usageData, setUsageData] = useState(null);
  const [plans, setPlans] = useState([]);
  const [requests, setRequests] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({ paymentMethod: 'UPI', transactionRef: '' });
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [usageRes, plansRes, requestsRes, paymentInfoRes] = await Promise.all([
        api.get('/subscription/usage'),
        api.get('/subscription/plans'),
        api.get('/subscription/my-requests'),
        api.get('/subscription/payment-info'),
      ]);
      setUsageData(usageRes.data);
      setPlans(plansRes.data.plans || []);
      setRequests(requestsRes.data.requests || []);
      setPaymentInfo(paymentInfoRes.data);
    } catch (err) {
      toast.error('Failed to load subscription details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openRequestModal = (plan) => {
    setSelectedPlan(plan);
    setFormData({ paymentMethod: 'UPI', transactionRef: '' });
    setScreenshotFile(null);
    setScreenshotPreview('');
    setShowRequestModal(true);
  };

  const hasPendingRequestFor = (planName) =>
    requests.some((r) => r.requestedPlan === planName && r.status === 'pending');

  const handleScreenshotSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshotFile(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!formData.transactionRef.trim()) {
      toast.error('Please enter your UPI ID / transaction reference');
      return;
    }
    if (!screenshotFile) {
      toast.error('Please upload a payment screenshot as proof');
      return;
    }
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('requestedPlan', selectedPlan.name);
      data.append('paymentMethod', formData.paymentMethod);
      data.append('transactionRef', formData.transactionRef.trim());
      data.append('image', screenshotFile);

      await api.post('/subscription/request', data);
      toast.success('Request submitted! SuperAdmin will review it shortly.');
      setShowRequestModal(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-24 text-gray-500">Loading subscription details...</div>;
  }

  const currentPlan = usageData?.plan;
  const subscription = usageData?.subscription;
  const usage = usageData?.usage || {};
  const features = usageData?.features || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Subscription</h2>
        <p className="text-gray-600">Manage your plan, usage, and upgrade requests</p>
      </div>

      {/* Current Plan Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FaCrown className="text-yellow-300" />
              <span className="text-sm uppercase tracking-wide text-white/80">Current Plan</span>
            </div>
            <h3 className="text-3xl font-black">{currentPlan?.name || 'Free'}</h3>
            <p className="text-white/80 text-sm mt-1">
              {currentPlan?.price ? `₹${currentPlan.price} / ${currentPlan.billingDuration}` : 'No cost'}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-sm text-white/80 justify-end">
              <FaClock />
              <span>Status: {subscription?.status || 'active'}</span>
            </div>
            {subscription?.expiryDate && (
              <p className="text-sm text-white/80 mt-1">
                Renews/Expires: {new Date(subscription.expiryDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {features.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/20 flex flex-wrap gap-3">
            {features.map((f) => (
              <span key={f} className="flex items-center gap-1.5 text-sm bg-white/15 px-3 py-1 rounded-full">
                <FaCheckCircle className="text-emerald-300" />
                {FEATURE_LABELS[f] || f}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Usage */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-3">Usage</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <UsageBar icon={FaBox} label="Products" used={usage.products?.used || 0} limit={usage.products?.limit} />
          <UsageBar icon={FaConciergeBell} label="Services" used={usage.services?.used || 0} limit={usage.services?.limit} />
          <UsageBar icon={FaImages} label="Gallery" used={usage.gallery?.used || 0} limit={usage.gallery?.limit} />
          <UsageBar icon={FaVideo} label="Videos" used={usage.videos?.used || 0} limit={usage.videos?.limit} />
        </div>
      </div>

      {/* Available Plans */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-3">Available Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((plan) => {
            const isCurrent = plan.name === currentPlan?.name;
            const pending = hasPendingRequestFor(plan.name);
            return (
              <div
                key={plan._id || plan.name}
                className={`rounded-xl p-6 border-2 shadow-sm ${isCurrent ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xl font-bold text-gray-800">{plan.name}</h4>
                  {isCurrent && <span className="text-xs font-bold bg-indigo-600 text-white px-2 py-1 rounded-full">Current</span>}
                </div>
                <p className="text-2xl font-black text-indigo-600 mb-3">
                  {plan.price ? `₹${plan.price}` : 'Free'}
                  {plan.price > 0 && <span className="text-sm font-medium text-gray-500">/{plan.billingDuration}</span>}
                </p>
                <ul className="space-y-1.5 text-sm text-gray-600 mb-4">
                  <li>Products: {plan.limits?.productLimit < 0 ? 'Unlimited' : plan.limits?.productLimit}</li>
                  <li>Services: {plan.limits?.serviceLimit < 0 ? 'Unlimited' : plan.limits?.serviceLimit}</li>
                  <li>Gallery images: {plan.limits?.galleryImageLimit < 0 ? 'Unlimited' : plan.limits?.galleryImageLimit}</li>
                  <li>Videos: {plan.limits?.videoLimit < 0 ? 'Unlimited' : plan.limits?.videoLimit}</li>
                  {(plan.limits?.customFeatures || []).map((f) => (
                    <li key={f} className="flex items-center gap-1.5 text-emerald-700">
                      <FaCheckCircle className="text-emerald-500 text-xs" /> {FEATURE_LABELS[f] || f}
                    </li>
                  ))}
                </ul>
                {!isCurrent && plan.name !== 'Free' && (
                  <button
                    onClick={() => openRequestModal(plan)}
                    disabled={pending}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaArrowUp />
                    {pending ? 'Request Pending' : `Upgrade to ${plan.name}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Request History */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <FaHistory /> Upgrade Request History
        </h3>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {requests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No requests yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3">Plan</th>
                  <th className="text-left px-4 py-3">Amount</th>
                  <th className="text-left px-4 py-3">Transaction Ref</th>
                  <th className="text-left px-4 py-3">Proof</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Submitted</th>
                  <th className="text-left px-4 py-3">Admin Note</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r._id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-800">{r.requestedPlan}</td>
                    <td className="px-4 py-3">₹{r.amount}</td>
                    <td className="px-4 py-3 text-gray-500">{r.transactionRef}</td>
                    <td className="px-4 py-3">
                      {r.paymentProof ? (
                        <a href={r.paymentProof} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-xs font-medium">View</a>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_BADGE[r.status] || ''}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-gray-500">{r.adminNote || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && selectedPlan && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowRequestModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
              <h3 className="text-xl font-bold mb-1 text-gray-800">Upgrade to {selectedPlan.name}</h3>
              <p className="text-gray-500 text-sm mb-4">
                Scan the QR code below and pay ₹{selectedPlan.price} via UPI. Then submit your UPI ID and a screenshot of the payment for verification.
              </p>

              {(paymentInfo?.paymentQrCode || paymentInfo?.paymentUpiId) ? (
                <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-4 mb-4">
                  {paymentInfo?.paymentQrCode ? (
                    <img src={paymentInfo.paymentQrCode} alt="Payment QR" className="w-28 h-28 object-contain rounded-lg border border-gray-200 bg-white" />
                  ) : (
                    <div className="w-28 h-28 flex items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white">
                      <FaQrcode className="text-gray-300 text-3xl" />
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Pay to UPI ID</p>
                    <p className="text-lg font-bold text-gray-800">{paymentInfo?.paymentUpiId || 'Not set'}</p>
                    <p className="text-xs text-gray-500 mt-1">Amount: ₹{selectedPlan.price}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 text-amber-700 text-xs rounded-lg p-3 mb-4">
                  Payment QR not configured yet. Please contact support.
                </div>
              )}

              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="UPI">UPI</option>
                    <option value="BankTransfer">Bank Transfer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your UPI ID / Transaction Ref *</label>
                  <input
                    type="text"
                    value={formData.transactionRef}
                    onChange={(e) => setFormData({ ...formData, transactionRef: e.target.value })}
                                        placeholder="e.g. yourname@upi or UTR number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Screenshot *</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-400 transition cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotSelect}
                      className="hidden"
                      id="paymentScreenshot"
                    />
                    <label htmlFor="paymentScreenshot" className="cursor-pointer block">
                      {screenshotPreview ? (
                        <img src={screenshotPreview} alt="Screenshot preview" className="max-h-40 mx-auto rounded-lg" />
                      ) : (
                        <>
                          <FaCamera className="text-gray-400 text-2xl mx-auto mb-2" />
                          <p className="text-gray-600 text-sm">Click to upload payment screenshot</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Request'}
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

export default Subscription;
