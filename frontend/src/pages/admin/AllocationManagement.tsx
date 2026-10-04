import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { allocationApi, windowApi } from '../../api/allocationApi';
import { Allocation, AllocationWindow } from '../../types/allocation';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SearchFilter } from '../../components/common/SearchFilter';
import { StatCard } from '../../components/common/StatCard';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce } from '../../hooks/useDebounce';
import { Sliders, PlayCircle, UserPlus, FileCheck2, CheckCircle, Clock, XCircle, Ban } from 'lucide-react';
import toast from 'react-hot-toast';

export const AllocationManagement: React.FC = () => {
  const navigate = useNavigate();
  const [windows, setWindows] = useState<AllocationWindow[]>([]);
  const [selectedWindowId, setSelectedWindowId] = useState<string>('');
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [stats, setStats] = useState({
    total: 0,
    accepted: 0,
    pending: 0,
    rejected: 0
  });

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

  const fetchAllocations = async () => {
    if (!selectedWindowId) return;
    try {
      setLoading(true);
      const statusParam = statusFilter === 'ALL' ? undefined : statusFilter;
      const res = await allocationApi.getAll(page, size, selectedWindowId, statusParam);
      if (res.data) {
        let list = res.data.content || [];
        if (debouncedSearch) {
          list = list.filter(a =>
            a.studentName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            a.registerNumber.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            a.roomNumber.toLowerCase().includes(debouncedSearch.toLowerCase())
          );
        }
        setAllocations(list);
        setTotalElements(res.data.totalElements || list.length);
        setTotalPages(res.data.totalPages || 1);

        // Compute summary metrics
        setStats({
          total: res.data.totalElements || list.length,
          accepted: list.filter(a => a.status === 'ACCEPTED').length,
          pending: list.filter(a => a.status === 'PENDING').length,
          rejected: list.filter(a => a.status === 'REJECTED').length
        });
      }
    } catch {
      toast.error('Failed to load allocations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, [selectedWindowId, page, size, debouncedSearch, statusFilter]);

  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this allocation? The bed will be released.')) return;
    try {
      await allocationApi.cancel(id);
      toast.success('Allocation cancelled and bed released');
      fetchAllocations();
    } catch {
      toast.error('Failed to cancel allocation');
    }
  };

  const columns: Column<Allocation>[] = [
    {
      key: 'student',
      header: 'Student',
      render: (a: Allocation) => (
        <div>
          <div className="font-semibold text-gray-900">{a.studentName}</div>
          <div className="text-xs text-gray-500 font-mono">{a.registerNumber}</div>
        </div>
      )
    },
    {
      key: 'room',
      header: 'Assigned Room',
      render: (a: Allocation) => (
        <div>
          <div className="font-medium text-gray-900">
            Room {a.roomNumber} &bull; Bed {a.bedNumber}
          </div>
          <div className="text-xs text-gray-500">
            {a.hostelName} &bull; {a.roomTypeName}
          </div>
        </div>
      )
    },
    {
      key: 'group',
      header: 'Group Name',
      render: (a: Allocation) => (
        <span className="text-xs font-medium text-gray-600">
          {a.groupName || 'Individual (Waiting Pool)'}
        </span>
      )
    },
    {
      key: 'type',
      header: 'Method',
      render: (a: Allocation) => (
        <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700">
          {a.allocationType}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (a: Allocation) => <StatusBadge status={String(a.status)} />
    },
    {
      key: 'actions',
      header: 'Action',
      render: (a: Allocation) => (
        a.status !== 'CANCELLED' ? (
          <button
            onClick={() => handleCancel(a.id)}
            className="text-red-600 hover:text-red-900 text-xs font-medium inline-flex items-center"
          >
            <Ban className="h-3.5 w-3.5 mr-1" /> Cancel
          </button>
        ) : (
          <span className="text-xs text-gray-400">Cancelled</span>
        )
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sliders className="h-6 w-6 text-indigo-600" />
            Allocation Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Review allocations, supervise automated allocation rounds, and manage manual room assignments.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate('/admin/allocations/run')}
            className="inline-flex items-center px-3.5 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <PlayCircle className="h-4 w-4 mr-1.5" /> Run Auto-Allocation
          </button>
          <button
            onClick={() => navigate('/admin/allocations/manual')}
            className="inline-flex items-center px-3.5 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <UserPlus className="h-4 w-4 mr-1.5" /> Manual Assign
          </button>
          <button
            onClick={() => navigate('/admin/allocations/final-list')}
            className="inline-flex items-center px-3.5 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <FileCheck2 className="h-4 w-4 mr-1.5" /> Final List
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label htmlFor="window-select" className="text-sm font-semibold text-gray-700 whitespace-nowrap">
            Academic Window:
          </label>
          <select
            id="window-select"
            value={selectedWindowId}
            onChange={(e) => setSelectedWindowId(e.target.value)}
            className="block w-full sm:w-72 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
          >
            {windows.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Allocations" value={stats.total} icon={<Sliders className="h-6 w-6" />} />
        <StatCard title="Accepted Offers" value={stats.accepted} icon={<CheckCircle className="h-6 w-6" />} />
        <StatCard title="Pending Acceptance" value={stats.pending} icon={<Clock className="h-6 w-6" />} />
        <StatCard title="Rejected Offers" value={stats.rejected} icon={<XCircle className="h-6 w-6" />} />
      </div>

      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search student, reg no, or room..."
        filters={[
          {
            label: 'Status',
            key: 'status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Pending', value: 'PENDING' },
              { label: 'Accepted', value: 'ACCEPTED' },
              { label: 'Rejected', value: 'REJECTED' },
              { label: 'Cancelled', value: 'CANCELLED' }
            ]
          }
        ]}
      />

      <DataTable
        columns={columns}
        data={allocations}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={handlePageChange}
        emptyTitle="No allocations found"
        emptyDescription="Run auto-allocation or assign students manually to populate this window."
      />
    </div>
  );
};

export default AllocationManagement;
