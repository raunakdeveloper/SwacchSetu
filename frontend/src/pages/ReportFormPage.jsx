import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useReport } from '../context/ReportContext';
import MapPicker from '../components/MapPicker';
import { toast } from 'react-toastify';

const ReportFormPage = () => {
  const { user } = useAuth();
  const { createReport } = useReport();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    latitude: '',
    longitude: '',
    image: null,
  });

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // address ko editable rakhte hue location ke address ko bhi sync karenge
    if (name === 'address') {
      setFormData((prev) => ({
        ...prev,
        address: value,
      }));
      setSelectedLocation((prev) =>
        prev ? { ...prev, address: value } : prev
      );
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      image: file,
    }));

    // Preview ke liye
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const handleLocationSelect = (location) => {
    // location: { lat, lng, address }
    setSelectedLocation(location);
    setFormData((prev) => ({
      ...prev,
      address: location.address || prev.address,
      latitude: location.lat,
      longitude: location.lng,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate('/login', {
        state: { message: 'Please login to submit a report' },
      });
      return;
    }

    // basic check: address & location
    if (!formData.address || !formData.latitude || !formData.longitude) {
      setError(
        'Please select a location on the map and ensure address is filled.'
      );
      return;
    }

    setError('');
    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);

      // Backend expects location as a JSON object
      const locationData = {
        address: formData.address,
        latitude: formData.latitude,
        longitude: formData.longitude,
      };
      data.append('location', JSON.stringify(locationData));

      if (formData.image) data.append('image', formData.image);

      const response = await createReport(data);
      // Backend returns the report directly or in response.report
      const reportId = response.report?._id || response._id;
      toast.success(response.message || 'Report submitted successfully!');
      navigate(`/reports/${reportId}`);
    } catch (err) {
      console.error(err);
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to submit report. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-4 pb-8">
      <div className="container mx-auto px-4 page-transition">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl text-center font-bold mb-6 fade-in">Submit a Report</h1>

        {!user && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg mb-6">
            You need to login to submit a report. You can fill the form, but
            login is required before submission.
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md p-8 space-y-6 fade-in"
        >
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief title of the issue"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the garbage issue in detail"
            />
          </div>

          {/* Map + Address */}
          <div className="space-y-4">
            <MapPicker
              selectedLocation={selectedLocation}
              onLocationSelect={handleLocationSelect}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address (Editable) *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Full address of the location"
              />
              <p className="text-xs text-gray-500 mt-1">
                You can adjust this address manually after selecting on the map.
              </p>
            </div>
          </div>

          {/* Image Upload + Capture + Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload or Capture Image *
            </label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              You can choose from gallery or use camera to capture the current
              situation.
            </p>

            {imagePreview && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-1">Image Preview:</p>
                <img
                  src={imagePreview}
                  alt="Selected"
                  className="h-40 w-full max-w-xs rounded-lg border object-cover"
                />
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Submitting...
              </span>
            ) : (
              'Submit Report'
            )}
          </button>
        </form>
      </div>
      </div>
      </div>
  );
};

export default ReportFormPage;