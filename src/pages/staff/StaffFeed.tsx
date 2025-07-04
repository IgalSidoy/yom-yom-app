import React, { useState, useEffect, useCallback } from "react";
import {
  AttendancePost,
  FeedFloatingButton,
  SleepPost,
  CreateSleepPostModal,
  SleepPostErrorBoundary,
  FeedContainer,
} from "../../components/feed";
import {
  CreateSleepPostData,
  SleepPost as SleepPostType,
} from "../../types/posts";
import { Child, dailyReportsApi, DailyReport } from "../../services/api";
import { useAttendance } from "../../contexts/AttendanceContext";
import { useApp } from "../../contexts/AppContext";

const StaffFeed: React.FC = () => {
  const { attendanceData } = useAttendance();
  const { user } = useApp();

  // State for sleep post creation
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);
  const [sleepPosts, setSleepPosts] = useState<SleepPostType[]>([]);
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [isLoadingDailyReport, setIsLoadingDailyReport] = useState(false);

  // Loading states
  const [isFeedLoading, setIsFeedLoading] = useState(false);
  const [isPostsLoading, setIsPostsLoading] = useState(false);

  // Fetch daily report when user clicks on feed
  const fetchDailyReport = useCallback(async () => {
    if (!user?.groupId) {
      console.log("No user groupId available");
      return;
    }

    console.log("Fetching daily report for groupId:", user.groupId);
    setIsLoadingDailyReport(true);
    try {
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
      console.log("Fetching report for date:", today);
      const report = await dailyReportsApi.getDailyReport(user.groupId, today);
      console.log("Daily report received:", report);
      setDailyReport(report);
    } catch (error) {
      console.error("Failed to fetch daily report:", error);
      // If no report exists for today, that's okay - we'll create a new one
    } finally {
      setIsLoadingDailyReport(false);
    }
  }, [user?.groupId]);

  // Fetch initial data when component mounts
  useEffect(() => {
    const fetchInitialData = async () => {
      if (user?.groupId) {
        setIsFeedLoading(true);
        try {
          // Fetch daily report on component mount
          await fetchDailyReport();
        } catch (error) {
          console.error("Failed to fetch initial data:", error);
        } finally {
          setIsFeedLoading(false);
        }
      }
    };

    fetchInitialData();
  }, [user?.groupId, fetchDailyReport]);

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

  const handleViewDetails = (id: string) => {
    console.log("View details for post:", id);
  };

  const handleEdit = (id: string) => {
    console.log("Edit post:", id);
  };

  const handleLike = (id: string) => {
    console.log("Like post:", id);
  };

  const handlePostTypeSelect = async (postType: string) => {
    console.log("Selected post type:", postType);
    switch (postType) {
      case "sleep":
        setIsSleepModalOpen(true);
        break;
      case "snack":
        console.log("Creating snack post...");
        break;
      case "activity":
        console.log("Creating activity post...");
        break;
      default:
        console.log("Unknown post type:", postType);
    }
  };

  const handleSleepPostSubmit = (data: CreateSleepPostData) => {
    setIsPostsLoading(true);
    setTimeout(() => {
      const now = new Date();
      const newSleepPost: SleepPostType = {
        id: Date.now().toString(),
        type: "sleep",
        title: data.title,
        groupName: data.groupName,
        sleepDate: data.sleepDate,
        children: data.children,
        totalChildren: data.children.length,
        sleepingChildren: data.children.length,
        averageSleepDuration:
          data.children.length > 0
            ? Math.round(
                data.children.reduce(
                  (sum, child) => sum + (child.sleepDuration || 0),
                  0
                ) / data.children.length
              )
            : 0,
        status: "active",
        teacherName: "שרה כהן",
        teacherAvatar: "https://randomuser.me/api/portraits/women/32.jpg",
        publishDate:
          now.toLocaleDateString("he-IL", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }) +
          " " +
          now.toLocaleTimeString("he-IL", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        isLiked: false,
        likeCount: 0,
      };
      setSleepPosts((prev) => [newSleepPost, ...prev]);
      setIsSleepModalOpen(false);
      setIsPostsLoading(false);
    }, 800);
  };

  // Get children data from daily report or attendance context
  const children: Child[] =
    dailyReport?.children?.map((reportChild) => ({
      id: reportChild.childId,
      firstName: reportChild.firstName,
      lastName: reportChild.lastName,
      dateOfBirth: "", // Not available in daily report
      accountId: dailyReport.accountId,
      groupId: dailyReport.groupId,
      groupName: attendanceData?.groupName || "גן א",
      parents: [], // Parents data not available in daily report
    })) ||
    attendanceData?.children?.map((attendanceChild) => ({
      id: attendanceChild.childId,
      firstName: attendanceChild.firstName,
      lastName: attendanceChild.lastName,
      dateOfBirth: attendanceChild.dateOfBirth || "",
      accountId: attendanceData.accountId,
      groupId: attendanceData.groupId,
      groupName: attendanceData.groupName,
      parents: [], // Parents data not available in attendance context
    })) ||
    [];

  return (
    <>
      <FeedContainer
        title="הזנת חדשות - צוות"
        subtitle="צפה ועדכן חדשות ומידע חשוב לקבוצתך"
        isLoading={isFeedLoading}
        isPostsLoading={isPostsLoading}
        showFloatingButton={true}
        onPostTypeSelect={handlePostTypeSelect}
      >
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
      </FeedContainer>

      {/* Sleep Post Creation Modal with Error Boundary */}
      <SleepPostErrorBoundary
        onClose={() => setIsSleepModalOpen(false)}
        onRetry={() => {
          console.log("Retrying sleep post creation...");
        }}
      >
        <CreateSleepPostModal
          isOpen={isSleepModalOpen}
          onClose={() => setIsSleepModalOpen(false)}
          onSubmit={handleSleepPostSubmit}
          children={children}
          groupName={attendanceData?.groupName || "גן א"}
          groupId={dailyReport?.groupId || attendanceData?.groupId || "group1"}
          isLoadingDailyReport={isLoadingDailyReport}
        />
      </SleepPostErrorBoundary>
    </>
  );
};

export default StaffFeed;
