import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building,
  DoorOpen,
  Layers,
  Users,
  UserCheck,
  Calendar,
  Sliders,
  PlayCircle,
  UserPlus,
  FileCheck2,
  ListFilter,
  FileDown,
  ShieldAlert,
  Settings,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'ROLE_SUPER_ADMIN';

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Hostels', path: '/admin/hostels', icon: Building },
    { label: 'Rooms', path: '/admin/rooms', icon: DoorOpen },
    { label: 'Room Types', path: '/admin/room-types', icon: Layers },
    { label: 'Students', path: '/admin/students', icon: Users },
    { label: 'Groups', path: '/admin/groups', icon: UserCheck },
    { label: 'Allocation Windows', path: '/admin/allocation-windows', icon: Calendar },
    { label: 'Allocations Overview', path: '/admin/allocations', icon: Sliders },
    { label: 'Run Auto-Allocation', path: '/admin/allocations/run', icon: PlayCircle },
    { label: 'Manual Allocation', path: '/admin/allocations/manual', icon: UserPlus },
    { label: 'Final Allocation List', path: '/admin/allocations/final-list', icon: FileCheck2 },
    { label: 'Waiting Pool', path: '/admin/waiting-pool', icon: ListFilter },
    { label: 'Export Center', path: '/admin/export', icon: FileDown },
  ];

  const superAdminItems = [
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldAlert },
    { label: 'System Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-0 -translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6 bg-slate-950">
          <div className="flex items-center space-x-2 text-white font-bold text-lg">
            <Building className="h-6 w-6 text-indigo-400" />
            <span>Admin Portal</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="h-[calc(100vh-4rem)] overflow-y-auto py-4 px-3 space-y-1">
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Management
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin/dashboard'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <item.icon className="h-4 w-4 mr-3 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}

          {isSuperAdmin && (
            <>
              <div className="pt-4 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Administration
              </div>
              {superAdminItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                  {item.label}
                </NavLink>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;

