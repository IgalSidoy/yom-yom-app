import React, { useState, useEffect, useCallback } from "react";
import { Alert, Box } from "@mui/material";
import { useLocation } from "react-router-dom";
import {
  FeedContainer,
  FetchDailyReportButton,
  FeedDateSelector,
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
  const location = useLocation();

  // Loading states
  const [isFeedLoading, setIsFeedLoading] = useState(false);
  const [isPostsLoading, setIsPostsLoading] = useState(false);

  // Feed data state
  const [feedPosts, setFeedPosts] = useState<FeedPostType[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  // Fetch feed data
  const fetchFeedData = useCallback(
    async (date: Dayjs) => {
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
      console.log("StaffFeed: Refreshing feed data on focus");
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
      title="חדשות הקבוצה - צוות"
      subtitle="צפה בחדשות ועדכונים מהקבוצה"
      isLoading={isFeedLoading}
      showFloatingButton={true}
      headerContent={headerContent}
    >
      <Alert severity="info" sx={{ mb: 2 }}>
        צפה בחדשות ועדכונים מהקבוצה
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

export default StaffFeed;
