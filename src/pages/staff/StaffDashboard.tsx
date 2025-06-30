import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../contexts/AppContext";
import { useAttendance } from "../../contexts/AttendanceContext";
import { ApiAttendanceStatus } from "../../types/attendance";
import SwipeableCards from "../../components/SwipeableCards";
import QuickActionsSlide from "../../components/dashboard/QuickActionsSlide";
import StatisticsSlide from "../../components/dashboard/StatisticsSlide";
import AdditionalInfoSlide from "../../components/dashboard/AdditionalInfoSlide";

const StaffDashboard: React.FC = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const theme = useTheme();
  const { attendanceData } = useAttendance();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = useMemo(() => {
    if (!attendanceData?.children) {
      return {
        present: 0,
        late: 0,
        absent: 0,
        attendancePercentage: 0,
        total: 0,
      };
    }

    const total = attendanceData.children.length;
    const present = attendanceData.children.filter(
      (child) => child.status === ApiAttendanceStatus.ARRIVED
    ).length;
    const late = attendanceData.children.filter(
      (child) => child.status === ApiAttendanceStatus.LATE
    ).length;
    const absent = attendanceData.children.filter(
      (child) => child.status === ApiAttendanceStatus.MISSING
    ).length;

    const attendancePercentage =
      total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    return {
      present,
      late,
      absent,
      attendancePercentage,
      total,
    };
  }, [attendanceData]);

  const handleStartAttendance = () => {
    navigate("/attendance");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("he-IL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getGreeting = (time: Date) => {
    const hour = time.getHours();
    if (hour < 12) return "בוקר טוב";
    if (hour < 18) return "צהריים טובים";
    return "ערב טוב";
  };

  // Create slides array
  const slides = [
    <QuickActionsSlide
      key="quick-actions"
      onStartAttendance={handleStartAttendance}
      user={user}
      currentTime={currentTime}
    />,
    <StatisticsSlide key="statistics" stats={stats} />,
    <AdditionalInfoSlide key="additional-info" />,
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        p: 2,
        dir: "rtl",
        overflow: "hidden", // Prevent scroll during swipe
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                mb: 0.5,
                fontSize: { xs: "1.5rem", sm: "2rem" },
              }}
            >
              {getGreeting(currentTime)}, {user?.firstName}!
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
            >
              {formatDate(currentTime)}
            </Typography>
          </Box>
          <Box
            sx={{
              textAlign: "center",
              p: 1.5,
              borderRadius: 2,
              bgcolor: "primary.main",
              color: "white",
              minWidth: 70,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1rem" }}>
              {formatTime(currentTime)}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              שעה נוכחית
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Swipeable Content */}
      <SwipeableCards
        slides={slides}
        autoplayDelay={8000}
        spaceBetween={30}
        className="dashboard-swiper"
      />
    </Box>
  );
};

export default StaffDashboard;
