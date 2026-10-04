import axiosInstance from './axiosInstance';
import { ApiResponse, PagedResponse } from '../types/common';
import { Allocation, AllocationWindow, AllocationWindowRequest, ManualAllocationRequest, WaitingPoolEntry, WaitingPoolJoinRequest } from '../types/allocation';

export const allocationApi = {
  autoRun: async (windowId: string | number): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.post(`/allocations/auto-run/${windowId}`);
    return response.data;
  },
  
  manualAllocate: async (data: ManualAllocationRequest, windowId?: string | number): Promise<ApiResponse<Allocation>> => {
    let url = '/allocations/manual';
    if (windowId) url += `?windowId=${windowId}`;
    const response = await axiosInstance.post(url, data);
    return response.data;
  },
  
  getAll: async (page = 0, size = 10, windowId?: string, status?: string, hostelId?: string): Promise<ApiResponse<PagedResponse<Allocation>>> => {
    let url = `/allocations?page=${page}&size=${size}`;
    if (windowId) url += `&windowId=${windowId}`;
    if (status) url += `&status=${status}`;
    if (hostelId) url += `&hostelId=${hostelId}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },
  
  getMyAllocation: async (windowId?: string | number): Promise<ApiResponse<Allocation>> => {
    const url = windowId ? `/allocations/my-allocation?windowId=${windowId}` : '/allocations/my-allocation';
    const response = await axiosInstance.get(url);
    return response.data;
  },
  
  accept: async (id: string | number): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.put(`/allocations/${id}/accept`);
    return response.data;
  },
  
  reject: async (id: string | number): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.put(`/allocations/${id}/reject`);
    return response.data;
  },
  
  cancel: async (id: string | number): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.put(`/allocations/${id}/cancel`);
    return response.data;
  },

  getStats: async (): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.get('/allocations/stats');
    return response.data;
  }
};

export const windowApi = {
  getAll: async (page = 0, size = 10): Promise<ApiResponse<PagedResponse<AllocationWindow>>> => {
    const response = await axiosInstance.get(`/allocation-windows?page=${page}&size=${size}`);
    return response.data;
  },
  
  getActive: async (): Promise<ApiResponse<AllocationWindow>> => {
    const response = await axiosInstance.get('/allocation-windows/active');
    return response.data;
  },
  
  create: async (data: AllocationWindowRequest): Promise<ApiResponse<AllocationWindow>> => {
    const response = await axiosInstance.post('/allocation-windows', data);
    return response.data;
  },
  
  update: async (id: string, data: AllocationWindowRequest): Promise<ApiResponse<AllocationWindow>> => {
    const response = await axiosInstance.put(`/allocation-windows/${id}`, data);
    return response.data;
  },
  
  updateStatus: async (id: string, status: string): Promise<ApiResponse<AllocationWindow>> => {
    const response = await axiosInstance.patch(`/allocation-windows/${id}/status`, { status });
    return response.data;
  }
};

export const waitingPoolApi = {
  join: async (data: WaitingPoolJoinRequest): Promise<ApiResponse<WaitingPoolEntry>> => {
    const response = await axiosInstance.post('/waiting-pool/join', data);
    return response.data;
  },
  
  leave: async (windowId?: string | number): Promise<ApiResponse<null>> => {
    let url = '/waiting-pool/leave';
    if (windowId) url += `?windowId=${windowId}`;
    const response = await axiosInstance.delete(url);
    return response.data;
  },
  
  getMyStatus: async (windowId?: string | number): Promise<ApiResponse<WaitingPoolEntry>> => {
    let url = '/waiting-pool/status';
    if (windowId) url += `?windowId=${windowId}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },
  
  getAll: async (windowId: string | number, page = 0, size = 10): Promise<ApiResponse<PagedResponse<WaitingPoolEntry>>> => {
    const response = await axiosInstance.get(`/waiting-pool?windowId=${windowId}&page=${page}&size=${size}`);
    return response.data;
  },

  getPending: async (hostelType?: string): Promise<ApiResponse<WaitingPoolEntry[]>> => {
    let url = '/waiting-pool/admin/pending';
    if (hostelType) url += `?hostelType=${hostelType}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  verify: async (id: string | number): Promise<ApiResponse<WaitingPoolEntry>> => {
    const response = await axiosInstance.put(`/waiting-pool/${id}/verify`);
    return response.data;
  },

  approve: async (id: string | number): Promise<ApiResponse<WaitingPoolEntry>> => {
    const response = await axiosInstance.put(`/waiting-pool/${id}/approve`);
    return response.data;
  },

  reject: async (id: string | number, reason?: string): Promise<ApiResponse<WaitingPoolEntry>> => {
    let url = `/waiting-pool/${id}/reject`;
    if (reason) url += `?reason=${encodeURIComponent(reason)}`;
    const response = await axiosInstance.put(url);
    return response.data;
  }
};

