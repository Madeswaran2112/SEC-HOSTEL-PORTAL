import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Toast } from './components/common/Toast';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AuthLayout } from './components/layouts/AuthLayout';
import { StudentLayout } from './components/layouts/StudentLayout';
import { AdminLayout } from './components/layouts/AdminLayout';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import GroupManagement from './pages/student/GroupManagement';
import CreateGroup from './pages/student/CreateGroup';
import GroupInvitations from './pages/student/GroupInvitations';
import AllocationStatus from './pages/student/AllocationStatus';
import WaitingPool from './pages/student/WaitingPool';
import NotificationCenter from './pages/student/NotificationCenter';

import AdminDashboard from './pages/admin/AdminDashboard';
import HostelList from './pages/admin/HostelList';
import HostelForm from './pages/admin/HostelForm';
import HostelDetail from './pages/admin/HostelDetail';
import RoomTypeManagement from './pages/admin/RoomTypeManagement';
import RoomList from './pages/admin/RoomList';
import RoomUpload from './pages/admin/RoomUpload';
import RoomForm from './pages/admin/RoomForm';
import RoomDetail from './pages/admin/RoomDetail';
import StudentList from './pages/admin/StudentList';
import StudentDetail from './pages/admin/StudentDetail';
import GroupList from './pages/admin/GroupList';
import GroupDetail from './pages/admin/GroupDetail';
import AllocationWindows from './pages/admin/AllocationWindows';
import AllocationManagement from './pages/admin/AllocationManagement';
import RunAllocation from './pages/admin/RunAllocation';
import ManualAllocation from './pages/admin/ManualAllocation';
import FinalAllocationList from './pages/admin/FinalAllocationList';
import WaitingPoolAdmin from './pages/admin/WaitingPoolAdmin';
import ExportCenter from './pages/admin/ExportCenter';
import AuditLogs from './pages/admin/AuditLogs';
import SystemSettings from './pages/admin/SystemSettings';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Toast />
          <Routes>
            {/* Root Route -> SEC HOSTEL Unified Login Page */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Registration & Account Recovery */}
            <Route element={<AuthLayout />}>
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>

            {/* 1. BOYS PORTAL (Male Students Only) */}
            <Route element={<ProtectedRoute allowedRoles={['ROLE_STUDENT']} allowedGender="MALE" />}>
              <Route element={<StudentLayout />}>
                <Route path="/boys" element={<StudentDashboard />} />
                <Route path="/boys/dashboard" element={<Navigate to="/boys" replace />} />
                <Route path="/boys/group" element={<GroupManagement />} />
                <Route path="/boys/allocation" element={<AllocationStatus />} />
                <Route path="/boys/waiting-pool" element={<WaitingPool />} />
              </Route>
            </Route>

            {/* 2. GIRLS PORTAL (Female Students Only) */}
            <Route element={<ProtectedRoute allowedRoles={['ROLE_STUDENT']} allowedGender="FEMALE" />}>
              <Route element={<StudentLayout />}>
                <Route path="/girls" element={<StudentDashboard />} />
                <Route path="/girls/dashboard" element={<Navigate to="/girls" replace />} />
                <Route path="/girls/group" element={<GroupManagement />} />
                <Route path="/girls/allocation" element={<AllocationStatus />} />
                <Route path="/girls/waiting-pool" element={<WaitingPool />} />
              </Route>
            </Route>

            {/* Student General Subroutes */}
            <Route element={<ProtectedRoute allowedRoles={['ROLE_STUDENT']} />}>
              <Route element={<StudentLayout />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/profile" element={<StudentProfile />} />
                <Route path="/student/group" element={<GroupManagement />} />
                <Route path="/student/group/create" element={<CreateGroup />} />
                <Route path="/student/group/invitations" element={<GroupInvitations />} />
                <Route path="/student/allocation" element={<AllocationStatus />} />
                <Route path="/student/waiting-pool" element={<WaitingPool />} />
                <Route path="/student/notifications" element={<NotificationCenter />} />
                <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
              </Route>
            </Route>

            {/* 3. ADMIN PORTAL (Admin & Super Admin Only) */}
            <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_SUPER_ADMIN']} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/hostels" element={<HostelList />} />
                <Route path="/admin/hostels/new" element={<HostelForm />} />
                <Route path="/admin/hostels/:id" element={<HostelDetail />} />
                <Route path="/admin/hostels/:id/edit" element={<HostelForm />} />
                <Route path="/admin/room-types" element={<RoomTypeManagement />} />
                <Route path="/admin/rooms" element={<RoomList />} />
                <Route path="/admin/rooms/upload" element={<RoomUpload />} />
                <Route path="/admin/rooms/new" element={<RoomForm />} />
                <Route path="/admin/rooms/:id" element={<RoomDetail />} />
                <Route path="/admin/rooms/:id/edit" element={<RoomForm />} />
                <Route path="/admin/students" element={<StudentList />} />
                <Route path="/admin/students/:id" element={<StudentDetail />} />
                <Route path="/admin/groups" element={<GroupList />} />
                <Route path="/admin/groups/:id" element={<GroupDetail />} />
                <Route path="/admin/allocation-windows" element={<AllocationWindows />} />
                <Route path="/admin/allocations" element={<AllocationManagement />} />
                <Route path="/admin/allocations/run" element={<RunAllocation />} />
                <Route path="/admin/allocations/manual" element={<ManualAllocation />} />
                <Route path="/admin/allocations/final-list" element={<FinalAllocationList />} />
                <Route path="/admin/waiting-pool" element={<WaitingPoolAdmin />} />
                <Route path="/admin/export" element={<ExportCenter />} />
                <Route path="/admin/audit-logs" element={<AuditLogs />} />
                <Route path="/admin/settings" element={<SystemSettings />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
