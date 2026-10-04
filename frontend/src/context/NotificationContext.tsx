import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Notification } from '../types/notification';
import { notificationApi } from '../api/notificationApi';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchUnreadCount = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      const res = await notificationApi.getUnreadCount();
      if (res.data) {
        setUnreadCount(typeof res.data.count === 'number' ? res.data.count : 0);
      }
    } catch {
      // Ignore background poll errors
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      setIsLoading(true);
      const res = await notificationApi.getAll(0, 10);
      if (res.data?.content) {
        setNotifications(res.data.content);
      }
      fetchUnreadCount();
    } catch {
      // Ignore errors
    } finally {
      setIsLoading(false);
    }
  }, [fetchUnreadCount]);

  const markAsRead = async (id: string) => {
    try {
      await notificationApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Ignore
    }
  };

  const markAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications, fetchUnreadCount]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAllRead
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;

