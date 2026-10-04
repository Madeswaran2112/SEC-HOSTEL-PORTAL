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
  allocatedAt: string;
  respondedAt?: string;
}

export interface AllocationWindow {
  id: string;
  name: string;
  academicYear: string;
  semester: string;
  startDate: string;
  endDate: string;
  status: AllocationWindowStatus;
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

