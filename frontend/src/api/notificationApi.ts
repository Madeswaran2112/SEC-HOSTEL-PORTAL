import axiosInstance from './axiosInstance';
import { ApiResponse, PagedResponse } from '../types/common';
import { Notification } from '../types/notification';

export const notificationApi = {
  getAll: async (page = 0, size = 10): Promise<ApiResponse<PagedResponse<Notification>>> => {
    const response = await axiosInstance.get(`/notifications?page=${page}&size=${size}`);
    return response.data;
  },
  
  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
    const response = await axiosInstance.get('/notifications/unread-count');
    return response.data;
  },
  
  markRead: async (id: string): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.put(`/notifications/${id}/read`);
    return response.data;
  },
  
  markAllRead: async (): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.put('/notifications/mark-all-read');
    return response.data;
  }
};

