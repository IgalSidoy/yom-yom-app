import React from "react";
import {
  Box,
  Container,
  Typography,
  AppBar,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import MobileLayout from "./MobileLayout";

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
    <MobileLayout showBottomNav={true}>
      {/* Header */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "background.default",
          borderBottom: 1,
          borderColor: "divider",
          flexShrink: 0, // Prevent header from shrinking
        }}
      >
        <Container maxWidth={maxWidth} sx={{ px: { xs: 1, sm: 2 } }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              minHeight: { xs: 56, sm: 64 },
              px: { xs: 1, sm: 0 },
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
      <Container
        maxWidth={maxWidth}
        sx={{
          py: { xs: 2, sm: 4 },
          pb: { xs: 2, sm: 4, md: 6 }, // Extra bottom padding on desktop
          px: { xs: 1, sm: 2 },
          width: "100%",
          flex: 1, // Take remaining space
          display: "flex",
          flexDirection: "column",
          minHeight: 0, // Allow flex child to shrink
        }}
      >
        <Box
          sx={{
            maxWidth: "100%",
            mx: "auto",
            width: "100%",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0, // Allow flex child to shrink
            "& > *": {
              width: "100%",
            },
          }}
        >
          {children}
        </Box>
      </Container>
    </MobileLayout>
  );
};

export default AdminSettingsLayout;
