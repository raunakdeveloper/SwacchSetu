// src/pages/ReportsListPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpDown, Filter } from "lucide-react";
import { useReport } from "../context/ReportContext";
import ReportTable from "../components/ReportTable";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination";

const ReportsListPage = () => {
  const { fetchReports, reports } = useReport();
  const location = useLocation();

  // Filters State
  const [reportId, setReportId] = useState("");
  const [filterType, setFilterType] = useState("");
  const [status, setStatus] = useState("");

  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    search: "",
    sortBy: "createdAt",
    order: "desc",
  });

  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadReports();
  }, [
    filters.page,
    filters.search,
    filters.sortBy,
    filters.order,
    reportId,
    filterType,
    status,
  ]);

  const loadReports = async () => {
    try {
      const data = await fetchReports({
        search: filters.search,
        page: filters.page,
        limit: filters.limit,
        sortBy: filterType || filters.sortBy,
        order: filters.order,
        reportId,
        status,
      });

      setTotalPages(data?.totalPages || 1);
    } catch (error) {
      console.error("Error loading reports:", error);
    }
  };

  const handleSearchSubmit = () => {
    // Reset to first page and reload with current filters
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  return (
    <div className="container mx-auto px-4 pt-4 pb-8">

      {/* Heading */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">All Reports</h1>
        <p className="text-gray-600">Track and manage garbage reports.</p>
      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-8">
        <SearchBar
          reportId={reportId}
          onReportIdChange={setReportId}
          filterType={filterType}
          onFilterTypeChange={setFilterType}
          status={status}
          onStatusChange={setStatus}
          onSubmit={handleSearchSubmit}
        />
      </div>

      {/* Reports Table */}
      <div>
        {!reports || reports.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Filter className="h-10 w-10 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 mb-1">No reports found</p>
            <p className="text-gray-400 text-sm">
              Try adjusting filters or search terms.
            </p>
          </div>
        ) : (
          <>
            <ReportTable
              reports={reports}
              columns={{
                reportedBy: true,
              }}
              actions={(report) => (
                <Link
                  to={`/reports/${report._id}`}
                  state={{ from: location.pathname + location.search }}
                  className="px-3 py-1 text-xs rounded-md border border-blue-500 
                             text-blue-600 hover:bg-blue-50"
                >
                  View
                </Link>
              )}
            />

            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={filters.page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
      </div>
  );
};

export default ReportsListPage;
