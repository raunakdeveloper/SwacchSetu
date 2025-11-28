import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, ChevronUp, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useReport } from '../context/ReportContext';
import StatusBadge from '../components/StatusBadge';
import Timeline from '../components/Timeline';
import MapViewer from '../components/MapViewer';
import Comments from '../components/comments';
import Loader from '../components/loader';
import { formatDate } from '../utils/formatDate';
import ImageViewerModal from '../components/ImageViewerModal';

const ReportViewPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { getReport, upvoteReport } = useReport();
  const navigate = useNavigate();
  const location = useLocation();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upvoting, setUpvoting] = useState(false);

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageModalSrc, setImageModalSrc] = useState('');
  const [imageModalAlt, setImageModalAlt] = useState('');

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await getReport(id);
      setReport(data);
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentAdded = () => {
    loadReport();
  };

  const handleUpvote = async () => {
    if (!user) {
      navigate('/login', { state: { message: 'Please login to upvote' } });
      return;
    }
    if (!report) return;

    setUpvoting(true);
    try {
      const response = await upvoteReport(id);
      setReport((prev) => ({
        ...prev,
        upvotes: response?.upvotes ?? prev?.upvotes ?? 0,
      }));
    } catch (error) {
      console.error('Error upvoting:', error);
    } finally {
      setUpvoting(false);
    }
  };

  const openImageModal = (src, alt) => {
    if (!src) return;
    setImageModalSrc(src);
    setImageModalAlt(alt || '');
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
    setImageModalSrc('');
    setImageModalAlt('');
  };

  if (loading) {
    return <Loader />;
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Report not found
          </h1>
          <Link to="/reports" className="text-blue-600 hover:text-blue-700">
            Back to all reports
          </Link>
        </div>
      </div>
    );
  }

  const hasLocation =
    report.location &&
    (report.location.address ||
      (report.location.latitude && report.location.longitude));

  const lat = report.location?.latitude;
  const lng = report.location?.longitude;
  const mapLink =
    lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : null;

  const handleViewOnMaps = () => {
    if (!mapLink) return;
    window.open(mapLink, '_blank');
  };

  const handleCopyLocation = () => {
    if (!mapLink || !navigator.clipboard) return;
    navigator.clipboard.writeText(mapLink);
    alert('Location link copied!');
  };

  const handleBack = () => {
    const from = location.state?.from;
    if (from) {
      navigate(from);
      return;
    }
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
      return;
    }
    navigate('/reports');
  };

  const handleShareLocation = async () => {
    if (!mapLink) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: report.title,
          text: `Check this report location: ${report.title}`,
          url: mapLink,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      alert('Sharing not supported in this browser');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Reports</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Report details card */}
            <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
              {/* Report ID */}
              <div className="mb-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report ID: {report.issueId || id}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {report.title}
              </h1>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {report.description}
                </p>
              </div>

              {/* Report Image */}
              {report.image && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Report Image
                  </h3>
                  <div
                    onClick={() => openImageModal(report.image, report.title)}
                    className="relative w-full h-64 rounded-lg overflow-hidden cursor-pointer group bg-gray-100 border border-gray-200"
                  >
                    <img
                      src={report.image}
                      alt={report.title}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-4 py-2 bg-white/90 rounded-md text-xs md:text-sm font-medium">
                        Click to view full image
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center space-x-4 pt-4 border-t">
                <button
                  onClick={handleUpvote}
                  disabled={upvoting}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <ChevronUp className="h-5 w-5" />
                  <span>{report.upvotes ?? 0} votes</span>
                </button>

                <div className="flex items-center space-x-2 text-gray-500 text-sm">
                  <MessageCircle className="h-5 w-5" />
                  <span>{report.commentsCount ?? 0} comments</span>
                </div>
              </div>
            </div>

            {/* Location card */}
            {hasLocation && (
              <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 relative z-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Location
                </h3>

                <div className="h-64 rounded-lg overflow-hidden mb-4">
                  <MapViewer
                    latitude={lat}
                    longitude={lng}
                    address={report.location?.address}
                  />
                </div>

                {report.location?.address && (
                  <div className="flex items-start space-x-2 mb-4">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <p className="text-gray-700">{report.location.address}</p>
                  </div>
                )}

                {/* Location action buttons */}
                {mapLink && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleViewOnMaps}
                      className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={handleCopyLocation}
                      className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Copy
                    </button>
                    <button
                      onClick={handleShareLocation}
                      className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Share
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Comments card */}
            <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Comments
              </h3>
              <Comments reportId={id} onCommentAdded={handleCommentAdded} />
            </div>
          </div>

          {/* RIGHT: sidebar */}
          <div className="space-y-6">
            {/* Report Information card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Report Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-start">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium text-gray-900 text-right">
                    {formatDate(report.createdAt)}
                  </span>
                </div>

                <div className="flex justify-between items-start">
                  <span className="text-gray-600">Reported by:</span>
                  <span className="font-medium text-gray-900 text-right">
                    {report.createdBy?.name || 'N/A'}
                  </span>
                </div>

                <div className="flex justify-between items-start">
                  <span className="text-gray-600">Assigned to:</span>
                  <span className="font-medium text-gray-900 text-right">
                    {report.assignedTo?.name || 'Not assigned'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-gray-600">Status:</span>
                  <StatusBadge status={report.status} />
                </div>

                {report.priority && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Priority:</span>
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full capitalize bg-gray-100 text-gray-800">
                      {report.priority}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Timeline
              </h3>
              <Timeline timeline={report.timeline || []} />
            </div>

            {/* Completion proof card */}
            {report.status === 'completed' && (report.completionImage || report.completionNote) && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Completion Proof
                </h3>

                {report.completionImage && (
                  <div
                    onClick={() =>
                      openImageModal(
                        report.completionImage,
                        'Completion proof'
                      )
                    }
                    className="relative w-full h-48 rounded-lg overflow-hidden cursor-pointer group bg-gray-100 border border-gray-200 mb-3"
                  >
                    <img
                      src={report.completionImage}
                      alt="Completion proof"
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-4 py-2 bg-white/90 rounded-md text-xs font-medium">
                        Click to view full image
                      </span>
                    </div>
                  </div>
                )}

                {report.completionNote && report.completionNote.trim() ? (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <h4 className="text-xs font-semibold text-gray-700 mb-2">Message by Worker</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {report.completionNote.trim()}
                    </p>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image modal */}
      <ImageViewerModal
        src={imageModalSrc}
        alt={imageModalAlt}
        isOpen={imageModalOpen}
        onClose={closeImageModal}
      />
      </div>
  );
};

export default ReportViewPage;
