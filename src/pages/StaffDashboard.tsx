import React from "react";
import DailyAttendance from "../components/DailyAttendance";
import { Box, Typography } from "@mui/material";

const StaffDashboard = () => {
  return (
    <Box sx={{ mt: 4, px: 2 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        דף צוות - נוכחות יומית
      </Typography>
      <DailyAttendance />
    </Box>
  );
};

export default StaffDashboard;
