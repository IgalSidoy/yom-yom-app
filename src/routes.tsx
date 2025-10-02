import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ROUTES } from "./config/routes";
import ProtectedRoute from "./shared/components/ui/ProtectedRoute";
import Login from "./pages/shared/Login";
import Onboarding from "./pages/shared/Onboarding";
import Settings from "./pages/shared/Settings";
import CreateSleepPostPage from "./pages/shared/CreateSleepPostPage";
import CreateFoodPostPage from "./pages/shared/CreateFoodPostPage";
import NotFound from "./pages/shared/NotFound";
import BottomNav from "./shared/components/layout/BottomNav";
import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffFeed from "./pages/staff/StaffFeed";
import Attendance from "./pages/staff/Attendance";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminFeed from "./pages/admin/AdminFeed";
import AdminSettingsPageNew from "./features/admin/pages/AdminSettingsPageNew";
import ProfileSettings from "./features/admin/components/settings/ProfileSettings";
import OrganizationSettings from "./features/admin/components/settings/OrganizationSettings";
import AccountsSettings from "./features/admin/components/settings/AccountsSettings";
import AccountEditPage from "./features/admin/components/settings/AccountEditPage";
import GroupsSettings from "./features/admin/components/settings/GroupsSettings";
import UsersSettings from "./features/admin/components/settings/UsersSettings";
import ChildrenSettings from "./features/admin/components/settings/ChildrenSettings";
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

// Staff and Admin route protection (redirects Parent users to dashboard)
const StaffAndAdminOnly: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useApp();

  if (user?.role === "Parent") {
    return <Navigate to="/dashboard" replace />;
  }

  if (user?.role === "Staff" || user?.role === "Admin") {
    return <>{children}</>;
  }

  // For any other role or no role, redirect to dashboard
  return <Navigate to="/dashboard" replace />;
};

const AppRoutes: React.FC = () => {
  const location = useLocation();

  // Hide bottom navigation for create post pages, login page, and onboarding page
  const shouldShowBottomNav =
    !location.pathname.includes(ROUTES.SLEEP_POST) &&
    !location.pathname.includes(ROUTES.FOOD_POST) &&
    !location.pathname.includes(ROUTES.LOGIN) &&
    !location.pathname.includes(ROUTES.ONBOARDING);

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
          path={ROUTES.ADMIN_DASHBOARD}
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.STAFF_DASHBOARD}
          element={
            <ProtectedRoute>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PARENT_DASHBOARD}
          element={
            <ProtectedRoute>
              <ParentDashboard />
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
          path={ROUTES.ADMIN_SETTINGS}
          element={
            <ProtectedRoute>
              <AdminSettingsPageNew />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_PROFILE}
          element={
            <ProtectedRoute>
              <ProfileSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_ORGANIZATION}
          element={
            <ProtectedRoute>
              <OrganizationSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_ACCOUNTS}
          element={
            <ProtectedRoute>
              <AccountsSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_ACCOUNT_EDIT}
          element={
            <ProtectedRoute>
              <AccountEditPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_ACCOUNT_CREATE}
          element={
            <ProtectedRoute>
              <AccountEditPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_GROUPS}
          element={
            <ProtectedRoute>
              <GroupsSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_USERS}
          element={
            <ProtectedRoute>
              <UsersSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_CHILDREN}
          element={
            <ProtectedRoute>
              <ChildrenSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SLEEP_POST}
          element={
            <ProtectedRoute>
              <StaffOnly>
                <CreateSleepPostPage />
              </StaffOnly>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.FOOD_POST}
          element={
            <ProtectedRoute>
              <StaffAndAdminOnly>
                <CreateFoodPostPage />
              </StaffAndAdminOnly>
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
        <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
      </Routes>
      {shouldShowBottomNav && <BottomNav />}
    </>
  );
};

export default AppRoutes;
