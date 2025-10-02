import React, { useEffect } from "react";
import { Alert, Box } from "@mui/material";
import { useLocation } from "react-router-dom";
import {
  FeedContainer,
  FetchDailyReportButton,
  FeedDateSelector,
  FeedPost,
} from "../../features/feed/components";
import { useApp } from "../../contexts/AppContext";
import { useDailyReport } from "../../contexts/DailyReportContext";
import { useFeed } from "../../contexts/FeedContext";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../config/routes";

const ParentFeed: React.FC = () => {
  const { user } = useApp();
  const { dailyReport, fetchDailyReport } = useDailyReport();
  const {
    feedPosts,
    selectedDate,
    isFeedLoading,
    isLoadingChildren,
    handleDateChange,
    fetchFeedData,
    userChildren,
  } = useFeed();
  const navigate = useNavigate();
  const location = useLocation();

  // Load feed data when component mounts and children are loaded (for parents)
  useEffect(() => {
    if (user?.role === "Parent") {
      // For parents, wait for children to be loaded
      if (userChildren.length > 0) {
        fetchFeedData(selectedDate);
      }
    } else {
      // For other roles, fetch immediately
      fetchFeedData(selectedDate);
    }
  }, [user?.role, userChildren.length, selectedDate, fetchFeedData]);

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
      title="חדשות הילדים - הורה"
      subtitle="צפה בחדשות ועדכונים מהילדים"
      isLoading={isFeedLoading || isLoadingChildren}
      showFloatingButton={false}
      headerContent={headerContent}
    >
      <Alert severity="info" sx={{ mb: 2 }}>
        צפה בחדשות ועדכונים מהילדים שלך
      </Alert>

      {/* Render feed posts from context */}
      {feedPosts.length > 0 ? (
        feedPosts.map((post) => (
          <FeedPost key={post.id} post={post} isClosed={post.isClosed} />
        ))
      ) : (
        <Alert severity="info" sx={{ mt: 2 }}>
          אין עדיין חדשות להצגה לתאריך זה
        </Alert>
      )}
    </FeedContainer>
  );
};

export default ParentFeed;
