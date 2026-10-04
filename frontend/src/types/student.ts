export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE'
}

export enum StudentAllocationStatus {
  NOT_APPLIED = 'NOT_APPLIED',
  IN_POOL = 'IN_POOL',
  ALLOCATED = 'ALLOCATED',
  CONFIRMED = 'CONFIRMED'
}

export interface Student {
  id: string;
  userId: string;
  name: string;
  registerNumber: string;
  department: string;
  year: number;
  email: string;
  phone: string;
  gender: Gender | string;
  allocationStatus: StudentAllocationStatus | string;
  createdAt: string;
}

export interface StudentUpdateRequest {
  name?: string;
  department?: string;
  year?: number;
  phone?: string;
}

