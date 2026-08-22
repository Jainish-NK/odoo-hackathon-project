import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const location = useLocation();
  const { showToast } = useToast();
  const currentUser = authService.getCurrentUser();
  const isAuthenticated = Boolean(currentUser);
  const isAdmin = authService.isAdminUser(currentUser);

  useEffect(() => {
    if (!isAuthenticated) {
      showToast(
        'warning',
        'Authentication Required',
        'Please sign in or create an account to start planning and saving your trips.'
      );
    } else if (requireAdmin && !isAdmin) {
      showToast(
        'error',
        'Access Restricted',
        'Administrator privileges are required to view the Admin Dashboard.'
      );
    }
  }, [isAuthenticated, requireAdmin, isAdmin, showToast]);

  if (!isAuthenticated) {
    const redirectPath = location.pathname + location.search;
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(redirectPath)}`}
        state={{ from: redirectPath }}
        replace
      />
    );
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
