import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/shared/Login";
import Onboarding from "./pages/shared/Onboarding";
import Dashboard from "./pages/shared/Dashboard";
import Settings from "./pages/shared/Settings";
import Feed from "./pages/shared/Feed";
import BottomNav from "./components/BottomNav";
import StaffDashboard from "./pages/staff/StaffDashboard";
import Attendance from "./pages/staff/Attendance";

const AppRoutes: React.FC = () => {
  const location = useLocation();
  const showBottomNav = !["/login", "/onboarding"].includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff-dashboard"
          element={
            <ProtectedRoute>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <Attendance />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      {showBottomNav && <BottomNav />}
    </>
  );
};

export default AppRoutes;
