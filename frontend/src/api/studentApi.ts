import axiosInstance from './axiosInstance';
import { ApiResponse, PagedResponse } from '../types/common';
import { Student, StudentUpdateRequest } from '../types/student';

export const studentApi = {
  getProfile: async (): Promise<ApiResponse<Student>> => {
    const response = await axiosInstance.get('/students/profile');
    return response.data;
  },
  
  updateProfile: async (data: StudentUpdateRequest): Promise<ApiResponse<Student>> => {
    const response = await axiosInstance.put('/students/profile', data);
    return response.data;
  },
  
  getStudentById: async (id: string): Promise<ApiResponse<Student>> => {
    const response = await axiosInstance.get(`/students/${id}`);
    return response.data;
  },
  
  getStudents: async (page = 0, size = 10, search?: string, status?: string): Promise<ApiResponse<PagedResponse<Student>>> => {
    let url = `/students?page=${page}&size=${size}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  getStats: async (): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.get('/students/stats');
    return response.data;
  }
};

