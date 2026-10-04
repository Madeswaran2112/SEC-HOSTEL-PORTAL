import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roomApi } from '../../api/roomApi';
import { Room } from '../../types/room';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Users, Bed } from 'lucide-react';
import toast from 'react-hot-toast';

export const RoomDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await roomApi.getById(id);
        setRoom(res.data);
      } catch (error) {
        toast.error('Failed to load room details');
        navigate('/admin/rooms');
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id, navigate]);

  const handleStatusChange = async (newStatus: string) => {
    if (!room) return;
    try {
      setUpdatingStatus(true);
      await roomApi.updateStatus(room.id, newStatus);
      toast.success('Status updated');
      const res = await roomApi.getById(room.id);
      setRoom(res.data);
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) return <div className="py-12"><LoadingSpinner size="lg" /></div>;
  if (!room) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Room Details</h1>
        <button
          onClick={() => navigate(`/admin/rooms/${room.id}/edit`)}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Edit Room
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-indigo-50 flex justify-between items-center">
          <div className="flex items-center">
            <Bed className="h-8 w-8 text-indigo-600 mr-3" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Room {room.roomNumber}</h2>
              <p className="text-sm text-gray-500">{room.hostelName} • Floor {room.floorNumber}</p>
            </div>
          </div>
          <StatusBadge status={room.status} />
        </div>

        <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Room Type</h3>
            <p className="mt-1 text-lg text-gray-900">{room.roomTypeName}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Occupancy</h3>
            <p className="mt-1 text-lg text-gray-900">{room.occupiedBeds} / {room.capacity} Beds</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Change Status</h3>
            <select
              value={room.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updatingStatus}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="AVAILABLE">Available</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="BLOCKED">Blocked</option>
              {room.status === 'FULL' && <option value="FULL">Full</option>}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2 text-gray-500" /> Current Occupants
        </h3>
        
        {room.occupiedBeds === 0 ? (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            This room is currently empty.
          </div>
        ) : (
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bed</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Register Number</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {/* Normally we'd fetch allocation details specifically for this room */}
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-gray-500">
                    Occupants list loading requires allocation detailed endpoint... (Placeholder)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomDetail;
