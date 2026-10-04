import React from 'react';
import { Room } from '../../types/room';
import { StatusBadge } from '../common/StatusBadge';
import { Link } from 'react-router-dom';

interface RoomCardProps {
  room: Room;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  const occupancyPercentage = (room.occupiedBeds / room.capacity) * 100;
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            <Link to={`/admin/rooms/${room.id}`} className="hover:text-indigo-600">
              {room.roomNumber}
            </Link>
          </h3>
          <p className="text-xs text-gray-500">{room.hostelName} • Floor {room.floorNumber}</p>
        </div>
        <StatusBadge status={room.status} />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-2 text-sm">
          <span className="text-gray-500 font-medium">{room.roomTypeName}</span>
          <span className="text-gray-900 font-bold">{room.occupiedBeds} / {room.capacity} Beds</span>
        </div>
        
        <div className="flex gap-1 mt-3">
          {Array.from({ length: room.capacity }).map((_, i) => (
            <div 
              key={i} 
              className={`h-2 flex-1 rounded-sm ${i < room.occupiedBeds ? 'bg-indigo-500' : 'bg-gray-200'}`}
              title={i < room.occupiedBeds ? 'Occupied' : 'Available'}
            />
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <Link 
            to={`/admin/rooms/${room.id}`}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
          >
            Manage Room
          </Link>
        </div>
      </div>
    </div>
  );
};
