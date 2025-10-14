import React, { useState, useEffect } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  IconButton,
  Divider,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useApp } from "../../../contexts/AppContext";
import { getNavItemsForRole, navLabels, NavItem } from "./navigationConfig";
import SidebarProfile from "./SidebarProfile";

interface SidebarProps {
  onToggle?: (isExpanded: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onToggle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useApp();

  // Sidebar state
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem("sidebar-expanded");
    return saved ? JSON.parse(saved) : true;
  });
  const [isHovered, setIsHovered] = useState(false);

  // Get navigation items for current user role
  const navItems = getNavItemsForRole(user?.role as any);

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem("sidebar-expanded", JSON.stringify(isExpanded));
    onToggle?.(isExpanded);
  }, [isExpanded, onToggle]);

  // Auto-collapse on mobile
  useEffect(() => {
    if (isMobile) {
      setIsExpanded(false);
    }
  }, [isMobile]);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleItemClick = (item: NavItem) => {
    navigate(item.path);
    // Auto-collapse on mobile after navigation
    if (isMobile) {
      setIsExpanded(false);
    }
  };

  const isActiveRoute = (item: NavItem) => {
    return location.pathname.startsWith(item.path);
  };

  const sidebarWidth = isExpanded ? 240 : 72;

  return (
    <Box
      sx={{
        position: "fixed",
        left: 0,
        top: 0,
        height: "100vh",
        width: sidebarWidth,
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderRight: "1px solid rgba(255, 145, 77, 0.2)",
        boxShadow: "4px 0 24px rgba(0, 0, 0, 0.04)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        zIndex: 1200,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header with Toggle Button */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: isExpanded ? "space-between" : "center",
          minHeight: 64,
        }}
      >
        {isExpanded && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 2,
                background: "linear-gradient(135deg, #FF914D 0%, #FFB74D 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
                fontSize: "1rem",
              }}
            >
              Y
            </Box>
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                  lineHeight: 1,
                }}
              >
                יום יום
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontSize: "0.7rem",
                }}
              >
                ניהול גנים
              </Typography>
            </Box>
          </Box>
        )}

        <Tooltip title={isExpanded ? "צמצם" : "הרחב"} placement="right">
          <IconButton
            onClick={handleToggle}
            size="small"
            sx={{
              color: "text.secondary",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "primary.main",
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            {isExpanded ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>
        </Tooltip>
      </Box>

      <Divider sx={{ borderColor: "rgba(255, 145, 77, 0.1)" }} />

      {/* Navigation Items */}
      <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        <List sx={{ p: 1 }}>
          {navItems.map((item) => {
            const isActive = isActiveRoute(item);
            const label = navLabels[language][item.label];

            return (
              <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                {isExpanded ? (
                  <ListItemButton
                    onClick={() => handleItemClick(item)}
                    sx={{
                      borderRadius: 2,
                      mx: 0.5,
                      py: 1.5,
                      px: 2,
                      backgroundColor: isActive
                        ? "rgba(255, 145, 77, 0.15)"
                        : "transparent",
                      border: isActive
                        ? "1px solid rgba(255, 145, 77, 0.3)"
                        : "1px solid transparent",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        backgroundColor: isActive
                          ? "rgba(255, 145, 77, 0.2)"
                          : "rgba(255, 255, 255, 0.1)",
                        transform: "translateX(2px)",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        color: isActive ? "primary.main" : "text.secondary",
                        transition: "all 0.2s ease-in-out",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={label}
                      sx={{
                        "& .MuiListItemText-primary": {
                          fontWeight: isActive ? 600 : 500,
                          color: isActive ? "primary.main" : "text.primary",
                          fontSize: "0.875rem",
                          transition: "all 0.2s ease-in-out",
                        },
                      }}
                    />
                  </ListItemButton>
                ) : (
                  <Tooltip title={label} placement="right">
                    <ListItemButton
                      onClick={() => handleItemClick(item)}
                      sx={{
                        borderRadius: 2,
                        mx: 0.5,
                        py: 1.5,
                        px: 1,
                        display: "flex",
                        justifyContent: "center",
                        backgroundColor: isActive
                          ? "rgba(255, 145, 77, 0.15)"
                          : "transparent",
                        border: isActive
                          ? "1px solid rgba(255, 145, 77, 0.3)"
                          : "1px solid transparent",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          backgroundColor: isActive
                            ? "rgba(255, 145, 77, 0.2)"
                            : "rgba(255, 255, 255, 0.1)",
                          transform: "scale(1.05)",
                        },
                        position: "relative",
                        "&::before": isActive
                          ? {
                              content: '""',
                              position: "absolute",
                              left: 0,
                              top: "50%",
                              transform: "translateY(-50%)",
                              width: 3,
                              height: 24,
                              backgroundColor: "primary.main",
                              borderRadius: "0 2px 2px 0",
                            }
                          : {},
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: "auto",
                          color: isActive ? "primary.main" : "text.secondary",
                          transition: "all 0.2s ease-in-out",
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                    </ListItemButton>
                  </Tooltip>
                )}
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* User Profile Section */}
      <SidebarProfile isExpanded={isExpanded} />
    </Box>
  );
};

export default Sidebar;
