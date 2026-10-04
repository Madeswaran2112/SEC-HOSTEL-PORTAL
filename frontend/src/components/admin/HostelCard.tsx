import React from 'react';
import { Hostel } from '../../types/hostel';
import { Building, Users, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HostelCardProps {
  hostel: Hostel;
}

export const HostelCard: React.FC<HostelCardProps> = ({ hostel }) => {
  const totalRooms = hostel.totalRooms ?? 0;
  const availableRooms = hostel.availableRooms ?? 0;
  const occupancyRate = totalRooms > 0 
    ? Math.round(((totalRooms - availableRooms) / totalRooms) * 100) 
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className={`h-2 ${hostel.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Building className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-bold text-gray-900">
                <Link to={`/admin/hostels/${hostel.id}`} className="hover:text-indigo-600">
                  {hostel.name}
                </Link>
              </h3>
              <p className="text-sm text-gray-500 flex items-center">
                <span className="capitalize">{hostel.hostelType.toLowerCase()}</span> Hostel
              </p>
            </div>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            hostel.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {hostel.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-xs text-gray-500 mb-1">Total Rooms</p>
            <p className="text-lg font-semibold text-gray-900">{totalRooms}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-xs text-gray-500 mb-1">Available</p>
            <p className="text-lg font-semibold text-gray-900">{availableRooms}</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">Occupancy</span>
            <span className="font-medium">{occupancyRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${occupancyRate > 90 ? 'bg-red-500' : occupancyRate > 70 ? 'bg-yellow-500' : 'bg-green-500'}`} 
              style={{ width: `${occupancyRate}%` }}
            ></div>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-end">
        <Link 
          to={`/admin/hostels/${hostel.id}`}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
};
