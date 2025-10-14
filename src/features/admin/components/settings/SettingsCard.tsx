import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";

export interface SettingsCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info";
}

const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  description,
  icon,
  to,
  color = "primary",
}) => {
  const theme = useTheme();

  const getColorValue = () => {
    switch (color) {
      case "primary":
        return theme.palette.primary.main;
      case "secondary":
        return theme.palette.secondary.main;
      case "success":
        return theme.palette.success.main;
      case "warning":
        return theme.palette.warning.main;
      case "error":
        return theme.palette.error.main;
      case "info":
        return theme.palette.info.main;
      default:
        return theme.palette.primary.main;
    }
  };

  return (
    <Paper
      component={RouterLink}
      to={to}
      elevation={0}
      sx={{
        p: 3,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        textDecoration: "none",
        color: "inherit",
        "&:hover": {
          boxShadow: 3,
          borderColor: getColorValue(),
          transform: "translateY(-2px)",
        },
        "&:active": {
          transform: "translateY(0px)",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            bgcolor: `${getColorValue()}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Box sx={{ color: getColorValue(), fontSize: "1.5rem" }}>{icon}</Box>
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              mb: 1,
              color: "text.primary",
              fontSize: "1.1rem",
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              lineHeight: 1.5,
              fontSize: "0.9rem",
            }}
          >
            {description}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default SettingsCard;
