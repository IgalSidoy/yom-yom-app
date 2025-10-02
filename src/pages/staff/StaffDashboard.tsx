import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  useTheme,
  Skeleton,
  Fade,
  Slide,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../config/routes";
import { useApp } from "../../contexts/AppContext";
import { useAttendance } from "../../contexts/AttendanceContext";
import { ApiAttendanceStatus } from "../../types/attendance";
import SwipeableCards from "../../shared/components/ui/SwipeableCards";
import QuickActionsSlide from "../../features/dashboard/components/QuickActionsSlide";
import StatisticsSlide from "../../features/dashboard/components/StatisticsSlide";
import AdditionalInfoSlide from "../../features/dashboard/components/AdditionalInfoSlide";
import DateTimeWidget from "../../shared/components/ui/DateTimeWidget";
import DashboardContainer from "../../features/dashboard/components/DashboardContainer";

const StaffDashboard: React.FC = () => {
  const { user, isLoadingUser } = useApp();
  const navigate = useNavigate();
  const theme = useTheme();
  const { attendanceData, isAttendanceClosed } = useAttendance();

  // Check if all data is ready (only user loaded, attendance data is optional for dashboard)
  const isDataReady = useMemo(() => {
    // Only show content when user is loaded
    return !isLoadingUser && user !== null;
  }, [isLoadingUser, user]);

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
    navigate(ROUTES.ATTENDANCE);
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

  // Skeleton components
  const HeaderSkeleton = () => (
    <Box sx={{ mb: 3 }}>
      <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
    </Box>
  );

  const SwipeableCardsSkeleton = () => (
    <Box
      sx={{
        height: { xs: "calc(100vh - 210px)", sm: "calc(100vh - 240px)" },
        border: { xs: "none", sm: "1px solid" },
        borderColor: { xs: "transparent", sm: "divider" },
        borderRadius: { xs: 0, sm: 2 },
        boxShadow: { xs: "none", sm: "0 2px 8px rgba(0, 0, 0, 0.1)" },
        p: 3,
      }}
    >
      {/* Quick Actions Skeleton */}
      <Box sx={{ mb: 4 }}>
        <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
          <Skeleton
            variant="rectangular"
            width={120}
            height={80}
            sx={{ borderRadius: 2 }}
          />
          <Skeleton
            variant="rectangular"
            width={120}
            height={80}
            sx={{ borderRadius: 2 }}
          />
          <Skeleton
            variant="rectangular"
            width={120}
            height={80}
            sx={{ borderRadius: 2 }}
          />
        </Box>
        <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
      </Box>

      {/* Statistics Skeleton */}
      <Box sx={{ mb: 4 }}>
        <Skeleton variant="text" width="30%" height={28} sx={{ mb: 2 }} />
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Skeleton
            variant="rectangular"
            width={100}
            height={80}
            sx={{ borderRadius: 2 }}
          />
          <Skeleton
            variant="rectangular"
            width={100}
            height={80}
            sx={{ borderRadius: 2 }}
          />
          <Skeleton
            variant="rectangular"
            width={100}
            height={80}
            sx={{ borderRadius: 2 }}
          />
          <Skeleton
            variant="rectangular"
            width={100}
            height={80}
            sx={{ borderRadius: 2 }}
          />
        </Box>
      </Box>

      {/* Additional Info Skeleton */}
      <Box>
        <Skeleton variant="text" width="35%" height={28} sx={{ mb: 2 }} />
        <Skeleton
          variant="rectangular"
          height={120}
          sx={{ borderRadius: 2, mb: 2 }}
        />
        <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
      </Box>
    </Box>
  );

  return (
    <DashboardContainer>
      {/* Skeleton Loading State */}
      <Fade in={!isDataReady} timeout={300}>
        <Box sx={{ display: isDataReady ? "none" : "block" }}>
          <HeaderSkeleton />
          <SwipeableCardsSkeleton />
        </Box>
      </Fade>

      {/* Actual Dashboard Content */}
      <Fade in={isDataReady} timeout={800}>
        <Box sx={{ display: isDataReady ? "block" : "none" }}>
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
      </Fade>
    </DashboardContainer>
  );
};

export default StaffDashboard;
