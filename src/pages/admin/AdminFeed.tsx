import React, { useEffect } from "react";
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
import { useFeed } from "../../contexts/FeedContext";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../config/routes";

const AdminFeed: React.FC = () => {
  const { user } = useApp();
  const { dailyReport, fetchDailyReport } = useDailyReport();
  const {
    feedPosts,
    selectedDate,
    isFeedLoading,
    handleDateChange,
    fetchFeedData,
  } = useFeed();
  const navigate = useNavigate();
  const location = useLocation();

  // Load feed data when component mounts
  useEffect(() => {
    if (user?.groupId) {
      fetchFeedData(selectedDate);
    }
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
      title="חדשות הקבוצה - מנהל"
      subtitle="צפה בחדשות ועדכונים מהקבוצה"
      isLoading={isFeedLoading}
      showFloatingButton={true}
      headerContent={headerContent}
    >
      <Alert severity="info" sx={{ mb: 2 }}>
        צפה בחדשות ועדכונים מהקבוצה שלך
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

export default AdminFeed;
