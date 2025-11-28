// Common helper functions for PDF viewing and downloading

// Get backend base URL without /api suffix
const getBackendBaseUrl = () => {
  return (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '');
};

// Get PDF URL from notice object
export const getPdfUrl = (notice) => {
  return notice.pdfUrl || notice.pdf || notice.attachmentUrl || '';
};

// Get internal view URL
export const getInternalViewUrl = (notice) => {
  const baseUrl = getBackendBaseUrl();
  return `${baseUrl}/notices/${notice._id}.pdf`;
};

// Get internal download URL
export const getInternalDownloadUrl = (notice) => {
  const baseUrl = getBackendBaseUrl();
  return `${baseUrl}/notices/${notice._id}/download`;
};

// Handle PDF view (accepts toast for notifications)
export const handleViewPdf = (notice, toast = null) => {
  if (!getPdfUrl(notice)) {
    if (toast) {
      toast.error('No attachment available');
    }
    return;
  }
  window.open(getInternalViewUrl(notice), '_blank', 'noopener,noreferrer');
};

// Handle PDF download (accepts toast for notifications)
export const handleDownloadPdf = (notice, toast = null) => {
  if (!getPdfUrl(notice)) {
    if (toast) {
      toast.error('No attachment available');
    }
    return;
  }
  const link = document.createElement('a');
  link.href = getInternalDownloadUrl(notice);
  link.download = notice.title ? `${notice.title}.pdf` : 'notice.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
