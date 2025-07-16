import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useApp } from "../contexts/AppContext";

const AuthDebug: React.FC = () => {
  const { accessToken, isLoading, isAuthenticated, testRefreshToken } =
    useAuth();
  const { accessToken: appAccessToken, user } = useApp();

  // Get refresh token from cookies
  const getRefreshToken = () => {
    const cookies = document.cookie.split(";");
    const refreshTokenCookie = cookies.find((cookie) => {
      const trimmedCookie = cookie.trim();
      return trimmedCookie.startsWith("refreshToken=");
    });

    if (refreshTokenCookie) {
      const parts = refreshTokenCookie.split("=");
      if (parts.length >= 2) {
        return parts.slice(1).join("=");
      }
    }
    return null;
  };

  const refreshToken = getRefreshToken();

  const testNoCookieScenario = () => {
    if ((window as any).testNoCookieScenario) {
      (window as any).testNoCookieScenario();
    }
  };

  const triggerAuthCheck = () => {
    if ((window as any).triggerAuthCheck) {
      (window as any).triggerAuthCheck();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 10,
        right: 10,
        background: "#f0f0f0",
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "5px",
        fontSize: "12px",
        zIndex: 9999,
        maxWidth: "300px",
      }}
    >
      <h4>🔐 Auth Debug</h4>
      <div>Loading: {isLoading ? "Yes" : "No"}</div>
      <div>Authenticated: {isAuthenticated ? "Yes" : "No"}</div>
      <div>
        Auth Token:{" "}
        {accessToken ? `${accessToken.substring(0, 20)}...` : "None"}
      </div>
      <div>
        App Token:{" "}
        {appAccessToken ? `${appAccessToken.substring(0, 20)}...` : "None"}
      </div>
      <div>User: {user ? `${user.firstName} ${user.lastName}` : "None"}</div>
      <div>Cookies: {document.cookie ? "Present" : "None"}</div>
      <div>
        Refresh Token:{" "}
        {refreshToken ? `${refreshToken.substring(0, 20)}...` : "None"}
      </div>
      <div
        style={{
          marginTop: "10px",
          display: "flex",
          gap: "5px",
          flexDirection: "column",
        }}
      >
        <button
          onClick={testRefreshToken}
          style={{
            padding: "5px 10px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "3px",
            cursor: "pointer",
          }}
        >
          Test Refresh
        </button>
        <button
          onClick={testNoCookieScenario}
          style={{
            padding: "5px 10px",
            background: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "3px",
            cursor: "pointer",
          }}
        >
          Test No Cookie
        </button>
        <button
          onClick={triggerAuthCheck}
          style={{
            padding: "5px 10px",
            background: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "3px",
            cursor: "pointer",
          }}
        >
          Trigger Auth Check
        </button>
      </div>
    </div>
  );
};

export default AuthDebug;
