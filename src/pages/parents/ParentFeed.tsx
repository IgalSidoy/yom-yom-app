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
import { feedApi, userApi } from "../../services/api";
import { FeedPost as FeedPostType } from "../../types/posts";
import { UserChild } from "../../services/api";
import dayjs, { Dayjs } from "dayjs";

const ParentFeed: React.FC = () => {
  const { user } = useApp();
  const { dailyReport, fetchDailyReport } = useDailyReport();
  const navigate = useNavigate();
  const location = useLocation();

  // Loading states
  const [isFeedLoading, setIsFeedLoading] = useState(false);
  const [isPostsLoading, setIsPostsLoading] = useState(false);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);

  // Feed data state
  const [feedPosts, setFeedPosts] = useState<FeedPostType[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [children, setChildren] = useState<UserChild[]>([]);

  // Helper function to determine if a sleep post is closed
  const isSleepPostClosed = (post: FeedPostType): boolean => {
    if (post.type !== "SleepPost" || !post.metadata.sleepMetadata) {
      return false;
    }

    const sleepData = post.metadata.sleepMetadata;

    // Check if all children have finished sleeping (have both start and end timestamps)
    return sleepData.childrenSleepData.every((child) => {
      const hasStartTime =
        child.startTimestamp && child.startTimestamp !== "0001-01-01T00:00:00";
      const hasEndTime =
        child.endTimestamp && child.endTimestamp !== "0001-01-01T00:00:00";
      return hasStartTime && hasEndTime;
    });
  };

  // Fetch parent's children
  const fetchChildren = useCallback(async () => {
    try {
      setIsLoadingChildren(true);
      const response = await userApi.getUserChildren();
      if (response.data.children) {
        setChildren(response.data.children);
      }
    } catch (error) {
      console.error("Failed to fetch children:", error);
      setChildren([]);
    } finally {
      setIsLoadingChildren(false);
    }
  }, []);

  // Fetch feed data for parent (all children's groups)
  const fetchFeedData = useCallback(
    async (date: Dayjs) => {
      if (children.length === 0) {
        console.warn("No children available for parent");
        return;
      }

      setIsFeedLoading(true);
      try {
        const formattedDate = date.format("YYYY-MM-DD");

        // Get unique group IDs from all children
        const groupIds = new Set<string>();
        children.forEach((child) => {
          if (child.groupId) {
            groupIds.add(child.groupId);
          }
        });

        // Fetch feed data for all groups
        const allPosts: FeedPostType[] = [];
        for (const groupId of Array.from(groupIds)) {
          try {
            const posts = await feedApi.getFeedByGroup(groupId, formattedDate);
            allPosts.push(...posts);
          } catch (error) {
            console.error(`Failed to fetch feed for group ${groupId}:`, error);
          }
        }

        // Sort posts by creation date (newest first)
        allPosts.sort(
          (a, b) =>
            new Date(b.created).getTime() - new Date(a.created).getTime()
        );

        setFeedPosts(allPosts);
      } catch (error) {
        console.error("Failed to fetch feed data:", error);
        setFeedPosts([]);
      } finally {
        setIsFeedLoading(false);
      }
    },
    [children]
  );

  // Handle date change
  const handleDateChange = (date: Dayjs) => {
    setSelectedDate(date);
    fetchFeedData(date);
  };

  // Fetch children first
  useEffect(() => {
    if (!user) return;
    fetchChildren();
  }, [user, fetchChildren]);

  // Fetch feed data when children are loaded and set up refresh mechanism
  useEffect(() => {
    if (children.length === 0) return;

    // Initial fetch
    fetchFeedData(selectedDate);

    // Set up focus listener for refresh when returning from sleep post creation
    const handleFocus = () => {
      console.log("ParentFeed: Refreshing feed data on focus");
      fetchFeedData(selectedDate);
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [children, selectedDate, fetchFeedData]);

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

      {/* Render feed posts from API */}
      {feedPosts.length > 0 ? (
        feedPosts.map((post) => (
          <FeedPost
            key={post.id}
            post={post}
            isClosed={isSleepPostClosed(post)}
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
