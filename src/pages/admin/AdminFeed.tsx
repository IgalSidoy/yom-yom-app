import React, { useState } from "react";
import { Alert, Box, Typography, Chip } from "@mui/material";
import { FeedContainer } from "../../components/feed";

const AdminFeed: React.FC = () => {
  const [isFeedLoading] = useState(false);

  const handlePostTypeSelect = async (postType: string) => {
    console.log("Admin selected post type:", postType);
    // Admin can create posts for any group
    switch (postType) {
      case "sleep":
        console.log("Creating sleep post for admin...");
        break;
      case "snack":
        console.log("Creating snack post for admin...");
        break;
      case "activity":
        console.log("Creating activity post for admin...");
        break;
      default:
        console.log("Unknown post type:", postType);
    }
  };

  // Mock data for admin feed
  const mockAdminPosts = [
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

  return (
    <FeedContainer
      title="לוח בקרה - מנהל"
      subtitle="צפה בניהול כל הגנים והמערכת"
      isLoading={isFeedLoading}
      showFloatingButton={true}
      onPostTypeSelect={handlePostTypeSelect}
    >
      {/* Admin-specific info alert */}
      <Alert severity="info" sx={{ mb: 2 }}>
        כאן תוכלו לראות את כל המידע והעדכונים מכל הגנים במערכת
      </Alert>

      {/* Render admin posts */}
      {mockAdminPosts.map((post) => (
        <Box
          key={post.id}
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

      {mockAdminPosts.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          אין עדיין עדכונים להצגה
        </Alert>
      )}
    </FeedContainer>
  );
};

export default AdminFeed;
