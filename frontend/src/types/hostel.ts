export enum HostelType {
  BOYS = 'BOYS',
  GIRLS = 'GIRLS'
}

export interface Hostel {
  id: string;
  name: string;
  hostelType: HostelType | string;
  address: string;
  totalFloors: number;
  isActive: boolean;
  totalRooms?: number;
  availableRooms?: number;
  totalBeds?: number;
  occupiedBeds?: number;
  availableBeds?: number;
  occupancyRate?: number;
}

export interface HostelRequest {
  name: string;
  hostelType: string;
  address?: string;
  totalFloors: number;
}

