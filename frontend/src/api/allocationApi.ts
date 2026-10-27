import axiosInstance from './axiosInstance';
import { ApiResponse, PagedResponse } from '../types/common';
import {
  Allocation,
  AllocationWindow,
  AllocationWindowRequest,
  PhaseScheduleRequest,
  ManualAllocationRequest,
  WaitingPoolEntry,
  WaitingPoolJoinRequest,
  PhaseOnePreferenceRequest,
  PhaseOnePreferenceResponse,
  ValidateRoommateResponse,
  PhaseTwoBookingRequest,
  PhaseTwoBookingResponse,
  BookingStatusResponse
} from '../types/allocation';
import { Room } from '../types/room';

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
  
  update: async (id: string | number, data: AllocationWindowRequest): Promise<ApiResponse<AllocationWindow>> => {
    const response = await axiosInstance.put(`/allocation-windows/${id}`, data);
    return response.data;
  },
  
  updateStatus: async (id: string | number, status: string): Promise<ApiResponse<AllocationWindow>> => {
    const response = await axiosInstance.patch(`/allocation-windows/${id}/status?status=${status}`);
    return response.data;
  },

  updatePhase1Status: async (id: string | number, status: string): Promise<ApiResponse<AllocationWindow>> => {
    const response = await axiosInstance.patch(`/allocation-windows/${id}/phase1-status?status=${status}`);
    return response.data;
  },

  updatePhase2Status: async (id: string | number, status: string): Promise<ApiResponse<AllocationWindow>> => {
    const response = await axiosInstance.patch(`/allocation-windows/${id}/phase2-status?status=${status}`);
    return response.data;
  },

  updateSchedule: async (id: string | number, data: PhaseScheduleRequest): Promise<ApiResponse<AllocationWindow>> => {
    const response = await axiosInstance.put(`/allocation-windows/${id}/schedule`, data);
    return response.data;
  },

  openPhase1: async (id: string | number): Promise<ApiResponse<AllocationWindow>> => {
    const response = await axiosInstance.post(`/allocation-windows/${id}/phase1/open`);
    return response.data;
  },

  closePhase1: async (id: string | number): Promise<ApiResponse<AllocationWindow>> => {
    const response = await axiosInstance.post(`/allocation-windows/${id}/phase1/close`);
    return response.data;
  },

  openPhase2: async (id: string | number): Promise<ApiResponse<AllocationWindow>> => {
    const response = await axiosInstance.post(`/allocation-windows/${id}/phase2/open`);
    return response.data;
  },

  closePhase2: async (id: string | number): Promise<ApiResponse<AllocationWindow>> => {
    const response = await axiosInstance.post(`/allocation-windows/${id}/phase2/close`);
    return response.data;
  }
};

export const bookingApi = {
  submitPhaseOne: async (data: PhaseOnePreferenceRequest): Promise<ApiResponse<PhaseOnePreferenceResponse>> => {
    const response = await axiosInstance.post('/booking/phase1', data);
    return response.data;
  },

  cancelPhaseOne: async (): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.delete('/booking/phase1');
    return response.data;
  },

  getMyPhaseOnePreference: async (): Promise<ApiResponse<PhaseOnePreferenceResponse>> => {
    const response = await axiosInstance.get('/booking/phase1');
    return response.data;
  },

  getPhaseTwoRooms: async (floorNumber?: number, roomTypeId?: number, isAc?: boolean): Promise<ApiResponse<Room[]>> => {
    let url = '/booking/phase2/rooms';
    const params: string[] = [];
    if (floorNumber !== undefined && floorNumber !== null) params.push(`floorNumber=${floorNumber}`);
    if (roomTypeId !== undefined && roomTypeId !== null) params.push(`roomTypeId=${roomTypeId}`);
    if (isAc !== undefined && isAc !== null) params.push(`isAc=${isAc}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  validateRoommate: async (registerNumber: string): Promise<ApiResponse<ValidateRoommateResponse>> => {
    const response = await axiosInstance.post('/booking/phase2/validate-roommate', { registerNumber });
    return response.data;
  },

  bookRoomPhaseTwo: async (data: PhaseTwoBookingRequest): Promise<ApiResponse<PhaseTwoBookingResponse>> => {
    const response = await axiosInstance.post('/booking/phase2/book', data);
    return response.data;
  },

  cancelPhaseTwo: async (): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.post('/booking/phase2/cancel');
    return response.data;
  },

  getStatus: async (): Promise<ApiResponse<BookingStatusResponse>> => {
    const response = await axiosInstance.get('/booking/status');
    return response.data;
  },

  getAdminPhase1Submissions: async (windowId?: string | number): Promise<ApiResponse<PhaseOnePreferenceResponse[]>> => {
    const url = windowId ? `/booking/admin/phase1-submissions?windowId=${windowId}` : '/booking/admin/phase1-submissions';
    const response = await axiosInstance.get(url);
    return response.data;
  },

  getAdminPhase2Selections: async (windowId?: string | number): Promise<ApiResponse<Allocation[]>> => {
    const url = windowId ? `/booking/admin/phase2-selections?windowId=${windowId}` : '/booking/admin/phase2-selections';
    const response = await axiosInstance.get(url);
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

  acceptOffer: async (poolEntryId: string | number): Promise<ApiResponse<WaitingPoolEntry>> => {
    const response = await axiosInstance.post(`/waiting-pool/accept-offer?poolEntryId=${poolEntryId}`);
    return response.data;
  },

  declineOffer: async (poolEntryId: string | number): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.post(`/waiting-pool/decline-offer?poolEntryId=${poolEntryId}`);
    return response.data;
  },

  getAdminWaitlist: async (
    windowId?: string | number,
    hostelType?: string,
    status?: string,
    search?: string,
    page = 0,
    size = 10
  ): Promise<ApiResponse<PagedResponse<WaitingPoolEntry>>> => {
    let url = `/waiting-pool/admin?page=${page}&size=${size}`;
    if (windowId) url += `&windowId=${windowId}`;
    if (hostelType) url += `&hostelType=${hostelType}`;
    if (status && status !== 'ALL') url += `&status=${status}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  adminIssueOffer: async (id: string | number, roomId: string | number): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.post(`/waiting-pool/${id}/issue-offer?roomId=${roomId}`);
    return response.data;
  },

  adminCancel: async (id: string | number, reason: string): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.post(`/waiting-pool/${id}/cancel?reason=${encodeURIComponent(reason)}`);
    return response.data;
  },

  adminUpdatePriority: async (id: string | number, priority: number, reason?: string): Promise<ApiResponse<null>> => {
    let url = `/waiting-pool/${id}/priority?priority=${priority}`;
    if (reason) url += `&reason=${encodeURIComponent(reason)}`;
    const response = await axiosInstance.put(url);
    return response.data;
  },

  adminExceptionalAllocate: async (id: string | number, roomId: string | number, reason: string): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.post(`/waiting-pool/${id}/exceptional-allocate?roomId=${roomId}&reason=${encodeURIComponent(reason)}`);
    return response.data;
  }
};
