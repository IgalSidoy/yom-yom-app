import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ROUTES } from "./config/routes";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/shared/Login";
import Onboarding from "./pages/shared/Onboarding";
import Settings from "./pages/shared/Settings";
import CreateSleepPostPage from "./pages/shared/CreateSleepPostPage";
import NotFound from "./pages/shared/NotFound";
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

  // Hide bottom navigation for create sleep post page
  const shouldShowBottomNav = !location.pathname.includes(
    ROUTES.CREATE_SLEEP_POST
  );

  return (
    <>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.ONBOARDING} element={<Onboarding />} />
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SETTINGS}
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.FEED}
          element={
            <ProtectedRoute>
              <RoleBasedFeed />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ATTENDANCE}
          element={
            <ProtectedRoute>
              <StaffOnly>
                <Attendance />
              </StaffOnly>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CREATE_SLEEP_POST}
          element={
            <ProtectedRoute>
              <StaffOnly>
                <CreateSleepPostPage />
              </StaffOnly>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
      </Routes>
      {shouldShowBottomNav && <BottomNav />}
    </>
  );
};

export default AppRoutes;
