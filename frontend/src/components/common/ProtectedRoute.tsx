import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  allowedRoles?: string[];
  allowedGender?: 'MALE' | 'FEMALE';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, allowedGender }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Authenticating..." />
      </div>
    );
  }

  // Not authenticated -> redirect to root login page
  if (!isAuthenticated || !user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 1. Role Authorization Check
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === 'ROLE_STUDENT') {
      return <Navigate to={user.gender === 'FEMALE' ? '/girls' : '/boys'} replace />;
    } else {
      return <Navigate to="/admin" replace />;
    }
  }

  // 2. Strict Gender Separation Security
  if (allowedGender) {
    if (user.role !== 'ROLE_STUDENT') {
      return <Navigate to="/admin" replace />;
    }
    if (user.gender && user.gender !== allowedGender) {
      return <Navigate to={user.gender === 'FEMALE' ? '/girls' : '/boys'} replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
