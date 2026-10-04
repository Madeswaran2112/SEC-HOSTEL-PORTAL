import React from 'react';
import { Allocation } from '../../types/allocation';
import { StatusBadge } from '../common/StatusBadge';
import { Home, MapPin, Check, X } from 'lucide-react';

interface AllocationCardProps {
  allocation: Allocation;
  onAccept?: () => void;
  onReject?: () => void;
}

export const AllocationCard: React.FC<AllocationCardProps> = ({ allocation, onAccept, onReject }) => {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="bg-green-600 px-6 py-4 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-white flex items-center">
          <Home className="mr-2 h-5 w-5" /> Room Allocation
        </h3>
        <StatusBadge status={allocation.status} className="bg-white text-green-800" />
      </div>
      <div className="px-6 py-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Hostel</h4>
            <p className="text-lg font-medium text-gray-900 flex items-center">
              <MapPin className="h-4 w-4 mr-1 text-gray-400" /> {allocation.hostelName}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Room Details</h4>
            <p className="text-lg font-medium text-gray-900">
              Room {allocation.roomNumber} <span className="text-gray-500 text-base font-normal">({allocation.roomTypeName})</span>
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Floor</h4>
            <p className="text-base text-gray-900">Floor {allocation.floorNumber}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Bed Number</h4>
            <p className="text-base text-gray-900">Bed {allocation.bedNumber}</p>
          </div>
          {allocation.groupName && (
            <div className="md:col-span-2">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Allocated As</h4>
              <p className="text-base text-gray-900">Group: {allocation.groupName}</p>
            </div>
          )}
        </div>
        <div className="mt-4 text-xs text-gray-400">
          Allocated on: {new Date(allocation.allocatedAt).toLocaleString()}
        </div>
      </div>
      
      {allocation.status === 'PENDING' && (onAccept || onReject) && (
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
          {onReject && (
            <button
              onClick={onReject}
              className="inline-flex justify-center items-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <X className="mr-2 h-4 w-4" /> Reject
            </button>
          )}
          {onAccept && (
            <button
              onClick={onAccept}
              className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none"
            >
              <Check className="mr-2 h-4 w-4" /> Accept Room
            </button>
          )}
        </div>
      )}
    </div>
  );
};
