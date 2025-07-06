import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/shared/Login";
import Onboarding from "./pages/shared/Onboarding";
import Settings from "./pages/shared/Settings";
import BottomNav from "./components/BottomNav";
import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffFeed from "./pages/staff/StaffFeed";
import Attendance from "./pages/staff/Attendance";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminFeed from "./pages/admin/AdminFeed";
import ParentDashboard from "./pages/parents/ParentDashboard";
import ParentFeed from "./pages/parents/ParentFeed";
import { useApp } from "./contexts/AppContext";

// Role-based Dashboard component
const Dashboard: React.FC = () => {
  const { user, isLoadingUser } = useApp();

  if (isLoadingUser || !user) {
    return null; // Don't show anything while loading to avoid flash
  }

  switch (user.role) {
    case "Staff":
      return <StaffDashboard />;
    case "Admin":
      return <AdminDashboard />;
    case "Parent":
      return <ParentDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

// Role-based Feed component
const RoleBasedFeed: React.FC = () => {
  const { user, isLoadingUser } = useApp();

  if (isLoadingUser || !user) {
    return null; // Don't show anything while loading to avoid flash
  }

  switch (user.role) {
    case "Staff":
      return <StaffFeed />;
    case "Admin":
      return <AdminFeed />;
    case "Parent":
      return <ParentFeed />;
    default:
      return <Navigate to="/login" replace />;
  }
};

// Staff-only route protection
const StaffOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useApp();

  if (user?.role !== "Staff") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const location = useLocation();

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
              <RoleBasedFeed />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <StaffOnly>
                <Attendance />
              </StaffOnly>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <BottomNav />
    </>
  );
};

export default AppRoutes;
