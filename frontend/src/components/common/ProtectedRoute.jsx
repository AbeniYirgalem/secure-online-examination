import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../ui/LoadingSpinner';
import { ShieldAlert } from 'lucide-react';
import Button from '../ui/Button';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" className="text-blue-600 mb-3" />
        <p className="text-xs text-slate-500 font-medium">Verifying security credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Restricted</h2>
        <p className="text-sm text-slate-600 max-w-md mb-6 leading-relaxed">
          Your role ({user.role}) does not have permission to access this section of the examination platform.
        </p>
        <Button onClick={() => window.history.back()} variant="secondary">
          Return to Previous Page
        </Button>
      </div>
    );
  }

  return children;
}
