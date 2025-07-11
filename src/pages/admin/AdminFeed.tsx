import React, { useState, useEffect } from "react";
import { Alert, Box } from "@mui/material";
import {
  FeedContainer,
  FetchDailyReportButton,
  FeedDatePicker,
  FeedPost,
} from "../../components/feed";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../config/routes";
import { useApp } from "../../contexts/AppContext";
import { feedApi } from "../../services/api";
import { FeedPost as FeedPostType } from "../../types/posts";
import dayjs, { Dayjs } from "dayjs";

const AdminFeed: React.FC = () => {
  const [isFeedLoading, setIsFeedLoading] = useState(false);
  const { user } = useApp();
  const navigate = useNavigate();

  // Feed data state
  const [feedPosts, setFeedPosts] = useState<FeedPostType[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  // Fetch feed data for admin (all groups)
  const fetchFeedData = async (date: Dayjs) => {
    if (!user?.groupId) {
      console.warn("No group ID available for admin");
      return;
    }

    setIsFeedLoading(true);
    try {
      const formattedDate = date.format("YYYY-MM-DD");
      const posts = await feedApi.getFeedByGroup(user.groupId, formattedDate);
      setFeedPosts(posts);
    } catch (error) {
      console.error("Failed to fetch feed data:", error);
      setFeedPosts([]);
    } finally {
      setIsFeedLoading(false);
    }
  };

  // Handle date change
  const handleDateChange = (date: Dayjs) => {
    setSelectedDate(date);
    fetchFeedData(date);
  };

  // Initial data fetch
  useEffect(() => {
    if (user?.groupId) {
      fetchFeedData(selectedDate);
    }
  }, [user?.groupId]);

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

  const handleViewDetails = (id: string) => {
    console.log("View details for post:", id);
  };

  const handleEdit = (id: string) => {
    console.log("Edit post:", id);
  };

  const handleLike = (id: string) => {
    console.log("Like post:", id);
  };

  // Header content with date picker
  const headerContent = (
    <Box>
      <FetchDailyReportButton />
      <FeedDatePicker
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        label="בחר תאריך לצפייה בפיד"
      />
    </Box>
  );

  return (
    <FeedContainer
      title="לוח בקרה - מנהל"
      subtitle="צפה בניהול כל הגנים והמערכת"
      isLoading={isFeedLoading}
      showFloatingButton={true}
      onPostTypeSelect={handlePostTypeSelect}
      headerContent={headerContent}
    >
      {/* Admin-specific info alert */}
      <Alert severity="info" sx={{ mb: 2 }}>
        כאן תוכלו לראות את כל המידע והעדכונים מכל הגנים במערכת
      </Alert>

      {/* Render feed posts from API */}
      {feedPosts.length > 0 ? (
        feedPosts.map((post) => (
          <FeedPost
            key={post.id}
            post={post}
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
            onLike={handleLike}
            canEdit={true}
          />
        ))
      ) : (
        <Alert severity="info" sx={{ mt: 2 }}>
          אין עדיין חדשות להצגה לתאריך זה
        </Alert>
      )}
    </FeedContainer>
  );
};

export default AdminFeed;
