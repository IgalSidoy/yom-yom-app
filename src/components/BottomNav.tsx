import React from "react";
import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import DynamicFeedIcon from "@mui/icons-material/DynamicFeed";
import SettingsIcon from "@mui/icons-material/Settings";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { label: "Home", icon: <HomeIcon />, path: "/dashboard" },
  { label: "Feed", icon: <DynamicFeedIcon />, path: "/feed" },
  { label: "Settings", icon: <SettingsIcon />, path: "/settings" },
];

const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
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
            label={item.label}
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
    </Paper>
  );
};

export default BottomNav;
