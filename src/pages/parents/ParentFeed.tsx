import React, { useState, useEffect, useCallback } from "react";
import { Alert } from "@mui/material";
import {
  FeedContainer,
  FeedPost,
  FeedDateSelector,
} from "../../components/feed";
import { useApp } from "../../contexts/AppContext";
import { feedApi, userApi } from "../../services/api";
import { FeedPost as FeedPostType } from "../../types/posts";
import { UserChild } from "../../services/api";
import dayjs, { Dayjs } from "dayjs";

const ParentFeed: React.FC = () => {
  const { user } = useApp();

  // Loading states
  const [isFeedLoading, setIsFeedLoading] = useState(false);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);

  // Feed data state
  const [feedPosts, setFeedPosts] = useState<FeedPostType[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [children, setChildren] = useState<UserChild[]>([]);

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

  // Fetch feed data for parent's children's groups
  const fetchFeedData = useCallback(
    async (date: Dayjs) => {
      console.log(
        "ParentFeed: fetchFeedData called with date:",
        date.format("YYYY-MM-DD")
      );
      console.log("ParentFeed: children:", children);

      if (children.length === 0) {
        console.warn("No children available for parent");
        return;
      }

      setIsFeedLoading(true);
      try {
        const formattedDate = date.format("YYYY-MM-DD");

        // Get unique group IDs from children
        const groupIds = Array.from(
          new Set(
            children
              .map((child) => child.groupId)
              .filter((id): id is string => Boolean(id))
          )
        );
        console.log("ParentFeed: Group IDs from children:", groupIds);

        if (groupIds.length === 0) {
          console.warn("No group IDs available from children");
          setFeedPosts([]);
          return;
        }

        // Fetch feed data for all groups
        const allPosts: FeedPostType[] = [];
        for (const groupId of groupIds) {
          try {
            console.log(
              "ParentFeed: Calling API for groupId:",
              groupId,
              "date:",
              formattedDate
            );
            const posts = await feedApi.getFeedByGroup(groupId, formattedDate);
            allPosts.push(...posts);
          } catch (error) {
            console.error(`Failed to fetch feed for group ${groupId}:`, error);
          }
        }

        console.log("ParentFeed: All posts combined:", allPosts);
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
    console.log(
      "ParentFeed: handleDateChange called with date:",
      date.format("YYYY-MM-DD")
    );
    setSelectedDate(date);
    fetchFeedData(date);
  };

  // Single useEffect to handle all data fetching scenarios
  useEffect(() => {
    if (!user) return;

    console.log("ParentFeed: useEffect triggered, user:", user);
    console.log("ParentFeed: Initial fetch for user:", user.id);

    // Fetch children first
    fetchChildren();
  }, [user, fetchChildren]);

  // Fetch feed data when children are loaded and set up refresh mechanism
  useEffect(() => {
    if (children.length === 0) return;

    // Initial feed fetch
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
      title="חדשות הילדים - הורים"
      subtitle="צפה בחדשות ועדכונים על ילדיך מהגן"
      isLoading={isFeedLoading}
      showFloatingButton={false}
      headerContent={headerContent}
    >
      <Alert severity="info" sx={{ mb: 2 }}>
        צפה בחדשות ועדכונים על ילדיך מהגן
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

export default ParentFeed;
