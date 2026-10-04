import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../common/Navbar';

export const StudentLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} SEC HOSTEL — Saveetha Engineering College. All rights reserved.
      </footer>
    </div>
  );
};

export default StudentLayout;
