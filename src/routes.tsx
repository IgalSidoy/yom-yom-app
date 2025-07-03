import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/shared/Login";
import Onboarding from "./pages/shared/Onboarding";
import Settings from "./pages/shared/Settings";
import Feed from "./pages/shared/Feed";
import BottomNav from "./components/BottomNav";
import StaffDashboard from "./pages/staff/StaffDashboard";
import Attendance from "./pages/staff/Attendance";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ParentDashboard from "./pages/parents/ParentDashboard";
import { useApp } from "./contexts/AppContext";

// Role-based Dashboard component
const Dashboard: React.FC = () => {
  const { user, isLoadingUser } = useApp();

  if (isLoadingUser || !user) {
    return <div>Loading...</div>;
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
