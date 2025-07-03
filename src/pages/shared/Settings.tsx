import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useApp } from "../../contexts/AppContext";
import AdminSettings from "../admin/AdminSettings";
import StaffSettings from "../staff/StaffSettings";
import ParentSettings from "../parents/ParentSettings";

const Settings = () => {
  const { user, isLoadingUser } = useApp();
  const navigate = useNavigate();

  if (isLoadingUser) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  switch (user.role) {
    case "Admin":
      return <AdminSettings />;
    case "Staff":
      return <StaffSettings />;
    case "Parent":
      return <ParentSettings />;
    default:
      return (
        <Typography variant="h6" sx={{ mt: 4, textAlign: "center" }}>
          לא נמצאו הגדרות מתאימות
        </Typography>
      );
  }
};

export default Settings;
