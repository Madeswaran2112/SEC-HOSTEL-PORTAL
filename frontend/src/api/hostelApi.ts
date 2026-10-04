import axiosInstance from './axiosInstance';
import { ApiResponse, PagedResponse } from '../types/common';
import { Hostel, HostelRequest } from '../types/hostel';
import { Room } from '../types/room';

export const hostelApi = {
  getAll: async (page = 0, size = 10, search?: string): Promise<ApiResponse<PagedResponse<Hostel>>> => {
    let url = `/hostels?page=${page}&size=${size}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },
  
  getById: async (id: string): Promise<ApiResponse<Hostel>> => {
    const response = await axiosInstance.get(`/hostels/${id}`);
    return response.data;
  },
  
  create: async (data: HostelRequest): Promise<ApiResponse<Hostel>> => {
    const response = await axiosInstance.post('/hostels', data);
    return response.data;
  },
  
  update: async (id: string, data: HostelRequest): Promise<ApiResponse<Hostel>> => {
    const response = await axiosInstance.put(`/hostels/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.delete(`/hostels/${id}`);
    return response.data;
  },

  getRooms: async (id: string, page = 0, size = 10): Promise<ApiResponse<PagedResponse<Room>>> => {
    const response = await axiosInstance.get(`/hostels/${id}/rooms?page=${page}&size=${size}`);
    return response.data;
  },

  getStats: async (): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.get('/hostels/stats');
    return response.data;
  }
};

