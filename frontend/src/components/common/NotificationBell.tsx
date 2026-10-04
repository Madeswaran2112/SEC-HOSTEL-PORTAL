import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { Notification } from '../../types/notification';
import { formatDateTime } from '../../utils/formatters';
import { Link } from 'react-router-dom';

export const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5 z-50">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead()}
                className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-500">
                No notifications right now
              </div>
            ) : (
              notifications.slice(0, 5).map((n: Notification) => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && markAsRead(n.id)}
                  className={`p-3 text-left transition-colors cursor-pointer hover:bg-gray-50 ${
                    !n.isRead ? 'bg-indigo-50/50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <p className={`text-xs ${!n.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {n.title}
                    </p>
                    <span className="text-[10px] text-gray-400 ml-2 whitespace-nowrap">
                      {formatDateTime(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.message}</p>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-gray-100 p-2 text-center">
            <Link
              to="/student/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
