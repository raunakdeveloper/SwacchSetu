import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatDate';
import Navbar from '../../components/navbar';

const UserProfile = () => {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 pt-4 pb-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">My Profile</h1>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-semibold">{user?.name}</h2>
              <p className="text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Email
              </label>
              <p className="text-lg">{user?.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                User ID
              </label>
              <p className="text-lg font-mono">{user?._id}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Role
              </label>
              <p className="text-lg capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default UserProfile;