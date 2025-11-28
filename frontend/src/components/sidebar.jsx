import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ role }) => {
  const location = useLocation();

  const authorityLinks = [
    { path: '/dashboard/authority', label: 'Dashboard' },
    { path: '/dashboard/authority/manage', label: 'Manage Reports' },
    { path: '/dashboard/authority/analytics', label: 'Analytics' },
    { path: '/dashboard/authority/notices', label: 'Notices' },
  ];

  const workerLinks = [
    { path: '/dashboard/worker', label: 'Dashboard' },
    { path: '/dashboard/worker/manage', label: 'Report Management' },
    { path: '/dashboard/worker/analytics', label: 'Analytics' },
    { path: '/dashboard/worker/notices', label: 'Notices' },
  ];

  const links = role === 'authority' ? authorityLinks : workerLinks;

  return (
    <aside className="w-64 bg-white border-r min-h-screen">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-6 capitalize">{role} Panel</h2>
        <nav className="flex flex-col gap-2">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 rounded-lg ${
                location.pathname === link.path
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;