import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { studentApi } from '../../api/studentApi';
import { allocationApi, bookingApi } from '../../api/allocationApi';
import { Student } from '../../types/student';
import { Allocation, BookingStatusResponse } from '../../types/allocation';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  User,
  Home,
  CheckCircle,
  Clock,
  Bell,
  Sparkles,
  Bed,
  ArrowRight,
  ShieldCheck,
  DoorOpen,
  Calendar,
  AlertCircle
} from 'lucide-react';
import useNotifications from '../../hooks/useNotifications';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { unreadCount, notifications } = useNotifications();
  
  const [student, setStudent] = useState<Student | null>(null);
  const [allocation, setAllocation] = useState<Allocation | null>(null);
  const [bookingStatus, setBookingStatus] = useState<BookingStatusResponse | null>(null);
  const [roomStats, setRoomStats] = useState<{ totalRooms: number; totalBeds: number; occupiedBeds: number; availableBeds: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [studentRes, allocationRes, bookingRes, roomsRes] = await Promise.allSettled([
          studentApi.getProfile(),
          allocationApi.getMyAllocation(),
          bookingApi.getStatus(),
          bookingApi.getPhaseTwoRooms()
        ]);

        if (studentRes.status === 'fulfilled' && studentRes.value?.data) {
          setStudent(studentRes.value.data);
        }
        if (allocationRes.status === 'fulfilled' && allocationRes.value?.data) {
          setAllocation(allocationRes.value.data);
        }
        if (bookingRes.status === 'fulfilled' && bookingRes.value?.data) {
          setBookingStatus(bookingRes.value.data);
          if (bookingRes.value.data.allocation) {
            setAllocation(bookingRes.value.data.allocation);
          }
        }
        if (roomsRes.status === 'fulfilled' && roomsRes.value?.data) {
          const rooms = roomsRes.value.data;
          const totalRooms = rooms.length;
          const totalBeds = rooms.reduce((s, r) => s + (r.effectiveCapacity || r.capacity || 0), 0);
          const occupiedBeds = rooms.reduce((s, r) => s + (r.occupiedBeds || 0), 0);
          const availableBeds = rooms.reduce((s, r) => s + Math.max(0, (r.effectiveCapacity || r.capacity || 0) - (r.occupiedBeds || 0)), 0);
          setRoomStats({ totalRooms, totalBeds, occupiedBeds, availableBeds });
        }
      } catch (error) {
        console.error('Failed to load student dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="py-12"><LoadingSpinner size="lg" text="Loading SEC Hostel dashboard..." /></div>;
  }

  // Determine portal: /girls route, female student profile, or female user account
  const isGirls = location.pathname.startsWith('/girls') || (student?.gender === 'FEMALE') || (user?.gender === 'FEMALE');

  const theme = isGirls ? {
    portalName: 'GIRLS HOSTEL',
    portalSub: 'Girls Student Accommodation Portal',
    bannerBg: 'from-pink-600 via-fuchsia-700 to-purple-800',
    primaryBg: 'bg-fuchsia-600 hover:bg-fuchsia-700',
    accentText: 'text-fuchsia-700',
    badge: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300',
    cardBorder: 'border-fuchsia-100',
    iconBg: 'bg-fuchsia-100 text-fuchsia-700',
    lightBg: 'bg-fuchsia-50/50',
    buttonOutline: 'border-fuchsia-300 text-fuchsia-700 hover:bg-fuchsia-50'
  } : {
    portalName: 'BOYS HOSTEL',
    portalSub: 'Boys Student Accommodation Portal',
    bannerBg: 'from-blue-700 via-indigo-700 to-blue-900',
    primaryBg: 'bg-blue-600 hover:bg-blue-700',
    accentText: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-800 border-blue-300',
    cardBorder: 'border-blue-100',
    iconBg: 'bg-blue-100 text-blue-700',
    lightBg: 'bg-blue-50/50',
    buttonOutline: 'border-blue-300 text-blue-700 hover:bg-blue-50'
  };

  const bookingLink = isGirls ? '/girls/booking' : '/boys/booking';
  const waitlistLink = isGirls ? '/girls/waiting-pool' : '/boys/waiting-pool';

  // Compute Next Action dynamically based on live requirements
  let nextAction = {
    title: 'Room Allocation Portal',
    badge: 'Window Inactive',
    badgeColor: 'bg-gray-100 text-gray-800 border-gray-300',
    description: 'The room booking window is currently not active. Please check the schedule announcements for upcoming dates.',
    btnText: 'View Phase Schedules',
    btnLink: bookingLink,
    icon: Clock
  };

  if (allocation || bookingStatus?.allocation) {
    const alloc = allocation || bookingStatus?.allocation;
    nextAction = {
      title: `Room Booked: Room ${alloc?.roomNumber}, Bed #${alloc?.bedNumber}`,
      badge: 'Allocation Confirmed',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      description: `Your accommodation in ${alloc?.hostelName || 'SEC Hostel'} is confirmed (${alloc?.roomTypeName || 'Assigned Room'}). You can view your room pass or review details.`,
      btnText: 'View Room Pass',
      btnLink: bookingLink,
      icon: CheckCircle
    };
  } else if (bookingStatus?.waitlistEntry) {
    const wl = bookingStatus.waitlistEntry;
    if (wl.status === 'OFFERED') {
      nextAction = {
        title: `Exclusive Room Offer: Room ${wl.offeredRoomNumber || ''}`,
        badge: 'Action Required',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300 ring-2 ring-amber-400',
        description: `You have received a provisional bed offer in Room ${wl.offeredRoomNumber || ''}. Accept before the deadline to lock your room!`,
        btnText: 'Respond to Offer Now',
        btnLink: bookingLink,
        icon: Sparkles
      };
    } else {
      nextAction = {
        title: `Waiting List: Position #${wl.queuePosition || 1}`,
        badge: 'In Waiting Queue',
        badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        description: `You are in the waiting queue. Top compatible candidates are automatically promoted in real-time as beds are released.`,
        btnText: 'Check Waiting List Status',
        btnLink: waitlistLink,
        icon: Clock
      };
    }
  } else if (bookingStatus?.effectivePhase2Status === 'OPEN' || bookingStatus?.phase2Status === 'OPEN') {
    nextAction = {
      title: 'Phase 2: Book Your Room',
      badge: 'Live Booking Open',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse',
      description: 'Phase 2 live room selection is now active! Browse available rooms, select your bed, assign roommates if desired, and confirm your booking.',
      btnText: 'Book Your Room Now',
      btnLink: bookingLink,
      icon: Home
    };
  } else if (bookingStatus?.hasSubmittedPhase1) {
    nextAction = {
      title: 'Phase 1 Submitted - Waiting for Phase 2',
      badge: 'Phase 1 Recorded',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
      description: `Your choice for "${bookingStatus.phase1Preference?.preferredRoomTypeName || 'Selected Room Type'}" has been saved. Phase 2 live room selection will open according to schedule.`,
      btnText: 'Edit / View Preference',
      btnLink: bookingLink,
      icon: CheckCircle
    };
  } else if (bookingStatus?.effectivePhase1Status === 'OPEN' || bookingStatus?.phase1Status === 'OPEN') {
    nextAction = {
      title: 'Phase 1: Select Room Preference',
      badge: 'Phase 1 Open',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300 animate-pulse',
      description: 'Phase 1 room preference selection is now open. Submit your room category and floor preference before the deadline.',
      btnText: 'Submit Room Preference',
      btnLink: bookingLink,
      icon: Sparkles
    };
  }

  const ActionIcon = nextAction.icon;

  return (
    <div className="space-y-6">
      {/* 1. Portal Welcome Banner */}
      <div className={`bg-gradient-to-r ${theme.bannerBg} rounded-2xl p-6 sm:p-8 text-white shadow-md`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 backdrop-blur-xs border border-white/30">
                {theme.portalName}
              </span>
              <span className="text-white/80 text-xs">SEC Hostel Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, {student?.name || user?.name || user?.email?.split('@')[0]}!
            </h1>
            <p className="text-white/85 text-xs sm:text-sm mt-1 max-w-xl">
              {theme.portalSub} — Manage your room preferences, real-time booking, and hostel accommodation.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20">
              <span className="text-[11px] text-white/70 block uppercase tracking-wider">Current Status</span>
              <span className="text-sm font-black text-white">
                {allocation ? 'ROOM ASSIGNED' : bookingStatus?.waitlistEntry ? 'WAITING LIST' : bookingStatus?.hasSubmittedPhase1 ? 'PHASE 1 SUBMITTED' : 'NOT BOOKED'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC NEXT ACTION HERO CARD */}
      <div className="bg-white rounded-2xl border-2 border-indigo-100 shadow-md p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl ${theme.iconBg} flex items-center justify-center font-bold flex-shrink-0 shadow-xs`}>
              <ActionIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${nextAction.badgeColor}`}>
                  {nextAction.badge}
                </span>
                <span className="text-xs text-gray-400 font-medium">Recommended Next Step</span>
              </div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">
                {nextAction.title}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl">
                {nextAction.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              to={nextAction.btnLink}
              className={`inline-flex items-center gap-2 py-3 px-6 rounded-xl text-sm font-black text-white shadow-md transition transform hover:-translate-y-0.5 ${theme.primaryBg}`}
            >
              <span>{nextAction.btnText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. REAL-TIME ROOM AVAILABILITY STATS (ACCURATE DATABASE DATA) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Total Rooms</span>
            <DoorOpen className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2">
            {roomStats?.totalRooms ?? '—'}
          </div>
          <span className="text-[11px] text-gray-400">Configured in hostel</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Total Bed Capacity</span>
            <Bed className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2">
            {roomStats?.totalBeds ?? '—'}
          </div>
          <span className="text-[11px] text-gray-400">Effective bed space</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Occupied Beds</span>
            <CheckCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">
            {roomStats?.occupiedBeds ?? '—'}
          </div>
          <span className="text-[11px] text-gray-400">Allocated to students</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Available Beds</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">
            {roomStats?.availableBeds ?? '—'}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold">Available for booking</span>
        </div>
      </div>

      {/* 4. 8-Stage Student Workflow Tracker */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span>Room Allocation Progress (8-Stage Workflow)</span>
            </h2>
            <p className="text-xs text-gray-500">Live tracker of your SEC Hostel booking progression</p>
          </div>
          <Link
            to={bookingLink}
            className={`inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold text-white transition shadow-xs ${theme.primaryBg}`}
          >
            Booking Center <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Stages Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 pt-1">
          {[
            { num: 1, label: 'Window Open', isDone: true, isCurrent: !bookingStatus?.hasSubmittedPhase1 },
            { num: 2, label: 'Phase 1 Preference', isDone: Boolean(bookingStatus?.hasSubmittedPhase1), isCurrent: Boolean(bookingStatus?.hasSubmittedPhase1 && bookingStatus?.phase2Status !== 'OPEN') },
            { num: 3, label: 'Phase 2 Wait', isDone: bookingStatus?.phase2Status === 'OPEN' || Boolean(allocation), isCurrent: Boolean(bookingStatus?.hasSubmittedPhase1 && bookingStatus?.phase2Status !== 'OPEN') },
            { num: 4, label: 'Select Room', isDone: Boolean(allocation), isCurrent: Boolean(bookingStatus?.phase2Status === 'OPEN' && !allocation) },
            { num: 5, label: 'Add Roommates', isDone: Boolean(allocation), isCurrent: Boolean(bookingStatus?.phase2Status === 'OPEN' && !allocation) },
            { num: 6, label: 'Confirm Booking', isDone: Boolean(allocation), isCurrent: Boolean(bookingStatus?.phase2Status === 'OPEN' && !allocation) },
            { num: 7, label: 'Room Assigned', isDone: Boolean(allocation), isCurrent: Boolean(allocation) },
            { num: 8, label: 'Room Details', isDone: Boolean(allocation), isCurrent: Boolean(allocation) },
          ].map((s) => (
            <div
              key={s.num}
              className={`p-2.5 rounded-xl border text-center transition ${
                s.isDone
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : s.isCurrent
                  ? 'bg-blue-50 border-blue-300 text-blue-900 ring-2 ring-blue-500/20'
                  : 'bg-gray-50 border-gray-100 text-gray-400'
              }`}
            >
              <div className="flex items-center justify-center mb-1">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                    s.isDone ? 'bg-emerald-600 text-white' : s.isCurrent ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {s.isDone ? '✓' : s.num}
                </span>
              </div>
              <span className="text-[11px] font-bold leading-tight block">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Detailed Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* CARD 1: Student Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl ${theme.iconBg} flex items-center justify-center font-bold`}>
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Student Profile</h3>
                  <span className="text-[11px] text-gray-500">Academic & Hostel Record</span>
                </div>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${theme.badge}`}>
                {student?.gender || (isGirls ? 'FEMALE' : 'MALE')}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Full Name</span>
                <span className="text-gray-900 font-bold">{student?.name || user?.name || 'Student'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Register Number</span>
                <span className="text-gray-900 font-mono font-semibold">{student?.registerNumber || 'REG-PENDING'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Department</span>
                <span className="text-gray-900 font-semibold">{student?.department || 'Engineering'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Academic Year</span>
                <span className="text-gray-900 font-semibold">{student?.year ? `Year ${student.year}` : '1st Year'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Email</span>
                <span className="text-gray-900 font-medium truncate max-w-[180px]">{student?.email || user?.email}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500 font-medium">Previous Room</span>
                <span className="text-gray-900 font-medium">{student?.previousRoomNumber || 'None / First Year'}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">SEC Hostel ID Verified</span>
            <Link to="/student/profile" className={`text-xs font-bold ${theme.accentText} hover:underline`}>
              Edit Profile →
            </Link>
          </div>
        </div>

        {/* CARD 2: Current Booking / Allocation Details */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl ${theme.iconBg} flex items-center justify-center font-bold`}>
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Room Allocation</h3>
                  <span className="text-[11px] text-gray-500">Assigned Bed & Hostel</span>
                </div>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${allocation ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300'}`}>
                {allocation ? 'ASSIGNED' : 'UNALLOCATED'}
              </span>
            </div>

            {allocation ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                  <span className="text-[11px] text-emerald-700 font-semibold block uppercase tracking-wide">Allocated Room</span>
                  <div className="text-2xl font-black text-emerald-900">{allocation.roomNumber}</div>
                  <span className="text-xs text-emerald-800 font-medium">Bed #{allocation.bedNumber} • Floor {allocation.floorNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500 font-medium">Hostel Campus</span>
                  <span className="text-gray-900 font-bold">{allocation.hostelName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500 font-medium">Room Category</span>
                  <span className="text-gray-900 font-semibold">{allocation.roomTypeName}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500 font-medium">Allocation Mode</span>
                  <span className="text-gray-900 font-semibold">{allocation.allocationType}</span>
                </div>
              </div>
            ) : bookingStatus?.hasSubmittedPhase1 ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-center">
                  <span className="text-[11px] text-blue-700 font-semibold block uppercase tracking-wide">Phase 1 Preference Saved</span>
                  <div className="text-lg font-black text-blue-900 mt-1">{bookingStatus.phase1Preference?.preferredRoomTypeName}</div>
                  <span className="text-xs text-blue-700 font-medium">{bookingStatus.phase1Preference?.isAc ? 'AC Room' : 'Non-AC Room'}</span>
                </div>
                <p className="text-[11px] text-gray-500 text-center pt-2">
                  You can edit your preference before Phase 1 closes, or proceed to Phase 2 for live bed booking.
                </p>
              </div>
            ) : (
              <div className="py-4 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2 border border-amber-200">
                  <Clock className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-gray-800">No Room Allocated Yet</p>
                <p className="text-[11px] text-gray-500">
                  Participate in Phase 1 preference selection or Phase 2 live booking to secure your room.
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 pt-3 border-t border-gray-100">
            <Link
              to={bookingLink}
              className={`w-full inline-flex justify-center items-center py-2 px-3 rounded-xl text-xs font-bold border transition ${theme.buttonOutline}`}
            >
              {allocation ? 'View Allocation Pass' : 'Open Booking Portal'}
            </Link>
          </div>
        </div>

        {/* CARD 3: Notifications & System Announcements */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl ${theme.iconBg} flex items-center justify-center font-bold`}>
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                  <span className="text-[11px] text-gray-500">Alerts & Status Updates</span>
                </div>
              </div>
              {unreadCount > 0 && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                  {unreadCount} New
                </span>
              )}
            </div>

            <div className="space-y-2.5 max-h-48 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-400">
                  No notifications yet. You are all caught up!
                </div>
              ) : (
                notifications.slice(0, 3).map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl border text-xs transition ${
                      !n.isRead ? 'bg-indigo-50/50 border-indigo-100' : 'bg-gray-50/60 border-gray-100'
                    }`}
                  >
                    <div className="font-bold text-gray-900 truncate">{n.title}</div>
                    <div className="text-[11px] text-gray-600 line-clamp-2 mt-0.5">{n.message}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">Instant notification push</span>
            <Link to="/student/notifications" className={`text-xs font-bold ${theme.accentText} hover:underline`}>
              View All Alerts →
            </Link>
          </div>
        </div>

      </div>

      {/* 6. Quick Actions Grid (Streamlined & Non-Redundant) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">Quick Shortcuts</h3>
            <p className="text-xs text-gray-500">Direct navigation for {theme.portalName}</p>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${theme.badge}`}>
            {theme.portalName}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            to={bookingLink}
            className={`p-4 rounded-xl border ${theme.cardBorder} ${theme.lightBg} hover:shadow-sm transition text-center flex flex-col items-center justify-center group`}
          >
            <div className={`w-10 h-10 rounded-xl ${theme.iconBg} flex items-center justify-center mb-2 group-hover:scale-105 transition`}>
              <Bed className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-900">Room Booking</span>
            <span className="text-[11px] text-gray-500 mt-0.5">Phase 1 & Phase 2</span>
          </Link>

          <Link
            to={isGirls ? '/girls/allocation' : '/boys/allocation'}
            className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 hover:shadow-sm transition text-center flex flex-col items-center justify-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <Home className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-900">My Allocation</span>
            <span className="text-[11px] text-gray-500 mt-0.5">Room pass & details</span>
          </Link>

          <Link
            to={waitlistLink}
            className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 hover:shadow-sm transition text-center flex flex-col items-center justify-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-900">Waiting List</span>
            <span className="text-[11px] text-gray-500 mt-0.5">Queue status & join</span>
          </Link>

          <Link
            to="/student/notifications"
            className="p-4 rounded-xl border border-purple-100 bg-purple-50/40 hover:shadow-sm transition text-center flex flex-col items-center justify-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <Bell className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-900">Notice Board</span>
            <span className="text-[11px] text-gray-500 mt-0.5">Hostel alerts</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
