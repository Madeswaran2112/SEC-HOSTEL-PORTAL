import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { hostelApi } from '../../api/hostelApi';
import { roomApi } from '../../api/roomApi';
import { studentApi } from '../../api/studentApi';
import { allocationApi, windowApi, waitingPoolApi } from '../../api/allocationApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Hostel } from '../../types/hostel';
import { Room } from '../../types/room';
import {
  Home,
  Bed,
  CheckCircle,
  Users,
  Clock,
  Sparkles,
  Upload,
  ArrowUpRight,
  ShieldCheck,
  FileSpreadsheet,
  TrendingUp,
  Building,
  Calendar,
  ListFilter
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [stats, setStats] = useState({
    totalRooms: 0,
    totalBeds: 0,
    availableBeds: 0,
    occupiedBeds: 0,
    totalStudents: 0,
    allocatedStudents: 0,
    waitingListCount: 0,
    activeWindows: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [hostelsRes, roomsRes, studentsRes, allocRes, windowsRes, waitlistRes] = await Promise.allSettled([
          hostelApi.getAll(0, 100),
          roomApi.getAll(0, 1000),
          studentApi.getStudents(0, 1000),
          allocationApi.getAll(0, 1000),
          windowApi.getAll(),
          waitingPoolApi.getAdminWaitlist()
        ]);

        const hostelList: Hostel[] = hostelsRes.status === 'fulfilled' && hostelsRes.value?.data?.content
          ? hostelsRes.value.data.content
          : [];
        setHostels(hostelList);

        const roomList: Room[] = roomsRes.status === 'fulfilled' && roomsRes.value?.data?.content
          ? roomsRes.value.data.content
          : [];
        setRooms(roomList);

        const totalRooms = roomList.length;
        const totalBeds = roomList.reduce((s, r) => s + (r.effectiveCapacity || r.totalCapacity || r.capacity || 0), 0);
        const occupiedBeds = roomList.reduce((s, r) => s + (r.occupiedBeds || 0), 0);
        const availableBeds = Math.max(0, totalBeds - occupiedBeds);

        const totalStudents = studentsRes.status === 'fulfilled' && studentsRes.value?.data?.totalElements !== undefined
          ? studentsRes.value.data.totalElements
          : 0;

        const allocatedStudents = allocRes.status === 'fulfilled' && allocRes.value?.data?.totalElements !== undefined
          ? allocRes.value.data.totalElements
          : 0;

        const activeWindows = windowsRes.status === 'fulfilled' && Array.isArray(windowsRes.value?.data)
          ? windowsRes.value.data.filter((w: any) => w.status === 'OPEN').length
          : 0;

        const waitingListCount = waitlistRes.status === 'fulfilled' && waitlistRes.value?.data?.totalElements !== undefined
          ? waitlistRes.value.data.totalElements
          : 0;

        setStats({
          totalRooms,
          totalBeds,
          availableBeds,
          occupiedBeds,
          totalStudents,
          allocatedStudents,
          waitingListCount,
          activeWindows,
        });
      } catch (error) {
        console.error('Failed to load admin dashboard live data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="py-12"><LoadingSpinner size="lg" text="Loading SEC Hostel admin dashboard..." /></div>;
  }

  const metricCards = [
    {
      title: 'Total Rooms',
      value: stats.totalRooms,
      icon: <Home className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-50 border-blue-200',
      badge: 'Database Inventory',
      badgeColor: 'bg-blue-100 text-blue-700'
    },
    {
      title: 'Total Bed Capacity',
      value: stats.totalBeds,
      icon: <Bed className="w-5 h-5 text-indigo-600" />,
      bg: 'bg-indigo-50 border-indigo-200',
      badge: 'Usable Capacity',
      badgeColor: 'bg-indigo-100 text-indigo-700'
    },
    {
      title: 'Available Beds',
      value: stats.availableBeds,
      icon: <Sparkles className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50 border-emerald-200',
      badge: 'Ready to Book',
      badgeColor: 'bg-emerald-100 text-emerald-700'
    },
    {
      title: 'Occupied Beds',
      value: stats.occupiedBeds,
      icon: <CheckCircle className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50 border-amber-200',
      badge: 'Allocated',
      badgeColor: 'bg-amber-100 text-amber-700'
    },
    {
      title: 'Enrolled Students',
      value: stats.totalStudents,
      icon: <Users className="w-5 h-5 text-purple-600" />,
      bg: 'bg-purple-50 border-purple-200',
      badge: 'Master Roster',
      badgeColor: 'bg-purple-100 text-purple-700'
    },
    {
      title: 'Confirmed Allocations',
      value: stats.allocatedStudents,
      icon: <ShieldCheck className="w-5 h-5 text-teal-600" />,
      bg: 'bg-teal-50 border-teal-200',
      badge: 'Room Passes',
      badgeColor: 'bg-teal-100 text-teal-700'
    },
    {
      title: 'Waiting List Queue',
      value: stats.waitingListCount,
      icon: <Clock className="w-5 h-5 text-rose-600" />,
      bg: 'bg-rose-50 border-rose-200',
      badge: 'In Queue',
      badgeColor: 'bg-rose-100 text-rose-700'
    },
    {
      title: 'Active Phase Windows',
      value: stats.activeWindows,
      icon: <Calendar className="w-5 h-5 text-sky-600" />,
      bg: 'bg-sky-50 border-sky-200',
      badge: 'Live Windows',
      badgeColor: 'bg-sky-100 text-sky-700'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                ADMIN PORTAL
              </span>
              <span className="text-slate-400 text-xs">SEC Hostel Management System</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">System Analytics & Allocation Hub</h1>
            <p className="text-slate-300 text-sm mt-1">Live database metrics for Boys & Girls Hostels, room inventory, and active booking phases.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/allocation-windows"
              className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow transition"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Phase Scheduler
            </Link>
            <Link
              to="/admin/rooms/upload"
              className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Excel
            </Link>
          </div>
        </div>
      </div>

      {/* 8 Metric Cards Grid (Accurate Live Database Numbers) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Key Allocation Metrics</h2>
          <span className="text-xs text-gray-500 font-medium">Real-Time Database Records</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricCards.map((m, idx) => (
            <div
              key={idx}
              className={`rounded-xl border p-5 bg-white shadow-xs hover:shadow-md transition duration-200 ${m.bg}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-white shadow-xs border border-gray-100">
                  {m.icon}
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m.badgeColor}`}>
                  {m.badge}
                </span>
              </div>
              <div className="text-2xl font-black text-gray-900 tracking-tight">{m.value}</div>
              <div className="text-xs font-medium text-gray-600 mt-1">{m.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Boys & Girls Hostel Capacity Data Grid (Live Real Data) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-gray-900">Hostels Capacity & Inventory Grid</h3>
            <p className="text-xs text-gray-500">Separated management for Boys Hostel and Girls Hostel blocks</p>
          </div>
          <Link
            to="/admin/rooms"
            className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Manage Room Inventory <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {hostels.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            No hostel records found in database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4 text-left">Hostel / Campus Name</th>
                  <th className="py-3 px-4 text-left">Portal / Gender</th>
                  <th className="py-3 px-4 text-center">Total Rooms</th>
                  <th className="py-3 px-4 text-center">Total Beds</th>
                  <th className="py-3 px-4 text-center">Occupied Beds</th>
                  <th className="py-3 px-4 text-center">Available Beds</th>
                  <th className="py-3 px-4 text-left">Occupancy Rate</th>
                  <th className="py-3 px-4 text-center">Block Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {hostels.map((h) => {
                  const hRooms = rooms.filter((r) => String(r.hostelId) === String(h.id));
                  const hTotalRooms = hRooms.length;
                  const hTotalBeds = hRooms.reduce((s, r) => s + (r.effectiveCapacity || r.totalCapacity || r.capacity || 0), 0);
                  const hOccupied = hRooms.reduce((s, r) => s + (r.occupiedBeds || 0), 0);
                  const hAvailable = Math.max(0, hTotalBeds - hOccupied);
                  const hRate = hTotalBeds > 0 ? Math.round((hOccupied / hTotalBeds) * 100) : 0;
                  const isBoys = h.hostelType === 'BOYS';

                  return (
                    <tr key={h.id} className="hover:bg-gray-50/80 transition">
                      <td className="py-3.5 px-4 font-semibold text-gray-900 flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-400" />
                        {h.name}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isBoys
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-200'
                          }`}
                        >
                          {isBoys ? 'Boys Portal' : 'Girls Portal'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-medium text-gray-800">{hTotalRooms}</td>
                      <td className="py-3.5 px-4 text-center font-medium text-gray-800">{hTotalBeds}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-amber-700">{hOccupied}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-700">{hAvailable}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full ${hRate > 80 ? 'bg-rose-500' : hRate > 50 ? 'bg-indigo-600' : 'bg-emerald-500'}`}
                              style={{ width: `${hRate}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-700">{hRate}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                          hTotalRooms === 0
                            ? 'bg-gray-100 text-gray-600 border border-gray-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {hTotalRooms === 0 ? 'Empty / Ready for Import' : 'Active'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bottom Grid: Quick Actions and System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Management Actions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-bold text-gray-900 mb-4">Quick Management Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Link
              to="/admin/allocation-windows"
              className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-100/60 transition text-center flex flex-col items-center justify-center group"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-900">Phase Scheduler</span>
              <span className="text-[11px] text-gray-500 mt-0.5">Phase 1 & Phase 2</span>
            </Link>

            <Link
              to="/admin/rooms/upload"
              className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100/60 transition text-center flex flex-col items-center justify-center group"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-900">Import Excel</span>
              <span className="text-[11px] text-gray-500 mt-0.5">Room & student rosters</span>
            </Link>

            <Link
              to="/admin/students"
              className="p-4 rounded-xl border border-purple-100 bg-purple-50/50 hover:bg-purple-100/60 transition text-center flex flex-col items-center justify-center group"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-900">Student Master</span>
              <span className="text-[11px] text-gray-500 mt-0.5">Enrollment & history</span>
            </Link>

            <Link
              to="/admin/rooms"
              className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-100/60 transition text-center flex flex-col items-center justify-center group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition">
                <Home className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-900">Room Inventory</span>
              <span className="text-[11px] text-gray-500 mt-0.5">Live status & capacity</span>
            </Link>

            <Link
              to="/admin/waiting-pool"
              className="p-4 rounded-xl border border-amber-100 bg-amber-50/50 hover:bg-amber-100/60 transition text-center flex flex-col items-center justify-center group"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition">
                <ListFilter className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-900">Waiting List</span>
              <span className="text-[11px] text-gray-500 mt-0.5">Queue & promotion</span>
            </Link>

            <Link
              to="/admin/export"
              className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition text-center flex flex-col items-center justify-center group"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-800 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-900">Export Center</span>
              <span className="text-[11px] text-gray-500 mt-0.5">Excel reports</span>
            </Link>
          </div>
        </div>

        {/* Portal Policy Card */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                SECURITY & POLICY
              </span>
            </div>
            <h4 className="text-base font-bold mb-2">Hostel Separation Policy</h4>
            <ul className="text-xs space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">•</span>
                <span><strong>Boys Portal:</strong> Strictly restricted to male students and Boys Hostel blocks.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-fuchsia-400 font-bold">•</span>
                <span><strong>Girls Portal:</strong> Strictly restricted to female students and Girls Hostel blocks.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Waiting List Promotion:</strong> Automatic 24h bed reservation upon cancellation.</span>
              </li>
            </ul>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>SEC HOSTEL v2.0</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span> Systems Normal
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
