import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { studentApi } from '../../api/studentApi';
import { groupApi } from '../../api/groupApi';
import { allocationApi } from '../../api/allocationApi';
import { Student } from '../../types/student';
import { Group } from '../../types/group';
import { Allocation } from '../../types/allocation';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  User,
  Users,
  Home,
  CheckCircle,
  Clock,
  Bell,
  Sparkles,
  Bed
} from 'lucide-react';
import useNotifications from '../../hooks/useNotifications';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { unreadCount, notifications } = useNotifications();
  
  const [student, setStudent] = useState<Student | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [allocation, setAllocation] = useState<Allocation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [studentRes, groupRes, allocationRes] = await Promise.allSettled([
          studentApi.getProfile(),
          groupApi.getMyGroup(),
          allocationApi.getMyAllocation()
        ]);

        if (studentRes.status === 'fulfilled' && studentRes.value?.data) {
          setStudent(studentRes.value.data);
        }
        if (groupRes.status === 'fulfilled' && groupRes.value?.data) {
          setGroup(groupRes.value.data);
        }
        if (allocationRes.status === 'fulfilled' && allocationRes.value?.data) {
          setAllocation(allocationRes.value.data);
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

  const getStageNumber = () => {
    if (allocation) return 4;
    if (group?.status === 'APPROVED' || group?.status === 'SUBMITTED') return 3;
    if (group) return 2;
    return 1;
  };

  const currentStage = getStageNumber();

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
              {theme.portalSub} — Manage your group members, preferences, and real-time room allocation status.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20">
              <span className="text-[11px] text-white/70 block uppercase tracking-wider">Allocation Status</span>
              <span className="text-sm font-black text-white">
                {allocation ? 'ROOM ASSIGNED' : student?.allocationStatus ? String(student.allocationStatus).replace('_', ' ') : 'IN PROCESS'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 7 Required Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* CARD 1: Profile Card */}
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
                <span className="text-gray-500 font-medium">Contact</span>
                <span className="text-gray-900 font-medium">{student?.phone || 'Not provided'}</span>
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

        {/* CARD 2: Room Preference Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl ${theme.iconBg} flex items-center justify-center font-bold`}>
                  <Bed className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Room Preference</h3>
                  <span className="text-[11px] text-gray-500">Choice & Specifications</span>
                </div>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Saved
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Hostel Campus</span>
                <span className="text-gray-900 font-bold">{isGirls ? 'Girls Hostel (Block C/D)' : 'Boys Hostel (Block A/B)'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Room Type</span>
                <span className="text-gray-900 font-semibold">{group?.preferredRoomType || '4-Sharing Non-AC'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Floor Preference</span>
                <span className="text-gray-900 font-semibold">Floors 1 - 3</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Air Conditioning</span>
                <span className="text-gray-900 font-semibold">Standard Air Flow</span>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-50 text-[11px] text-gray-600 mt-2">
                Room preferences are prioritized according to group readiness and registration timestamps.
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-gray-100">
            <Link
              to="/student/group"
              className={`w-full inline-flex justify-center items-center py-2 px-3 rounded-xl text-xs font-bold border transition ${theme.buttonOutline}`}
            >
              Modify Preference Settings
            </Link>
          </div>
        </div>

        {/* CARD 3: Group Status Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl ${theme.iconBg} flex items-center justify-center font-bold`}>
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Group Status</h3>
                  <span className="text-[11px] text-gray-500">Roommate Grouping</span>
                </div>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${theme.badge}`}>
                {group ? String(group.status) : 'NO GROUP'}
              </span>
            </div>

            {group ? (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500 font-medium">Group Name</span>
                  <span className="text-gray-900 font-bold">{group.groupName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500 font-medium">Group Leader</span>
                  <span className="text-gray-900 font-semibold">{group.leaderName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500 font-medium">Group Members</span>
                  <span className="text-gray-900 font-bold">{group.currentSize} / {group.maxSize} Confirmed</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 my-2">
                  <div
                    className={`h-2 rounded-full ${isGirls ? 'bg-fuchsia-600' : 'bg-blue-600'}`}
                    style={{ width: `${Math.min(100, (group.currentSize / (group.maxSize || 4)) * 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-gray-500">
                  {group.currentSize >= group.maxSize
                    ? 'Group is complete and locked for allocation.'
                    : `Invite ${group.maxSize - group.currentSize} more roommate(s) to finalize group.`}
                </p>
              </div>
            ) : (
              <div className="text-center py-4 space-y-2">
                <div className="text-xs text-gray-500">You are not part of any roommate group yet.</div>
                <p className="text-[11px] text-gray-400">Form a group with your friends or join an existing group with an invite code.</p>
              </div>
            )}
          </div>

          <div className="mt-5 pt-3 border-t border-gray-100">
            <Link
              to="/student/group"
              className={`w-full inline-flex justify-center items-center py-2 px-3 rounded-xl text-xs font-bold text-white transition ${theme.primaryBg}`}
            >
              {group ? 'Manage Roommates' : 'Create or Join Group'}
            </Link>
          </div>
        </div>

        {/* CARD 4: Application Status Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl ${theme.iconBg} flex items-center justify-center font-bold`}>
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Application Status</h3>
                  <span className="text-[11px] text-gray-500">Enrollment Progression</span>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                Step {currentStage} of 4
              </span>
            </div>

            {/* Stepper */}
            <div className="space-y-3 text-xs my-2">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">✓</div>
                <div className="flex-1">
                  <div className="font-bold text-gray-900">Student Registered</div>
                  <div className="text-[10px] text-gray-500">Account verified with SEC register ID</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${currentStage >= 2 ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {currentStage >= 2 ? '✓' : '2'}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-900">Group Enrollment</div>
                  <div className="text-[10px] text-gray-500">{group ? 'Group formed and synchronized' : 'Awaiting group completion'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${currentStage >= 3 ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {currentStage >= 3 ? '✓' : '3'}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-900">Warden Verification</div>
                  <div className="text-[10px] text-gray-500">Hostel office eligibility review</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${currentStage >= 4 ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {currentStage >= 4 ? '✓' : '4'}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-900">Room Allocation</div>
                  <div className="text-[10px] text-gray-500">{allocation ? 'Room and bed assigned' : 'Scheduled in allocation run'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
            <span>Window: Fall 2026</span>
            <span className="font-bold text-gray-700">Official Portal Process</span>
          </div>
        </div>

        {/* CARD 5: Allocation Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl ${theme.iconBg} flex items-center justify-center font-bold`}>
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Room Allocation</h3>
                  <span className="text-[11px] text-gray-500">Hostel & Room Details</span>
                </div>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${allocation ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300'}`}>
                {allocation ? 'ASSIGNED' : 'IN QUEUE'}
              </span>
            </div>

            {allocation ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                  <span className="text-[11px] text-emerald-700 font-semibold block uppercase tracking-wide">Assigned Room</span>
                  <div className="text-2xl font-black text-emerald-900">{allocation.roomNumber}</div>
                  <span className="text-xs text-emerald-800 font-medium">Bed #{allocation.bedNumber} • Floor {allocation.floorNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500 font-medium">Hostel Name</span>
                  <span className="text-gray-900 font-bold">{allocation.hostelName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500 font-medium">Room Type</span>
                  <span className="text-gray-900 font-semibold">{allocation.roomTypeName}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500 font-medium">Allocation Mode</span>
                  <span className="text-gray-900 font-semibold">{allocation.allocationType}</span>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2 border border-amber-200">
                  <Clock className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-gray-800">Allocation Not Yet Finalized</p>
                <p className="text-[11px] text-gray-500">
                  Your application will be evaluated during the upcoming automated allocation window run.
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 pt-3 border-t border-gray-100">
            <Link
              to="/student/allocation"
              className={`w-full inline-flex justify-center items-center py-2 px-3 rounded-xl text-xs font-bold border transition ${theme.buttonOutline}`}
            >
              {allocation ? 'View Allocation Letter' : 'Check Allocation Schedule'}
            </Link>
          </div>
        </div>

        {/* CARD 6: Notifications Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl ${theme.iconBg} flex items-center justify-center font-bold`}>
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                  <span className="text-[11px] text-gray-500">System Alerts & Updates</span>
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

      {/* CARD 7: Quick Actions Grid */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">Quick Actions</h3>
            <p className="text-xs text-gray-500">Shortcuts to manage your {theme.portalName} requirements</p>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${theme.badge}`}>
            {theme.portalName}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            to="/student/group"
            className={`p-4 rounded-xl border ${theme.cardBorder} ${theme.lightBg} hover:shadow-sm transition text-center flex flex-col items-center justify-center group`}
          >
            <div className={`w-10 h-10 rounded-xl ${theme.iconBg} flex items-center justify-center mb-2 group-hover:scale-105 transition`}>
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-900">Manage Group</span>
            <span className="text-[11px] text-gray-500 mt-0.5">Invite teammates</span>
          </Link>

          <Link
            to="/student/allocation"
            className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 hover:shadow-sm transition text-center flex flex-col items-center justify-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <Home className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-900">View Allocation</span>
            <span className="text-[11px] text-gray-500 mt-0.5">Room pass & details</span>
          </Link>

          <Link
            to="/student/waiting-pool"
            className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 hover:shadow-sm transition text-center flex flex-col items-center justify-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-900">Waiting Pool</span>
            <span className="text-[11px] text-gray-500 mt-0.5">Individual allocation</span>
          </Link>

          <Link
            to="/student/notifications"
            className="p-4 rounded-xl border border-purple-100 bg-purple-50/40 hover:shadow-sm transition text-center flex flex-col items-center justify-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <Bell className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-900">Notice Board</span>
            <span className="text-[11px] text-gray-500 mt-0.5">Announcements</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
