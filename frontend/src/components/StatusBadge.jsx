import React from 'react';
import { statusColors } from '../utils/statusColors';

const StatusBadge = ({ status }) => {
  const colorClass = statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-300';
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colorClass} capitalize`}>
      {status}
    </span>
  );
};

export default StatusBadge;