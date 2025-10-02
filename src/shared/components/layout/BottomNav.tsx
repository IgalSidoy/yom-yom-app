import React from "react";
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  InputLabel,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import DynamicFeedIcon from "@mui/icons-material/DynamicFeed";
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleIcon from "@mui/icons-material/People";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useApp } from "../../../contexts/AppContext";

type NavLabel =
  | "Home"
  | "Feed"
  | "Settings"
  | "AdminSettings"
  | "StaffDashboard";

type NavLabelsMap = {
  heb: Record<NavLabel, string>;
  rus: Record<NavLabel, string>;
  eng: Record<NavLabel, string>;
};

const navLabels: NavLabelsMap = {
  heb: {
    Home: "בית",
    Feed: "פיד",
    Settings: "הגדרות",
    AdminSettings: "הגדרות מנהל",
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

const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useApp();

  // Define navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      { label: "Home" as NavLabel, icon: <HomeIcon />, path: "/dashboard" },
      { label: "Feed" as NavLabel, icon: <DynamicFeedIcon />, path: "/feed" },
    ];

    // Add attendance for staff users
    if (user?.role === "Staff") {
      baseItems.push({
        label: "StaffDashboard" as NavLabel,
        icon: <PeopleIcon />,
        path: "/attendance",
      });
    }

    // Add appropriate settings based on user role
    if (user?.role === "Admin") {
      baseItems.push({
        label: "AdminSettings" as NavLabel,
        icon: <SettingsIcon />,
        path: "/admin/settings",
      });
    } else {
      baseItems.push({
        label: "Settings" as NavLabel,
        icon: <SettingsIcon />,
        path: "/settings",
      });
    }

    return baseItems;
  };

  const navItems = getNavItems();
  const currentIndex = navItems.findIndex((item) =>
    location.pathname.startsWith(item.path)
  );

  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        borderRadius: "16px 16px 0 0",
        bgcolor: "background.paper",
        boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.08)",
        zIndex: 1000,
        height: { xs: "calc(72px + env(safe-area-inset-bottom))", sm: "72px" },
        borderTop: "1px solid",
        borderColor: "divider",
      }}
      elevation={0}
    >
      <BottomNavigation
        showLabels
        value={currentIndex === -1 ? 0 : currentIndex}
        onChange={(_, newValue) => navigate(navItems[newValue].path)}
        sx={{
          bgcolor: "transparent",
          height: "100%",
          "& .Mui-selected": {
            color: "#FF9F43",
            "& .MuiBottomNavigationAction-label": {
              fontWeight: 600,
              color: "#FF9F43",
            },
          },
          "& .MuiBottomNavigationAction-root": {
            minWidth: "auto",
            padding: "8px 12px",
            color: "#9E9E9E",
            "& .MuiBottomNavigationAction-label": {
              fontSize: "0.75rem",
              fontWeight: 500,
              transition: "all 0.2s",
              color: "#9E9E9E",
              "&.Mui-selected": {
                fontSize: "0.75rem",
                color: "#FF9F43",
              },
            },
            "& .MuiSvgIcon-root": {
              fontSize: "1.5rem",
              transition: "all 0.2s",
              color: "inherit",
            },
          },
        }}
      >
        {navItems.map((item) => (
          <BottomNavigationAction
            key={item.label}
            label={navLabels[language][item.label]}
            icon={item.icon}
            sx={{
              "&.Mui-selected": {
                "& .MuiSvgIcon-root": {
                  transform: "scale(1.1)",
                  color: "#FF9F43",
                },
              },
            }}
          />
        ))}
      </BottomNavigation>
      <InputLabel id="language-select-label">
        {language === "heb"
          ? "עברית"
          : language === "rus"
          ? "Русский"
          : "English"}
      </InputLabel>
    </Paper>
  );
};

export default BottomNav;
