import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { useApp } from "../../../contexts/AppContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Only check isAuthenticated from AuthContext
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
