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
  testRefreshToken: () => Promise<void>;
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

  console.log("🚀 [AuthContext] AuthProvider initialized", {
    initialPath: initialPath.current,
    currentPath: location.pathname,
    isInitialMount: isInitialMount.current,
  });

  // Add immediate logging to see if this runs
  console.log("🔍 [AuthContext] Component rendered, isLoading:", isLoading);

  // Define checkAuth function outside useEffect so it can be called from other functions
  const checkAuth = async () => {
    console.log("🔐 [AuthContext] Starting authentication check...");
    console.log("🔍 [AuthContext] Current URL:", window.location.href);
    console.log("🔍 [AuthContext] Current pathname:", location.pathname);

    try {
      // Check if we have a refresh token
      const cookies = document.cookie.split(";");
      console.log("🍪 [AuthContext] All cookies:", cookies);
      console.log("🍪 [AuthContext] Total cookies found:", cookies.length);

      // Log each cookie individually
      cookies.forEach((cookie, index) => {
        const trimmedCookie = cookie.trim();
        console.log(`🍪 [AuthContext] Cookie ${index}:`, {
          raw: cookie,
          trimmed: trimmedCookie,
          name: trimmedCookie.split("=")[0],
          hasValue: trimmedCookie.includes("="),
        });
      });

      // Improved cookie parsing
      const refreshTokenCookie = cookies.find((cookie) => {
        const trimmedCookie = cookie.trim();
        console.log("🍪 [AuthContext] Checking cookie:", trimmedCookie);
        return trimmedCookie.startsWith("refreshToken=");
      });

      let refreshToken = null;
      if (refreshTokenCookie) {
        const parts = refreshTokenCookie.split("=");
        if (parts.length >= 2) {
          refreshToken = parts.slice(1).join("="); // Handle tokens that might contain '=' characters
        }
      }

      console.log("🔄 [AuthContext] Refresh token found:", !!refreshToken);
      if (refreshToken) {
        console.log(
          "🔄 [AuthContext] Refresh token length:",
          refreshToken.length
        );
        console.log(
          "🔄 [AuthContext] Refresh token value (first 20 chars):",
          refreshToken.substring(0, 20) + "..."
        );
        console.log(
          "🔄 [AuthContext] Refresh token will be used in Authorization header as: Bearer [token]"
        );
      } else {
        console.log(
          "❌ [AuthContext] NO REFRESH TOKEN FOUND - This is the scenario we want to test!"
        );
      }

      if (refreshToken) {
        console.log("🔄 [AuthContext] Attempting to get new access token...");
        // Use the getNewAccessToken function which handles the refresh token from cookies
        const token = await getNewAccessToken();

        console.log("✅ [AuthContext] New access token received:", !!token);

        if (token) {
          setAccessToken(token);
          console.log("✅ [AuthContext] Access token set successfully");
        } else {
          console.log(
            "❌ [AuthContext] No token received, redirecting to login"
          );
          setAccessToken(null);
          navigate("/login", { replace: true });
        }
      } else {
        console.log(
          "❌ [AuthContext] No refresh token found, redirecting to login"
        );
        console.log("🔀 [AuthContext] Navigating to login page...");
        setAccessToken(null);
        navigate("/login", { replace: true });
      }
    } catch (error) {
      console.error("💥 [AuthContext] Authentication check failed:", error);
      setAccessToken(null);
      navigate("/login", { replace: true });
    } finally {
      setIsLoading(false);
      console.log("🏁 [AuthContext] Authentication check completed");
    }
  };

  // Sync token with AppContext via custom event
  useEffect(() => {
    console.log("🔄 [AuthContext] Syncing access token:", {
      hasToken: !!accessToken,
      tokenLength: accessToken?.length || 0,
    });

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
    console.log("🔄 [AuthContext] useEffect triggered", {
      isInitialMount: isInitialMount.current,
      isLoading,
      hasAccessToken: !!accessToken,
    });

    // Skip refresh check if this is not the initial mount
    if (!isInitialMount.current) {
      console.log("⏭️ [AuthContext] Skipping refresh - not initial mount");
      return;
    }
    isInitialMount.current = false;

    checkAuth();
  }, [navigate]); // Remove location from dependencies to prevent unnecessary re-runs

  // Show loading state while checking auth
  if (isLoading) {
    console.log("⏳ [AuthContext] Showing loading state...");
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
        }}
      >
        🔐 Checking authentication...
      </div>
    );
  }

  const login = (data: LoginData) => {
    setAccessToken(data.token);
    navigate("/dashboard");
  };

  const logout = () => {
    setAccessToken(null);
    navigate("/login");
  };

  // Test function for debugging
  const testRefreshToken = async () => {
    console.log("🧪 [AuthContext] Testing refresh token manually...");
    try {
      const token = await getNewAccessToken();
      console.log("🧪 [AuthContext] Manual refresh successful:", !!token);
      if (token) {
        setAccessToken(token);
      }
    } catch (error) {
      console.error("🧪 [AuthContext] Manual refresh failed:", error);
    }
  };

  // Test function to clear cookies and test no-cookie scenario
  const testNoCookieScenario = () => {
    console.log("🧪 [AuthContext] Testing no-cookie scenario...");
    console.log(
      "🧪 [AuthContext] Current cookies before clearing:",
      document.cookie
    );

    // Clear all cookies
    document.cookie.split(";").forEach(function (c) {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    console.log(
      "🧪 [AuthContext] Cookies cleared. Current cookies:",
      document.cookie
    );
    console.log(
      "🧪 [AuthContext] Reloading page to test no-cookie scenario..."
    );

    // Reload the page to trigger the authentication check
    window.location.reload();
  };

  // Test function to manually trigger authentication check
  const triggerAuthCheck = () => {
    console.log("🧪 [AuthContext] Manually triggering authentication check...");
    // Reset the initial mount flag to allow the check to run again
    isInitialMount.current = true;
    setIsLoading(true);
    // This will trigger the useEffect to run again
    checkAuth();
  };

  // Expose test functions globally for debugging
  (window as any).testRefreshToken = testRefreshToken;
  (window as any).testNoCookieScenario = testNoCookieScenario;
  (window as any).triggerAuthCheck = triggerAuthCheck;

  const value = {
    accessToken,
    setAccessToken,
    isLoading,
    isAuthenticated: !!accessToken,
    login,
    logout,
    testRefreshToken,
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
