import React, { useState } from "react";
import { Alert } from "@mui/material";
import {
  AttendancePost,
  SleepPost,
  SleepPostErrorBoundary,
  FeedContainer,
} from "../../components/feed";
import { Child } from "../../services/api";
import { useAttendance } from "../../contexts/AttendanceContext";
import { useApp } from "../../contexts/AppContext";
import { useDailyReport } from "../../contexts/DailyReportContext";

const ParentFeed: React.FC = () => {
  const { attendanceData } = useAttendance();
  const { user } = useApp();
  const { dailyReport } = useDailyReport();

  // Loading states
  const [isFeedLoading, setIsFeedLoading] = useState(false);

  // Mock data for parent's children's group
  const mockParentAttendancePosts = [
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

  // Mock sleep posts for parent's children
  const mockParentSleepPosts = [
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

  const handleViewDetails = (id: string) => {
    console.log("View details for post:", id);
  };

  const handleLike = (id: string) => {
    console.log("Like post:", id);
  };

  return (
    <FeedContainer
      title="חדשות הילדים - הורים"
      subtitle="צפה בחדשות ועדכונים על ילדיך מהגן"
      isLoading={isFeedLoading}
    >
      {/* Parent-specific info alert */}
      <Alert severity="info" sx={{ mb: 2 }}>
        צפה בחדשות ועדכונים על ילדיך מהגן
      </Alert>

      {/* Render sleep posts first */}
      {mockParentSleepPosts.map((post) => (
        <SleepPostErrorBoundary
          key={post.id}
          onClose={() => {
            console.log("Sleep post error, removing from view");
          }}
          onRetry={() => {
            console.log("Retrying sleep post render:", post.id);
          }}
        >
          <SleepPost
            {...post}
            onViewDetails={handleViewDetails}
            onEdit={() => {}} // Parents can't edit
            onLike={handleLike}
          />
        </SleepPostErrorBoundary>
      ))}

      {/* Render attendance posts */}
      {mockParentAttendancePosts.map((post) => (
        <AttendancePost
          key={post.id}
          {...post}
          onViewDetails={handleViewDetails}
          onEdit={() => {}} // Parents can't edit
          onLike={handleLike}
        />
      ))}

      {mockParentSleepPosts.length === 0 &&
        mockParentAttendancePosts.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            אין עדיין חדשות להצגה
          </Alert>
        )}
    </FeedContainer>
  );
};

export default ParentFeed;
