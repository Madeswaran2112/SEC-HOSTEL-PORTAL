export enum GroupStatus {
  FORMING = 'FORMING',
  COMPLETE = 'COMPLETE',
  PARTIAL = 'PARTIAL',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ALLOCATED = 'ALLOCATED',
  DISSOLVED = 'DISSOLVED'
}

export enum MembershipStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED'
}

export interface GroupMember {
  id: string;
  studentId: string;
  studentName: string;
  registerNumber: string;
  status: MembershipStatus | string;
  invitedAt: string;
  respondedAt?: string;
}

export interface Group {
  id: string;
  groupName: string;
  leaderId: string;
  leaderName: string;
  preferredRoomType?: string;
  preferredRoomTypeId?: string;
  hostelTypePreference: string;
  status: GroupStatus | string;
  maxSize: number;
  currentSize: number;
  members: GroupMember[];
  createdAt: string;
}

export interface GroupCreateRequest {
  groupName: string;
  preferredRoomTypeId: string;
  maxSize: number;
  memberRegisterNumbers?: string[];
}

export interface MemberValidationResponse {
  valid: boolean;
  message: string;
  studentId?: number;
  name?: string;
  registerNumber?: string;
  department?: string;
  year?: number;
  gender?: string;
}

export interface GroupInviteRequest {
  registerNumber?: string;
  email?: string;
}
