import React, { useState, useEffect } from "react";
import { Alert, Box } from "@mui/material";
import {
  FeedContainer,
  FetchDailyReportButton,
  FeedDatePicker,
  FeedPost,
} from "../../components/feed";
import { useApp } from "../../contexts/AppContext";
import { useDailyReport } from "../../contexts/DailyReportContext";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../config/routes";
import { feedApi } from "../../services/api";
import { FeedPost as FeedPostType } from "../../types/posts";
import dayjs, { Dayjs } from "dayjs";

const StaffFeed: React.FC = () => {
  const { user } = useApp();
  const { dailyReport, fetchDailyReport } = useDailyReport();
  const navigate = useNavigate();

  // Loading states
  const [isFeedLoading, setIsFeedLoading] = useState(false);
  const [isPostsLoading, setIsPostsLoading] = useState(false);

  // Feed data state
  const [feedPosts, setFeedPosts] = useState<FeedPostType[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  // Fetch feed data
  const fetchFeedData = async (date: Dayjs) => {
    if (!user?.groupId) {
      console.warn("No group ID available for user");
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
      title="הזנת חדשות - צוות"
      subtitle="צפה ועדכן חדשות ומידע חשוב לקבוצתך"
      isLoading={isFeedLoading}
      isPostsLoading={isPostsLoading}
      showFloatingButton={true}
      onPostTypeSelect={handlePostTypeSelect}
      headerContent={headerContent}
    >
      {/* Staff-specific info alert */}
      <Alert severity="info" sx={{ mb: 2 }}>
        כאן תוכלו לראות את כל המידע והעדכונים על קבוצתכם
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

export default StaffFeed;
