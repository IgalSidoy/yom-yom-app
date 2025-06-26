import React from "react";
import DailyAttendance from "../../components/DailyAttendance";
import { Box, Typography, Button, Card, CardContent } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import { useNavigate } from "react-router-dom";

const StaffDashboard = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ mt: 4, px: 2 }}>
      {/* Welcome Card */}
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

      {/* Attendance Component */}
      <Box data-attendance>
        <DailyAttendance />
      </Box>
    </Box>
  );
};

export default StaffDashboard;
