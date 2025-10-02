import React, { useState, useEffect, useMemo, useRef } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../contexts/AppContext";
import { useAttendance } from "../../contexts/AttendanceContext";
import { ApiAttendanceStatus } from "../../types/attendance";
import { attendanceApi, GroupAttendance } from "../../services/api";
import SwipeableCards, {
  SwipeableCardsRef,
} from "../../shared/components/ui/SwipeableCards";
import ParentQuickActionsSlide from "../../features/dashboard/components/ParentQuickActionsSlide";
import ParentChildrenInfoSlide from "../../features/dashboard/components/ParentChildrenInfoSlide";
import DateTimeWidget from "../../shared/components/ui/DateTimeWidget";
import DashboardContainer from "../../features/dashboard/components/DashboardContainer";
import MobileLayout from "../../shared/components/layout/MobileLayout";

const ParentDashboard: React.FC = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const theme = useTheme();
  const { attendanceData } = useAttendance();
  const [attendanceDataByDate, setAttendanceDataByDate] = useState<
    GroupAttendance[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [forceExpandAttendance, setForceExpandAttendance] = useState(false);
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

  // Reset force expand flag after it's been used
  useEffect(() => {
    if (forceExpandAttendance) {
      // Reset the flag after a short delay to allow the accordion to expand
      const timer = setTimeout(() => {
        setForceExpandAttendance(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [forceExpandAttendance]);

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
    // Set flag to force expand the accordion
    setForceExpandAttendance(true);
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
      forceExpand={forceExpandAttendance}
      attendanceDataByDate={attendanceDataByDate}
    />,
  ];

  return (
    <MobileLayout showBottomNav={true}>
      <DashboardContainer>
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
      </DashboardContainer>
    </MobileLayout>
  );
};

export default ParentDashboard;
