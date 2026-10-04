import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-black text-gray-900 tracking-tight">
          SEC HOSTEL
        </h2>
        <p className="mt-1 text-center text-xs font-semibold text-indigo-600 uppercase tracking-wider">
          Saveetha Engineering College
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-md sm:rounded-2xl sm:px-10 border border-gray-100">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
