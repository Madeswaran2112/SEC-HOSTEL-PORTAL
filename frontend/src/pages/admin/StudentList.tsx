import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentApi } from '../../api/studentApi';
import { Student, Gender, AdminStudentCreateRequest } from '../../types/student';
import { DataTable, Column } from '../../components/common/DataTable';
import { SearchFilter } from '../../components/common/SearchFilter';
import { StatusBadge } from '../../components/common/StatusBadge';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce } from '../../hooks/useDebounce';
import { Eye, Users, Plus, Download, Upload, Trash2, X, CheckCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export const StudentList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Modal & Import state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<{ imported: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Student Form state
  const [formData, setFormData] = useState<AdminStudentCreateRequest>({
    name: '',
    registerNumber: '',
    email: '',
    department: 'CSE',
    year: 2,
    phone: '',
    gender: Gender.MALE,
    previousRoomNumber: '',
    password: 'Password@123'
  });
  const [savingStudent, setSavingStudent] = useState(false);

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

  const handleDownloadTemplate = async () => {
    try {
      const blob = await studentApi.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sec_students_template.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Template downloaded successfully');
    } catch {
      toast.error('Failed to download Excel template');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const res = await studentApi.importExcel(file);
      if (res.data) {
        toast.success(`Import complete! ${res.data.importedCount} students added/updated.`);
        setImportSummary({
          imported: res.data.importedCount,
          errors: res.data.errors || []
        });
        fetchStudents();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to import Excel file');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.registerNumber || !formData.email) {
      toast.error('Please enter name, register number and email');
      return;
    }

    try {
      setSavingStudent(true);
      await studentApi.createStudent(formData);
      toast.success('Student created successfully');
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        registerNumber: '',
        email: '',
        department: 'CSE',
        year: 2,
        phone: '',
        gender: Gender.MALE,
        previousRoomNumber: '',
        password: 'Password@123'
      });
      fetchStudents();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create student');
    } finally {
      setSavingStudent(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string | number) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await studentApi.deleteStudent(id);
      toast.success('Student deleted successfully');
      fetchStudents();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete student');
    }
  };

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
      render: (s: Student) => <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{s.registerNumber}</span>
    },
    {
      key: 'department',
      header: 'Dept & Year',
      render: (s: Student) => (
        <span className="text-xs text-gray-700 font-medium">
          {s.department} &bull; Year {s.year}
        </span>
      )
    },
    {
      key: 'gender',
      header: 'Hostel Gender',
      render: (s: Student) => (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          s.gender === 'MALE' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
        }`}>
          {s.gender === 'MALE' ? 'Boys' : 'Girls'}
        </span>
      )
    },
    {
      key: 'previousRoomNumber',
      header: 'Prev Room',
      render: (s: Student) => (
        <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
          {s.previousRoomNumber || 'None'}
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
      header: 'Actions',
      render: (s: Student) => (
        <div className="flex items-center space-x-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/students/${s.id}`);
            }}
            className="inline-flex items-center text-xs text-indigo-600 hover:text-indigo-900 font-medium"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => handleDelete(e, s.id)}
            className="inline-flex items-center text-xs text-red-500 hover:text-red-700 font-medium"
            title="Delete Student"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-600" />
            Students Master Directory
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage student records, previous room histories, and Excel bulk imports for SEC Hostel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Download Template */}
          <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
            title="Download Excel Template"
          >
            <Download className="h-4 w-4 mr-1 text-gray-500" />
            Excel Template
          </button>

          {/* Import Excel */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx, .xls"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="inline-flex items-center px-3 py-2 border border-emerald-300 rounded-md shadow-sm text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50"
          >
            <Upload className="h-4 w-4 mr-1 text-emerald-600" />
            {isImporting ? 'Importing...' : 'Import Excel'}
          </button>

          {/* Add Student */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Student
          </button>
        </div>
      </div>

      {/* Import summary alert */}
      {importSummary && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start justify-between">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-emerald-900">
                Successfully processed: {importSummary.imported} students imported/updated.
              </p>
              {importSummary.errors.length > 0 && (
                <div className="mt-2 text-xs text-red-700">
                  <div className="font-semibold flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                    Validation warnings / skipped rows ({importSummary.errors.length}):
                  </div>
                  <ul className="list-disc pl-5 mt-1 space-y-0.5">
                    {importSummary.errors.slice(0, 5).map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                    {importSummary.errors.length > 5 && (
                      <li>...and {importSummary.errors.length - 5} more</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setImportSummary(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

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
              { label: 'Applied (Phase 1)', value: 'APPLIED' },
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

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Plus className="h-5 w-5 text-indigo-600" />
                Add Student to Master Data
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Madeswaran K"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Register Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.registerNumber}
                    onChange={(e) => setFormData({ ...formData, registerNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 uppercase"
                    placeholder="e.g. 211421104001"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Hostel Gender *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={Gender.MALE}>Male (Boys Hostel)</option>
                    <option value={Gender.FEMALE}>Female (Girls Hostel)</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    College Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. student@saveetha.ac.in"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. CSE, IT, ECE"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Academic Year
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={1}>Year 1</option>
                    <option value={2}>Year 2</option>
                    <option value={3}>Year 3</option>
                    <option value={4}>Year 4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. 9876543210"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Previous Room No
                  </label>
                  <input
                    type="text"
                    value={formData.previousRoomNumber}
                    onChange={(e) => setFormData({ ...formData, previousRoomNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. B-204"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingStudent}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {savingStudent ? 'Saving...' : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;
