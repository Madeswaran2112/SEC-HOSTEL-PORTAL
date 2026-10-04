import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomApi, roomTypeApi } from '../../api/roomApi';
import { hostelApi } from '../../api/hostelApi';
import { Room } from '../../types/room';
import { DataTable } from '../../components/common/DataTable';
import { SearchFilter } from '../../components/common/SearchFilter';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import usePagination from '../../hooks/usePagination';
import toast from 'react-hot-toast';
import { SelectOption } from '../../types/common';

export const RoomList: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [hostels, setHostels] = useState<SelectOption[]>([]);
  const [roomTypes, setRoomTypes] = useState<SelectOption[]>([]);
  
  const [filterValues, setFilterValues] = useState({
    hostelId: '',
    roomTypeId: '',
    status: ''
  });
  
  const { page, size, handlePageChange } = usePagination(0, 10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [hostelRes, typeRes] = await Promise.all([
          hostelApi.getAll(0, 100),
          roomTypeApi.getAll()
        ]);
        setHostels(hostelRes.data.content.map(h => ({ label: h.name, value: h.id })));
        setRoomTypes(typeRes.data.map(rt => ({ label: rt.name, value: rt.id })));
      } catch (error) {
        console.error('Failed to load filter options');
      }
    };
    fetchOptions();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await roomApi.getAll(page, size, filterValues.hostelId, filterValues.roomTypeId, filterValues.status);
      setRooms(res.data.content);
      setTotalElements(res.data.totalElements);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [page, size, filterValues]);

  const handleFilterChange = (key: string, val: string) => {
    setFilterValues(prev => ({ ...prev, [key]: val }));
    handlePageChange(0); // Reset page on filter change
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    try {
      await roomApi.delete(id);
      toast.success('Room deleted');
      fetchRooms();
    } catch (error) {
      toast.error('Failed to delete room');
    }
  };

  const columns = [
    { key: 'roomNumber', header: 'Room No', render: (r: Room) => <span className="font-bold text-gray-900">{r.roomNumber}</span> },
    { key: 'hostelName', header: 'Hostel' },
    { key: 'floorNumber', header: 'Floor' },
    { key: 'roomTypeName', header: 'Type' },
    { key: 'occupancy', header: 'Occupancy', render: (r: Room) => `${r.occupiedBeds} / ${r.capacity}` },
    { key: 'status', header: 'Status', render: (r: Room) => <StatusBadge status={r.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (r: Room) => (
        <div className="flex space-x-2">
          <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/rooms/${r.id}/edit`); }} className="text-indigo-600 hover:text-indigo-900">
            <Edit className="h-4 w-4" />
          </button>
          <button onClick={(e) => handleDelete(e, r.id)} className="text-red-600 hover:text-red-900">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Rooms</h1>
        <button
          onClick={() => navigate('/admin/rooms/new')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Room
        </button>
      </div>

      <SearchFilter
        searchValue=""
        onSearchChange={() => {}}
        searchPlaceholder="Search rooms..."
        filters={[
          { key: 'hostelId', label: 'Hostel', options: hostels },
          { key: 'roomTypeId', label: 'Room Type', options: roomTypes },
          { key: 'status', label: 'Status', options: [
            { label: 'Available', value: 'AVAILABLE' },
            { label: 'Full', value: 'FULL' },
            { label: 'Maintenance', value: 'MAINTENANCE' },
            { label: 'Blocked', value: 'BLOCKED' }
          ]}
        ]}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
      />

      <DataTable
        columns={columns}
        data={rooms}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={handlePageChange}
        onRowClick={(r) => navigate(`/admin/rooms/${r.id}`)}
      />
    </div>
  );
};

export default RoomList;
