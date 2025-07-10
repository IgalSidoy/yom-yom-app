import React, { useState, useEffect } from "react";
import { Alert, Box, Typography, Chip, Avatar } from "@mui/material";
import {
  AttendancePost,
  SleepPost,
  SleepPostErrorBoundary,
  FeedContainer,
  FetchDailyReportButton,
} from "../../components/feed";
import {
  CreateSleepPostData,
  SleepPost as SleepPostType,
} from "../../types/posts";
import { Child } from "../../services/api";
import { useAttendance } from "../../contexts/AttendanceContext";
import { useApp } from "../../contexts/AppContext";
import { useDailyReport } from "../../contexts/DailyReportContext";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../config/routes";

const StaffFeed: React.FC = () => {
  const { attendanceData } = useAttendance();
  const { user } = useApp();
  const { dailyReport, fetchDailyReport } = useDailyReport();
  const navigate = useNavigate();

  // Loading states
  const [isFeedLoading, setIsFeedLoading] = useState(false);
  const [isPostsLoading, setIsPostsLoading] = useState(false);

  // Mock sleep posts for demonstration
  const [sleepPosts, setSleepPosts] = useState<SleepPostType[]>([]);

  // Mock data for staff's group only
  const mockStaffAttendancePosts = [
    {
      id: "1",
      title: "נוכחות יומית - גן א",
      groupName: "גן א",
      attendanceDate: "יום שני, 15 בינואר 2024",
      presentCount: 18,
      totalCount: 22,
      status: "completed" as const,
      teacherName: "שרה כהן",
      teacherAvatar: "https://randomuser.me/api/portraits/women/32.jpg",
      publishDate: "יום שני, 15 בינואר 2024 08:30",
      isLiked: true,
      likeCount: 5,
    },
    {
      id: "2",
      title: "נוכחות בוקר - גן א",
      groupName: "גן א",
      attendanceDate: "יום שני, 15 בינואר 2024",
      presentCount: 15,
      totalCount: 20,
      status: "in-progress" as const,
      teacherName: "דוד לוי",
      teacherAvatar: "https://randomuser.me/api/portraits/men/45.jpg",
      publishDate: "יום שני, 15 בינואר 2024 09:15",
      isLiked: false,
      likeCount: 3,
    },
  ];

  // Mock sleep posts for staff
  const mockStaffSleepPosts = [
    {
      id: "1",
      type: "sleep" as const,
      title: "שנת צהריים - גן א",
      groupName: "גן א",
      sleepDate: "יום שני, 15 בינואר 2024",
      children: [
        {
          childId: "child1",
          firstName: "יוסי",
          lastName: "כהן",
          sleepDuration: 120,
        },
        {
          childId: "child2",
          firstName: "שרה",
          lastName: "לוי",
          sleepDuration: 90,
        },
      ],
      totalChildren: 2,
      sleepingChildren: 2,
      averageSleepDuration: 105,
      status: "active" as const,
      teacherName: "שרה כהן",
      teacherAvatar: "https://randomuser.me/api/portraits/women/32.jpg",
      publishDate: "יום שני, 15 בינואר 2024 12:30",
      isLiked: true,
      likeCount: 8,
    },
  ];

  useEffect(() => {
    // Initialize sleep posts with mock data
    setSleepPosts(mockStaffSleepPosts);
  }, []);

  const handleViewDetails = (id: string) => {
    console.log("View details for post:", id);
  };

  const handleEdit = (id: string) => {
    console.log("Edit post:", id);
  };

  const handleLike = (id: string) => {
    console.log("Like post:", id);
  };

  // Post type selection handler
  const handlePostTypeSelect = async (postType: string) => {
    switch (postType) {
      case "sleep":
        navigate(ROUTES.SLEEP_POST);
        break;
      case "attendance":
        navigate(ROUTES.ATTENDANCE);
        break;
      default:
        console.log("Unknown post type:", postType);
    }
  };

  return (
    <FeedContainer
      title="הזנת חדשות - צוות"
      subtitle="צפה ועדכן חדשות ומידע חשוב לקבוצתך"
      isLoading={isFeedLoading}
      isPostsLoading={isPostsLoading}
      showFloatingButton={true}
      onPostTypeSelect={handlePostTypeSelect}
      headerContent={<FetchDailyReportButton />}
    >
      {/* Staff-specific info alert */}
      <Alert severity="info" sx={{ mb: 2 }}>
        כאן תוכלו לראות את כל המידע והעדכונים על קבוצתכם
      </Alert>

      {/* Render sleep posts first */}
      {sleepPosts.map((post) => (
        <SleepPostErrorBoundary
          key={post.id}
          onClose={() => {
            setSleepPosts((prev) => prev.filter((p) => p.id !== post.id));
          }}
          onRetry={() => {
            console.log("Retrying sleep post render:", post.id);
          }}
        >
          <SleepPost
            {...post}
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
            onLike={handleLike}
          />
        </SleepPostErrorBoundary>
      ))}

      {/* Render attendance posts */}
      {mockStaffAttendancePosts.map((post) => (
        <AttendancePost
          key={post.id}
          {...post}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onLike={handleLike}
        />
      ))}

      {sleepPosts.length === 0 && mockStaffAttendancePosts.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          אין עדיין חדשות להצגה
        </Alert>
      )}
    </FeedContainer>
  );
};

export default StaffFeed;
