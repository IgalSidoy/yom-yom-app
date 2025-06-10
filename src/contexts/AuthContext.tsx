import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import api, { getNewAccessToken } from "../services/api";
import { AxiosError } from "axios";

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
  const isInitialMount = useRef(true);

  // Persist token changes to localStorage
  useEffect(() => {
    if (accessToken) {
      localStorage.setItem(TOKEN_KEY, accessToken);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [accessToken]);

  // Token refresh and validation logic
  useEffect(() => {
    // Skip refresh check if this is not the initial mount
    if (!isInitialMount.current) {
      return;
    }
    isInitialMount.current = false;

    const checkAuth = async () => {
      try {
        // Use the getNewAccessToken function which handles the refresh token from cookies
        const token = await getNewAccessToken();
        setAccessToken(token);
        // Redirect to dashboard on successful refresh using router
        navigate("/dashboard");
      } catch (error) {
        console.error("Auth check failed:", error);
        setAccessToken(null);

        // Only redirect if it's not a 401 response (which means refresh token is invalid)
        const axiosError = error as AxiosError;
        if (axiosError.response?.status !== 401) {
          navigate("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

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
