import React from "react";
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export interface AdminSettingsLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  showBackButton?: boolean;
  backPath?: string;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
}

const AdminSettingsLayout: React.FC<AdminSettingsLayoutProps> = ({
  title,
  subtitle,
  children,
  showBackButton = true,
  backPath = "/admin/settings",
  maxWidth = "md",
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(backPath);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Header */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "background.default",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Container maxWidth={maxWidth}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              minHeight: 64,
              px: { xs: 2, sm: 0 },
            }}
          >
            {/* Left section - Empty */}
            <Box sx={{ flex: 1 }} />

            {/* Center section - Title */}
            <Box sx={{ flex: 1, textAlign: "center" }}>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                sx={{
                  fontWeight: 600,
                  color: "text.primary",
                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                }}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontSize: { xs: "0.8rem", sm: "0.9rem" },
                    mt: 0.5,
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>

            {/* Right section - Back button */}
            <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
              {showBackButton && (
                <IconButton
                  onClick={handleBack}
                  sx={{
                    color: "text.primary",
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                  aria-label="חזור"
                >
                  <ArrowBackIcon />
                </IconButton>
              )}
            </Box>
          </Box>
        </Container>
      </AppBar>

      {/* Content */}
      <Container maxWidth={maxWidth} sx={{ py: 4 }}>
        <Box
          sx={{
            maxWidth: "100%",
            mx: "auto",
            "& > *": {
              width: "100%",
            },
          }}
        >
          {children}
        </Box>
      </Container>
    </Box>
  );
};

export default AdminSettingsLayout;
