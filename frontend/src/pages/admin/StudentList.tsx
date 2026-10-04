import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentApi } from '../../api/studentApi';
import { Student } from '../../types/student';
import { DataTable, Column } from '../../components/common/DataTable';
import { SearchFilter } from '../../components/common/SearchFilter';
import { StatusBadge } from '../../components/common/StatusBadge';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce } from '../../hooks/useDebounce';
import { Eye, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export const StudentList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const debouncedSearch = useDebounce(search, 400);
  const { page, size, handlePageChange } = usePagination(0, 10);
  const navigate = useNavigate();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const statusParam = statusFilter === 'ALL' ? undefined : statusFilter;
      const res = await studentApi.getStudents(page, size, debouncedSearch, statusParam);
      if (res.data) {
        setStudents(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
        setTotalPages(res.data.totalPages || 0);
      }
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, size, debouncedSearch, statusFilter]);

  const columns: Column<Student>[] = [
    {
      key: 'name',
      header: 'Student Name',
      render: (s: Student) => (
        <div>
          <div className="font-semibold text-gray-900">{s.name}</div>
          <div className="text-xs text-gray-500">{s.email}</div>
        </div>
      )
    },
    {
      key: 'registerNumber',
      header: 'Reg Number',
      render: (s: Student) => <span className="font-mono text-xs font-medium text-gray-700">{s.registerNumber}</span>
    },
    {
      key: 'department',
      header: 'Department / Year',
      render: (s: Student) => (
        <span className="text-xs text-gray-600">
          {s.department} &bull; Year {s.year}
        </span>
      )
    },
    {
      key: 'gender',
      header: 'Gender',
      render: (s: Student) => (
        <span className="capitalize text-xs font-medium text-gray-600">
          {s.gender ? s.gender.toLowerCase() : '-'}
        </span>
      )
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (s: Student) => <span className="text-xs text-gray-600">{s.phone || '-'}</span>
    },
    {
      key: 'allocationStatus',
      header: 'Allocation Status',
      render: (s: Student) => <StatusBadge status={String(s.allocationStatus)} />
    },
    {
      key: 'actions',
      header: 'Action',
      render: (s: Student) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/admin/students/${s.id}`);
          }}
          className="inline-flex items-center text-xs text-indigo-600 hover:text-indigo-900 font-medium"
        >
          <Eye className="h-3.5 w-3.5 mr-1" /> View
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-600" />
            Students Directory
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage all enrolled students and their hostel allocation statuses.
          </p>
        </div>
      </div>

      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by student name or register number..."
        filters={[
          {
            label: 'Allocation Status',
            key: 'status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Not Applied', value: 'NOT_APPLIED' },
              { label: 'In Waiting Pool', value: 'IN_POOL' },
              { label: 'Allocated', value: 'ALLOCATED' },
              { label: 'Confirmed', value: 'CONFIRMED' }
            ]
          }
        ]}
      />

      <DataTable
        columns={columns}
        data={students}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={handlePageChange}
        onRowClick={(s) => navigate(`/admin/students/${s.id}`)}
        emptyTitle="No students found"
        emptyDescription="Try adjusting your search query or status filter."
      />
    </div>
  );
};

export default StudentList;
