import axiosInstance from './axiosInstance';
import { ApiResponse, PagedResponse } from '../types/common';
import { Student, StudentUpdateRequest, AdminStudentCreateRequest, StudentImportResponse } from '../types/student';

export const studentApi = {
  getProfile: async (): Promise<ApiResponse<Student>> => {
    const response = await axiosInstance.get('/students/profile');
    return response.data;
  },
  
  updateProfile: async (data: StudentUpdateRequest): Promise<ApiResponse<Student>> => {
    const response = await axiosInstance.put('/students/profile', data);
    return response.data;
  },
  
  getStudentById: async (id: string | number): Promise<ApiResponse<Student>> => {
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

  searchStudents: async (query: string): Promise<ApiResponse<Student[]>> => {
    const response = await axiosInstance.get(`/students/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  createStudent: async (data: AdminStudentCreateRequest): Promise<ApiResponse<Student>> => {
    const response = await axiosInstance.post('/students', data);
    return response.data;
  },

  updateStudent: async (id: string | number, data: AdminStudentCreateRequest): Promise<ApiResponse<Student>> => {
    const response = await axiosInstance.put(`/students/${id}`, data);
    return response.data;
  },

  deleteStudent: async (id: string | number): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete(`/students/${id}`);
    return response.data;
  },

  downloadTemplate: async (): Promise<Blob> => {
    const response = await axiosInstance.get('/students/template/excel', {
      responseType: 'blob'
    });
    return response.data;
  },

  importExcel: async (file: File): Promise<ApiResponse<StudentImportResponse>> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post('/students/import/excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getStats: async (): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.get('/students/stats');
    return response.data;
  }
};
