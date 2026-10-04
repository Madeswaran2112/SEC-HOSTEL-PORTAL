import React, { useEffect, useState } from 'react';
import useNotifications from '../../hooks/useNotifications';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Bell, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotificationCenter: React.FC = () => {
  const { notifications, isLoading, fetchNotifications, markAsRead, markAllRead } = useNotifications();
  const [filter, setFilter] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filteredNotifications = notifications.filter(n => filter === 'ALL' || (!n.isRead && filter === 'UNREAD'));

  const handleNotificationClick = (id: string, referenceType?: string, referenceId?: string) => {
    markAsRead(id);
    if (referenceType && referenceId) {
      if (referenceType === 'GROUP') navigate('/student/group');
      if (referenceType === 'ALLOCATION') navigate('/student/allocation');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <div className="flex space-x-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
          >
            <option value="ALL">All Notifications</option>
            <option value="UNREAD">Unread Only</option>
          </select>
          <button
            onClick={markAllRead}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Check className="h-4 w-4 mr-2 text-gray-500" />
            Mark all read
          </button>
        </div>
      </div>

      {isLoading && notifications.length === 0 ? (
        <div className="py-12"><LoadingSpinner size="lg" /></div>
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          title="No notifications"
          description={filter === 'UNREAD' ? "You don't have any unread notifications." : "You don't have any notifications yet."}
          icon={<Bell className="h-10 w-10" />}
        />
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <li key={notification.id}>
                <div 
                  onClick={() => handleNotificationClick(notification.id, notification.referenceType, notification.referenceId)}
                  className={`block hover:bg-gray-50 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${!notification.isRead ? 'text-indigo-600' : 'text-gray-900'}`}>
                        {notification.title}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          {notification.type}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {notification.message}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
