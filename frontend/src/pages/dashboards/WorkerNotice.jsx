// src/pages/dashboards/WorkerNotice.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/sidebar';
import Loader from '../../components/loader';
import Pagination from '../../components/Pagination';
import { useWorker } from '../../context/WorkerContext';
import { useToast } from '../../components/Toast';
import { getPdfUrl, handleViewPdf, handleDownloadPdf } from '../../utils/pdfHelper';

const WorkerNotice = () => {
  // Worker can only view notices
  const {
    notices,
    loading,
    fetchAllNotices,
  } = useWorker();

  const toast = useToast();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch worker notices on mount
  useEffect(() => {
    const loadNotices = async () => {
      await fetchAllNotices();
      setCurrentPage(1);
    };
    loadNotices();
  }, [fetchAllNotices]);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString();
  };

  // ---- Pagination logic ----
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

  return (
    <div className="flex">
        <Sidebar role="worker" />

      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Notice Board</h1>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">All Notices</h2>

          {loading ? (
            <Loader />
          ) : !notices || notices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <svg
                className="w-16 h-16 text-gray-300 mb-4"
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
              <p className="text-gray-500 text-lg font-medium mb-1">
                No notices published yet
              </p>
              <p className="text-sm text-gray-400">
                Check back later for updates
              </p>
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
                            {notice.audience || 'worker'}
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
                              <span className="text-xs text-gray-400">
                                No PDF
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            {pdfUrl ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleViewPdf(notice, toast)}
                                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                  title="View PDF"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() => handleDownloadPdf(notice, toast)}
                                  className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                  title="Download PDF"
                                >
                                  Download
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">
                                -
                              </span>
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
            </>
          )}
        </div>
      </div>
      </div>
  );
};

export default WorkerNotice;
