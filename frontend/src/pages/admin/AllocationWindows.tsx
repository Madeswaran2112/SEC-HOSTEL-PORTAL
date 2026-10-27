import React, { useEffect, useState } from 'react';
import { windowApi } from '../../api/allocationApi';
import { AllocationWindow, AllocationWindowRequest, AllocationWindowStatus, PhaseScheduleRequest, PhaseStatus } from '../../types/allocation';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { usePagination } from '../../hooks/usePagination';
import { formatDate } from '../../utils/formatters';
import {
  Calendar,
  Plus,
  Play,
  CheckCircle,
  Lock,
  Clock,
  Layers,
  DoorOpen,
  Save,
  Check,
  AlertTriangle,
  RefreshCw,
  Globe
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AllocationWindows: React.FC = () => {
  const [windows, setWindows] = useState<AllocationWindow[]>([]);
  const [selectedWindow, setSelectedWindow] = useState<AllocationWindow | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { page, size, handlePageChange } = usePagination(0, 10);

  // New Window Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<AllocationWindowRequest>({
    name: '',
    academicYear: '2026-2027',
    semester: 'Odd Semester',
    startDate: '',
    endDate: ''
  });

  // Phase 1 Schedule Form state
  const [p1AcademicYear, setP1AcademicYear] = useState('2026-2027');
  const [p1StartDate, setP1StartDate] = useState('');
  const [p1EndDate, setP1EndDate] = useState('');
  const [p1Description, setP1Description] = useState('Phase 1: Room Type Preference (Single, 2-in-1, 4-in-1, 8-in-1, 10-in-1 AC/Non-AC)');
  const [savingP1, setSavingP1] = useState(false);

  // Phase 2 Schedule Form state
  const [p2AcademicYear, setP2AcademicYear] = useState('2026-2027');
  const [p2StartDate, setP2StartDate] = useState('');
  const [p2EndDate, setP2EndDate] = useState('');
  const [p2Description, setP2Description] = useState('Phase 2: Floor, Room Number & Roommate Selection with real-time bed capacity');
  const [savingP2, setSavingP2] = useState(false);

  const fetchWindows = async () => {
    try {
      setLoading(true);
      const res = await windowApi.getAll(page, size);
      if (res.data) {
        const raw = res.data;
        const list: AllocationWindow[] = Array.isArray(raw) ? raw : ((raw as any).content || []);
        setWindows(list);
        setTotalElements(list.length);
        setTotalPages(1);

        if (list.length > 0) {
          const current = selectedWindow
            ? (list.find(w => String(w.id) === String(selectedWindow.id)) || list[0])
            : list[0];
          setSelectedWindow(current);
          populateScheduleForms(current);
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load allocation windows');
    } finally {
      setLoading(false);
    }
  };

  const populateScheduleForms = (w: AllocationWindow) => {
    setP1AcademicYear(w.academicYear || '2026-2027');
    setP1StartDate(w.phase1StartDate ? formatForInput(w.phase1StartDate) : '');
    setP1EndDate(w.phase1EndDate ? formatForInput(w.phase1EndDate) : '');
    setP1Description(w.phase1Description || 'Phase 1: Room Type Preference (Single, 2-in-1, 4-in-1, 8-in-1, 10-in-1 AC/Non-AC)');

    setP2AcademicYear(w.academicYear || '2026-2027');
    setP2StartDate(w.phase2StartDate ? formatForInput(w.phase2StartDate) : '');
    setP2EndDate(w.phase2EndDate ? formatForInput(w.phase2EndDate) : '');
    setP2Description(w.phase2Description || 'Phase 2: Floor, Room Number & Roommate Selection with real-time bed capacity');
  };

  const formatForInput = (dt: any) => {
    if (!dt) return '';
    if (typeof dt === 'string') {
      return dt.slice(0, 16);
    }
    if (Array.isArray(dt)) {
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${dt[0]}-${pad(dt[1])}-${pad(dt[2])}T${pad(dt[3] || 0)}:${pad(dt[4] || 0)}`;
    }
    return '';
  };

  useEffect(() => {
    fetchWindows();
  }, [page, size]);

  const handleSelectWindow = (w: AllocationWindow) => {
    setSelectedWindow(w);
    populateScheduleForms(w);
  };

  const handleSavePhase1Schedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWindow) {
      toast.error('Please select an allocation window first');
      return;
    }

    if (!p1AcademicYear || p1AcademicYear.trim() === '') {
      toast.error('Academic year is required');
      return;
    }

    if (!p1StartDate) {
      toast.error('Phase 1 Start Date & Time is required');
      return;
    }

    if (!p1EndDate) {
      toast.error('Phase 1 End Date & Time is required');
      return;
    }

    if (new Date(p1EndDate) <= new Date(p1StartDate)) {
      toast.error('Phase 1 End Date & Time must be later than Start Date & Time');
      return;
    }

    try {
      setSavingP1(true);
      const formattedStart = p1StartDate.length === 16 ? `${p1StartDate}:00` : p1StartDate;
      const formattedEnd = p1EndDate.length === 16 ? `${p1EndDate}:00` : p1EndDate;

      const payload: PhaseScheduleRequest = {
        phase: 1,
        academicYear: p1AcademicYear.trim(),
        startDate: formattedStart,
        endDate: formattedEnd,
        description: p1Description
      };

      const res = await windowApi.updateSchedule(selectedWindow.id, payload);
      toast.success('Phase 1 schedule saved successfully');
      if (res.data) {
        setSelectedWindow(res.data);
        populateScheduleForms(res.data);
      }
      fetchWindows();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save Phase 1 schedule');
    } finally {
      setSavingP1(false);
    }
  };

  const handleSavePhase2Schedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWindow) {
      toast.error('Please select an allocation window first');
      return;
    }

    if (!p2AcademicYear || p2AcademicYear.trim() === '') {
      toast.error('Academic year is required');
      return;
    }

    if (!p2StartDate) {
      toast.error('Phase 2 Start Date & Time is required');
      return;
    }

    if (!p2EndDate) {
      toast.error('Phase 2 End Date & Time is required');
      return;
    }

    if (new Date(p2EndDate) <= new Date(p2StartDate)) {
      toast.error('Phase 2 End Date & Time must be later than Start Date & Time');
      return;
    }

    try {
      setSavingP2(true);
      const formattedStart = p2StartDate.length === 16 ? `${p2StartDate}:00` : p2StartDate;
      const formattedEnd = p2EndDate.length === 16 ? `${p2EndDate}:00` : p2EndDate;

      const payload: PhaseScheduleRequest = {
        phase: 2,
        academicYear: p2AcademicYear.trim(),
        startDate: formattedStart,
        endDate: formattedEnd,
        description: p2Description
      };

      const res = await windowApi.updateSchedule(selectedWindow.id, payload);
      toast.success('Phase 2 schedule saved successfully');
      if (res.data) {
        setSelectedWindow(res.data);
        populateScheduleForms(res.data);
      }
      fetchWindows();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save Phase 2 schedule');
    } finally {
      setSavingP2(false);
    }
  };

  const handleOpenPhase1 = async () => {
    if (!selectedWindow) {
      toast.error('Please select an allocation window first');
      return;
    }

    if (p1StartDate && new Date(p1StartDate) > new Date()) {
      if (!window.confirm('The scheduled start time is in the future. Are you sure you want to manually OPEN Phase 1 now as an administrative override?')) {
        return;
      }
    }

    try {
      const res = await windowApi.openPhase1(selectedWindow.id);
      toast.success('Phase 1 is now OPEN for student preference submissions');
      if (res.data) {
        setSelectedWindow(res.data);
        populateScheduleForms(res.data);
      }
      fetchWindows();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to open Phase 1');
    }
  };

  const handleClosePhase1 = async () => {
    if (!selectedWindow) {
      toast.error('Please select an allocation window first');
      return;
    }

    if (!window.confirm('Are you sure you want to CLOSE Phase 1? New student preference submissions will be immediately blocked.')) {
      return;
    }

    try {
      const res = await windowApi.closePhase1(selectedWindow.id);
      toast.success('Phase 1 is now CLOSED');
      if (res.data) {
        setSelectedWindow(res.data);
        populateScheduleForms(res.data);
      }
      fetchWindows();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to close Phase 1');
    }
  };

  const handleOpenPhase2 = async () => {
    if (!selectedWindow) {
      toast.error('Please select an allocation window first');
      return;
    }

    if (p2StartDate && new Date(p2StartDate) > new Date()) {
      if (!window.confirm('The scheduled start time is in the future. Are you sure you want to manually OPEN Phase 2 now as an administrative override?')) {
        return;
      }
    }

    try {
      const res = await windowApi.openPhase2(selectedWindow.id);
      toast.success('Phase 2 is now OPEN for live room and roommate selection');
      if (res.data) {
        setSelectedWindow(res.data);
        populateScheduleForms(res.data);
      }
      fetchWindows();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to open Phase 2');
    }
  };

  const handleClosePhase2 = async () => {
    if (!selectedWindow) {
      toast.error('Please select an allocation window first');
      return;
    }

    if (!window.confirm('Are you sure you want to CLOSE Phase 2? Live room bookings will be immediately blocked.')) {
      return;
    }

    try {
      const res = await windowApi.closePhase2(selectedWindow.id);
      toast.success('Phase 2 is now CLOSED');
      if (res.data) {
        setSelectedWindow(res.data);
        populateScheduleForms(res.data);
      }
      fetchWindows();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to close Phase 2');
    }
  };

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

  const columns: Column<AllocationWindow>[] = [
    {
      key: 'name',
      header: 'Window Name',
      render: (w: AllocationWindow) => (
        <div
          onClick={() => handleSelectWindow(w)}
          className={`cursor-pointer p-1 rounded ${selectedWindow?.id === w.id ? 'font-bold text-indigo-700' : ''}`}
        >
          <div className="font-semibold text-gray-900">{w.name}</div>
          <div className="text-xs text-gray-500">{w.academicYear} &bull; {w.semester}</div>
        </div>
      )
    },
    {
      key: 'dates',
      header: 'Academic Timeline',
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
      header: 'Phase 1 Status',
      render: (w: AllocationWindow) => {
        const eff = w.effectivePhase1Status || w.phase1Status || 'NOT_OPEN';
        return (
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
            eff === 'OPEN'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : eff === 'CLOSED'
              ? 'bg-rose-100 text-rose-800 border border-rose-300'
              : 'bg-gray-100 text-gray-700 border border-gray-300'
          }`}>
            {eff}
          </span>
        );
      }
    },
    {
      key: 'phase2Status',
      header: 'Phase 2 Status',
      render: (w: AllocationWindow) => {
        const eff = w.effectivePhase2Status || w.phase2Status || 'NOT_OPEN';
        return (
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
            eff === 'OPEN'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : eff === 'CLOSED'
              ? 'bg-rose-100 text-rose-800 border border-rose-300'
              : 'bg-gray-100 text-gray-700 border border-gray-300'
          }`}>
            {eff}
          </span>
        );
      }
    },
    {
      key: 'actions',
      header: 'Window Controls',
      render: (w: AllocationWindow) => (
        <div className="flex items-center space-x-2">
          {w.status === AllocationWindowStatus.UPCOMING && (
            <button
              onClick={() => handleStatusChange(w.id, 'OPEN')}
              className="text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 px-2.5 py-1 rounded border border-green-200 inline-flex items-center"
            >
              <Play className="h-3 w-3 mr-1" /> Open
            </button>
          )}
          {w.status === AllocationWindowStatus.OPEN && (
            <button
              onClick={() => handleStatusChange(w.id, 'CLOSED')}
              className="text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded border border-amber-200 inline-flex items-center"
            >
              <Lock className="h-3 w-3 mr-1" /> Close
            </button>
          )}
          {w.status === AllocationWindowStatus.CLOSED && (
            <button
              onClick={() => handleStatusChange(w.id, 'COMPLETED')}
              className="text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded border border-blue-200 inline-flex items-center"
            >
              <CheckCircle className="h-3 w-3 mr-1" /> Complete
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Calendar className="h-6 w-6 text-indigo-600" />
            Allocation Management & Phase Scheduler
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Configure independent Phase 1 and Phase 2 schedules with server-enforced Asia/Kolkata (IST) deadlines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-semibold text-indigo-900">
            <Globe className="h-4 w-4 text-indigo-600" />
            <span>Timezone: Asia/Kolkata (IST)</span>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-1.5" /> New Window
          </button>
        </div>
      </div>

      {/* Selected Window Banner */}
      {selectedWindow && (
        <div className="bg-slate-900 text-white p-4 rounded-xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-indigo-300 font-bold">Active Configuration Target:</span>
              <span className="text-sm font-bold text-white">{selectedWindow.name}</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Academic Year: <span className="text-white font-medium">{selectedWindow.academicYear}</span> &bull; Semester: <span className="text-white font-medium">{selectedWindow.semester}</span>
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Phase 1 Status</span>
              <span className={`font-black ${selectedWindow.effectivePhase1Status === 'OPEN' ? 'text-emerald-400' : selectedWindow.effectivePhase1Status === 'CLOSED' ? 'text-rose-400' : 'text-slate-300'}`}>
                {selectedWindow.effectivePhase1Status || selectedWindow.phase1Status || 'NOT_OPEN'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Phase 2 Status</span>
              <span className={`font-black ${selectedWindow.effectivePhase2Status === 'OPEN' ? 'text-emerald-400' : selectedWindow.effectivePhase2Status === 'CLOSED' ? 'text-rose-400' : 'text-slate-300'}`}>
                {selectedWindow.effectivePhase2Status || selectedWindow.phase2Status || 'NOT_OPEN'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2 SEPARATE SCHEDULE CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ========================================================= */}
        {/* CARD 1: PHASE 1 — ROOM TYPE PREFERENCE */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl border-2 border-indigo-100 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            {/* Card Header */}
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white/10 rounded-lg backdrop-blur-xs">
                    <Layers className="h-5 w-5 text-indigo-300" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold tracking-tight">Phase 1 — Room Type Preference</h2>
                    <p className="text-[11px] text-indigo-200">Preference collection for 10 standard room types</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    selectedWindow?.effectivePhase1Status === 'OPEN'
                      ? 'bg-emerald-500 text-white'
                      : selectedWindow?.effectivePhase1Status === 'CLOSED'
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-700 text-slate-200'
                  }`}>
                    {selectedWindow?.effectivePhase1Status || selectedWindow?.phase1Status || 'NOT_OPEN'}
                  </span>
                </div>
              </div>
            </div>

            {/* Phase 1 Form */}
            <form onSubmit={handleSavePhase1Schedule} className="p-5 space-y-4">
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-900 space-y-1">
                <span className="font-bold block">10 Standard SEC Hostel Room Types:</span>
                <p className="text-[11px] text-indigo-700 leading-relaxed">
                  Single AC / Non-AC &bull; 2-in-1 AC / Non-AC &bull; 4-in-1 AC / Non-AC &bull; 8-in-1 AC / Non-AC &bull; 10-in-1 AC / Non-AC.
                  Students submit preference only (no room number is chosen in Phase 1).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Academic Year
                </label>
                <input
                  type="text"
                  value={p1AcademicYear}
                  onChange={(e) => setP1AcademicYear(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. 2026-2027"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-gray-400" /> Start Date & Time (IST)
                  </label>
                  <input
                    type="datetime-local"
                    value={p1StartDate}
                    onChange={(e) => setP1StartDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-gray-400" /> End Date & Time (IST)
                  </label>
                  <input
                    type="datetime-local"
                    value={p1EndDate}
                    onChange={(e) => setP1EndDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Phase Description & Guidelines
                </label>
                <textarea
                  rows={2}
                  value={p1Description}
                  onChange={(e) => setP1Description(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs text-gray-700 focus:ring-2 focus:ring-indigo-500"
                  placeholder="Instructions for students submitting room type preferences..."
                />
              </div>

              {/* Action Controls */}
              <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="submit"
                  disabled={savingP1}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  {savingP1 ? 'Saving...' : 'Save Schedule'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenPhase1}
                    className="inline-flex items-center px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold"
                  >
                    <Play className="h-3.5 w-3.5 mr-1 text-emerald-600" /> Open Phase 1
                  </button>

                  <button
                    type="button"
                    onClick={handleClosePhase1}
                    className="inline-flex items-center px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded-lg text-xs font-bold"
                  >
                    <Lock className="h-3.5 w-3.5 mr-1 text-rose-600" /> Close Phase 1
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CARD 2: PHASE 2 — ROOM AND ROOMMATE SELECTION */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl border-2 border-emerald-100 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            {/* Card Header */}
            <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white/10 rounded-lg backdrop-blur-xs">
                    <DoorOpen className="h-5 w-5 text-emerald-300" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold tracking-tight">Phase 2 — Room & Roommate Selection</h2>
                    <p className="text-[11px] text-emerald-200">Real-time floor, room, and roommate assignment</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    selectedWindow?.effectivePhase2Status === 'OPEN'
                      ? 'bg-emerald-500 text-white'
                      : selectedWindow?.effectivePhase2Status === 'CLOSED'
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-700 text-slate-200'
                  }`}>
                    {selectedWindow?.effectivePhase2Status || selectedWindow?.phase2Status || 'NOT_OPEN'}
                  </span>
                </div>
              </div>
            </div>

            {/* Phase 2 Form */}
            <form onSubmit={handleSavePhase2Schedule} className="p-5 space-y-4">
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs text-emerald-900 space-y-1">
                <span className="font-bold block">Live Room & Roommate Booking:</span>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  Students choose their permitted hostel floor & room number, validate roommates with register numbers,
                  and lock their booking atomically with pessimistic database concurrency.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Academic Year
                </label>
                <input
                  type="text"
                  value={p2AcademicYear}
                  onChange={(e) => setP2AcademicYear(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. 2026-2027"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-gray-400" /> Start Date & Time (IST)
                  </label>
                  <input
                    type="datetime-local"
                    value={p2StartDate}
                    onChange={(e) => setP2StartDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-xs font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-gray-400" /> End Date & Time (IST)
                  </label>
                  <input
                    type="datetime-local"
                    value={p2EndDate}
                    onChange={(e) => setP2EndDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-xs font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Phase Description & Guidelines
                </label>
                <textarea
                  rows={2}
                  value={p2Description}
                  onChange={(e) => setP2Description(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs text-gray-700 focus:ring-2 focus:ring-emerald-500"
                  placeholder="Instructions for room and roommate selection..."
                />
              </div>

              {/* Action Controls */}
              <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="submit"
                  disabled={savingP2}
                  className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  {savingP2 ? 'Saving...' : 'Save Schedule'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenPhase2}
                    className="inline-flex items-center px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold"
                  >
                    <Play className="h-3.5 w-3.5 mr-1 text-emerald-600" /> Open Phase 2
                  </button>

                  <button
                    type="button"
                    onClick={handleClosePhase2}
                    className="inline-flex items-center px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded-lg text-xs font-bold"
                  >
                    <Lock className="h-3.5 w-3.5 mr-1 text-rose-600" /> Close Phase 2
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ALLOCATION WINDOWS MASTER TABLE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600" />
            Allocation Windows Directory
          </h2>
          <span className="text-xs text-gray-500">Click a row to load its schedule into the cards above</span>
        </div>

        <DataTable
          columns={columns}
          data={windows}
          loading={loading}
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          onPageChange={handlePageChange}
          onRowClick={(w) => handleSelectWindow(w)}
          emptyTitle="No allocation windows found"
          emptyDescription="Create your first allocation window to configure Phase 1 & Phase 2 schedules."
        />
      </div>

      {/* New Allocation Window Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Allocation Window"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Window Title / Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. 2026-2027 Hostel Room Allocation"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Academic Year *
              </label>
              <input
                type="text"
                required
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                placeholder="2026-2027"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Semester *
              </label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Odd Semester">Odd Semester</option>
                <option value="Even Semester">Even Semester</option>
                <option value="Summer Term">Summer Term</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                End Date *
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:opacity-50"
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
