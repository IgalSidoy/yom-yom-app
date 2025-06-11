import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api, { getNewAccessToken, updateAccessToken } from "../services/api";
import { AxiosError } from "axios";
import { useApp } from "./AppContext";

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

const TOKEN_KEY = "auth_token";

export function AuthProvider({ children }: AuthProviderProps) {
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    // Initialize from localStorage
    return localStorage.getItem(TOKEN_KEY);
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const isInitialMount = useRef(true);
  const initialPath = useRef(location.pathname);
  const { setAccessToken: setAppAccessToken } = useApp();

  // Persist token changes to localStorage and sync with AppContext
  useEffect(() => {
    if (accessToken) {
      localStorage.setItem(TOKEN_KEY, accessToken);
      setAppAccessToken(accessToken);
      updateAccessToken(accessToken);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      setAppAccessToken(null);
      updateAccessToken(null);
    }
  }, [accessToken, setAppAccessToken]);

  // Token refresh and validation logic
  useEffect(() => {
    // Skip refresh check if this is not the initial mount
    if (!isInitialMount.current) {
      return;
    }
    isInitialMount.current = false;

    const checkAuth = async () => {
      try {
        console.log("Starting auth check...");
        // Use the getNewAccessToken function which handles the refresh token from cookies
        const token = await getNewAccessToken();
        console.log("Got new token:", token ? "Token received" : "No token");

        if (!token) {
          console.log("No token received, throwing error");
          throw new Error("No token received from refresh");
        }

        console.log(
          "Setting access token and staying on route:",
          location.pathname
        );
        setAccessToken(token);

        // If refresh was successful, stay on the initial route
        // No need to navigate since we're already on the correct route
      } catch (error) {
        console.error("Auth check failed:", error);
        const axiosError = error as AxiosError;
        console.log("Error status:", axiosError.response?.status);

        setAccessToken(null);

        // Only redirect if it's a 401 response (which means refresh token is invalid)
        if (axiosError.response?.status === 401) {
          console.log("401 received, redirecting to login");
          navigate("/login", { replace: true });
        } else {
          console.log("Non-401 error, staying on route:", location.pathname);
        }
      } finally {
        console.log("Auth check complete, setting isLoading to false");
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, location]);

  // Show loading state while checking auth
  if (isLoading) {
    console.log("Still loading, showing nothing");
    return null; // or return a loading spinner component
  }

  console.log(
    "Rendering with token:",
    accessToken ? "Token exists" : "No token"
  );
  const login = (data: LoginData) => {
    setAccessToken(data.token);
    navigate("/");
  };

  const logout = () => {
    setAccessToken(null);
    navigate("/login");
  };

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
