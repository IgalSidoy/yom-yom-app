import React from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useLocation } from "react-router-dom";
import { getIsLoggingOut } from "../../../services/api";
import AuthLoadingPage from "../../../pages/AuthLoadingPage";

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { isLoading } = useAuth();
  const location = useLocation();

  // Don't show loading page if:
  // 1. Currently logging out
  // 2. Already on login page (no need to check auth)
  if (getIsLoggingOut() || location.pathname === "/login") {
    return <>{children}</>;
  }

  // Show loading page only while AuthContext is checking authentication
  if (isLoading) {
    return <AuthLoadingPage />;
  }

  return <>{children}</>;
};

export default AuthWrapper;
