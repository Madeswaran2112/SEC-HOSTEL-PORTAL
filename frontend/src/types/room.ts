export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  FULL = 'FULL',
  MAINTENANCE = 'MAINTENANCE',
  BLOCKED = 'BLOCKED'
}

export interface RoomType {
  id: string;
  name: string;
  capacity: number;
  isAc: boolean;
  baseFee: number;
  isActive: boolean;
}

export interface Room {
  id: string;
  hostelId: string;
  hostelName?: string;
  roomTypeId: string | number;
  roomTypeName?: string;
  isAc?: boolean;
  building?: string;
  roomNumber: string;
  floorNumber: number;
  status: RoomStatus | string;
  capacity: number;
  effectiveCapacity?: number;
  totalCapacity?: number;
  occupiedBeds: number;
  availableBeds: number;
}

export interface RoomRequest {
  hostelId: string | number;
  roomTypeId: string | number;
  roomNumber: string;
  building?: string;
  floorNumber: number;
  totalCapacity?: number;
}

export interface RoomTypeRequest {
  name: string;
  capacity: number;
  isAc: boolean;
  baseFee?: number;
}

export interface ExcelRoomRow {
  rowNumber: number;
  hostelName: string;
  floorNumber: number;
  roomNumber: string;
  roomTypeName: string;
  isAc: boolean;
  totalCapacity: number;
  availableBeds: number;
  status: string;
  valid: boolean;
  errors: string[];
}

export interface ExcelPreviewResponse {
  hostelId: number;
  hostelName: string;
  totalRows: number;
  validRows: number;
  errorRows: number;
  rows: ExcelRoomRow[];
}

export interface ExcelImportResponse {
  hostelId: number;
  hostelName: string;
  importedCount: number;
  updatedCount: number;
  errorCount: number;
  message: string;
  warnings?: string[];
}

