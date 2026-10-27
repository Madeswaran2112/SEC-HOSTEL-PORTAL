import React, { useEffect, useState } from 'react';
import { windowApi } from '../../api/allocationApi';
import { AllocationWindow, AllocationWindowRequest, AllocationWindowStatus } from '../../types/allocation';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { FormField } from '../../components/common/FormField';
import { usePagination } from '../../hooks/usePagination';
import { formatDate } from '../../utils/formatters';
import { Calendar, Plus, Play, CheckCircle, Lock, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

export const AllocationWindows: React.FC = () => {
  const [windows, setWindows] = useState<AllocationWindow[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { page, size, handlePageChange } = usePagination(0, 10);

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<AllocationWindowRequest>({
    name: '',
    academicYear: '2026-2027',
    semester: 'Odd Semester',
    startDate: '',
    endDate: ''
  });

  const fetchWindows = async () => {
    try {
      setLoading(true);
      const res = await windowApi.getAll(page, size);
      if (res.data) {
        setWindows(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
        setTotalPages(res.data.totalPages || 0);
      }
    } catch {
      toast.error('Failed to load allocation windows');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWindows();
  }, [page, size]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await windowApi.create(formData);
      toast.success('Allocation window created successfully');
      setModalOpen(false);
      setFormData({
        name: '',
        academicYear: '2026-2027',
        semester: 'Odd Semester',
        startDate: '',
        endDate: ''
      });
      fetchWindows();
    } catch {
      toast.error('Failed to create allocation window');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string | number, newStatus: string) => {
    try {
      await windowApi.updateStatus(id, newStatus);
      toast.success(`Window status updated to ${newStatus}`);
      fetchWindows();
    } catch {
      toast.error('Failed to update window status');
    }
  };

  const handlePhase1StatusChange = async (id: string | number, newStatus: string) => {
    try {
      await windowApi.updatePhase1Status(id, newStatus);
      toast.success(`Phase 1 status updated to ${newStatus}`);
      fetchWindows();
    } catch {
      toast.error('Failed to update Phase 1 status');
    }
  };

  const handlePhase2StatusChange = async (id: string | number, newStatus: string) => {
    try {
      await windowApi.updatePhase2Status(id, newStatus);
      toast.success(`Phase 2 status updated to ${newStatus}`);
      fetchWindows();
    } catch {
      toast.error('Failed to update Phase 2 status');
    }
  };

  const columns: Column<AllocationWindow>[] = [
    {
      key: 'name',
      header: 'Window Name',
      render: (w: AllocationWindow) => (
        <div>
          <div className="font-semibold text-gray-900">{w.name}</div>
          <div className="text-xs text-gray-500">{w.academicYear} &bull; {w.semester}</div>
        </div>
      )
    },
    {
      key: 'dates',
      header: 'Application Timeline',
      render: (w: AllocationWindow) => (
        <span className="text-xs text-gray-600">
          {formatDate(w.startDate)} &mdash; {formatDate(w.endDate)}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Window Status',
      render: (w: AllocationWindow) => <StatusBadge status={String(w.status)} />
    },
    {
      key: 'phase1Status',
      header: 'Phase 1: Room Preference',
      render: (w: AllocationWindow) => (
        <div className="flex items-center gap-1.5">
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
            w.phase1Status === 'OPEN'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : w.phase1Status === 'CLOSED'
              ? 'bg-rose-100 text-rose-800 border border-rose-300'
              : 'bg-gray-100 text-gray-700 border border-gray-300'
          }`}>
            {w.phase1Status || 'NOT_OPEN'}
          </span>
          <select
            value={w.phase1Status || 'NOT_OPEN'}
            onChange={(e) => handlePhase1StatusChange(w.id, e.target.value)}
            className="text-[11px] font-semibold border rounded-lg px-1.5 py-0.5 bg-white text-gray-700 focus:outline-none"
          >
            <option value="NOT_OPEN">NOT_OPEN</option>
            <option value="OPEN">OPEN</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </div>
      )
    },
    {
      key: 'phase2Status',
      header: 'Phase 2: Room Selection',
      render: (w: AllocationWindow) => (
        <div className="flex items-center gap-1.5">
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
            w.phase2Status === 'OPEN'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : w.phase2Status === 'CLOSED'
              ? 'bg-rose-100 text-rose-800 border border-rose-300'
              : 'bg-gray-100 text-gray-700 border border-gray-300'
          }`}>
            {w.phase2Status || 'NOT_OPEN'}
          </span>
          <select
            value={w.phase2Status || 'NOT_OPEN'}
            onChange={(e) => handlePhase2StatusChange(w.id, e.target.value)}
            className="text-[11px] font-semibold border rounded-lg px-1.5 py-0.5 bg-white text-gray-700 focus:outline-none"
          >
            <option value="NOT_OPEN">NOT_OPEN</option>
            <option value="OPEN">OPEN</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (w: AllocationWindow) => (
        <div className="flex items-center space-x-2">
          {w.status === AllocationWindowStatus.UPCOMING && (
            <button
              onClick={() => handleStatusChange(w.id, 'OPEN')}
              className="text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 px-2.5 py-1 rounded border border-green-200 inline-flex items-center"
            >
              <Play className="h-3 w-3 mr-1" /> Open Window
            </button>
          )}
          {w.status === AllocationWindowStatus.OPEN && (
            <button
              onClick={() => handleStatusChange(w.id, 'CLOSED')}
              className="text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded border border-amber-200 inline-flex items-center"
            >
              <Lock className="h-3 w-3 mr-1" /> Close Registrations
            </button>
          )}
          {w.status === AllocationWindowStatus.CLOSED && (
            <button
              onClick={() => handleStatusChange(w.id, 'COMPLETED')}
              className="text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded border border-blue-200 inline-flex items-center"
            >
              <CheckCircle className="h-3 w-3 mr-1" /> Mark Completed
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-indigo-600" />
            Allocation Windows & Phase Controls
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Define academic cycles and manage independent Phase 1 (Room Preference) & Phase 2 (Room Selection) controls.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" /> New Allocation Window
        </button>
      </div>

      <DataTable
        columns={columns}
        data={windows}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={handlePageChange}
        emptyTitle="No allocation windows found"
        emptyDescription="Create your first allocation window to open registrations."
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Allocation Window"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <FormField label="Window Name" required>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. 2026-2027 Odd Semester Allocation"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Academic Year" required>
              <input
                type="text"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                placeholder="2026-2027"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </FormField>

            <FormField label="Semester" required>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Odd Semester">Odd Semester</option>
                <option value="Even Semester">Even Semester</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Date" required>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </FormField>

            <FormField label="End Date" required>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </FormField>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Window'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AllocationWindows;
