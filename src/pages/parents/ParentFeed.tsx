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
import MobileLayout from "../../shared/components/layout/MobileLayout";

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
    refreshFeed,
    userChildren,
  } = useFeed();
  const navigate = useNavigate();
  const location = useLocation();

  // Load feed data when component mounts - stable dependencies
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
  }, []); // Empty dependency array - only run on mount

  // Header content with date selector
  const headerContent = (
    <FeedDateSelector
      selectedDate={selectedDate}
      onDateChange={handleDateChange}
      onRefresh={refreshFeed}
      isRefreshing={isFeedLoading || isLoadingChildren}
      label="בחר תאריך לצפייה בפיד"
    />
  );

  return (
    <MobileLayout showBottomNav={true}>
      <FeedContainer
        title="חדשות הילדים - הורה"
        subtitle="צפה בחדשות ועדכונים מהילדים"
        isLoading={isFeedLoading || isLoadingChildren}
        showFloatingButton={false}
        headerContent={headerContent}
      >
        <Alert
          severity="info"
          sx={{
            mb: 2,
            borderRadius: 3,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            border: "1px solid",
            borderColor: "info.light",
            "& .MuiAlert-icon": {
              fontSize: "1.5rem",
            },
          }}
        >
          צפה בחדשות ועדכונים מהילדים שלך
        </Alert>

        {/* Render feed posts from context */}
        {feedPosts.length > 0 ? (
          feedPosts.map((post) => (
            <FeedPost key={post.id} post={post} isClosed={post.isClosed} />
          ))
        ) : (
          <Alert
            severity="info"
            sx={{
              mt: 2,
              borderRadius: 3,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              border: "1px solid",
              borderColor: "info.light",
              "& .MuiAlert-icon": {
                fontSize: "1.5rem",
              },
            }}
          >
            אין עדיין חדשות להצגה לתאריך זה
          </Alert>
        )}
      </FeedContainer>
    </MobileLayout>
  );
};

export default ParentFeed;
