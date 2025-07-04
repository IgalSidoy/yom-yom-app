import React, { useState } from "react";
import { Typography, Box, useTheme, useMediaQuery } from "@mui/material";
import {
  AttendancePost,
  FeedFloatingButton,
  SleepPost,
  CreateSleepPostModal,
  SleepPostErrorBoundary,
} from "../../components/feed";
import {
  CreateSleepPostData,
  SleepPost as SleepPostType,
} from "../../types/posts";
import { Child } from "../../services/api";

const Feed: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // State for sleep post creation
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);
  const [sleepPosts, setSleepPosts] = useState<SleepPostType[]>([]);

  // Mock data for attendance posts
  const mockAttendancePosts = [
    {
      id: "1",
      title: "נוכחות יומית - גן א'",
      groupName: "גן א'",
      attendanceDate: "יום שני, 15 בינואר 2024",
      presentCount: 18,
      totalCount: 22,
      status: "completed" as const,
      teacherName: "שרה כהן",
      teacherAvatar: "https://randomuser.me/api/portraits/women/32.jpg",
      publishDate: "יום שני, 15 בינואר 2024",
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
      publishDate: "יום שני, 15 בינואר 2024",
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

  const handlePostTypeSelect = (postType: string) => {
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
    // Create a new sleep post
    const newSleepPost: SleepPostType = {
      id: Date.now().toString(), // In real app, this would come from the backend
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
      teacherName: "שרה כהן", // In real app, this would come from user context
      teacherAvatar: "https://randomuser.me/api/portraits/women/32.jpg",
      publishDate: new Date().toLocaleDateString("he-IL", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      isLiked: false,
      likeCount: 0,
    };

    setSleepPosts((prev) => [newSleepPost, ...prev]);
    setIsSleepModalOpen(false);
  };

  // Mock children data for the sleep modal
  const mockChildren: Child[] = [
    {
      id: "1",
      firstName: "יוסי",
      lastName: "כהן",
      dateOfBirth: "2019-03-15",
      accountId: "acc1",
      groupId: "group1",
      groupName: "גן א'",
      parents: ["parent1", "parent2"],
    },
    {
      id: "2",
      firstName: "שרה",
      lastName: "לוי",
      dateOfBirth: "2019-07-22",
      accountId: "acc1",
      groupId: "group1",
      groupName: "גן א'",
      parents: ["parent3"],
    },
    {
      id: "3",
      firstName: "דוד",
      lastName: "גולדברג",
      dateOfBirth: "2019-01-10",
      accountId: "acc1",
      groupId: "group1",
      groupName: "גן א'",
      parents: ["parent4", "parent5"],
    },
  ];

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
            {/* Render sleep posts first */}
            {sleepPosts.map((post) => (
              <SleepPostErrorBoundary
                key={post.id}
                onClose={() => {
                  // Remove the problematic post from the list
                  setSleepPosts((prev) => prev.filter((p) => p.id !== post.id));
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
            {/* Render sleep posts first */}
            {sleepPosts.map((post) => (
              <SleepPostErrorBoundary
                key={post.id}
                onClose={() => {
                  // Remove the problematic post from the list
                  setSleepPosts((prev) => prev.filter((p) => p.id !== post.id));
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
          children={mockChildren}
          groupName="גן א'"
          groupId="group1"
        />
      </SleepPostErrorBoundary>
    </Box>
  );
};

export default Feed;
