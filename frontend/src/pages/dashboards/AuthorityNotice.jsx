// src/pages/dashboards/AuthorityNotice.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../../components/navbar';
import Sidebar from '../../components/sidebar';
import Loader from '../../components/loader';
import Pagination from '../../components/Pagination';
import { useNotice } from '../../context/NoticeContext';
import { useToast } from '../../components/Toast';
import ConfirmDialog from '../../components/ConfirmDialog';
import { getPdfUrl, handleViewPdf, handleDownloadPdf } from '../../utils/pdfHelper';

const AuthorityNotice = () => {
  const [activeTab, setActiveTab] = useState('createnotice');

  const {
    notices,
    loading,
    fetchAllNotices,
    createNotice,
    deleteNotice,
  } = useNotice();

  const toast = useToast();
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    noticeId: null,
    noticeTitle: '',
  });

  const [form, setForm] = useState({
    title: '',
    description: '',
    audience: 'public',
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [creating, setCreating] = useState(false);
  const fileInputRef = React.useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [viewingId, setViewingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (activeTab === 'notice') {
      setCurrentPage(1);
      fetchAllNotices();
    }
  }, [activeTab, fetchAllNotices]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setPdfFile(null);
      return;
    }

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      e.target.value = '';
      return;
    }

    if (file.size > 1048576) {
      toast.error('PDF file size must be less than 1MB');
      e.target.value = '';
      return;
    }

    setPdfFile(file);
  };

  const handleCreateNotice = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }

    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('audience', form.audience);
    if (pdfFile) fd.append('pdfFile', pdfFile);

    try {
      setCreating(true);
      await createNotice(fd);
      toast.success('Notice created successfully');

      setForm({
        title: '',
        description: '',
        audience: 'public',
      });
      setPdfFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      await fetchAllNotices();
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.error || 'Failed to create notice';
      toast.error(errorMsg);
    } finally {
      setCreating(false);
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString();
  };

  const totalPages = Math.max(
    1,
    Math.ceil((notices?.length || 0) / itemsPerPage)
  );

  const paginatedNotices = (notices || []).slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleDeleteClick = (notice) => {
    setConfirmDialog({
      isOpen: true,
      noticeId: notice._id,
      noticeTitle: notice.title,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeletingId(confirmDialog.noticeId);
      await deleteNotice(confirmDialog.noticeId);
      toast.success('Notice deleted successfully');
      await fetchAllNotices();
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.error || 'Failed to delete notice';
      toast.error(errorMsg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex">
        <Sidebar role="authority" />
        <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Notice Boards</h1>

        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() =>
            setConfirmDialog({
              isOpen: false,
              noticeId: null,
              noticeTitle: '',
            })
          }
          onConfirm={handleDeleteConfirm}
          title="Delete Notice"
          message={`Are you sure you want to delete "${confirmDialog.noticeTitle}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('createnotice')}
            className={`px-6 py-2 rounded-lg font-medium ${
              activeTab === 'createnotice'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Create Notice
          </button>

          <button
            onClick={() => setActiveTab('notice')}
            className={`px-6 py-2 rounded-lg font-medium ${
              activeTab === 'notice'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Notices
          </button>
        </div>

        {/* CREATE NOTICE TAB */}
        {activeTab === 'createnotice' && (
          <div className="bg-white rounded-xl shadow p-6 max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">Create New Notice</h2>

            <form onSubmit={handleCreateNotice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Enter notice title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={4}
                  placeholder="Enter brief description (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Target Audience
                </label>
                <select
                  name="audience"
                  value={form.audience}
                  onChange={handleFormChange}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="public">Public (Users)</option>
                  <option value="worker">Worker</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Public notices users ko dikhenge. Worker notices workers ko.
                  Authority ko dono list me dikhengi.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  PDF Attachment (optional)
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="w-full text-sm"
                  ref={fileInputRef}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum file size: 1MB. Only PDF files are allowed.
                </p>
                {pdfFile && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Selected: {pdfFile.name} (
                    {(pdfFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={creating}
                className={`w-full py-2 rounded-lg text-white font-medium ${
                  creating
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {creating ? 'Creating...' : 'Publish Notice'}
              </button>
            </form>
          </div>
        )}

        {/* ALL NOTICES TAB */}
        {activeTab === 'notice' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">All Notices</h2>

            {loading ? (
              <Loader />
            ) : notices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-sm text-gray-500">
                  No notice created yet.
                </p>
                <button
                  onClick={() => setActiveTab('createnotice')}
                  className="mt-3 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Create your first notice
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-4 py-2 text-left">S.No</th>
                        <th className="px-4 py-2 text-left">Title</th>
                        <th className="px-4 py-2 text-left">Audience</th>
                        <th className="px-4 py-2 text-left">Date &amp; Time</th>
                        <th className="px-4 py-2 text-left">Attachment</th>
                        <th className="px-4 py-2 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedNotices.map((notice, index) => (
                        <tr
                          key={notice._id || index}
                          className="border-b last:border-0 hover:bg-gray-50"
                        >
                          <td className="px-4 py-2">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td className="px-4 py-2 font-medium">
                            {notice.title}
                          </td>
                          <td className="px-4 py-2 capitalize">
                            {notice.audience}
                          </td>
                          <td className="px-4 py-2">
                            {formatDateTime(notice.createdAt)}
                          </td>
                          <td className="px-4 py-2">
                            {notice.pdfUrl ||
                            notice.pdf ||
                            notice.attachmentUrl ? (
                              <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                                PDF
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">
                                -
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            {notice.pdfUrl ||
                            notice.pdf ||
                            notice.attachmentUrl ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={async () => {
                                    setViewingId(notice._id);
                                    try {
                                      await Promise.resolve(handleViewPdf(notice, toast));
                                    } finally {
                                      setViewingId(null);
                                    }
                                  }}
                                  disabled={viewingId === notice._id}
                                  className={`px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center ${
                                    viewingId === notice._id ? 'opacity-70 cursor-not-allowed' : ''
                                  }`}
                                  title="View PDF"
                                >
                                  {viewingId === notice._id ? (
                                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                  ) : (
                                    'View'
                                  )}
                                </button>
                                <button
                                  onClick={async () => {
                                    setDownloadingId(notice._id);
                                    try {
                                      await Promise.resolve(handleDownloadPdf(notice, toast));
                                    } finally {
                                      setDownloadingId(null);
                                    }
                                  }}
                                  disabled={downloadingId === notice._id}
                                  className={`px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center ${
                                    downloadingId === notice._id ? 'opacity-70 cursor-not-allowed' : ''
                                  }`}
                                  title="Download PDF"
                                >
                                  {downloadingId === notice._id ? (
                                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                  ) : (
                                    'Download'
                                  )}
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(notice)}
                                  disabled={deletingId === notice._id}
                                  className={`px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 flex items-center justify-center ${
                                    deletingId === notice._id ? 'opacity-70 cursor-not-allowed' : ''
                                  }`}
                                  title="Delete Notice"
                                >
                                  {deletingId === notice._id ? (
                                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                  ) : (
                                    'Delete'
                                  )}
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleDeleteClick(notice)}
                                className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                                title="Delete Notice"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </div>
        )}
      </div>
      </div>
    </>
  );
};

export default AuthorityNotice;
