import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../contexts/AppContext";
import { useAttendance } from "../../contexts/AttendanceContext";
import { ApiAttendanceStatus } from "../../types/attendance";
import SwipeableCards from "../../components/SwipeableCards";
import ParentQuickActionsSlide from "../../components/dashboard/ParentQuickActionsSlide";
import ParentChildrenInfoSlide from "../../components/dashboard/ParentChildrenInfoSlide";

const ParentDashboard: React.FC = () => {
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

  // Mock data for parent's children - in real app this would come from API
  const parentChildren = useMemo(() => {
    if (!attendanceData?.children) {
      return [];
    }

    // Filter children that belong to this parent
    // In real app, you'd filter by parentId
    return attendanceData.children.slice(0, 3).map((child, index) => ({
      id: child.childId || `child-${index}`,
      name: child.firstName || `ילד ${index + 1}`,
      status:
        child.status === ApiAttendanceStatus.ARRIVED
          ? ("present" as const)
          : child.status === ApiAttendanceStatus.LATE
          ? ("late" as const)
          : ("absent" as const),
      groupName: attendanceData.groupName || "קבוצה א",
      avatar: undefined, // Not available in current API
    }));
  }, [attendanceData]);

  const handleViewAttendance = () => {
    navigate("/attendance");
  };

  const handleViewMessages = () => {
    navigate("/feed");
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
    <ParentQuickActionsSlide
      key="quick-actions"
      onViewAttendance={handleViewAttendance}
      onViewMessages={handleViewMessages}
      childrenCount={parentChildren.length}
      hasUnreadMessages={true} // Mock data - in real app this would come from API
    />,
    <ParentChildrenInfoSlide
      key="children-info"
      children={parentChildren}
      currentTime={currentTime}
    />,
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
        className="parent-dashboard-swiper"
      />
    </Box>
  );
};

export default ParentDashboard;
