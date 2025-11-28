// src/components/SearchBar.jsx
import React from "react";

const SearchBar = ({
  reportId,
  onReportIdChange,
  filterType,
  onFilterTypeChange,
  status,
  onStatusChange,
  onSubmit,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-white p-4 rounded-lg shadow-sm"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">

        {/* Search Report ID */}
        <input
          type="text"
          value={reportId}
          onChange={(e) => onReportIdChange(e.target.value)}
          placeholder="Report ID"
          className="px-3 py-2 rounded-md bg-gray-100 focus:bg-white 
                     focus:ring-2 focus:ring-blue-500 outline-none"
        />

        {/* Filter Type */}
        <select
          value={filterType}
          onChange={(e) => onFilterTypeChange(e.target.value)}
          className="px-3 py-2 rounded-md bg-gray-100 focus:bg-white 
                     focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">Sort / Filter</option>
          <option value="createdAt">Date Reported</option>
          <option value="upvotesCount">Most Upvoted</option>
          <option value="title">Title</option>
        </select>

        {/* Status Filter */}
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-2 rounded-md bg-gray-100 focus:bg-white 
                     focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="assigned">Assigned</option>
          <option value="inprogress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>

        {/* Search Button */}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full"
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
