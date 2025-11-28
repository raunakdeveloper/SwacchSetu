import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/navbar';
import Sidebar from '../../components/sidebar';
import ReportTable from '../../components/ReportTable';
import Modal from '../../components/Modal';
import { useWorker } from '../../context/WorkerContext';
import Loader from '../../components/loader';
import { useToast } from '../../components/Toast';

const WorkerReportManagement = () => {
  const [activeTab, setActiveTab] = useState('assigned');
  const { 
    fetchAssignedReports, 
    fetchInprogressReports, 
    fetchCompletedReports,
    acceptReport,
    rejectReport,
    completeReport,
    workerReports,
    loading
  } = useWorker();
  
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [completeData, setCompleteData] = useState({
    image: null,
    note: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [submittingReject, setSubmittingReject] = useState(false);
  const [submittingComplete, setSubmittingComplete] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { success, error } = useToast();
  const [acceptingId, setAcceptingId] = useState(null);

  useEffect(() => {
    fetchReports();
  }, [activeTab]);

  const fetchReports = () => {
    if (activeTab === 'assigned') fetchAssignedReports();
    if (activeTab === 'inprogress') fetchInprogressReports();
    if (activeTab === 'completed') fetchCompletedReports();
  };

  const handleAccept = async (reportId) => {
    setAcceptingId(reportId);
    try {
      await acceptReport(reportId);
      success('✓ Report accepted', 2000);
      fetchReports();
    } catch (err) {
      console.error('Error accepting report:', err);
      error('Failed to accept report', 2000);
    } finally {
      setAcceptingId(null);
    }
  };

  const handleReject = (report) => {
    setSelectedReport(report);
    setShowRejectModal(true);
  };

  const submitReject = async () => {
    setSubmittingReject(true);
    try {
      await rejectReport(selectedReport._id, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
      success('✓ Report rejected', 2000);
      fetchReports();
    } catch (err) {
      console.error('Error rejecting report:', err);
      error('Failed to reject report', 2000);
    } finally {
      setSubmittingReject(false);
    }
  };

  const handleComplete = (report) => {
    setSelectedReport(report);
    setShowCompleteModal(true);
  };

  const submitComplete = async () => {
    if (!completeData.image) {
      alert('Please upload a completion image');
      return;
    }
    setSubmittingComplete(true);
    try {
      const formData = new FormData();
      if (completeData.image) formData.append('completionImage', completeData.image);
      if (completeData.note) formData.append('completionNote', completeData.note);

      await completeReport(selectedReport._id, formData);
      setShowCompleteModal(false);
      setCompleteData({ image: null, note: '' });
      setImagePreview(null);
      success('✓ Report completed', 2000);
      fetchReports();
    } catch (err) {
      console.error('Error completing report:', err);
      error('Failed to complete report', 2000);
    } finally {
      setSubmittingComplete(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCompleteData({ ...completeData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { key: 'assigned', label: 'Not Participated' },
    { key: 'inprogress', label: 'Participated' },
    { key: 'completed', label: 'Completed' }
  ];

  const renderActions = (report) => {
    if (activeTab === 'assigned') {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/reports/${report._id}`, { state: { from: location.pathname + location.search } })}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            View
          </button>
          <button
            onClick={() => handleAccept(report._id)}
            disabled={acceptingId === report._id}
            className={`px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center justify-center ${
              acceptingId === report._id ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {acceptingId === report._id ? (
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              'Accept'
            )}
          </button>
          <button
            onClick={() => handleReject(report)}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Reject
          </button>
        </div>
      );
    }
    if (activeTab === 'inprogress') {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/reports/${report._id}`, { state: { from: location.pathname + location.search } })}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            View
          </button>
          <button
            onClick={() => handleComplete(report)}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
          >
            Complete
          </button>
        </div>
      );
    }
    return (
      <button
        onClick={() => navigate(`/reports/${report._id}`, { state: { from: location.pathname + location.search } })}
        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
      >
        View
      </button>
    );
  };

  return (
    <>
      <Navbar />
      <div className="flex">
        <Sidebar role="worker" />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Report Management</h1>

        <div className="flex gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-2 rounded-lg font-medium ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <Loader />
        ) : (
          <ReportTable
            reports={workerReports}
            columns={{ assignedBy: true }}
            actions={renderActions}
          />
        )}

        <Modal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          title="Reject Report"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Rejection Reason</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                rows="4"
                placeholder="Explain why you're rejecting this report..."
                required
              />
            </div>
            <button
              onClick={submitReject}
              disabled={submittingReject || !rejectReason.trim()}
              className={`w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 ${
                submittingReject || !rejectReason.trim() ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {submittingReject && (
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              )}
              {submittingReject ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </Modal>

        <Modal
          isOpen={showCompleteModal}
          onClose={() => setShowCompleteModal(false)}
          title="Complete Report"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Completion Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
              {imagePreview && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={imagePreview}
                      alt="Completion preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Completion Note (Optional)</label>
              <textarea
                value={completeData.note}
                onChange={(e) => setCompleteData({ ...completeData, note: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows="3"
                placeholder="Add any notes about the completion..."
              />
            </div>
            <button
              onClick={submitComplete}
              disabled={submittingComplete || !completeData.image}
              className={`w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 ${
                submittingComplete || !completeData.image ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {submittingComplete && (
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              )}
              {submittingComplete ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </Modal>
      </div>
      </div>
    </>
  );
};

export default WorkerReportManagement;