// src/pages/NoticePage.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotice } from '../context/NoticeContext';
import { useToast } from '../components/Toast';
import Navbar from '../components/navbar';
import Loader from '../components/loader';
import Pagination from '../components/Pagination';
import { getPdfUrl, handleViewPdf, handleDownloadPdf } from '../utils/pdfHelper';

const NoticePage = () => {
  const { user } = useAuth();
  const { notices, loading, fetchPublicNotices, fetchWorkerNotices } = useNotice();
  const toast = useToast();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Per-notice action loaders
  const [viewingId, setViewingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    const loadNotices = async () => {
      // /notices path pe sabko sirf public notices dikhni chahiye
      await fetchPublicNotices();
      setCurrentPage(1);
    };

    loadNotices();
  }, [fetchPublicNotices]);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString();
  };

  // Pagination logic
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

  const hasNotices = notices && notices.length > 0;

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 pt-4 pb-8">
        <h1 className="text-4xl font-bold mb-8">Notices &amp; Announcements</h1>

      {loading ? (
        <Loader />
      ) : !hasNotices ? (
        // Empty state
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg
            className="w-20 h-20 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            No notices published yet
          </h2>
          <p className="text-gray-500">
            There are currently no notices available. Please check back later.
          </p>
        </div>
      ) : (
        // Table + pagination
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">All Notices</h2>
            <span className="text-sm text-gray-500">
              Total: {notices.length}
            </span>
          </div>

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
                {paginatedNotices.map((notice, index) => {
                  const pdfUrl = getPdfUrl(notice);
                  return (
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
                        {notice.audience || notice.type || 'public'}
                      </td>
                      <td className="px-4 py-2">
                        {formatDateTime(notice.createdAt)}
                      </td>
                      <td className="px-4 py-2">
                        {pdfUrl ? (
                          <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                            PDF
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {pdfUrl ? (
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
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No PDF</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
      </div>
    </>
  );
};

export default NoticePage;
