import React, { useState, useEffect, useCallback } from "react";
import { Alert, Box } from "@mui/material";
import {
  FeedContainer,
  FetchDailyReportButton,
  FeedDateSelector,
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
  const fetchFeedData = useCallback(
    async (date: Dayjs) => {
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
    },
    [user?.groupId]
  );

  // Handle date change
  const handleDateChange = (date: Dayjs) => {
    setSelectedDate(date);
    fetchFeedData(date);
  };

  // Single useEffect to handle all feed data fetching scenarios
  useEffect(() => {
    if (!user?.groupId) return;

    // Initial fetch
    fetchFeedData(selectedDate);

    // Set up focus listener for refresh when returning from sleep post creation
    const handleFocus = () => {
      console.log("AdminFeed: Refreshing feed data on focus");
      fetchFeedData(selectedDate);
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [user?.groupId, selectedDate, fetchFeedData]);

  // Header content with date selector
  const headerContent = (
    <FeedDateSelector
      selectedDate={selectedDate}
      onDateChange={handleDateChange}
      label="בחר תאריך לצפייה בפיד"
    />
  );

  return (
    <FeedContainer
      title="חדשות הארגון - מנהל"
      subtitle="צפה בחדשות ועדכונים מכל הקבוצות"
      isLoading={isFeedLoading}
      showFloatingButton={false}
      headerContent={headerContent}
    >
      <Alert severity="info" sx={{ mb: 2 }}>
        צפה בחדשות ועדכונים מכל הקבוצות בארגון
      </Alert>

      {/* Render feed posts from API */}
      {feedPosts.length > 0 ? (
        feedPosts.map((post) => <FeedPost key={post.id} post={post} />)
      ) : (
        <Alert severity="info" sx={{ mt: 2 }}>
          אין עדיין חדשות להצגה לתאריך זה
        </Alert>
      )}
    </FeedContainer>
  );
};

export default AdminFeed;
