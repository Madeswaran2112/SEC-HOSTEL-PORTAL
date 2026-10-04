import React, { useEffect, useState } from 'react';
import { allocationApi, windowApi } from '../../api/allocationApi';
import { exportApi } from '../../api/exportApi';
import { Allocation, AllocationWindow } from '../../types/allocation';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ExportButtons } from '../../components/common/ExportButtons';
import { SearchFilter } from '../../components/common/SearchFilter';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDateTime } from '../../utils/formatters';
import { FileCheck2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const FinalAllocationList: React.FC = () => {
  const [windows, setWindows] = useState<AllocationWindow[]>([]);
  const [selectedWindowId, setSelectedWindowId] = useState('');
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACCEPTED');
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const debouncedSearch = useDebounce(search, 400);
  const { page, size, handlePageChange } = usePagination(0, 15);

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
      }
    } catch {
      toast.error('Failed to load final allocation list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, [selectedWindowId, page, size, debouncedSearch, statusFilter]);

  const handleDownload = (blobData: any, filename: string) => {
    const url = window.URL.createObjectURL(new Blob([blobData]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const data = await exportApi.exportAllocationsCSV(selectedWindowId);
      handleDownload(data, `allocations-${selectedWindowId || 'all'}.csv`);
      toast.success('CSV export downloaded');
    } catch {
      toast.error('Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const data = await exportApi.exportAllocationsExcel(selectedWindowId);
      handleDownload(data, `allocations-${selectedWindowId || 'all'}.xlsx`);
      toast.success('Excel export downloaded');
    } catch {
      toast.error('Failed to export Excel');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      const data = await exportApi.exportAllocationsPDF(selectedWindowId);
      handleDownload(data, `allocations-${selectedWindowId || 'all'}.pdf`);
      toast.success('PDF report downloaded');
    } catch {
      toast.error('Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  const columns: Column<Allocation>[] = [
    {
      key: 'studentName',
      header: 'Student Name',
      render: (a: Allocation) => (
        <div>
          <div className="font-semibold text-gray-900">{a.studentName}</div>
          <div className="text-xs text-gray-500 font-mono">{a.registerNumber}</div>
        </div>
      )
    },
    {
      key: 'roomDetails',
      header: 'Hostel & Room',
      render: (a: Allocation) => (
        <div>
          <div className="font-medium text-gray-900">{a.hostelName} &bull; Room {a.roomNumber}</div>
          <div className="text-xs text-gray-500">Bed #{a.bedNumber} &bull; {a.roomTypeName}</div>
        </div>
      )
    },
    {
      key: 'groupName',
      header: 'Group Info',
      render: (a: Allocation) => (
        <span className="text-xs font-medium text-gray-600">
          {a.groupName || 'Individual Allocation'}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Offer Status',
      render: (a: Allocation) => <StatusBadge status={String(a.status)} />
    },
    {
      key: 'allocatedAt',
      header: 'Allocated Date',
      render: (a: Allocation) => <span className="text-xs text-gray-500">{formatDateTime(a.allocatedAt)}</span>
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileCheck2 className="h-6 w-6 text-indigo-600" />
            Final Room Allocation List
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Official confirmed room assignments roster with one-click export for hostel wardens and administration.
          </p>
        </div>

        <ExportButtons
          onExportCSV={handleExportCSV}
          onExportExcel={handleExportExcel}
          onExportPDF={handleExportPDF}
          loading={exporting}
        />
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label htmlFor="window-select" className="text-sm font-semibold text-gray-700 whitespace-nowrap">
            Allocation Window:
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
        searchPlaceholder="Search by student name, reg no, or room number..."
        filters={[
          {
            label: 'Filter Status',
            key: 'status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'Accepted Only', value: 'ACCEPTED' },
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Pending', value: 'PENDING' },
              { label: 'Rejected', value: 'REJECTED' }
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
        emptyTitle="No confirmed allocations found"
        emptyDescription="No student room assignments found under this filter criteria."
      />
    </div>
  );
};

export default FinalAllocationList;
