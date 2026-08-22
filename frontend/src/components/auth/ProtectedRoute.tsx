import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const { showToast } = useToast();
  const isAuthenticated = Boolean(authService.getCurrentUser());

  useEffect(() => {
    if (!isAuthenticated) {
      showToast(
        'warning',
        'Authentication Required',
        'Please sign in or create an account to start planning and saving your trips.'
      );
    }
  }, [isAuthenticated, showToast]);

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

  return <>{children}</>;
};
