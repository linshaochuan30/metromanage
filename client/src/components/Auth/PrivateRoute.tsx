import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const isAuthenticated = !!localStorage.getItem('authToken');
  return isAuthenticated ? children : <Navigate to="/login" replace />;
} 