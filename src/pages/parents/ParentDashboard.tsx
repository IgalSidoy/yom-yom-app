import React, { useState, useEffect, useMemo, useRef } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../contexts/AppContext";
import { useAttendance } from "../../contexts/AttendanceContext";
import { ApiAttendanceStatus } from "../../types/attendance";
import { attendanceApi, GroupAttendance } from "../../services/api";
import SwipeableCards, {
  SwipeableCardsRef,
} from "../../components/SwipeableCards";
import ParentQuickActionsSlide from "../../components/dashboard/ParentQuickActionsSlide";
import ParentChildrenInfoSlide from "../../components/dashboard/ParentChildrenInfoSlide";

const ParentDashboard: React.FC = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const theme = useTheme();
  const { attendanceData } = useAttendance();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceDataByDate, setAttendanceDataByDate] = useState<
    GroupAttendance[]
  >([]);
  const [loading, setLoading] = useState(false);
  const swiperRef = useRef<SwipeableCardsRef>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch attendance data for today
  const fetchAttendanceData = async () => {
    if (!user?.accountId) return;

    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
      const data = await attendanceApi.getAttendanceByDate(today);
      setAttendanceDataByDate(data);
    } catch (error) {
      console.error("Failed to fetch attendance data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [user?.accountId]);

  // Process attendance data to get parent's children
  const parentChildren = useMemo(() => {
    if (!attendanceDataByDate.length) {
      return [];
    }

    // Flatten all children from all groups and add group and account information
    const allChildren = attendanceDataByDate.flatMap((groupAttendance) =>
      groupAttendance.children.map((child) => ({
        ...child,
        groupName: groupAttendance.groupName,
        accountName: groupAttendance.accountName,
      }))
    );

    // In a real app, you would filter by parentId
    // For now, we'll show all children from the user's account
    return allChildren;
  }, [attendanceDataByDate]);

  const handleViewAttendance = () => {
    // Swipe to the attendance card (index 1 - ParentChildrenInfoSlide)
    swiperRef.current?.swipeTo(1);
  };

  const handleViewMessages = () => {
    navigate("/feed");
  };

  const handleUpdateAttendance = async (childId: string, status: string) => {
    // Find the group attendance data for this child
    const groupAttendance = attendanceDataByDate.find((group) =>
      group.children.some((child) => child.childId === childId)
    );

    if (!groupAttendance) {
      throw new Error("לא נמצאו נתוני נוכחות לילד זה");
    }

    try {
      // Update the child's attendance status
      await attendanceApi.updateChildAttendance(
        groupAttendance.groupId,
        groupAttendance.date,
        childId,
        status
      );
    } catch (error) {
      console.error("Failed to update attendance:", error);
      throw error;
    }
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
      loading={loading}
      onRefresh={fetchAttendanceData}
      onUpdateAttendance={handleUpdateAttendance}
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
        ref={swiperRef}
        slides={slides}
        autoplayDelay={8000}
        spaceBetween={30}
        className="parent-dashboard-swiper"
      />
    </Box>
  );
};

export default ParentDashboard;
