import React, { useState, useEffect } from "react";
import { Alert } from "@mui/material";
import { FeedContainer, FeedDatePicker, FeedPost } from "../../components/feed";
import { useApp } from "../../contexts/AppContext";
import { feedApi } from "../../services/api";
import { FeedPost as FeedPostType } from "../../types/posts";
import dayjs, { Dayjs } from "dayjs";

const ParentFeed: React.FC = () => {
  const { user } = useApp();

  // Loading states
  const [isFeedLoading, setIsFeedLoading] = useState(false);

  // Feed data state
  const [feedPosts, setFeedPosts] = useState<FeedPostType[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  // Fetch feed data for parent
  const fetchFeedData = async (date: Dayjs) => {
    if (!user?.groupId) {
      console.warn("No group ID available for parent");
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

  const handleLike = (id: string) => {
    console.log("Like post:", id);
  };

  // Header content with date picker
  const headerContent = (
    <FeedDatePicker
      selectedDate={selectedDate}
      onDateChange={handleDateChange}
      label="בחר תאריך לצפייה בפיד"
    />
  );

  return (
    <FeedContainer
      title="חדשות הילדים - הורים"
      subtitle="צפה בחדשות ועדכונים על ילדיך מהגן"
      isLoading={isFeedLoading}
      showFloatingButton={false}
      headerContent={headerContent}
    >
      {/* Parent-specific info alert */}
      <Alert severity="info" sx={{ mb: 2 }}>
        צפה בחדשות ועדכונים על ילדיך מהגן
      </Alert>

      {/* Render feed posts from API */}
      {feedPosts.length > 0 ? (
        feedPosts.map((post) => (
          <FeedPost
            key={post.id}
            post={post}
            onViewDetails={handleViewDetails}
            onLike={handleLike}
            canEdit={false} // Parents can't edit posts
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

export default ParentFeed;
