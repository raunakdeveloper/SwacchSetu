// src/components/ReportTable.jsx
import React from 'react';
import StatusBadge from './StatusBadge';
import { formatDate } from '../utils/formatDate';

const ReportTable = ({ reports, columns, actions }) => {
  if (!reports || reports.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">No reports found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                S.No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Issue ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              {/* Upvotes — always visible */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Upvotes
              </th>
              {/* Priority — only if columns.priority = true */}
              {columns?.priority && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Priority
                </th>
              )}
              {columns?.reportedBy && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Reported By
                </th>
              )}
              {columns?.assignedBy && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Assigned To
                </th>
              )}
              {actions && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {reports.map((report, index) => {
              const upvotes =
                report.upvotesCount ??
                (Array.isArray(report.upvotedBy)
                  ? report.upvotedBy.length
                  : 0);

              return (
                <tr key={report._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {report.issueId}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {report.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(report.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={report.status} />
                  </td>
                  {/* Upvotes value */}
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {upvotes}
                  </td>
                  {/* Priority (conditional) */}
                  {columns?.priority && (
                    <td className="px-6 py-4 text-sm capitalize">
                      {report.priority || 'normal'}
                    </td>
                  )}
                  {columns?.reportedBy && (
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {report.createdBy?.name || 'N/A'}
                    </td>
                  )}
                  {columns?.assignedBy && (
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {report.assignedTo?.name || 'N/A'}
                    </td>
                  )}
                  {actions && (
                    <td className="px-6 py-4 text-sm">{actions(report)}</td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportTable;
