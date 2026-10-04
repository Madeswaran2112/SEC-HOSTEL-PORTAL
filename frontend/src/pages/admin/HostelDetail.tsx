import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hostelApi } from '../../api/hostelApi';
import { HostelCard } from '../../components/admin/HostelCard';
import { RoomCard } from '../../components/admin/RoomCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Hostel } from '../../types/hostel';
import { Room } from '../../types/room';
import usePagination from '../../hooks/usePagination';
import toast from 'react-hot-toast';

export const HostelDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { page, size, handlePageChange } = usePagination(0, 20);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [hostelRes, roomsRes] = await Promise.all([
          hostelApi.getById(id),
          hostelApi.getRooms(id, page, size)
        ]);
        setHostel(hostelRes.data);
        setRooms(roomsRes.data.content);
        setTotalPages(roomsRes.data.totalPages);
      } catch (error) {
        toast.error('Failed to load hostel details');
        navigate('/admin/hostels');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDetails();
  }, [id, page, size, navigate]);

  if (loading) return <div className="py-12"><LoadingSpinner size="lg" /></div>;
  if (!hostel) return null;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Hostel Details</h1>
        <button
          onClick={() => navigate(`/admin/hostels/${id}/edit`)}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Edit Hostel
        </button>
      </div>

      <div className="max-w-3xl">
        <HostelCard hostel={hostel} />
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Rooms in {hostel.name}</h2>
          <button
            onClick={() => navigate('/admin/rooms/new')}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            + Add Room
          </button>
        </div>

        {rooms.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-500">No rooms found in this hostel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {rooms.map(room => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 0}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages - 1}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostelDetail;
