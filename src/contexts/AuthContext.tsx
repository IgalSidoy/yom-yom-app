import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api, { getNewAccessToken, updateAccessToken } from "../services/api";
import { AxiosError } from "axios";
import {
  getRefreshToken,
  hasRefreshToken,
  deleteRefreshToken,
} from "../utils/cookieUtils";

interface User {
  id: string;
  email: string;
  mobile: string;
  businessName: string;
  businessId: string;
}

interface LoginData {
  token: string;
  userId: string;
  accountId: string;
  organizationId: string;
}

interface AuthContextType {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const isInitialMount = useRef(true);
  const initialPath = useRef(location.pathname);
  const isCheckingAuth = useRef(false); // Prevent multiple simultaneous auth checks

  // Define checkAuth function with useCallback to prevent recreation on every render
  const checkAuth = useCallback(async () => {
    // Prevent multiple simultaneous auth checks
    if (isCheckingAuth.current) {
      return;
    }

    isCheckingAuth.current = true;

    try {
      // Since the refresh token is httpOnly, we can't check if it exists from JavaScript
      // We'll try to refresh and let the server handle it
      const token = await getNewAccessToken();

      if (token) {
        setAccessToken(token);

        // Check if user was trying to access a specific page
        const currentPath = location.pathname;

        // If user is on login page, redirect to dashboard
        if (currentPath === "/login") {
          // Don't redirect here - let AppContext handle role-based redirect after user data is loaded
          // This will be handled by the AppContext when user data is fetched
        } else if (currentPath === "/") {
          // If user is on root, redirect to dashboard
          // Don't redirect here - let AppContext handle role-based redirect after user data is loaded
        }
        // If user is already on a valid page, just continue
      } else {
        setAccessToken(null);
        navigate("/login", { replace: true });
      }
    } catch (error) {
      console.error("Authentication check failed:", error);

      // Clear access token and redirect to login
      setAccessToken(null);

      // Only redirect if we're not already on login page to prevent infinite loops
      if (location.pathname !== "/login") {
        navigate("/login", { replace: true });
      }
    } finally {
      setIsLoading(false);
      isCheckingAuth.current = false; // Reset the flag
    }
  }, [navigate, location.pathname]);

  // Sync token with AppContext via custom event
  useEffect(() => {
    if (accessToken) {
      updateAccessToken(accessToken);
      // Dispatch event to notify AppContext
      window.dispatchEvent(
        new CustomEvent("updateAccessToken", { detail: accessToken })
      );
    } else {
      updateAccessToken(null);
      // Dispatch event to notify AppContext
      window.dispatchEvent(
        new CustomEvent("updateAccessToken", { detail: null })
      );
    }
  }, [accessToken]);

  // Token refresh and validation logic
  useEffect(() => {
    // Skip refresh check if this is not the initial mount
    if (!isInitialMount.current) {
      return;
    }
    isInitialMount.current = false;

    checkAuth();
  }, [checkAuth]); // Only depend on checkAuth to prevent infinite loops

  // Listen for force logout events from API layer
  useEffect(() => {
    const handleForceLogout = () => {
      setAccessToken(null);
      navigate("/login", { replace: true });
    };

    window.addEventListener("forceLogout", handleForceLogout);

    return () => {
      window.removeEventListener("forceLogout", handleForceLogout);
    };
  }, [navigate]);

  // Listen for access token requests from API layer
  useEffect(() => {
    const handleGetAccessToken = () => {
      const event = new CustomEvent("accessTokenResponse", {
        detail: accessToken,
      });
      window.dispatchEvent(event);
    };

    window.addEventListener("getAccessToken", handleGetAccessToken);

    return () => {
      window.removeEventListener("getAccessToken", handleGetAccessToken);
    };
  }, [accessToken]);

  // Listen for access token updates from API layer (refresh token flow)
  useEffect(() => {
    const handleUpdateAccessToken = (event: CustomEvent) => {
      const newToken = event.detail;

      if (newToken !== accessToken) {
        setAccessToken(newToken);
      }
    };

    window.addEventListener(
      "updateAccessToken",
      handleUpdateAccessToken as EventListener
    );

    return () => {
      window.removeEventListener(
        "updateAccessToken",
        handleUpdateAccessToken as EventListener
      );
    };
  }, [accessToken]);

  // Define all functions that use hooks before any early returns
  const login = useCallback((data: LoginData) => {
    setAccessToken(data.token);
    // Don't navigate here - let AppContext handle role-based redirect after user data is loaded
  }, []);

  const logout = useCallback(() => {
    deleteRefreshToken(); // Clear refresh cookie
    setAccessToken(null); // Clear access token from context
    navigate("/login");
  }, [navigate]);

  const value = {
    accessToken,
    setAccessToken,
    isLoading,
    isAuthenticated: !!accessToken,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
