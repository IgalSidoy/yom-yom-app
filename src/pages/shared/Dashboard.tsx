import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Typography,
  Button,
  Card,
  CardContent,
} from "@mui/material";
import { useApp } from "../../contexts/AppContext";
import PeopleIcon from "@mui/icons-material/People";

const Dashboard: React.FC = () => {
  const { user, isLoadingUser } = useApp();
  const navigate = useNavigate();

  // If user is being loaded, show loading
  if (isLoadingUser || !user) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "50vh",
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          טוען...
        </Typography>
      </Box>
    );
  }

  // Render the appropriate dashboard based on user role
  switch (user.role) {
    case "Staff":
      return (
        <Box sx={{ p: 3, maxWidth: "sm", mx: "auto" }}>
          <Typography
            variant="h4"
            sx={{ mb: 3, textAlign: "center", fontWeight: 700 }}
          >
            ברוכים הבאים!
          </Typography>

          <Card sx={{ mb: 3, boxShadow: 2 }}>
            <CardContent sx={{ textAlign: "center", py: 4 }}>
              <PeopleIcon sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                ניהול נוכחות
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                עקבו אחר נוכחות הילדים וסטטוס ההגעה שלהם
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/attendance")}
                sx={{
                  bgcolor: "#FF9F43",
                  "&:hover": { bgcolor: "#F5820D" },
                }}
              >
                פתח נוכחות
              </Button>
            </CardContent>
          </Card>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center" }}
          >
            השתמשו בתפריט התחתון לניווט מהיר
          </Typography>
        </Box>
      );
    case "Admin":
    case "Parent":
    default:
      return (
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <h2>Dashboard (placeholder)</h2>
          <p>Welcome to the kindergarten app!</p>
        </div>
      );
  }
};

export default Dashboard;
