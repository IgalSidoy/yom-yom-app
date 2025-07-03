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
import DateTimeWidget from "../../components/DateTimeWidget";

const StaffDashboard: React.FC = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const theme = useTheme();
  const { attendanceData, isAttendanceClosed } = useAttendance();

  // Check if attendance is closed (either from context error or attendance data)
  const isAttendanceClosedComputed = useMemo(() => {
    return isAttendanceClosed || attendanceData?.isClosed || false;
  }, [isAttendanceClosed, attendanceData?.isClosed]);

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

  // Create slides array
  const slides = [
    <QuickActionsSlide
      key="quick-actions"
      onStartAttendance={handleStartAttendance}
      user={user}
      currentTime={new Date()}
      isAttendanceClosed={isAttendanceClosedComputed}
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
        <DateTimeWidget
          showGreeting={true}
          userName={user?.firstName}
          variant="full"
          size="large"
        />
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
