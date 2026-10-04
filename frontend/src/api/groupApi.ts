import axiosInstance from './axiosInstance';
import { ApiResponse, PagedResponse } from '../types/common';
import { Group, GroupCreateRequest, GroupInviteRequest, GroupMember } from '../types/group';

export const groupApi = {
  create: async (data: GroupCreateRequest): Promise<ApiResponse<Group>> => {
    const response = await axiosInstance.post('/groups', data);
    return response.data;
  },
  
  getMyGroup: async (): Promise<ApiResponse<Group>> => {
    const response = await axiosInstance.get('/groups/my-group');
    return response.data;
  },
  
  getById: async (id: string): Promise<ApiResponse<Group>> => {
    const response = await axiosInstance.get(`/groups/${id}`);
    return response.data;
  },
  
  update: async (id: string, data: any): Promise<ApiResponse<Group>> => {
    const response = await axiosInstance.put(`/groups/${id}`, data);
    return response.data;
  },
  
  dissolve: async (id: string): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.post(`/groups/${id}/dissolve`);
    return response.data;
  },
  
  invite: async (id: string, data: GroupInviteRequest): Promise<ApiResponse<GroupMember>> => {
    const response = await axiosInstance.post(`/groups/${id}/invite`, data);
    return response.data;
  },
  
  getInvitations: async (): Promise<ApiResponse<any[]>> => {
    const response = await axiosInstance.get('/groups/invitations');
    return response.data;
  },
  
  acceptInvite: async (invitationId: string | number): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.put(`/groups/invitations/${invitationId}/accept`);
    return response.data;
  },
  
  declineInvite: async (invitationId: string | number): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.put(`/groups/invitations/${invitationId}/decline`);
    return response.data;
  },

  validateMember: async (registerNumber: string, groupId?: string | number) => {
    let url = `/groups/validate-member?registerNumber=${encodeURIComponent(registerNumber)}`;
    if (groupId) url += `&groupId=${groupId}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  submitGroup: async (id: string | number): Promise<ApiResponse<Group>> => {
    const response = await axiosInstance.put(`/groups/${id}/submit`);
    return response.data;
  },

  getPendingGroups: async (hostelType?: string): Promise<ApiResponse<Group[]>> => {
    let url = '/groups/admin/pending';
    if (hostelType) url += `?hostelType=${hostelType}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  verifyGroup: async (id: string | number): Promise<ApiResponse<Group>> => {
    const response = await axiosInstance.put(`/groups/${id}/verify`);
    return response.data;
  },

  approveGroup: async (id: string | number): Promise<ApiResponse<Group>> => {
    const response = await axiosInstance.put(`/groups/${id}/approve`);
    return response.data;
  },

  rejectGroup: async (id: string | number, reason?: string): Promise<ApiResponse<Group>> => {
    let url = `/groups/${id}/reject`;
    if (reason) url += `?reason=${encodeURIComponent(reason)}`;
    const response = await axiosInstance.put(url);
    return response.data;
  },
  
  removeMember: async (groupId: string, memberId: string): Promise<ApiResponse<Group>> => {
    const response = await axiosInstance.delete(`/groups/${groupId}/members/${memberId}`);
    return response.data;
  },
  
  getAll: async (page = 0, size = 10, status?: string): Promise<ApiResponse<PagedResponse<Group>>> => {
    let url = `/groups?page=${page}&size=${size}`;
    if (status) url += `&status=${status}`;
    const response = await axiosInstance.get(url);
    return response.data;
  }
};

