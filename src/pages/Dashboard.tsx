import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useApp } from "../contexts/AppContext";
import StaffDashboard from "./StaffDashboard";

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
      return <StaffDashboard />;
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
