import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { hostelApi } from '../../api/hostelApi';
import { Hostel } from '../../types/hostel';
import { DataTable } from '../../components/common/DataTable';
import { SearchFilter } from '../../components/common/SearchFilter';
import { Plus, Edit, Trash2 } from 'lucide-react';
import usePagination from '../../hooks/usePagination';
import useDebounce from '../../hooks/useDebounce';
import toast from 'react-hot-toast';

export const HostelList: React.FC = () => {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const debouncedSearch = useDebounce(search, 500);
  const { page, size, handlePageChange } = usePagination(0, 10);
  const navigate = useNavigate();

  const fetchHostels = async () => {
    try {
      setLoading(true);
      const res = await hostelApi.getAll(page, size, debouncedSearch);
      setHostels(res.data.content);
      setTotalElements(res.data.totalElements);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast.error('Failed to load hostels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostels();
  }, [page, size, debouncedSearch]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to deactivate this hostel?')) return;
    
    try {
      await hostelApi.delete(id);
      toast.success('Hostel deactivated');
      fetchHostels();
    } catch (error) {
      toast.error('Failed to deactivate hostel');
    }
  };

  const columns = [
    { key: 'name', header: 'Name', render: (h: Hostel) => <span className="font-medium text-gray-900">{h.name}</span> },
    { key: 'hostelType', header: 'Type' },
    { key: 'totalFloors', header: 'Floors' },
    { key: 'totalRooms', header: 'Total Rooms' },
    { 
      key: 'status', 
      header: 'Status', 
      render: (h: Hostel) => (
        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${h.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {h.isActive ? 'Active' : 'Inactive'}
        </span>
      ) 
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (h: Hostel) => (
        <div className="flex space-x-2">
          <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/hostels/${h.id}/edit`); }} className="text-indigo-600 hover:text-indigo-900">
            <Edit className="h-4 w-4" />
          </button>
          <button onClick={(e) => handleDelete(e, h.id)} className="text-red-600 hover:text-red-900">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Hostels</h1>
        <button
          onClick={() => navigate('/admin/hostels/new')}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Hostel
        </button>
      </div>

      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search hostels by name..."
      />

      <DataTable
        columns={columns}
        data={hostels}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={handlePageChange}
        onRowClick={(h) => navigate(`/admin/hostels/${h.id}`)}
      />
    </div>
  );
};

export default HostelList;
