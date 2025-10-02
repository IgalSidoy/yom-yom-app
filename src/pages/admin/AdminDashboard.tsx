import React from "react";
import { Box, Typography } from "@mui/material";
import DashboardContainer from "../../features/dashboard/components/DashboardContainer";

const AdminDashboard: React.FC = () => (
  <DashboardContainer>
    <Box sx={{ textAlign: "center", py: 4 }}>
      <Typography variant="h3" sx={{ mb: 2, fontWeight: 600 }}>
        לוח בקרה - מנהל
      </Typography>
      <Typography variant="h5" sx={{ mb: 2, color: "text.secondary" }}>
        ברוך הבא, מנהל!
      </Typography>
      <Typography variant="body1" sx={{ color: "text.secondary" }}>
        זהו לוח הבקרה שלך. תכונות נוספות יגיעו בקרוב.
      </Typography>
    </Box>
  </DashboardContainer>
);

export default AdminDashboard;
