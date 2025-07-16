import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import AuthLoadingPage from "../pages/AuthLoadingPage";

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { isLoading } = useAuth();
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    // Always show loading for minimum 2 seconds
    const minLoadingTime = 2000; // 2 seconds
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, minLoadingTime);

    return () => clearTimeout(timer);
  }, []);

  // Show loading page while checking authentication OR during minimum time
  if (isLoading || showLoading) {
    return <AuthLoadingPage />;
  }

  return <>{children}</>;
};

export default AuthWrapper;
