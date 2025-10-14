import React from "react";
import HomeIcon from "@mui/icons-material/Home";
import DynamicFeedIcon from "@mui/icons-material/DynamicFeed";
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleIcon from "@mui/icons-material/People";
import { ROUTES } from "../../../config/routes";

export type NavLabel =
  | "Home"
  | "Feed"
  | "Settings"
  | "AdminSettings"
  | "StaffDashboard";

export type UserRole = "Admin" | "Staff" | "Parent";

export interface NavItem {
  id: string;
  label: NavLabel;
  icon: React.ReactElement;
  path: string;
  roles: UserRole[];
  badge?: number;
}

export type NavLabelsMap = {
  heb: Record<NavLabel, string>;
  rus: Record<NavLabel, string>;
  eng: Record<NavLabel, string>;
};

export const navLabels: NavLabelsMap = {
  heb: {
    Home: "בית",
    Feed: "פיד",
    Settings: "הגדרות",
    AdminSettings: "הגדרות",
    StaffDashboard: "נוכחות",
  },
  rus: {
    Home: "Главная",
    Feed: "Лента",
    Settings: "Настройки",
    AdminSettings: "Настройки администратора",
    StaffDashboard: "Посещаемость",
  },
  eng: {
    Home: "Home",
    Feed: "Feed",
    Settings: "Settings",
    AdminSettings: "Admin Settings",
    StaffDashboard: "Attendance",
  },
};

// Get role-based home route
export const getHomeRoute = (role?: UserRole): string => {
  switch (role) {
    case "Admin":
      return ROUTES.ADMIN_DASHBOARD;
    case "Staff":
      return ROUTES.STAFF_DASHBOARD;
    case "Parent":
      return ROUTES.PARENT_DASHBOARD;
    default:
      return ROUTES.DASHBOARD;
  }
};

// Get navigation items based on user role
export const getNavItems = (userRole?: UserRole): NavItem[] => {
  const baseItems: NavItem[] = [
    {
      id: "home",
      label: "Home",
      icon: React.createElement(HomeIcon),
      path: getHomeRoute(userRole),
      roles: ["Admin", "Staff", "Parent"],
    },
    {
      id: "feed",
      label: "Feed",
      icon: React.createElement(DynamicFeedIcon),
      path: "/feed",
      roles: ["Admin", "Staff", "Parent"],
    },
  ];

  // Add attendance for staff users
  if (userRole === "Staff") {
    baseItems.push({
      id: "attendance",
      label: "StaffDashboard",
      icon: React.createElement(PeopleIcon),
      path: "/attendance",
      roles: ["Staff"],
    });
  }

  // Add appropriate settings based on user role
  if (userRole === "Admin") {
    baseItems.push({
      id: "admin-settings",
      label: "AdminSettings",
      icon: React.createElement(SettingsIcon),
      path: "/admin/settings",
      roles: ["Admin"],
    });
  } else {
    baseItems.push({
      id: "settings",
      label: "Settings",
      icon: React.createElement(SettingsIcon),
      path: "/settings",
      roles: ["Staff", "Parent"],
    });
  }

  return baseItems;
};

// Filter navigation items for a specific role
export const getNavItemsForRole = (userRole?: UserRole): NavItem[] => {
  return getNavItems(userRole).filter((item) =>
    item.roles.includes(userRole as UserRole)
  );
};
