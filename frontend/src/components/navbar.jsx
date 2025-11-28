import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.jpeg';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowDropdown(false);
    setShowMobileMenu(false);
  };

  const getDashboardLink = () => {
    if (user?.role === 'authority') return '/dashboard/authority';
    if (user?.role === 'worker') return '/dashboard/worker';
    return '/reports';
  };

  const shouldShowDashboard =
    user?.role === 'authority' || user?.role === 'worker';

  // close desktop dropdown on outside click
  useEffect(() => {
    if (!showDropdown) return;

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  // optional: close mobile menu on route change if you track location (skip for now)

  return (
    <nav className="bg-white shadow-md sticky top-0 z-[2000]">
      <div className="container mx-auto px-4">
        {/* TOP BAR */}
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">

            <div className="flex flex-col leading-tight">
              <img
                src={logo}
                alt="Logo"
                className="w-44"
              />
              <span className="text-sm ml-[2px] font-semibold text-gray-500">Garbage Reporting System</span>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6 text-s">
            <Link to="/" className="text-gray-700 hover:text-blue-600">
              Home
            </Link>
            <Link to="/reports" className="text-gray-700 hover:text-blue-600">
              Reports List
            </Link>
            <Link to="/reports/new" className="text-gray-700 hover:text-blue-600">
              New Report
            </Link>
            <Link to="/notices" className="text-gray-700 hover:text-blue-600">
              Notices
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-blue-600">
              About
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-blue-600">
              Contact
            </Link>
          </div>

          {/* Desktop auth / user */}
          <div className="hidden md:flex items-center gap-4">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Register
                </Link>
              </>
            ) : (
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setShowDropdown((prev) => !prev)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 hover:bg-gray-50"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="font-medium text-sm text-gray-800 max-w-[120px] truncate">
                    {user.name}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50 text-sm">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-semibold text-gray-900 truncate">
                        {user.name}
                      </p>
                      {user.email && (
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      )}
                    </div>

                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowDropdown(false)}
                    >
                      Profile
                    </Link>

                    {shouldShowDashboard && (
                      <Link
                        to={getDashboardLink()}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowDropdown(false)}
                      >
                        Dashboard
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile: hamburger + small auth indicator */}
          <div className="flex items-center gap-2 md:hidden">
            {user && (
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            <button
              onClick={() => setShowMobileMenu((prev) => !prev)}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-100"
              aria-label="Toggle navigation"
            >
              {showMobileMenu ? (
                <svg
                  className="h-6 w-6 text-gray-800"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6 text-gray-800"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-100 pb-4">
            <div className="pt-3 flex flex-col gap-2 text-sm">
              <Link
                to="/"
                className="px-2 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
                onClick={() => setShowMobileMenu(false)}
              >
                Home
              </Link>
              <Link
                to="/reports"
                className="px-2 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
                onClick={() => setShowMobileMenu(false)}
              >
                Reports List
              </Link>
              <Link
                to="/reports/new"
                className="px-2 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
                onClick={() => setShowMobileMenu(false)}
              >
                New Report
              </Link>
              <Link
                to="/notices"
                className="px-2 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
                onClick={() => setShowMobileMenu(false)}
              >
                Notices
              </Link>
              <Link
                to="/about"
                className="px-2 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
                onClick={() => setShowMobileMenu(false)}
              >
                About
              </Link>
              <Link
                to="/contact"
                className="px-2 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
                onClick={() => setShowMobileMenu(false)}
              >
                Contact
              </Link>

              <div className="mt-2 border-t border-gray-100 pt-3">
                {!user ? (
                  <div className="flex gap-2">
                    <Link
                      to="/login"
                      className="flex-1 px-3 py-2 text-center text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="flex-1 px-3 py-2 text-center text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Register
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    <p className="px-2 text-xs text-gray-500">
                      Logged in as <span className="font-semibold">{user.name}</span>
                    </p>
                    <Link
                      to="/profile"
                      className="px-2 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Profile
                    </Link>
                    {shouldShowDashboard && (
                      <Link
                        to={getDashboardLink()}
                        className="px-2 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="mt-1 px-2 py-2 text-left text-red-600 hover:bg-gray-50 rounded-md"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
