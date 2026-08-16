import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FaSave, FaMapMarkerAlt } from 'react-icons/fa';

const Location = () => {
  const { business, refreshBusiness } = useAuth();
  const [formData, setFormData] = useState({
    latitude: '',
    longitude: '',
    mapUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasSavedLocation, setHasSavedLocation] = useState(false);

  useEffect(() => {
    if (business && business.location) {
      const savedLocation = {
        latitude: business.location.latitude || '',
        longitude: business.location.longitude || '',
        mapUrl: business.location.mapUrl || '',
      };
      setFormData(savedLocation);
      setHasSavedLocation(Boolean(savedLocation.latitude || savedLocation.longitude || savedLocation.mapUrl));
      setIsEditing(false);
    }
  }, [business]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          });
          toast.success('Location detected!');
        },
        (error) => {
          toast.error('Could not get your location');
        }
      );
    } else {
      toast.error('Geolocation not supported');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/business/location', formData);
      const result = res.data;
      if (!result.success) throw new Error(result.message || 'Failed to save');
      toast.success('Location saved!');
      setHasSavedLocation(Boolean(formData.latitude || formData.longitude || formData.mapUrl));
      setIsEditing(false);
      await refreshBusiness();
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to save location';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Location</h2>
        <p className="text-gray-600">Add your business location for maps integration</p>
      </div>

      {hasSavedLocation && !isEditing && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-indigo-100">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-sm font-semibold text-indigo-600">Saved Location</p>
              <h3 className="text-lg font-bold text-gray-800">Business location available</h3>
            </div>
            <button
              type="button"
              onClick={handleEditClick}
              className="px-4 py-2 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 font-medium hover:bg-indigo-100 transition"
            >
              Edit
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-gray-500">Latitude</p>
              <p className="font-semibold text-gray-800 break-all">{formData.latitude || 'Not added'}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-gray-500">Longitude</p>
              <p className="font-semibold text-gray-800 break-all">{formData.longitude || 'Not added'}</p>
            </div>
          </div>

          {formData.mapUrl && (
            <div className="mt-4 rounded-lg bg-gray-50 p-3">
              <p className="text-gray-500 text-sm">Google Maps URL</p>
              <a
                href={formData.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 font-medium break-all underline"
              >
                {formData.mapUrl}
              </a>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="19.0760"
                disabled={!isEditing && hasSavedLocation}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="72.8777"
                disabled={!isEditing && hasSavedLocation}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={getCurrentLocation}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            disabled={!isEditing && hasSavedLocation}
          >
            <FaMapMarkerAlt />
            Get Current Location
          </button>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Google Maps URL (Optional)</label>
            <input
              type="url"
              value={formData.mapUrl}
              onChange={(e) => setFormData({ ...formData, mapUrl: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="https://maps.google.com/..."
              disabled={!isEditing && hasSavedLocation}
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {hasSavedLocation && !isEditing ? (
              <button
                type="button"
                onClick={handleEditClick}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-50 transition"
              >
                <FaSave />
                Edit Location
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
              >
                <FaSave />
                {loading ? 'Saving...' : hasSavedLocation ? 'Update Location' : 'Save Location'}
              </button>
            )}

            {hasSavedLocation && isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-3 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Location;
