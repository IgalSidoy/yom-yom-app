import React, { useState } from "react";
import { Alert, Box, Typography, Chip, Avatar } from "@mui/material";
import {
  AttendancePost,
  SleepPost,
  SleepPostErrorBoundary,
  FeedContainer,
  FetchDailyReportButton,
} from "../../components/feed";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../config/routes";

const AdminFeed: React.FC = () => {
  const [isFeedLoading] = useState(false);
  const navigate = useNavigate();

  const handlePostTypeSelect = async (postType: string) => {
    console.log("Admin selected post type:", postType);
    // Admin can create posts for any group
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

  // Mock data for admin feed - showing posts from all groups
  const mockAdminAttendancePosts = [
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
      title: "נוכחות יומית - גן ב",
      groupName: "גן ב",
      attendanceDate: "יום שני, 15 בינואר 2024",
      presentCount: 20,
      totalCount: 25,
      status: "completed" as const,
      teacherName: "דוד לוי",
      teacherAvatar: "https://randomuser.me/api/portraits/men/45.jpg",
      publishDate: "יום שני, 15 בינואר 2024 08:45",
      isLiked: false,
      likeCount: 3,
    },
    {
      id: "3",
      title: "נוכחות יומית - גן ג",
      groupName: "גן ג",
      attendanceDate: "יום שני, 15 בינואר 2024",
      presentCount: 15,
      totalCount: 18,
      status: "in-progress" as const,
      teacherName: "מיכל רוזן",
      teacherAvatar: "https://randomuser.me/api/portraits/women/28.jpg",
      publishDate: "יום שני, 15 בינואר 2024 09:00",
      isLiked: false,
      likeCount: 1,
    },
  ];

  // Mock sleep posts for admin - showing posts from all groups
  const mockAdminSleepPosts = [
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
    {
      id: "2",
      type: "sleep" as const,
      title: "שנת צהריים - גן ב",
      groupName: "גן ב",
      sleepDate: "יום שני, 15 בינואר 2024",
      children: [
        {
          childId: "child3",
          firstName: "דניאל",
          lastName: "גולדברג",
          sleepDuration: 150,
        },
        {
          childId: "child4",
          firstName: "מיכל",
          lastName: "ברק",
          sleepDuration: 110,
        },
      ],
      totalChildren: 2,
      sleepingChildren: 2,
      averageSleepDuration: 130,
      status: "active" as const,
      teacherName: "דוד לוי",
      teacherAvatar: "https://randomuser.me/api/portraits/men/45.jpg",
      publishDate: "יום שני, 15 בינואר 2024 12:45",
      isLiked: false,
      likeCount: 6,
    },
  ];

  // Mock admin system posts
  const mockAdminSystemPosts = [
    {
      id: "1",
      type: "info",
      title: "דוח נוכחות יומי",
      content: "דוח נוכחות יומי לכל הגנים",
      date: "2024-01-15",
      groupCount: 5,
      totalChildren: 120,
    },
    {
      id: "2",
      type: "alert",
      title: "עדכון מערכת",
      content: "המערכת עודכנה לגרסה החדשה",
      date: "2024-01-14",
      priority: "high",
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

  return (
    <FeedContainer
      title="לוח בקרה - מנהל"
      subtitle="צפה בניהול כל הגנים והמערכת"
      isLoading={isFeedLoading}
      showFloatingButton={true}
      onPostTypeSelect={handlePostTypeSelect}
      headerContent={<FetchDailyReportButton />}
    >
      {/* Admin-specific info alert */}
      <Alert severity="info" sx={{ mb: 2 }}>
        כאן תוכלו לראות את כל המידע והעדכונים מכל הגנים במערכת
      </Alert>

      {/* Render system posts first */}
      {mockAdminSystemPosts.map((post) => (
        <Box
          key={post.id}
          sx={{
            p: { xs: 1.5, sm: 2 },
            mb: { xs: 0, sm: 2 },
            bgcolor: "background.paper",
            borderRadius: { xs: 0, sm: 2 },
            boxShadow: { xs: "none", sm: 1 },
            border: { xs: "none", sm: "1px solid" },
            borderColor: { xs: "transparent", sm: "divider" },
            borderBottom: { xs: "1px solid", sm: "none" },
            borderBottomColor: { xs: "divider", sm: "transparent" },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Chip
              label={post.type === "alert" ? "התראה" : "מידע"}
              color={post.type === "alert" ? "error" : "primary"}
              size="small"
              sx={{ mr: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              {post.date}
            </Typography>
          </Box>

          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            {post.title}
          </Typography>

          <Typography variant="body2" sx={{ mb: 2 }}>
            {post.content}
          </Typography>

          {post.groupCount && (
            <Box sx={{ display: "flex", gap: 2 }}>
              <Chip
                label={`${post.groupCount} גנים`}
                variant="outlined"
                size="small"
              />
              <Chip
                label={`${post.totalChildren} ילדים`}
                variant="outlined"
                size="small"
              />
            </Box>
          )}
        </Box>
      ))}

      {/* Render sleep posts from all groups */}
      {mockAdminSleepPosts.map((post) => (
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
            onEdit={handleEdit}
            onLike={handleLike}
          />
        </SleepPostErrorBoundary>
      ))}

      {/* Render attendance posts from all groups */}
      {mockAdminAttendancePosts.map((post) => (
        <AttendancePost
          key={post.id}
          {...post}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onLike={handleLike}
        />
      ))}

      {mockAdminSystemPosts.length === 0 &&
        mockAdminSleepPosts.length === 0 &&
        mockAdminAttendancePosts.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            אין עדיין עדכונים להצגה
          </Alert>
        )}
    </FeedContainer>
  );
};

export default AdminFeed;
