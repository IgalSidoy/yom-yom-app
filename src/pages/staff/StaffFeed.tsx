import React, { useState } from "react";
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

const StaffFeed: React.FC = () => {
  const { attendanceData } = useAttendance();
  const { user } = useApp();
  const { dailyReport } = useDailyReport();

  // Mock sleep posts for demonstration
  const [sleepPosts, setSleepPosts] = useState<SleepPostType[]>([]);

  // Loading states
  const [isFeedLoading, setIsFeedLoading] = useState(false);
  const [isPostsLoading, setIsPostsLoading] = useState(false);

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

  const handleViewDetails = (id: string) => {};

  const handleEdit = (id: string) => {};

  const handleLike = (id: string) => {};

  // Post type selection handler
  const handlePostTypeSelect = async (postType: string) => {
    // This will be handled by FeedContainer
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
      {/* Render sleep posts first */}
      {sleepPosts.map((post) => (
        <SleepPostErrorBoundary
          key={post.id}
          onClose={() => {
            setSleepPosts((prev) => prev.filter((p) => p.id !== post.id));
          }}
          onRetry={() => {
            // Retry logic here
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
    </FeedContainer>
  );
};

export default StaffFeed;
