import React, { useState } from "react";
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Divider,
  Tooltip,
  useTheme,
} from "@mui/material";
import {
  Language as LanguageIcon,
  Logout as LogoutIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useApp } from "../../../contexts/AppContext";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface SidebarProfileProps {
  isExpanded: boolean;
}

const SidebarProfile: React.FC<SidebarProfileProps> = ({ isExpanded }) => {
  const theme = useTheme();
  const { user } = useApp();
  const { logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [languageAnchorEl, setLanguageAnchorEl] = useState<null | HTMLElement>(
    null
  );

  const handleLanguageClick = (event: React.MouseEvent<HTMLElement>) => {
    setLanguageAnchorEl(event.currentTarget);
  };

  const handleLanguageClose = () => {
    setLanguageAnchorEl(null);
  };

  const handleLanguageSelect = (newLanguage: string) => {
    setLanguage(newLanguage as any);
    handleLanguageClose();
  };

  const handleLogout = () => {
    logout();
  };

  const getRoleLabel = (role?: string) => {
    const labels = {
      heb: {
        Admin: "מנהל",
        Staff: "צוות",
        Parent: "הורה",
      },
      rus: {
        Admin: "Администратор",
        Staff: "Персонал",
        Parent: "Родитель",
      },
      eng: {
        Admin: "Admin",
        Staff: "Staff",
        Parent: "Parent",
      },
    };
    return (
      labels[language as keyof typeof labels][
        role as keyof typeof labels.heb
      ] || role
    );
  };

  const getLanguageLabel = (lang: string) => {
    const labels = {
      heb: "עברית",
      rus: "Русский",
      eng: "English",
    };
    return labels[lang as keyof typeof labels] || lang;
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case "Admin":
        return "error";
      case "Staff":
        return "primary";
      case "Parent":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <Box
      sx={{
        mt: "auto",
        p: isExpanded ? 2 : 1,
        borderTop: "1px solid",
        borderColor: "divider",
        backgroundColor: "rgba(255, 255, 255, 0.05)",
      }}
    >
      {/* User Info Section */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: isExpanded ? 2 : 0,
          mb: 2,
        }}
      >
        <Avatar
          sx={{
            width: isExpanded ? 40 : 32,
            height: isExpanded ? 40 : 32,
            bgcolor: theme.palette.primary.main,
            fontSize: isExpanded ? "1rem" : "0.875rem",
            fontWeight: 600,
          }}
        >
          {user?.firstName?.charAt(0) || "U"}
        </Avatar>

        {isExpanded && (
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "text.primary",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.firstName} {user?.lastName}
            </Typography>
            <Chip
              label={getRoleLabel(user?.role)}
              size="small"
              color={getRoleColor(user?.role) as any}
              sx={{
                fontSize: "0.7rem",
                height: 20,
                mt: 0.5,
              }}
            />
          </Box>
        )}
      </Box>

      {/* Language Selector */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: isExpanded ? "space-between" : "center",
          mb: 1,
        }}
      >
        {isExpanded ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
              p: 1,
              borderRadius: 1,
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
            onClick={handleLanguageClick}
          >
            <LanguageIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {getLanguageLabel(language)}
            </Typography>
            <ExpandMoreIcon sx={{ fontSize: 16, color: "text.secondary" }} />
          </Box>
        ) : (
          <Tooltip title={getLanguageLabel(language)} placement="right">
            <IconButton
              size="small"
              onClick={handleLanguageClick}
              sx={{
                color: "text.secondary",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  color: "primary.main",
                },
              }}
            >
              <LanguageIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        )}

        <Menu
          anchorEl={languageAnchorEl}
          open={Boolean(languageAnchorEl)}
          onClose={handleLanguageClose}
          anchorOrigin={{
            vertical: "top",
            horizontal: isExpanded ? "left" : "right",
          }}
          transformOrigin={{
            vertical: "bottom",
            horizontal: isExpanded ? "left" : "right",
          }}
          PaperProps={{
            sx: {
              minWidth: 120,
              borderRadius: 2,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
              border: "1px solid",
              borderColor: "divider",
            },
          }}
        >
          <MenuItem onClick={() => handleLanguageSelect("heb")}>
            <Typography variant="body2">עברית</Typography>
          </MenuItem>
          <MenuItem onClick={() => handleLanguageSelect("rus")}>
            <Typography variant="body2">Русский</Typography>
          </MenuItem>
          <MenuItem onClick={() => handleLanguageSelect("eng")}>
            <Typography variant="body2">English</Typography>
          </MenuItem>
        </Menu>
      </Box>

      {/* Logout Button */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: isExpanded ? "flex-start" : "center",
        }}
      >
        {isExpanded ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
              p: 1,
              borderRadius: 1,
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
            onClick={handleLogout}
          >
            <LogoutIcon sx={{ fontSize: 18, color: "error.main" }} />
            <Typography variant="caption" sx={{ color: "error.main" }}>
              התנתק
            </Typography>
          </Box>
        ) : (
          <Tooltip title="התנתק" placement="right">
            <IconButton
              size="small"
              onClick={handleLogout}
              sx={{
                color: "error.main",
                "&:hover": {
                  backgroundColor: "rgba(244, 67, 54, 0.1)",
                },
              }}
            >
              <LogoutIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

export default SidebarProfile;
