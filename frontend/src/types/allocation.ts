export type PhaseStatus = 'NOT_OPEN' | 'OPEN' | 'CLOSED';

export type WaitlistStatus =
  | 'WAITING'
  | 'OFFERED'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'ALLOCATED';

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

  // Phase 1
  phase1Status?: PhaseStatus;
  effectivePhase1Status?: PhaseStatus;
  phase1StartDate?: string;
  phase1EndDate?: string;
  phase1Description?: string;

  // Phase 2
  phase2Status?: PhaseStatus;
  effectivePhase2Status?: PhaseStatus;
  phase2StartDate?: string;
  phase2EndDate?: string;
  phase2Description?: string;

  serverTime?: string;
  createdAt: string;
}

export interface AllocationWindowRequest {
  name: string;
  academicYear: string;
  semester: string;
  startDate: string;
  endDate: string;
}

export interface PhaseScheduleRequest {
  phase: number;
  academicYear?: string;
  startDate?: string;
  endDate?: string;
  status?: PhaseStatus;
  description?: string;
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
  department?: string;
  year?: number;
  preferredRoomType?: any;
  isAc?: boolean;
  groupSize?: number;
  floorPreference?: string;
  reason?: string;
  hostelTypePreference: string;
  priority: number;
  queuePosition?: number;
  joinedAt: string;
  status: WaitlistStatus | string;

  // Offer details
  offeredRoomId?: number;
  offeredRoomNumber?: string;
  offeredRoomTypeName?: string;
  offeredRoomBuilding?: string;
  offeredRoomFloor?: number;
  offeredAt?: string;
  offerExpiresAt?: string;
  adminNotes?: string;
}

export interface WaitingPoolJoinRequest {
  allocationWindowId: string | number;
  preferredRoomTypeId?: string | number;
  isAc?: boolean;
  groupSize?: number;
  floorPreference?: string;
  reason?: string;
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
  effectivePhase1Status?: PhaseStatus;
  phase1StartDate?: string;
  phase1EndDate?: string;
  phase1Description?: string;

  phase2Status: PhaseStatus;
  effectivePhase2Status?: PhaseStatus;
  phase2StartDate?: string;
  phase2EndDate?: string;
  phase2Description?: string;

  serverTime?: string;

  hasSubmittedPhase1: boolean;
  phase1Preference: PhaseOnePreferenceResponse | null;
  hasBookedPhase2: boolean;
  allocation: Allocation | null;
  roommates: Allocation[];

  waitlistEntry?: WaitingPoolEntry | null;
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
