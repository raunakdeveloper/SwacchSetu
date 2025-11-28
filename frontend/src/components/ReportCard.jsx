import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatDate } from '../utils/formatDate';

const ReportCard = ({ report }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
        <StatusBadge status={report.status} />
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {report.description}
      </p>
      
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">{formatDate(report.createdAt)}</span>
        <Link
          to={`/reports/${report._id}`}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
};

export default ReportCard;