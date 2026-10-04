import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { waitingPoolApi, windowApi } from '../../api/allocationApi';
import { WaitingPoolEntry, AllocationWindow } from '../../types/allocation';
import { DataTable, Column } from '../../components/common/DataTable';
import { SearchFilter } from '../../components/common/SearchFilter';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDateTime } from '../../utils/formatters';
import { ListFilter, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export const WaitingPoolAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [windows, setWindows] = useState<AllocationWindow[]>([]);
  const [selectedWindowId, setSelectedWindowId] = useState('');
  const [poolEntries, setPoolEntries] = useState<WaitingPoolEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const debouncedSearch = useDebounce(search, 400);
  const { page, size, handlePageChange } = usePagination(0, 10);

  useEffect(() => {
    const fetchWindows = async () => {
      try {
        const res = await windowApi.getAll(0, 50);
        if (res.data?.content && res.data.content.length > 0) {
          setWindows(res.data.content);
          setSelectedWindowId(res.data.content[0].id);
        }
      } catch {
        toast.error('Failed to load allocation windows');
      }
    };
    fetchWindows();
  }, []);

  const fetchPool = async () => {
    if (!selectedWindowId) return;
    try {
      setLoading(true);
      const res = await waitingPoolApi.getAll(selectedWindowId, page, size);
      if (res.data) {
        let list = res.data.content || [];
        if (debouncedSearch) {
          list = list.filter(e =>
            e.studentName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            e.registerNumber.toLowerCase().includes(debouncedSearch.toLowerCase())
          );
        }
        setPoolEntries(list);
        setTotalElements(res.data.totalElements || list.length);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch {
      toast.error('Failed to load waiting pool entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPool();
  }, [selectedWindowId, page, size, debouncedSearch]);

  const columns: Column<WaitingPoolEntry>[] = [
    {
      key: 'student',
      header: 'Student',
      render: (entry: WaitingPoolEntry) => (
        <div>
          <div className="font-semibold text-gray-900">{entry.studentName}</div>
          <div className="text-xs text-gray-500 font-mono">{entry.registerNumber}</div>
        </div>
      )
    },
    {
      key: 'preference',
      header: 'Room Preference',
      render: (entry: WaitingPoolEntry) => (
        <span className="text-xs font-medium text-gray-700">
          {entry.preferredRoomType || 'Any Room Type'}
        </span>
      )
    },
    {
      key: 'hostelType',
      header: 'Target Hostel',
      render: (entry: WaitingPoolEntry) => (
        <span className="text-xs uppercase font-medium px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
          {entry.hostelTypePreference}
        </span>
      )
    },
    {
      key: 'priority',
      header: 'Priority Rank',
      render: (entry: WaitingPoolEntry) => (
        <span className="font-mono text-xs font-bold text-gray-800">
          Rank {entry.priority || 0}
        </span>
      )
    },
    {
      key: 'joinedAt',
      header: 'Joined Pool',
      render: (entry: WaitingPoolEntry) => (
        <span className="text-xs text-gray-500">
          {formatDateTime(entry.joinedAt)}
        </span>
      )
    },
    {
      key: 'action',
      header: 'Action',
      render: () => (
        <button
          onClick={() => navigate('/admin/allocations/manual')}
          className="inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-900"
        >
          <UserPlus className="h-3.5 w-3.5 mr-1" /> Assign Room
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ListFilter className="h-6 w-6 text-indigo-600" />
            Individual Students Waiting Pool
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Queue of individual applicants without groups waiting for Phase 3 automated matching or manual assignment.
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label htmlFor="window-select" className="text-sm font-semibold text-gray-700 whitespace-nowrap">
            Target Window:
          </label>
          <select
            id="window-select"
            value={selectedWindowId}
            onChange={(e) => setSelectedWindowId(e.target.value)}
            className="block w-full sm:w-72 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
          >
            {windows.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.academicYear})
              </option>
            ))}
          </select>
        </div>
      </div>

      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search waiting pool student by name or register number..."
      />

      <DataTable
        columns={columns}
        data={poolEntries}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={handlePageChange}
        emptyTitle="Waiting pool is empty"
        emptyDescription="There are no individual unallocated students in the pool for this window."
      />
    </div>
  );
};

export default WaitingPoolAdmin;

