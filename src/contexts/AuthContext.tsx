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

    const checkAuth = async () => {
      try {
        // Check if we have a refresh token
        const cookies = document.cookie.split(";");
        const refreshTokenCookie = cookies.find((cookie) =>
          cookie.trim().startsWith("refreshToken=")
        );
        const refreshToken = refreshTokenCookie
          ? refreshTokenCookie.split("=")[1]
          : null;

        if (refreshToken) {
          // Use the getNewAccessToken function which handles the refresh token from cookies
          const token = await getNewAccessToken();

          if (token) {
            setAccessToken(token);
          } else {
            setAccessToken(null);
            navigate("/login", { replace: true });
          }
        } else {
          setAccessToken(null);
          navigate("/login", { replace: true });
        }
      } catch (error) {
        setAccessToken(null);
        navigate("/login", { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, location]);

  // Show loading state while checking auth
  if (isLoading) {
    return null; // or return a loading spinner component
  }

  const login = (data: LoginData) => {
    setAccessToken(data.token);
    navigate("/dashboard");
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
