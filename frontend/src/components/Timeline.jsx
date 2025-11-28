import React from 'react';
import { formatDate } from '../utils/formatDate';
import StatusBadge from './StatusBadge';

const Timeline = ({ timeline }) => {
  if (!timeline || timeline.length === 0) {
    return <p className="text-gray-500">No timeline events yet.</p>;
  }

  return (
    <div className="space-y-4">
      {timeline.map((event, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            {index < timeline.length - 1 && (
              <div className="w-0.5 h-full bg-gray-300 mt-1"></div>
            )}
          </div>
          <div className="flex-1 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={event.status} />
              <span className="text-sm text-gray-500">{formatDate(event.date)}</span>
            </div>
            <p className="text-gray-700">{event.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;