import React, { useState, useEffect, useCallback } from "react";
import { Typography, Box, useTheme, useMediaQuery } from "@mui/material";
import {
  AttendancePost,
  FeedFloatingButton,
  SleepPost,
  CreateSleepPostModal,
  SleepPostErrorBoundary,
} from "../../components/feed";
import { Skeleton, Fade, Slide, Box as MuiBox } from "@mui/material";
import {
  CreateSleepPostData,
  SleepPost as SleepPostType,
} from "../../types/posts";
import { Child, dailyReportsApi, DailyReport } from "../../services/api";
import { useAttendance } from "../../contexts/AttendanceContext";
import { useApp } from "../../contexts/AppContext";

const Feed: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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

  // Mock data for attendance posts
  const mockAttendancePosts = [
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
      title: "נוכחות בוקר - גן ב'",
      groupName: "גן ב'",
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

  // Skeleton components
  const PostSkeleton = () => (
    <Slide direction="up" in={true} timeout={600}>
      <MuiBox
        sx={{
          p: 2,
          mb: 2,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 1,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* Header skeleton */}
        <MuiBox sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <MuiBox sx={{ ml: 2, flex: 1 }}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={16} />
          </MuiBox>
          <Skeleton variant="text" width={80} height={16} />
        </MuiBox>

        {/* Title skeleton */}
        <Skeleton variant="text" width="80%" height={28} sx={{ mb: 1 }} />

        {/* Content skeleton */}
        <MuiBox sx={{ display: "flex", gap: 1, mb: 2 }}>
          <Skeleton
            variant="rectangular"
            width={60}
            height={24}
            sx={{ borderRadius: 1 }}
          />
          <Skeleton
            variant="rectangular"
            width={80}
            height={24}
            sx={{ borderRadius: 1 }}
          />
        </MuiBox>

        {/* Stats skeleton */}
        <MuiBox
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 1.5,
            bgcolor: "background.default",
            borderRadius: 1.5,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <MuiBox>
            <Skeleton variant="text" width={60} height={32} />
            <Skeleton variant="text" width={50} height={16} />
          </MuiBox>
          <MuiBox sx={{ textAlign: "center" }}>
            <Skeleton variant="text" width={40} height={24} />
            <Skeleton variant="text" width={80} height={16} />
          </MuiBox>
        </MuiBox>

        {/* Actions skeleton */}
        <MuiBox
          sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
        >
          <Skeleton
            variant="rectangular"
            width={100}
            height={32}
            sx={{ borderRadius: 1 }}
          />
          <MuiBox sx={{ display: "flex", gap: 1 }}>
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
          </MuiBox>
        </MuiBox>
      </MuiBox>
    </Slide>
  );

  const FeedSkeleton = () => (
    <Fade in={true} timeout={800}>
      <MuiBox>
        {[1, 2, 3].map((index) => (
          <PostSkeleton key={index} />
        ))}
      </MuiBox>
    </Fade>
  );

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
        // Use existing data - no need to fetch again
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
      firstName: reportChild.childName.split(" ")[0] || reportChild.childName,
      lastName: reportChild.childName.split(" ").slice(1).join(" ") || "",
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
    <Box
      sx={{
        height: { xs: "calc(100vh - 72px)", sm: "100vh" }, // Full height minus bottom nav on mobile
        bgcolor: "background.default",
        p: { xs: 1, sm: 2, md: 3 },
        dir: "rtl",
        overflow: "hidden", // Prevent body scroll on mobile
      }}
    >
      {/* Mobile Container */}
      {isMobile && (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            bgcolor: "background.paper",
            borderRadius: 0,
            boxShadow: "none",
            overflow: "hidden",
            border: "none",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Mobile Header */}
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                textAlign: "center",
                fontSize: "1.25rem",
              }}
            >
              הזנת חדשות
            </Typography>
          </Box>

          {/* Mobile Content */}
          <Box
            sx={{
              p: 2,
              flex: 1,
              bgcolor: "background.default",
              overflow: "auto",
            }}
          >
            {isFeedLoading ? (
              <FeedSkeleton />
            ) : (
              <>
                {isPostsLoading && (
                  <Slide direction="down" in={true} timeout={400}>
                    <MuiBox
                      sx={{
                        p: 2,
                        mb: 2,
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        borderRadius: 2,
                        textAlign: "center",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                      }}
                    >
                      <Skeleton variant="circular" width={16} height={16} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        מוסיף פוסט חדש...
                      </Typography>
                    </MuiBox>
                  </Slide>
                )}

                {/* Render sleep posts first */}
                {sleepPosts.map((post) => (
                  <SleepPostErrorBoundary
                    key={post.id}
                    onClose={() => {
                      // Remove the problematic post from the list
                      setSleepPosts((prev) =>
                        prev.filter((p) => p.id !== post.id)
                      );
                    }}
                    onRetry={() => {
                      // Force re-render of the specific post
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
                {mockAttendancePosts.map((post) => (
                  <AttendancePost
                    key={post.id}
                    {...post}
                    onViewDetails={handleViewDetails}
                    onEdit={handleEdit}
                    onLike={handleLike}
                  />
                ))}
              </>
            )}
          </Box>
        </Box>
      )}

      {/* Desktop/Tablet Container */}
      {!isMobile && (
        <Box
          sx={{
            maxWidth: { sm: "600px", md: "800px", lg: "1000px" },
            height: "calc(100vh - 150px)", // Full height minus bottom navbar
            mx: "auto",
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Desktop Header */}
          <Box
            sx={{
              p: { sm: 3, md: 4 },
              borderBottom: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                textAlign: "center",
                fontSize: { sm: "1.5rem", md: "1.75rem" },
              }}
            >
              הזנת חדשות
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                textAlign: "center",
                mt: 1,
                fontSize: { sm: "0.875rem", md: "1rem" },
              }}
            >
              צפה ועדכן חדשות ומידע חשוב
            </Typography>
          </Box>

          {/* Desktop Content */}
          <Box
            sx={{
              p: { sm: 3, md: 4 },
              flex: 1,
              bgcolor: "background.default",
              overflow: "auto",
            }}
          >
            {isFeedLoading ? (
              <FeedSkeleton />
            ) : (
              <>
                {isPostsLoading && (
                  <Slide direction="down" in={true} timeout={400}>
                    <MuiBox
                      sx={{
                        p: 2,
                        mb: 2,
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        borderRadius: 2,
                        textAlign: "center",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                      }}
                    >
                      <Skeleton variant="circular" width={16} height={16} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        מוסיף פוסט חדש...
                      </Typography>
                    </MuiBox>
                  </Slide>
                )}

                {/* Render sleep posts first */}
                {sleepPosts.map((post) => (
                  <SleepPostErrorBoundary
                    key={post.id}
                    onClose={() => {
                      // Remove the problematic post from the list
                      setSleepPosts((prev) =>
                        prev.filter((p) => p.id !== post.id)
                      );
                    }}
                    onRetry={() => {
                      // Force re-render of the specific post
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
                {mockAttendancePosts.map((post) => (
                  <AttendancePost
                    key={post.id}
                    {...post}
                    onViewDetails={handleViewDetails}
                    onEdit={handleEdit}
                    onLike={handleLike}
                  />
                ))}
              </>
            )}
          </Box>
        </Box>
      )}

      {/* Floating Action Button */}
      <FeedFloatingButton onPostTypeSelect={handlePostTypeSelect} />

      {/* Sleep Post Creation Modal with Error Boundary */}
      <SleepPostErrorBoundary
        onClose={() => setIsSleepModalOpen(false)}
        onRetry={() => {
          // Reset any error state and retry
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
    </Box>
  );
};

export default Feed;
