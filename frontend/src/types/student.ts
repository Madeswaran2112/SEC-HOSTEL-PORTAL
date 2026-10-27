export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE'
}

export enum StudentAllocationStatus {
  NOT_APPLIED = 'NOT_APPLIED',
  APPLIED = 'APPLIED',
  IN_POOL = 'IN_POOL',
  ALLOCATED = 'ALLOCATED',
  CONFIRMED = 'CONFIRMED'
}

export interface Student {
  id: string | number;
  userId: string | number;
  name: string;
  registerNumber: string;
  department: string;
  year: number;
  email: string;
  phone: string;
  gender: Gender | string;
  allocationStatus: StudentAllocationStatus | string;
  previousRoomNumber?: string;
  role?: string;
  createdAt: string;
}

export interface StudentUpdateRequest {
  name?: string;
  department?: string;
  year?: number;
  phone?: string;
  previousRoomNumber?: string;
}

export interface AdminStudentCreateRequest {
  name: string;
  registerNumber: string;
  email: string;
  department: string;
  year: number;
  phone: string;
  gender: Gender | string;
  previousRoomNumber?: string;
  password?: string;
}

export interface StudentImportResponse {
  totalRows: number;
  importedCount: number;
  errorCount: number;
  message: string;
  errors: string[];
}
