import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useApp } from "../contexts/AppContext";
import AdminSettings from "./AdminSettings";
import StaffSettings from "./StaffSettings";
import ParentSettings from "./ParentSettings";

const Settings = () => {
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
          טוען הגדרות...
        </Typography>
      </Box>
    );
  }

  // Render the appropriate settings page based on user role
  switch (user.role) {
    case "Admin":
      return <AdminSettings />;
    case "Staff":
      return <StaffSettings />;
    case "Parent":
      return <ParentSettings />;
    default:
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
          <Typography variant="h6" color="error">
            תפקיד לא מוכר
          </Typography>
          <Typography variant="body2" color="text.secondary">
            לא ניתן לטעון הגדרות עבור תפקיד זה
          </Typography>
        </Box>
      );
  }
};

export default Settings;
