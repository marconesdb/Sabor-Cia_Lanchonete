import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Aguarda a sessão ser restaurada do localStorage antes de redirecionar
  if (loading) return null;

  if (!user) {
    // Passa a rota atual como destino após o login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};