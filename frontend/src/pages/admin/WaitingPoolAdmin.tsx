import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { waitingPoolApi, windowApi } from '../../api/allocationApi';
import { roomApi } from '../../api/roomApi';
import { WaitingPoolEntry, AllocationWindow, WaitlistStatus } from '../../types/allocation';
import { Room } from '../../types/room';
import { DataTable, Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDateTime } from '../../utils/formatters';
import {
  ListFilter,
  Users,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Award,
  Zap,
  Eye,
  RefreshCw,
  Home
} from 'lucide-react';
import toast from 'react-hot-toast';

export const WaitingPoolAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [windows, setWindows] = useState<AllocationWindow[]>([]);
  const [selectedWindowId, setSelectedWindowId] = useState('');
  
  // TABS: 'BOYS' | 'GIRLS'
  const [activeTab, setActiveTab] = useState<'BOYS' | 'GIRLS'>('BOYS');

  const [poolEntries, setPoolEntries] = useState<WaitingPoolEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const debouncedSearch = useDebounce(search, 400);
  const { page, size, handlePageChange } = usePagination(0, 10);

  // Available rooms for offering/allocating
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);

  // Modals state
  const [selectedEntry, setSelectedEntry] = useState<WaitingPoolEntry | null>(null);
  
  // 1. Issue Offer Modal
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [submittingOffer, setSubmittingOffer] = useState(false);

  // 2. Cancel Entry Modal
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [submittingCancel, setSubmittingCancel] = useState(false);

  // 3. Priority Reorder Modal
  const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false);
  const [newPriority, setNewPriority] = useState<number>(1);
  const [priorityReason, setPriorityReason] = useState('');
  const [submittingPriority, setSubmittingPriority] = useState(false);

  // 4. Exceptional Allocate Modal
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [allocateRoomId, setAllocateRoomId] = useState<string>('');
  const [allocateReason, setAllocateReason] = useState('');
  const [submittingAllocate, setSubmittingAllocate] = useState(false);

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

  const fetchRooms = async () => {
    try {
      const res = await roomApi.getAll(0, 100, undefined, undefined, 'AVAILABLE');
      if (res.data?.content) {
        setAvailableRooms(res.data.content);
      }
    } catch {
      console.warn('Failed to fetch rooms list');
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchPool = async () => {
    if (!selectedWindowId) return;
    try {
      setLoading(true);
      const res = await waitingPoolApi.getAdminWaitlist(
        selectedWindowId,
        activeTab,
        statusFilter === 'ALL' ? undefined : statusFilter,
        debouncedSearch || undefined,
        page,
        size
      );
      if (res.data) {
        setPoolEntries(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch {
      toast.error('Failed to load waiting list entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPool();
  }, [selectedWindowId, activeTab, statusFilter, debouncedSearch, page, size]);

  const handleIssueOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntry || !selectedRoomId) return;
    try {
      setSubmittingOffer(true);
      await waitingPoolApi.adminIssueOffer(selectedEntry.id, selectedRoomId);
      toast.success(`Room offer issued to ${selectedEntry.studentName}`);
      setIsOfferModalOpen(false);
      setSelectedRoomId('');
      fetchPool();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to issue room offer');
    } finally {
      setSubmittingOffer(false);
    }
  };

  const handleCancelEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntry || !cancelReason.trim()) {
      toast.error('A mandatory cancellation reason is required');
      return;
    }
    try {
      setSubmittingCancel(true);
      await waitingPoolApi.adminCancel(selectedEntry.id, cancelReason);
      toast.success('Waiting list entry cancelled successfully');
      setIsCancelModalOpen(false);
      setCancelReason('');
      fetchPool();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel waiting entry');
    } finally {
      setSubmittingCancel(false);
    }
  };

  const handleUpdatePriority = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntry || !priorityReason.trim()) {
      toast.error('A mandatory reason is required for priority reordering');
      return;
    }
    try {
      setSubmittingPriority(true);
      await waitingPoolApi.adminUpdatePriority(selectedEntry.id, newPriority, priorityReason);
      toast.success('Queue priority updated successfully');
      setIsPriorityModalOpen(false);
      setPriorityReason('');
      fetchPool();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update priority');
    } finally {
      setSubmittingPriority(false);
    }
  };

  const handleExceptionalAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntry || !allocateRoomId || !allocateReason.trim()) {
      toast.error('Please choose a room and enter an allocation reason');
      return;
    }
    try {
      setSubmittingAllocate(true);
      await waitingPoolApi.adminExceptionalAllocate(selectedEntry.id, allocateRoomId, allocateReason);
      toast.success(`Exceptional allocation completed for ${selectedEntry.studentName}`);
      setIsAllocateModalOpen(false);
      setAllocateRoomId('');
      setAllocateReason('');
      fetchPool();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to allocate room');
    } finally {
      setSubmittingAllocate(false);
    }
  };

  // Filter available rooms matching the student's gender for offer modal
  const eligibleRooms = availableRooms.filter(r => {
    if (!selectedEntry) return true;
    const isBoys = selectedEntry.hostelTypePreference === 'BOYS';
    const isRoomBoys = r.hostelName?.toLowerCase().includes('boys') || r.roomNumber?.startsWith('B');
    return isBoys ? isRoomBoys : !isRoomBoys;
  });

  const columns: Column<WaitingPoolEntry>[] = [
    {
      key: 'queuePosition',
      header: 'Queue Rank',
      render: (entry: WaitingPoolEntry) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-black font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
          #{entry.queuePosition || entry.priority}
        </span>
      )
    },
    {
      key: 'student',
      header: 'Student',
      render: (entry: WaitingPoolEntry) => (
        <div>
          <div className="font-semibold text-gray-900">{entry.studentName}</div>
          <div className="text-xs text-gray-500 font-mono">
            {entry.registerNumber} &bull; {entry.department || 'Student'} (Yr {entry.year || 1})
          </div>
        </div>
      )
    },
    {
      key: 'preference',
      header: 'Requested Type',
      render: (entry: WaitingPoolEntry) => (
        <div className="text-xs">
          <span className="font-semibold text-gray-800">
            {entry.preferredRoomType?.name || 'Any Room Type'}
          </span>
          {entry.isAc !== undefined && (
            <span className={`ml-1.5 px-1.5 py-0.2 rounded text-[10px] font-bold ${
              entry.isAc ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-gray-100 text-gray-600'
            }`}>
              {entry.isAc ? 'AC' : 'Non-AC'}
            </span>
          )}
          {entry.groupSize && entry.groupSize > 1 && (
            <div className="text-[10px] text-gray-500 font-medium">Group Size: {entry.groupSize}</div>
          )}
        </div>
      )
    },
    {
      key: 'reason',
      header: 'Waiting Reason',
      render: (entry: WaitingPoolEntry) => (
        <span className="text-xs text-gray-600 italic max-w-xs block truncate" title={entry.reason}>
          {entry.reason || 'Room unavailable'}
        </span>
      )
    },
    {
      key: 'joinedAt',
      header: 'Joined Time',
      render: (entry: WaitingPoolEntry) => (
        <span className="text-xs text-gray-500 font-mono">
          {formatDateTime(entry.joinedAt)}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (entry: WaitingPoolEntry) => {
        const s = String(entry.status);
        let color = 'bg-gray-100 text-gray-700 border-gray-300';
        if (s === 'WAITING') color = 'bg-amber-100 text-amber-800 border-amber-300';
        if (s === 'OFFERED') color = 'bg-indigo-100 text-indigo-800 border-indigo-300 animate-pulse';
        if (s === 'ACCEPTED' || s === 'ALLOCATED') color = 'bg-emerald-100 text-emerald-800 border-emerald-300';
        if (s === 'DECLINED' || s === 'CANCELLED' || s === 'EXPIRED') color = 'bg-rose-100 text-rose-800 border-rose-300';

        return (
          <div>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${color}`}>
              {s}
            </span>
            {entry.offeredRoomNumber && s === 'OFFERED' && (
              <div className="text-[10px] text-indigo-700 font-medium mt-0.5">
                Offered: Room {entry.offeredRoomNumber}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'actions',
      header: 'Admin Actions',
      render: (entry: WaitingPoolEntry) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Issue Offer */}
          {(entry.status === 'WAITING' || entry.status === 'DECLINED') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedEntry(entry);
                setIsOfferModalOpen(true);
              }}
              className="text-[11px] font-bold px-2 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded border border-indigo-200"
              title="Issue Room Offer"
            >
              Offer Room
            </button>
          )}

          {/* Exceptional Allocate */}
          {entry.status !== 'ALLOCATED' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedEntry(entry);
                setIsAllocateModalOpen(true);
              }}
              className="text-[11px] font-bold px-2 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded border border-emerald-200"
              title="Exceptional Allocation"
            >
              Allocate
            </button>
          )}

          {/* Reorder Priority */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedEntry(entry);
              setNewPriority(entry.priority || 1);
              setIsPriorityModalOpen(true);
            }}
            className="text-[11px] font-medium px-2 py-1 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded border border-gray-200"
            title="Adjust Priority Rank"
          >
            Rank
          </button>

          {/* Cancel */}
          {entry.status !== 'CANCELLED' && entry.status !== 'ALLOCATED' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedEntry(entry);
                setIsCancelModalOpen(true);
              }}
              className="text-[11px] font-medium px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded border border-rose-200"
              title="Cancel Entry"
            >
              Cancel
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <ListFilter className="h-6 w-6 text-indigo-600" />
            Waiting List Management
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Strictly separated Boys & Girls queues with automatic promotion on booking cancellations.
          </p>
        </div>

        {/* Window Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-600">Window:</span>
          <select
            value={selectedWindowId}
            onChange={(e) => setSelectedWindowId(e.target.value)}
            className="text-xs font-medium border border-gray-300 rounded-lg px-3 py-1.5 bg-white shadow-xs focus:ring-2 focus:ring-indigo-500"
          >
            {windows.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.academicYear})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SEPARATE BOYS & GIRLS TABS */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => {
            setActiveTab('BOYS');
            handlePageChange(0);
          }}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'BOYS'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Users className="h-4 w-4 text-indigo-600" />
          <span>Boys Waiting List</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-800">
            {activeTab === 'BOYS' ? totalElements : '-'}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('GIRLS');
            handlePageChange(0);
          }}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'GIRLS'
              ? 'border-pink-600 text-pink-700 bg-pink-50/50'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Users className="h-4 w-4 text-pink-600" />
          <span>Girls Waiting List</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-pink-100 text-pink-800">
            {activeTab === 'GIRLS' ? totalElements : '-'}
          </span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student name or register number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Filter className="h-3.5 w-3.5" />
            <span className="font-semibold">Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              handlePageChange(0);
            }}
            className="text-xs border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="WAITING">WAITING</option>
            <option value="OFFERED">OFFERED (Pending Acceptance)</option>
            <option value="ACCEPTED">ACCEPTED</option>
            <option value="DECLINED">DECLINED</option>
            <option value="EXPIRED">EXPIRED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="ALLOCATED">ALLOCATED</option>
          </select>
        </div>
      </div>

      {/* Waiting List DataTable */}
      <DataTable
        columns={columns}
        data={poolEntries}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={handlePageChange}
        emptyTitle={`No students on the ${activeTab === 'BOYS' ? 'Boys' : 'Girls'} waiting list`}
        emptyDescription="Students who cannot find a room or prefer to wait will appear here in queue order."
      />

      {/* ========================================================= */}
      {/* 1. ISSUE ROOM OFFER MODAL */}
      {/* ========================================================= */}
      <Modal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        title="Issue Room Offer to Candidate"
      >
        <form onSubmit={handleIssueOffer} className="space-y-4">
          <div className="p-3 bg-indigo-50 rounded-lg text-xs text-indigo-900">
            <p className="font-semibold">Candidate: {selectedEntry?.studentName} ({selectedEntry?.registerNumber})</p>
            <p className="text-[11px] text-indigo-700 mt-0.5">
              Target Hostel: <span className="font-bold">{selectedEntry?.hostelTypePreference}</span> &bull; Preferred Type: {selectedEntry?.preferredRoomType?.name || 'Any'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Select Compatible Available Room *
            </label>
            <select
              required
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Choose an available room --</option>
              {eligibleRooms.map((r) => (
                <option key={r.id} value={r.id}>
                  Room {r.roomNumber} ({r.roomTypeName} {r.isAc ? 'AC' : 'Non-AC'}) &bull; Floor {r.floorNumber} &bull; {r.availableBeds} beds available
                </option>
              ))}
            </select>
          </div>

          <p className="text-[11px] text-gray-500">
            The student will receive an in-app notification and 24 hours to accept or decline before the offer expires.
          </p>

          <div className="pt-3 flex justify-end gap-2 border-t">
            <button
              type="button"
              onClick={() => setIsOfferModalOpen(false)}
              className="px-4 py-2 border rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingOffer}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold disabled:opacity-50"
            >
              {submittingOffer ? 'Issuing...' : 'Issue Offer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* 2. CANCEL ENTRY MODAL */}
      {/* ========================================================= */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Waiting List Entry"
      >
        <form onSubmit={handleCancelEntry} className="space-y-4">
          <p className="text-xs text-gray-600">
            Are you sure you want to cancel the waiting entry for <span className="font-bold">{selectedEntry?.studentName}</span> ({selectedEntry?.registerNumber})?
          </p>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Mandatory Reason for Cancellation *
            </label>
            <textarea
              required
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Student opted for day scholar / duplicate request / invalid eligibility..."
              className="w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t">
            <button
              type="button"
              onClick={() => setIsCancelModalOpen(false)}
              className="px-4 py-2 border rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Keep Entry
            </button>
            <button
              type="submit"
              disabled={submittingCancel}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold disabled:opacity-50"
            >
              {submittingCancel ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* 3. REORDER PRIORITY MODAL */}
      {/* ========================================================= */}
      <Modal
        isOpen={isPriorityModalOpen}
        onClose={() => setIsPriorityModalOpen(false)}
        title="Adjust Queue Priority Rank"
      >
        <form onSubmit={handleUpdatePriority} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              New Priority Rank (Integer) *
            </label>
            <input
              type="number"
              min={1}
              required
              value={newPriority}
              onChange={(e) => setNewPriority(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border rounded-lg text-xs font-mono focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Mandatory Reason for Rank Adjustment (Audit Trail) *
            </label>
            <textarea
              required
              rows={3}
              value={priorityReason}
              onChange={(e) => setPriorityReason(e.target.value)}
              placeholder="e.g. Academic merit priority / Special medical accommodation approved by Warden..."
              className="w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t">
            <button
              type="button"
              onClick={() => setIsPriorityModalOpen(false)}
              className="px-4 py-2 border rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingPriority}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold disabled:opacity-50"
            >
              {submittingPriority ? 'Saving...' : 'Update Priority'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* 4. EXCEPTIONAL ALLOCATION MODAL */}
      {/* ========================================================= */}
      <Modal
        isOpen={isAllocateModalOpen}
        onClose={() => setIsAllocateModalOpen(false)}
        title="Process Exceptional Allocation"
      >
        <form onSubmit={handleExceptionalAllocate} className="space-y-4">
          <div className="p-3 bg-amber-50 rounded-lg text-xs text-amber-900 border border-amber-200">
            <p className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Direct Administrative Allocation
            </p>
            <p className="text-[11px] text-amber-800 mt-1">
              This action immediately assigns a bed to {selectedEntry?.studentName} ({selectedEntry?.registerNumber}) and bypasses normal queue wait time. An audit record is permanently kept.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Select Room with Available Bed *
            </label>
            <select
              required
              value={allocateRoomId}
              onChange={(e) => setAllocateRoomId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">-- Choose an available room --</option>
              {eligibleRooms.map((r) => (
                <option key={r.id} value={r.id}>
                  Room {r.roomNumber} ({r.roomTypeName} {r.isAc ? 'AC' : 'Non-AC'}) &bull; Floor {r.floorNumber} &bull; {r.availableBeds} beds available
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Mandatory Allocation Reason (Audit Trail) *
            </label>
            <textarea
              required
              rows={3}
              value={allocateReason}
              onChange={(e) => setAllocateReason(e.target.value)}
              placeholder="e.g. Authorized by Principal / Sports quota accommodation / Emergency assignment..."
              className="w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t">
            <button
              type="button"
              onClick={() => setIsAllocateModalOpen(false)}
              className="px-4 py-2 border rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingAllocate}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold disabled:opacity-50"
            >
              {submittingAllocate ? 'Allocating...' : 'Confirm Allocation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WaitingPoolAdmin;
