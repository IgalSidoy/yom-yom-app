import React from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../config/routes";
import { Box, Typography, Button, Container, Paper } from "@mui/material";
import { Home as HomeIcon } from "@mui/icons-material";
import MobileLayout from "../../shared/components/layout/MobileLayout";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate(ROUTES.DASHBOARD);
  };

  return (
    <MobileLayout showBottomNav={false}>
      <Container maxWidth="sm">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            textAlign: "center",
            p: 3,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 3,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            {/* 404 Number */}
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "6rem", sm: "8rem" },
                fontWeight: 700,
                color: "primary.main",
                mb: 2,
                lineHeight: 1,
              }}
            >
              404
            </Typography>

            {/* Error Message */}
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                color: "text.primary",
                mb: 2,
              }}
            >
              עמוד לא נמצא
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                mb: 4,
                fontSize: "1.1rem",
              }}
            >
              הדף שחיפשת לא קיים או הועבר למיקום אחר
            </Typography>

            {/* Action Button */}
            <Button
              variant="contained"
              size="large"
              startIcon={<HomeIcon />}
              onClick={handleGoHome}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontSize: "1.1rem",
                fontWeight: 600,
              }}
            >
              חזרה לדף הבית
            </Button>
          </Paper>
        </Box>
      </Container>
    </MobileLayout>
  );
};

export default NotFound;
