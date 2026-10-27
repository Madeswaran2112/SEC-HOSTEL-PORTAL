export type PhaseStatus = 'NOT_OPEN' | 'OPEN' | 'CLOSED';

export interface Allocation {
  id: string;
  studentId: string;
  studentName: string;
  registerNumber: string;
  roomId: string;
  roomNumber: string;
  hostelName: string;
  roomTypeName: string;
  floorNumber: number;
  bedNumber: number;
  status: AllocationStatus;
  allocationType: AllocationType;
  groupId?: string;
  groupName?: string;
  allocatedAt: any;
  respondedAt?: any;
}

export interface AllocationWindow {
  id: string;
  name: string;
  academicYear: string;
  semester: string;
  startDate: string;
  endDate: string;
  status: AllocationWindowStatus;
  phase1Status?: PhaseStatus;
  phase2Status?: PhaseStatus;
  createdAt: string;
}

export interface AllocationWindowRequest {
  name: string;
  academicYear: string;
  semester: string;
  startDate: string;
  endDate: string;
}

export interface ManualAllocationRequest {
  studentId: string;
  roomId: string;
  bedNumber: number;
}

export interface WaitingPoolEntry {
  id: string;
  studentId: string;
  studentName: string;
  registerNumber: string;
  preferredRoomType: string;
  hostelTypePreference: string;
  priority: number;
  joinedAt: string;
}

export interface WaitingPoolJoinRequest {
  allocationWindowId: string;
  preferredRoomTypeId?: string;
}

export interface PhaseOnePreferenceRequest {
  preferredRoomTypeId: number;
  isAc: boolean;
}

export interface PhaseOnePreferenceResponse {
  id: number;
  studentId: number;
  studentName: string;
  registerNumber: string;
  allocationWindowId: number;
  windowName: string;
  preferredRoomTypeId: number;
  preferredRoomTypeName: string;
  capacity: number;
  isAc: boolean;
  submittedAt: string;
  updatedAt?: string;
}

export interface ValidateRoommateResponse {
  valid: boolean;
  studentId?: number;
  name?: string;
  registerNumber?: string;
  department?: string;
  year?: number;
  gender?: string;
  message: string;
}

export interface PhaseTwoBookingRequest {
  roomId: number;
  roommateRegisterNumbers: string[];
}

export interface PhaseTwoBookingResponse {
  roomId: number;
  roomNumber: string;
  building: string;
  hostelName: string;
  floorNumber: number;
  roomTypeName: string;
  isAc: boolean;
  totalCapacity: number;
  occupiedBeds: number;
  availableBeds: number;
  allocations: Allocation[];
  bookedAt: string;
}

export interface BookingStatusResponse {
  window: AllocationWindow | null;
  phase1Status: PhaseStatus;
  phase2Status: PhaseStatus;
  hasSubmittedPhase1: boolean;
  phase1Preference: PhaseOnePreferenceResponse | null;
  hasBookedPhase2: boolean;
  allocation: Allocation | null;
  roommates: Allocation[];
}

export enum AllocationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export enum AllocationType {
  AUTO = 'AUTO',
  MANUAL = 'MANUAL'
}

export enum AllocationWindowStatus {
  UPCOMING = 'UPCOMING',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  ALLOCATION_RUNNING = 'ALLOCATION_RUNNING',
  COMPLETED = 'COMPLETED'
}
