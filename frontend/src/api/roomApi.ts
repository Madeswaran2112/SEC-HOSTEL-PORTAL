import axiosInstance from './axiosInstance';
import { ApiResponse, PagedResponse } from '../types/common';
import { Room, RoomRequest, RoomType, RoomTypeRequest } from '../types/room';

export const roomApi = {
  getAll: async (page = 0, size = 10, hostelId?: string, roomTypeId?: string, status?: string): Promise<ApiResponse<PagedResponse<Room>>> => {
    let url = `/rooms?page=${page}&size=${size}`;
    if (hostelId) url += `&hostelId=${hostelId}`;
    if (roomTypeId) url += `&roomTypeId=${roomTypeId}`;
    if (status) url += `&status=${status}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },
  
  getById: async (id: string): Promise<ApiResponse<Room>> => {
    const response = await axiosInstance.get(`/rooms/${id}`);
    return response.data;
  },
  
  create: async (data: RoomRequest): Promise<ApiResponse<Room>> => {
    const response = await axiosInstance.post('/rooms', data);
    return response.data;
  },
  
  update: async (id: string, data: RoomRequest): Promise<ApiResponse<Room>> => {
    const response = await axiosInstance.put(`/rooms/${id}`, data);
    return response.data;
  },
  
  updateStatus: async (id: string, status: string): Promise<ApiResponse<Room>> => {
    const response = await axiosInstance.patch(`/rooms/${id}/status?status=${status}`);
    return response.data;
  },
  
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.delete(`/rooms/${id}`);
    return response.data;
  },

  downloadTemplate: async (): Promise<Blob> => {
    const response = await axiosInstance.get('/rooms/excel/template', {
      responseType: 'blob',
    });
    return response.data;
  },

  previewExcel: async (file: File, hostelId?: string | number) => {
    const formData = new FormData();
    formData.append('file', file);
    if (hostelId) formData.append('hostelId', String(hostelId));
    const url = hostelId ? `/rooms/excel/preview?hostelId=${hostelId}` : '/rooms/excel/preview';
    const response = await axiosInstance.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  importExcel: async (file: File, hostelId?: string | number) => {
    const formData = new FormData();
    formData.append('file', file);
    if (hostelId) formData.append('hostelId', String(hostelId));
    const url = hostelId ? `/rooms/excel/import?hostelId=${hostelId}` : '/rooms/excel/import';
    const response = await axiosInstance.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }
};

export const roomTypeApi = {
  getAll: async (): Promise<ApiResponse<RoomType[]>> => {
    const response = await axiosInstance.get('/room-types');
    return response.data;
  },
  
  getById: async (id: string): Promise<ApiResponse<RoomType>> => {
    const response = await axiosInstance.get(`/room-types/${id}`);
    return response.data;
  },
  
  create: async (data: RoomTypeRequest): Promise<ApiResponse<RoomType>> => {
    const response = await axiosInstance.post('/room-types', data);
    return response.data;
  },
  
  update: async (id: string, data: RoomTypeRequest): Promise<ApiResponse<RoomType>> => {
    const response = await axiosInstance.put(`/room-types/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.delete(`/room-types/${id}`);
    return response.data;
  }
};
