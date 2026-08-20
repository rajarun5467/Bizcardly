import { useState, useEffect } from 'react';
import { FaSave, FaCog, FaUserPlus, FaUpload, FaWrench, FaTools, FaQrcode } from 'react-icons/fa';
import { API_BASE_URL } from '../../api/config';
import toast from 'react-hot-toast';

const Toggle = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between py-3">
    <div>
      <p className="text-sm font-medium text-slate-800">{label}</p>
      {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${checked ? 'bg-indigo-600' : 'bg-slate-300'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

const SuperAdminSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [qrFile, setQrFile] = useState(null);
  const [qrPreview, setQrPreview] = useState('');

  const handleQrSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setQrFile(file);
      setQrPreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await fetch(`${API_BASE_URL}/superadmin/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSettings(data.settings);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('superadmin_token');
      const formData = new FormData();
      formData.append('platformName', settings.platformName);
      formData.append('defaultCardTemplate', settings.defaultCardTemplate);
      formData.append('registrationsEnabled', settings.registrationsEnabled);
      formData.append('maintenanceMode', settings.maintenanceMode);
      formData.append('maxUploadSize', settings.maxUploadSize);
      formData.append('allowedFileTypes', JSON.stringify(settings.allowedFileTypes));
      formData.append('paymentUpiId', settings.paymentUpiId || '');
      if (qrFile) formData.append('paymentQr', qrFile);

      const res = await fetch(`${API_BASE_URL}/superadmin/settings`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(data.message);
      setSettings(data.settings);
      setQrFile(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-slate-100 rounded-xl animate-pulse"></div>
        <div className="h-32 bg-slate-100 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="space-y-5 max-w-3xl">
      {/* General Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FaCog className="text-indigo-600" />
          <h3 className="text-lg font-semibold text-slate-800">General Settings</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Platform Name</label>
            <input
              type="text"
              value={settings.platformName}
              onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-900 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Default Card Template</label>
            <select
              value={settings.defaultCardTemplate}
              onChange={(e) => setSettings({ ...settings, defaultCardTemplate: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 text-sm bg-white"
            >
              <option value="classic">Classic</option>
              <option value="modern">Modern</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Registration Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FaUserPlus className="text-indigo-600" />
          <h3 className="text-lg font-semibold text-slate-800">Registration Settings</h3>
        </div>
        <div className="divide-y divide-slate-100">
          <Toggle
            checked={settings.registrationsEnabled}
            onChange={(val) => setSettings({ ...settings, registrationsEnabled: val })}
            label="Enable New Registrations"
            description="Allow new users to sign up on the platform"
          />
        </div>
      </div>

      {/* Upload Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FaUpload className="text-indigo-600" />
          <h3 className="text-lg font-semibold text-slate-800">Upload Settings</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Maximum Upload Size (MB)</label>
            <input
              type="number"
              value={settings.maxUploadSize}
              onChange={(e) => setSettings({ ...settings, maxUploadSize: parseInt(e.target.value) || 10 })}
              min="1"
              max="100"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-900 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Allowed File Types</label>
            <input
              type="text"
              value={settings.allowedFileTypes.join(', ')}
              onChange={(e) => setSettings({ ...settings, allowedFileTypes: e.target.value.split(',').map(t => t.trim()) })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-900 text-sm"
            />
            <p className="text-xs text-slate-400 mt-1">Comma-separated MIME types</p>
          </div>
        </div>
      </div>

      {/* Payment Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FaQrcode className="text-indigo-600" />
          <h3 className="text-lg font-semibold text-slate-800">Subscription Payment Settings</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          This QR code and UPI ID will be shown to users when they request a plan upgrade.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="flex flex-col items-center gap-2">
            <div className="w-36 h-36 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50">
              {qrPreview || settings.paymentQrCode ? (
                <img src={qrPreview || settings.paymentQrCode} alt="Payment QR" className="w-full h-full object-contain" />
              ) : (
                <FaQrcode className="text-slate-300 text-4xl" />
              )}
            </div>
            <label className="cursor-pointer text-xs font-medium text-indigo-600 hover:text-indigo-700">
              <input type="file" accept="image/*" onChange={handleQrSelect} className="hidden" />
              {settings.paymentQrCode ? 'Change QR Code' : 'Upload QR Code'}
            </label>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-700 mb-1">UPI ID</label>
            <input
              type="text"
              value={settings.paymentUpiId || ''}
              onChange={(e) => setSettings({ ...settings, paymentUpiId: e.target.value })}
              placeholder="yourbusiness@upi"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-900 text-sm"
            />
            <p className="text-xs text-slate-400 mt-1">Users will pay here and submit their UPI ref + screenshot for approval.</p>
          </div>
        </div>
      </div>

      {/* Maintenance Mode */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FaTools className="text-indigo-600" />
          <h3 className="text-lg font-semibold text-slate-800">Maintenance Mode</h3>
        </div>
        <div className="divide-y divide-slate-100">
          <Toggle
            checked={settings.maintenanceMode}
            onChange={(val) => setSettings({ ...settings, maintenanceMode: val })}
            label="Enable Maintenance Mode"
            description="When enabled, normal users and public visitors will see a maintenance page. SuperAdmin can still access the panel."
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 shadow-lg"
        >
          {saving ? (
            <>
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
              Saving...
            </>
          ) : (
            <>
              <FaSave /> Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SuperAdminSettings;
