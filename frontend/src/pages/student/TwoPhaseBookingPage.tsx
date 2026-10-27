import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { bookingApi } from '../../api/allocationApi';
import { roomTypeApi } from '../../api/roomApi';
import { studentApi } from '../../api/studentApi';
import {
  BookingStatusResponse,
  PhaseOnePreferenceResponse,
  ValidateRoommateResponse
} from '../../types/allocation';
import { Room, RoomType } from '../../types/room';
import { Student } from '../../types/student';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import {
  Building2,
  CheckCircle,
  Clock,
  AlertCircle,
  Bed,
  Users,
  Plus,
  Trash2,
  ShieldCheck,
  MapPin,
  Flame,
  ArrowRight,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

export const TwoPhaseBookingPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const [student, setStudent] = useState<Student | null>(null);
  const [bookingStatus, setBookingStatus] = useState<BookingStatusResponse | null>(null);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [roomsLoading, setRoomsLoading] = useState<boolean>(false);

  // Active Tab: 'phase1' | 'phase2'
  const [activeTab, setActiveTab] = useState<'phase1' | 'phase2'>('phase1');

  // Phase 1 form state
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<number | null>(null);
  const [isAcPreference, setIsAcPreference] = useState<boolean>(false);
  const [submittingPhase1, setSubmittingPhase1] = useState<boolean>(false);
  const [showPhase1ConfirmModal, setShowPhase1ConfirmModal] = useState<boolean>(false);

  // Phase 2 state
  const [selectedFloor, setSelectedFloor] = useState<number | ''>('');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [roommateInput, setRoommateInput] = useState<string>('');
  const [roommates, setRoommates] = useState<ValidateRoommateResponse[]>([]);
  const [validatingRoommate, setValidatingRoommate] = useState<boolean>(false);
  const [submittingPhase2, setSubmittingPhase2] = useState<boolean>(false);
  const [showPhase2ConfirmModal, setShowPhase2ConfirmModal] = useState<boolean>(false);

  const isGirls = location.pathname.startsWith('/girls') || (student?.gender === 'FEMALE') || (user?.gender === 'FEMALE');

  const theme = isGirls ? {
    portalName: 'GIRLS HOSTEL',
    portalSub: 'Girls Accommodation Selection Portal',
    bannerBg: 'from-pink-600 via-fuchsia-700 to-purple-800',
    primaryBg: 'bg-fuchsia-600 hover:bg-fuchsia-700',
    accentText: 'text-fuchsia-700',
    border: 'border-fuchsia-200',
    lightBg: 'bg-fuchsia-50/60',
    badge: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300',
    cardSelected: 'border-fuchsia-600 ring-2 ring-fuchsia-500/20 bg-fuchsia-50/40'
  } : {
    portalName: 'BOYS HOSTEL',
    portalSub: 'Boys Accommodation Selection Portal',
    bannerBg: 'from-blue-700 via-indigo-700 to-blue-900',
    primaryBg: 'bg-blue-600 hover:bg-blue-700',
    accentText: 'text-blue-700',
    border: 'border-blue-200',
    lightBg: 'bg-blue-50/60',
    badge: 'bg-blue-100 text-blue-800 border-blue-300',
    cardSelected: 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/40'
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileRes, statusRes, typesRes] = await Promise.all([
        studentApi.getProfile(),
        bookingApi.getStatus(),
        roomTypeApi.getAll()
      ]);

      if (profileRes?.data) setStudent(profileRes.data);
      if (statusRes?.data) {
        setBookingStatus(statusRes.data);
        if (statusRes.data.hasBookedPhase2) {
          setActiveTab('phase2');
        } else if (statusRes.data.phase2Status === 'OPEN' && statusRes.data.hasSubmittedPhase1) {
          setActiveTab('phase2');
        } else {
          setActiveTab('phase1');
        }

        if (statusRes.data.phase1Preference) {
          setSelectedRoomTypeId(Number(statusRes.data.phase1Preference.preferredRoomTypeId));
          setIsAcPreference(statusRes.data.phase1Preference.isAc);
        }
      }
      if (typesRes?.data) {
        setRoomTypes(typesRes.data);
      }
    } catch (err: any) {
      console.error('Failed to load booking system data', err);
      toast.error('Unable to load hostel booking details. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fetch Phase 2 Rooms when Phase 2 is active
  useEffect(() => {
    if (activeTab === 'phase2' && bookingStatus?.phase2Status === 'OPEN' && !bookingStatus.hasBookedPhase2) {
      fetchPhase2Rooms();
    }
  }, [activeTab, selectedFloor, bookingStatus?.phase2Status]);

  const fetchPhase2Rooms = async () => {
    try {
      setRoomsLoading(true);
      const floorParam = selectedFloor !== '' ? Number(selectedFloor) : undefined;
      const res = await bookingApi.getPhaseTwoRooms(floorParam);
      if (res?.data) {
        setAvailableRooms(res.data);
      }
    } catch (err: any) {
      toast.error('Could not load available rooms for Phase 2');
    } finally {
      setRoomsLoading(false);
    }
  };

  const handleSelectRoomType = (type: RoomType) => {
    if (bookingStatus?.phase1Status !== 'OPEN') {
      toast.error('Phase 1 room type preference is currently closed for editing.');
      return;
    }
    setSelectedRoomTypeId(Number(type.id));
    setIsAcPreference(type.isAc);
  };

  const handleSubmitPhase1 = async () => {
    if (!selectedRoomTypeId) {
      toast.error('Please select your preferred room type.');
      return;
    }

    try {
      setSubmittingPhase1(true);
      const res = await bookingApi.submitPhaseOne({
        preferredRoomTypeId: selectedRoomTypeId,
        isAc: isAcPreference
      });

      toast.success('Phase 1 Room Type Preference Saved Successfully!');
      setShowPhase1ConfirmModal(false);
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit Phase 1 preference.');
    } finally {
      setSubmittingPhase1(false);
    }
  };

  const handleValidateRoommate = async () => {
    if (!roommateInput || !roommateInput.trim()) {
      toast.error('Please enter a roommate register number');
      return;
    }

    const reg = roommateInput.trim().toUpperCase();

    // Check if adding self
    if (student?.registerNumber && reg === student.registerNumber.toUpperCase()) {
      toast.error('You cannot add yourself as a roommate');
      return;
    }

    // Check duplicate in list
    if (roommates.some(r => r.registerNumber?.toUpperCase() === reg)) {
      toast.error('Roommate already added to the list');
      return;
    }

    if (!selectedRoom) {
      toast.error('Please select a room first');
      return;
    }

    const maxAllowedRoommates = (selectedRoom.availableBeds || selectedRoom.capacity || 1) - 1;
    if (roommates.length >= maxAllowedRoommates) {
      toast.error(`Maximum allowed roommates for this room is ${maxAllowedRoommates}. (Room capacity limit reached).`);
      return;
    }

    try {
      setValidatingRoommate(true);
      const res = await bookingApi.validateRoommate(reg);
      if (res?.data && res.data.valid) {
        setRoommates([...roommates, res.data]);
        setRoommateInput('');
        toast.success(`Roommate verified: ${res.data.name} (${res.data.registerNumber})`);
      } else {
        toast.error(res?.data?.message || 'Roommate validation failed');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Student register number not found or ineligible.');
    } finally {
      setValidatingRoommate(false);
    }
  };

  const handleRemoveRoommate = (index: number) => {
    const updated = [...roommates];
    updated.splice(index, 1);
    setRoommates(updated);
  };

  const handleBookRoomPhase2 = async () => {
    if (!selectedRoom) {
      toast.error('Please select a room to book');
      return;
    }

    try {
      setSubmittingPhase2(true);
      const roommateRegs = roommates
        .map(r => r.registerNumber)
        .filter((r): r is string => Boolean(r));

      await bookingApi.bookRoomPhaseTwo({
        roomId: Number(selectedRoom.id),
        roommateRegisterNumbers: roommateRegs
      });

      toast.success('Room booked successfully! Allocation confirmed.');
      setShowPhase2ConfirmModal(false);
      setSelectedRoom(null);
      setRoommates([]);
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Room booking failed. Please retry.');
    } finally {
      setSubmittingPhase2(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" text="Loading SEC Hostel Two-Phase Booking..." />
      </div>
    );
  }

  const phase1Status = bookingStatus?.phase1Status || 'NOT_OPEN';
  const phase2Status = bookingStatus?.phase2Status || 'NOT_OPEN';
  const hasBooked = bookingStatus?.hasBookedPhase2;
  const myAllocation = bookingStatus?.allocation;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* 1. Header Banner */}
      <div className={`bg-gradient-to-r ${theme.bannerBg} rounded-2xl p-6 sm:p-8 text-white shadow-md`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 backdrop-blur-xs border border-white/30">
                {theme.portalName}
              </span>
              <span className="text-white/80 text-xs">Saveetha Engineering College</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Two-Phase Room Booking System
            </h1>
            <p className="text-white/85 text-xs sm:text-sm mt-1 max-w-xl">
              {theme.portalSub} — Submit your room type preference in Phase 1, then select your exact floor, room number, and roommates in Phase 2.
            </p>
          </div>

          {/* Phase Control Status Badges */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20">
              <span className="text-[11px] text-white/70 block uppercase tracking-wider font-semibold">Phase 1: Preference</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${phase1Status === 'OPEN' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="text-sm font-black text-white">{phase1Status}</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20">
              <span className="text-[11px] text-white/70 block uppercase tracking-wider font-semibold">Phase 2: Room Selection</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${phase2Status === 'OPEN' ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-sm font-black text-white">{phase2Status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex border-b border-gray-200 bg-white rounded-xl p-1.5 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('phase1')}
          className={`flex-1 py-3 px-4 text-xs sm:text-sm font-bold rounded-lg transition flex items-center justify-center gap-2 ${
            activeTab === 'phase1'
              ? `${theme.primaryBg} text-white shadow-xs`
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Bed className="w-4 h-4" />
          <span>Phase 1: Room Type Preference</span>
          {bookingStatus?.hasSubmittedPhase1 && (
            <span className="ml-1 bg-emerald-500/20 text-emerald-100 text-[10px] px-1.5 py-0.5 rounded-full border border-emerald-400/30">
              Submitted
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('phase2')}
          className={`flex-1 py-3 px-4 text-xs sm:text-sm font-bold rounded-lg transition flex items-center justify-center gap-2 ${
            activeTab === 'phase2'
              ? `${theme.primaryBg} text-white shadow-xs`
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Phase 2: Floor, Room & Roommates</span>
          {hasBooked && (
            <span className="ml-1 bg-emerald-500/20 text-emerald-100 text-[10px] px-1.5 py-0.5 rounded-full border border-emerald-400/30">
              Allocated
            </span>
          )}
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: PHASE 1 (ROOM TYPE PREFERENCE)                     */}
      {/* ======================================================== */}
      {activeTab === 'phase1' && (
        <div className="space-y-6">
          {/* Status Message */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Phase 1: Standard Room Type Selection</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Choose your room type preference from SEC Hostel options. Submissions can be updated anytime while Phase 1 is OPEN.
                </p>
              </div>
              <span className={`px-3 py-1 text-xs font-black rounded-full border self-start sm:self-auto ${
                phase1Status === 'OPEN' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-amber-50 text-amber-700 border-amber-300'
              }`}>
                Phase 1 is {phase1Status}
              </span>
            </div>

            {/* Current saved preference banner if exists */}
            {bookingStatus?.phase1Preference && (
              <div className="mt-4 p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">Your Saved Preference</span>
                    <span className="text-base font-black text-gray-900">
                      {bookingStatus.phase1Preference.preferredRoomTypeName}
                    </span>
                    <span className="text-xs text-gray-600 ml-2">
                      ({bookingStatus.phase1Preference.isAc ? 'Air Conditioned' : 'Non-AC'}, Capacity: {bookingStatus.phase1Preference.capacity} Beds)
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 sm:text-right">
                  <span>Submitted on: {formatDateTime(bookingStatus.phase1Preference.submittedAt)}</span>
                </div>
              </div>
            )}
          </div>

          {/* 10 Standard Room Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roomTypes.map((rt) => {
              const isSelected = selectedRoomTypeId === Number(rt.id);
              return (
                <div
                  key={rt.id}
                  onClick={() => handleSelectRoomType(rt)}
                  className={`cursor-pointer rounded-2xl border p-5 transition relative flex flex-col justify-between ${
                    isSelected ? theme.cardSelected : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        rt.isAc ? 'bg-cyan-100 text-cyan-800 border border-cyan-200' : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                        {rt.isAc ? 'AC Enabled' : 'Non-AC'}
                      </span>
                      <span className="text-xs font-semibold text-gray-500">
                        {rt.capacity} {rt.capacity === 1 ? 'Bed' : 'Beds'}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-gray-900">{rt.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Saveetha Hostel standard {rt.capacity}-occupant room with {rt.isAc ? 'central AC cooling' : 'natural ventilation'}.
                    </p>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-medium">Semester Fee</span>
                      <span className="text-base font-black text-gray-900">{formatCurrency(rt.baseFee)}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-2">
                    <button
                      type="button"
                      disabled={phase1Status !== 'OPEN'}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectRoomType(rt);
                      }}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? `${theme.primaryBg} text-white`
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle className="w-4 h-4" /> Selected Preference
                        </>
                      ) : (
                        'Select This Room Type'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Phase 1 Submit Button */}
          {phase1Status === 'OPEN' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Ready to save your choice?</h4>
                <p className="text-xs text-gray-500">
                  {selectedRoomTypeId
                    ? `Selected: ${roomTypes.find(r => Number(r.id) === selectedRoomTypeId)?.name || 'Selected Room'}`
                    : 'Please pick one of the 10 room types above.'}
                </p>
              </div>
              <button
                type="button"
                disabled={!selectedRoomTypeId || submittingPhase1}
                onClick={() => setShowPhase1ConfirmModal(true)}
                className={`py-2.5 px-6 rounded-xl text-xs sm:text-sm font-bold text-white transition shadow-sm ${
                  selectedRoomTypeId ? theme.primaryBg : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {bookingStatus?.phase1Preference ? 'Update Room Preference' : 'Confirm & Save Preference'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PHASE 2 (FLOOR, ROOM & ROOMMATES)                  */}
      {/* ======================================================== */}
      {activeTab === 'phase2' && (
        <div className="space-y-6">
          {/* Phase 2 Allocated Confirmation Card if already booked */}
          {hasBooked && myAllocation && (
            <div className="bg-white rounded-2xl border border-emerald-200 shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-5 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs font-bold">
                      <CheckCircle className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-100 block">
                        SEC Hostel Room Assigned
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black">
                        Room {myAllocation.roomNumber} — Bed {myAllocation.bedNumber}
                      </h2>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-emerald-800">
                    CONFIRMED
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="text-[11px] font-semibold text-gray-500 block">Hostel Block</span>
                    <span className="text-sm font-bold text-gray-900">{myAllocation.hostelName}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="text-[11px] font-semibold text-gray-500 block">Floor Number</span>
                    <span className="text-sm font-bold text-gray-900">Floor {myAllocation.floorNumber}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="text-[11px] font-semibold text-gray-500 block">Room Type</span>
                    <span className="text-sm font-bold text-gray-900">{myAllocation.roomTypeName}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="text-[11px] font-semibold text-gray-500 block">Allocated On</span>
                    <span className="text-xs font-bold text-gray-900">{formatDateTime(myAllocation.allocatedAt)}</span>
                  </div>
                </div>

                {/* Roommates sharing this room */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>Roommates Sharing Room {myAllocation.roomNumber}</span>
                  </h3>

                  {bookingStatus.roommates && bookingStatus.roommates.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {bookingStatus.roommates.map((rm) => (
                        <div key={rm.id} className="p-3 rounded-xl border border-gray-200 bg-white shadow-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-gray-900 truncate">{rm.studentName}</span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                              Bed {rm.bedNumber}
                            </span>
                          </div>
                          <span className="text-[11px] text-gray-500 font-mono block">Reg: {rm.registerNumber}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-500">
                      You are currently the first occupant in this room. Other beds will be assigned as roommates complete Phase 2.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Phase 2 Closed Notice */}
          {!hasBooked && phase2Status !== 'OPEN' && (
            <div className="bg-white rounded-2xl border border-amber-200 p-8 text-center shadow-xs">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-amber-200">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Phase 2 Room Selection is Currently Closed</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto mt-1 leading-relaxed">
                Phase 2 (floor, room number, and roommate selection) will open once the hostel administration reviews Phase 1 submissions. Please check back shortly.
              </p>
            </div>
          )}

          {/* Phase 2 Booking Active Workflow */}
          {!hasBooked && phase2Status === 'OPEN' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Room Filter & List (2 cols) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Select Permitted Room</h2>
                    <p className="text-xs text-gray-500">
                      Rooms in {theme.portalName} with available bed capacity.
                    </p>
                  </div>

                  {/* Floor Filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-600">Floor:</span>
                    <select
                      value={selectedFloor}
                      onChange={(e) => setSelectedFloor(e.target.value === '' ? '' : Number(e.target.value))}
                      className="text-xs font-semibold rounded-xl border border-gray-300 py-1.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Floors</option>
                      <option value="1">Floor 1</option>
                      <option value="2">Floor 2</option>
                      <option value="3">Floor 3</option>
                      <option value="4">Floor 4</option>
                    </select>
                  </div>
                </div>

                {roomsLoading ? (
                  <div className="py-12 flex justify-center bg-white rounded-2xl border border-gray-200">
                    <LoadingSpinner size="md" text="Loading available rooms..." />
                  </div>
                ) : availableRooms.length === 0 ? (
                  <div className="py-12 text-center bg-white rounded-2xl border border-gray-200 p-6">
                    <Bed className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-gray-800">No rooms currently available on this filter</p>
                    <p className="text-xs text-gray-500 mt-1">Try selecting All Floors or check back soon.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {availableRooms.map((room) => {
                      const isSelected = selectedRoom?.id === room.id;
                      const totalBeds = room.capacity || 4;
                      const available = room.availableBeds;
                      const occupied = room.occupiedBeds || 0;
                      const occupancyPercent = Math.min(100, Math.round((occupied / totalBeds) * 100));

                      return (
                        <div
                          key={room.id}
                          onClick={() => {
                            setSelectedRoom(room);
                            setRoommates([]);
                          }}
                          className={`cursor-pointer rounded-2xl border p-4 transition flex flex-col justify-between ${
                            isSelected ? theme.cardSelected : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-xs'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                                <Building2 className="w-4 h-4 text-blue-600" /> Room {room.roomNumber}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                room.isAc ? 'bg-cyan-100 text-cyan-800' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {room.isAc ? 'AC' : 'Non-AC'}
                              </span>
                            </div>

                            <p className="text-xs text-gray-500">
                              {room.building || 'Main Block'} • Floor {room.floorNumber} • {room.roomTypeName}
                            </p>

                            {/* Remaining Capacity Bar */}
                            <div className="mt-4 pt-3 border-t border-gray-100">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="font-semibold text-gray-600">Bed Availability</span>
                                <span className="font-black text-emerald-700">
                                  {available} of {totalBeds} Beds Free
                                </span>
                              </div>
                              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all ${
                                    occupancyPercent >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${occupancyPercent}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="mt-4">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRoom(room);
                                setRoommates([]);
                              }}
                              className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition ${
                                isSelected ? `${theme.primaryBg} text-white` : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {isSelected ? 'Room Selected' : 'Choose Room'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Roommate Selection & Booking Form */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
                  <h3 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100">
                    Room Booking Details
                  </h3>

                  {selectedRoom ? (
                    <div className="space-y-4">
                      {/* Selected Room Summary */}
                      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Selected Room</span>
                          <span className="font-bold text-gray-900">{selectedRoom.roomNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Room Type</span>
                          <span className="font-semibold text-gray-800">{selectedRoom.roomTypeName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Available Beds</span>
                          <span className="font-bold text-emerald-700">{selectedRoom.availableBeds} Free Beds</span>
                        </div>
                      </div>

                      {/* Roommate Input Section */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-xs font-bold text-gray-700">Add Roommates (Optional)</label>
                          <span className="text-[11px] text-gray-500">
                            Allowed: {(selectedRoom.availableBeds || 1) - 1} max
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Enter Register Number"
                            value={roommateInput}
                            onChange={(e) => setRoommateInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleValidateRoommate()}
                            className="flex-1 uppercase font-mono text-xs py-2 px-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            disabled={validatingRoommate}
                            onClick={handleValidateRoommate}
                            className="py-2 px-3 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Verify
                          </button>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 block">
                          Roommate must be of the same gender and enrolled in SEC Hostel.
                        </span>
                      </div>

                      {/* Roommates List */}
                      {roommates.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-gray-700 block">Verified Roommates:</span>
                          {roommates.map((rm, idx) => (
                            <div
                              key={rm.studentId || idx}
                              className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between text-xs"
                            >
                              <div>
                                <span className="font-bold text-gray-900 block">{rm.name}</span>
                                <span className="text-[11px] font-mono text-gray-500">
                                  {rm.registerNumber} • {rm.department} (Yr {rm.year})
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveRoommate(idx)}
                                className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded-lg transition"
                                title="Remove roommate"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Total occupants summary */}
                      <div className="pt-2 border-t border-gray-100 text-xs flex justify-between font-bold">
                        <span className="text-gray-600">Total Group Occupants:</span>
                        <span className="text-blue-700">{1 + roommates.length} of {selectedRoom.availableBeds} beds needed</span>
                      </div>

                      {/* Submit Room Booking */}
                      <button
                        type="button"
                        onClick={() => setShowPhase2ConfirmModal(true)}
                        className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-white transition shadow-sm ${theme.primaryBg}`}
                      >
                        Confirm & Book Room {selectedRoom.roomNumber}
                      </button>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs text-gray-400">
                      Please pick a room from the available rooms list on the left to begin booking.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: PHASE 1 CONFIRMATION MODAL                      */}
      {/* ======================================================== */}
      {showPhase1ConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className={`w-10 h-10 rounded-xl ${theme.lightBg} ${theme.accentText} flex items-center justify-center font-bold`}>
                <Bed className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Confirm Room Type Preference</h3>
                <span className="text-xs text-gray-500">Phase 1 Selection</span>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              You are selecting: <strong className="text-gray-900">{roomTypes.find(r => Number(r.id) === selectedRoomTypeId)?.name}</strong>.
              You may edit this preference at any time until Phase 1 closes.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPhase1ConfirmModal(false)}
                className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingPhase1}
                onClick={handleSubmitPhase1}
                className={`flex-1 py-2.5 px-4 text-white text-xs font-bold rounded-xl transition ${theme.primaryBg}`}
              >
                {submittingPhase1 ? 'Saving...' : 'Save Preference'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: PHASE 2 CONFIRMATION MODAL                      */}
      {/* ======================================================== */}
      {showPhase2ConfirmModal && selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className={`w-10 h-10 rounded-xl ${theme.lightBg} ${theme.accentText} flex items-center justify-center font-bold`}>
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Confirm Room Booking</h3>
                <span className="text-xs text-gray-500">Atomic Room Reservation</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 text-xs space-y-1.5 border border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-500">Room Number</span>
                <span className="font-bold text-gray-900">Room {selectedRoom.roomNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Floor</span>
                <span className="font-semibold text-gray-800">Floor {selectedRoom.floorNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Room Type</span>
                <span className="font-semibold text-gray-800">{selectedRoom.roomTypeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Students to Allocate</span>
                <span className="font-bold text-blue-700">{1 + roommates.length} Students</span>
              </div>
            </div>

            {roommates.length > 0 && (
              <div className="text-xs">
                <span className="font-bold text-gray-700 block mb-1">Roommates included in booking:</span>
                <ul className="list-disc list-inside text-gray-600 space-y-0.5 text-[11px]">
                  {roommates.map((r, i) => (
                    <li key={i}>{r.name} ({r.registerNumber})</li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-[11px] text-gray-500 leading-relaxed">
              By confirming, beds in Room {selectedRoom.roomNumber} will be immediately reserved and assigned in the database for you and your specified roommates.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPhase2ConfirmModal(false)}
                className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
              >
                Back
              </button>
              <button
                type="button"
                disabled={submittingPhase2}
                onClick={handleBookRoomPhase2}
                className={`flex-1 py-2.5 px-4 text-white text-xs font-bold rounded-xl transition ${theme.primaryBg}`}
              >
                {submittingPhase2 ? 'Booking...' : 'Confirm & Book Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TwoPhaseBookingPage;
