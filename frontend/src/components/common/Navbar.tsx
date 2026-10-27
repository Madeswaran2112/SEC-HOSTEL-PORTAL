import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { NotificationBell } from './NotificationBell';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isStudent = user?.role === 'ROLE_STUDENT' || user?.role === 'ROLE_BOYS_STUDENT' || user?.role === 'ROLE_GIRLS_STUDENT';
  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_SUPER_ADMIN';
  const studentHome = (user?.role === 'ROLE_GIRLS_STUDENT' || user?.gender === 'FEMALE') ? '/girls' : '/boys';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 mr-2"
                aria-label="Open sidebar"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}

            <Link to={isAdmin ? '/admin' : isStudent ? studentHome : '/'} className="flex items-center gap-2">
              <div className="bg-indigo-600 text-white p-2 rounded-lg">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <span className="font-bold text-lg text-gray-900 tracking-tight block">SEC HOSTEL</span>
                <span className="text-[10px] text-gray-500 tracking-wider uppercase block -mt-1 font-semibold">Saveetha Engineering College</span>
              </div>
            </Link>

            {isStudent && (
              <nav className="hidden md:ml-8 md:flex md:space-x-4">
                <Link to={studentHome} className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50">Dashboard</Link>
                <Link to={`${studentHome}/booking`} className="px-3 py-2 rounded-md text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">Room Booking</Link>
                <Link to={`${studentHome}/allocation`} className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50">My Allocation</Link>
                <Link to={`${studentHome}/waiting-pool`} className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50">Waiting List</Link>
              </nav>
            )}
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />

            <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-gray-900">{user?.name || user?.email}</div>
                <div className="text-xs text-gray-500 font-mono">
                  {user?.role?.replace('ROLE_', '')}
                </div>
              </div>

              {isStudent && (
                <Link
                  to="/student/profile"
                  className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-full"
                  title="Profile"
                >
                  <UserIcon className="h-5 w-5" />
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
