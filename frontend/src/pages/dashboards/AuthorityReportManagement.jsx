import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../../components/sidebar';
import ReportTable from '../../components/ReportTable';
import Modal from '../../components/Modal';
import api from '../../utils/api';
import Loader from '../../components/loader';
import { useToast } from '../../components/Toast';

const AuthorityReportManagement = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [workers, setWorkers] = useState([]);
  const [workersLoading, setWorkersLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [assigningWorker, setAssigningWorker] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  
  const [updateForm, setUpdateForm] = useState({
    status: '',
    priority: ''
  });
  const [assignWorker, setAssignWorker] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { success, error } = useToast();

  useEffect(() => {
    fetchReports();
    fetchWorkers();
  }, [activeTab]);

  // Tab classification:
  // pending => status: pending
  // participated => statuses approved,inprogress
  // completed => statuses completed,rejected
  const fetchReports = async () => {
    setLoading(true);
    try {
      if (activeTab === 'pending') {
        // All pending that are NOT assigned
        const response = await api.get('/reports', { params: { status: 'pending' } });
        const list = (response.data.reports || []).filter(r => !r.assignedTo);
        setReports(list);
      } else if (activeTab === 'participated') {
        // approved + inprogress + pending but already assigned
        const response = await api.get('/reports', { params: { status: 'approved,inprogress,pending' } });
        const list = (response.data.reports || []).filter(r => (
          r.status === 'approved' ||
          r.status === 'inprogress' ||
          (r.status === 'pending' && r.assignedTo)
        ));
        setReports(list);
      } else if (activeTab === 'completed') {
        // completed + rejected
        const response = await api.get('/reports', { params: { status: 'completed,rejected' } });
        setReports(response.data.reports || []);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkers = async () => {
    setWorkersLoading(true);
    try {
      const response = await api.get('/worker/workers');
      setWorkers(response.data.workers || []);
    } catch (err) {
      console.error('Error fetching workers:', err);
      setWorkers([]);
    } finally {
      setWorkersLoading(false);
    }
  };

  const handleManage = (report) => {
    setSelectedReport(report);
    setUpdateForm({
      status: report.status,
      priority: report.priority || 'normal'
    });
    setRejectReason('');
    setAssignWorker(report.assignedTo?._id || '');
    setShowModal(true);
  };

  const handleUpdateStatus = async () => {
    setStatusUpdating(true);
    try {
      const payload = { ...updateForm };
      if (payload.status === 'rejected') {
        payload.reasonType = 'Other';
        payload.reasonText = rejectReason?.trim();
      }
      await api.patch(`/reports/${selectedReport._id}/status`, payload);
      success('✓ Status updated', 2000);
      setShowModal(false);
      fetchReports();
    } catch (err) {
      console.error('Error updating status:', err);
      error('Failed to update status', 2000);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAssignWorker = async () => {
    if (!assignWorker) return;
    setAssigningWorker(true);
    try {
      await api.patch(`/reports/${selectedReport._id}/assign`, { workerId: assignWorker });
      success('✓ Worker assigned', 2000);
      setShowModal(false);
      fetchReports();
    } catch (err) {
      console.error('Error assigning worker:', err);
      error('Failed to assign worker', 2000);
    } finally {
      setAssigningWorker(false);
    }
  };

  const tabs = [
    { key: 'pending', label: 'Not Participated' },
    { key: 'participated', label: 'Participated' },
    { key: 'completed', label: 'Completed' }
  ];

  const renderActions = (report) => (
    <div className="flex gap-2">
      <button
        onClick={() => navigate(`/reports/${report._id}` , { state: { from: location.pathname + location.search } })}
        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
      >
        View
      </button>
      <button
        onClick={() => handleManage(report)}
        className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
      >
        Manage
      </button>
    </div>
  );

  return (
    <div className="flex">
        <Sidebar role="authority" />
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
            reports={reports}
            columns={{ reportedBy: true }}
            actions={renderActions}
          />
        )}

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Manage Report"
        >
          {selectedReport && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-4">Report Info</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">ID:</span> {selectedReport.issueId}</p>
                  <p><span className="text-gray-500">Title:</span> {selectedReport.title}</p>
                  <p><span className="text-gray-500">Status:</span> {selectedReport.status}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Update Status</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2">Status</label>
                    <select
                      value={updateForm.status}
                      onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      disabled={statusUpdating}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="inprogress">In Progress</option>
                    </select>
                  </div>
                  {updateForm.status === 'rejected' && (
                    <div>
                      <label className="block text-sm mb-2">Reject Reason</label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        rows="3"
                        placeholder="Provide reason for rejection"
                        required
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm mb-2">Priority</label>
                    <select
                      value={updateForm.priority}
                      onChange={(e) => setUpdateForm({ ...updateForm, priority: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      disabled={statusUpdating}
                    >
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <button
                    onClick={handleUpdateStatus}
                    disabled={statusUpdating || (updateForm.status === 'rejected' && !rejectReason.trim())}
                    className={`w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 ${
                      statusUpdating || (updateForm.status === 'rejected' && !rejectReason.trim()) ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {statusUpdating && <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
                    {statusUpdating ? 'Updating...' : 'Update'}
                  </button>
                </div>

                <h3 className="font-semibold mb-4 mt-6">Assign Worker</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2">Select Worker</label>
                    <select
                      value={assignWorker}
                      onChange={(e) => setAssignWorker(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      disabled={workersLoading || assigningWorker}
                    >
                      <option value="">Select a worker</option>
                      {workersLoading && <option value="" disabled>Loading workers...</option>}
                      {(!workersLoading && workers.length === 0) && <option value="" disabled>No workers found</option>}
                      {workers.map(worker => (
                        <option key={worker._id} value={worker._id}>
                          {worker.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleAssignWorker}
                    disabled={assigningWorker || workersLoading || !assignWorker}
                    className={`w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 ${assigningWorker ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {assigningWorker && <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
                    {assigningWorker ? 'Assigning...' : 'Assign'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
      </div>
  );
};

export default AuthorityReportManagement;