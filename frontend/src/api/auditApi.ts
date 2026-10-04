import axiosInstance from './axiosInstance';
import { ApiResponse, PagedResponse } from '../types/common';
import { AuditLog } from '../types/audit';

export const auditApi = {
  getAll: async (page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc'): Promise<ApiResponse<PagedResponse<AuditLog>>> => {
    const response = await axiosInstance.get(`/audit-logs?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
    return response.data;
  },

  getById: async (id: string | number): Promise<ApiResponse<AuditLog>> => {
    const response = await axiosInstance.get(`/audit-logs/${id}`);
    return response.data;
  }
};
