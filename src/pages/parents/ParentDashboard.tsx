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
import DateTimeWidget from "../../components/DateTimeWidget";

const ParentDashboard: React.FC = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const theme = useTheme();
  const { attendanceData } = useAttendance();
  const [attendanceDataByDate, setAttendanceDataByDate] = useState<
    GroupAttendance[]
  >([]);
  const [loading, setLoading] = useState(false);
  const swiperRef = useRef<SwipeableCardsRef>(null);

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
      currentTime={new Date()}
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
        <DateTimeWidget
          showGreeting={true}
          userName={user?.firstName}
          variant="full"
          size="large"
        />
      </Box>

      {/* Swipeable Content */}
      <SwipeableCards
        ref={swiperRef}
        slides={slides}
        autoplayDelay={10000}
        spaceBetween={30}
        className="parent-dashboard-swiper"
      />
    </Box>
  );
};

export default ParentDashboard;
