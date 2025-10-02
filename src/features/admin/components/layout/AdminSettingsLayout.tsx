import React from "react";
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../../config/routes";

interface AdminSettingsLayoutProps {
  title: string;
  children: React.ReactNode;
  showBackButton?: boolean;
}

const AdminSettingsLayout: React.FC<AdminSettingsLayoutProps> = ({
  title,
  children,
  showBackButton = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(ROUTES.ADMIN_SETTINGS);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "background.default",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* Left side - Back button for RTL */}
          {showBackButton && (
            <IconButton
              onClick={handleBack}
              sx={{
                color: "text.primary",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}

          {/* Center - Title */}
          <Typography
            variant={isMobile ? "h6" : "h5"}
            sx={{
              fontWeight: 600,
              color: "text.primary",
              flex: 1,
              textAlign: "center",
            }}
          >
            {title}
          </Typography>

          {/* Right side - Empty space for balance */}
          {showBackButton && <Box sx={{ width: 48 }} />}
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {children}
      </Container>
    </Box>
  );
};

export default AdminSettingsLayout;
