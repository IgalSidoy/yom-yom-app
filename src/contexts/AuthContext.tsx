import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

interface User {
  id: string;
  email: string;
  mobile: string;
  businessName: string;
  businessId: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  login: (
    token: string,
    userId: string,
    accountId: string,
    organizationId: string
  ) => void;
  logout: () => void;
  userId: string | null;
  accountId: string | null;
  organizationId: string | null;
}

interface TokenResponse {
  token: string;
  refreshToken: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedUserId = localStorage.getItem("userId");
    const storedAccountId = localStorage.getItem("accountId");
    const storedOrganizationId = localStorage.getItem("organizationId");

    if (token) {
      setIsAuthenticated(true);
      setUserId(storedUserId);
      setAccountId(storedAccountId);
      setOrganizationId(storedOrganizationId);
    }
    setLoading(false);
  }, []);

  const login = (
    token: string,
    userId: string,
    accountId: string,
    organizationId: string
  ) => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("userId", userId);
    localStorage.setItem("accountId", accountId);
    localStorage.setItem("organizationId", organizationId);
    setIsAuthenticated(true);
    setUserId(userId);
    setAccountId(accountId);
    setOrganizationId(organizationId);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("accountId");
    localStorage.removeItem("organizationId");
    setIsAuthenticated(false);
    setUserId(null);
    setAccountId(null);
    setOrganizationId(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loading,
        login,
        logout,
        userId,
        accountId,
        organizationId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
