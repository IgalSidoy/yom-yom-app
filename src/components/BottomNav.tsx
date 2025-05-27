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
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";

type NavLabel = "Home" | "Feed" | "Settings";

type NavLabelsMap = {
  heb: Record<NavLabel, string>;
  rus: Record<NavLabel, string>;
  eng: Record<NavLabel, string>;
};

const navLabels: NavLabelsMap = {
  heb: { Home: "בית", Feed: "פיד", Settings: "הגדרות" },
  rus: { Home: "Главная", Feed: "Лента", Settings: "Настройки" },
  eng: { Home: "Home", Feed: "Feed", Settings: "Settings" },
};

const navItems: { label: NavLabel; icon: React.ReactNode; path: string }[] = [
  { label: "Home", icon: <HomeIcon />, path: "/dashboard" },
  { label: "Feed", icon: <DynamicFeedIcon />, path: "/feed" },
  { label: "Settings", icon: <SettingsIcon />, path: "/settings" },
];

const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
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
        borderRadius: 0,
        bgcolor: "background.paper",
        boxShadow: "0 -2px 8px #0001",
        zIndex: 1000,
      }}
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={currentIndex === -1 ? 0 : currentIndex}
        onChange={(_, newValue) => navigate(navItems[newValue].path)}
        sx={{
          bgcolor: "background.paper",
          "& .Mui-selected": {
            color: "primary.main",
          },
        }}
      >
        {navItems.map((item) => (
          <BottomNavigationAction
            key={item.label}
            label={navLabels[language][item.label]}
            icon={item.icon}
            sx={{
              color: "text.primary",
              "&.Mui-selected": {
                color: "primary.main",
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
