import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { THEME_COLORS } from "../config/colors";

const AuthLoadingPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only redirect when auth check is complete
    if (!isLoading) {
      if (isAuthenticated) {
        // User is authenticated, redirect to intended page or dashboard
        const currentPath = location.pathname;
        if (currentPath === "/login" || currentPath === "/") {
          navigate("/dashboard", { replace: true });
        }
        // If user is already on a valid page, the AuthProvider will handle it
      } else {
        // User is not authenticated, redirect to login
        navigate("/login", { replace: true });
      }
    }
  }, [isLoading, isAuthenticated, navigate, location.pathname]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: THEME_COLORS.BACKGROUND,
        padding: "20px",
      }}
    >
      <div
        style={{
          fontSize: "32px",
          color: THEME_COLORS.PRIMARY,
          fontWeight: "700",
          marginBottom: "8px",
          textAlign: "center",
        }}
      >
        יום יום
      </div>
      <div
        style={{
          fontSize: "16px",
          color: THEME_COLORS.TEXT_SECONDARY,
          marginBottom: "40px",
          textAlign: "center",
          fontStyle: "italic",
        }}
      >
        מערכת ניהול יום יום
      </div>

      <div
        style={{
          width: "80px",
          height: "80px",
          border: `5px solid ${THEME_COLORS.SECONDARY}`,
          borderTop: `5px solid ${THEME_COLORS.PRIMARY}`,
          borderRadius: "50%",
          animation: "spin 1.2s ease-in-out infinite",
          boxShadow: `0 4px 12px rgba(255, 145, 77, 0.2)`,
        }}
      />

      <div
        style={{
          marginTop: "32px",
          fontSize: "18px",
          color: THEME_COLORS.TEXT_PRIMARY,
          fontWeight: "500",
          textAlign: "center",
          lineHeight: "1.4",
        }}
      >
        מתחבר למערכת...
      </div>
      <div
        style={{
          marginTop: "8px",
          fontSize: "14px",
          color: THEME_COLORS.TEXT_SECONDARY,
          textAlign: "center",
          opacity: 0.8,
        }}
      >
        אנא המתן רגע
      </div>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default AuthLoadingPage;
