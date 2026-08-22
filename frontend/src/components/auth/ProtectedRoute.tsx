import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const location = useLocation();
  const { showToast } = useToast();
<<<<<<< HEAD
  const currentUser = authService.getCurrentUser();
  const isAuthenticated = Boolean(currentUser);
  const isAdmin = authService.isAdminUser(currentUser);
=======
  const { isAuthenticated, isLoading } = useAuth();
>>>>>>> 40f0140 (done)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
<<<<<<< HEAD
  }, [isAuthenticated, requireAdmin, isAdmin, showToast]);
=======
  }, [isAuthenticated, isLoading, showToast]);

  // Wait for the initial token → profile check before deciding — otherwise
  // a hard refresh on a protected route would flash a redirect to /login
  // even though the stored access token is still valid.
  if (isLoading) return null;
>>>>>>> 40f0140 (done)

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
