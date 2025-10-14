import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { feedApi, userApi } from "../services/api";
import { FeedPost } from "../types/posts";
import { UserChild } from "../services/api";
import { useApp } from "./AppContext";
import dayjs, { Dayjs } from "dayjs";

interface FeedContextType {
  // Feed data
  feedPosts: FeedPost[];
  selectedDate: Dayjs;

  // Loading states
  isFeedLoading: boolean;
  isLoadingChildren: boolean;

  // Children data (for parents)
  userChildren: UserChild[];

  // Actions
  fetchFeedData: (date: Dayjs, groupId?: string) => Promise<void>;
  handleDateChange: (date: Dayjs) => void;
  refreshFeed: () => Promise<void>;
  clearFeed: () => void;
}

const FeedContext = createContext<FeedContextType | undefined>(undefined);

interface FeedProviderProps {
  children: ReactNode;
}

export const FeedProvider: React.FC<FeedProviderProps> = ({ children }) => {
  const { user } = useApp();

  // Feed data state
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [userChildren, setUserChildren] = useState<UserChild[]>([]);

  // Loading states
  const [isFeedLoading, setIsFeedLoading] = useState(false);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);

  // Use ref to store userChildren for stable access in callbacks
  const userChildrenRef = useRef<UserChild[]>([]);

  // Fetch parent's children (only for parent users)
  const fetchChildren = useCallback(async () => {
    if (user?.role !== "Parent") {
      setUserChildren([]);
      userChildrenRef.current = [];
      return;
    }

    try {
      setIsLoadingChildren(true);
      const response = await userApi.getUserChildren();
      if (response.data.children) {
        setUserChildren(response.data.children);
        userChildrenRef.current = response.data.children;
      }
    } catch (error) {
      console.error("Failed to fetch children:", error);
      setUserChildren([]);
      userChildrenRef.current = [];
    } finally {
      setIsLoadingChildren(false);
    }
  }, [user?.role]);

  // Fetch feed data based on user role
  const fetchFeedData = useCallback(
    async (date: Dayjs, groupId?: string) => {
      if (!user) {
        console.warn("No user available for feed");
        return;
      }

      setIsFeedLoading(true);
      try {
        const formattedDate = date.format("YYYY-MM-DD");

        if (user.role === "Parent") {
          // For parents, fetch feed data for all children's groups
          const currentChildren = userChildrenRef.current;
          if (currentChildren.length === 0) {
            console.warn("No children available for parent");
            setFeedPosts([]);
            return;
          }

          // Get unique group IDs from all children
          const groupIds = new Set<string>();
          currentChildren.forEach((child: UserChild) => {
            if (child.groupId) {
              groupIds.add(child.groupId);
            }
          });

          // Fetch feed data for all groups
          const allPosts: FeedPost[] = [];
          for (const groupId of Array.from(groupIds)) {
            try {
              const posts = await feedApi.getFeedByGroup(
                groupId,
                formattedDate
              );
              allPosts.push(...posts);
            } catch (error) {
              console.error(
                `Failed to fetch feed for group ${groupId}:`,
                error
              );
            }
          }

          // Sort posts by creation date (newest first)
          allPosts.sort(
            (a, b) =>
              new Date(b.created).getTime() - new Date(a.created).getTime()
          );

          setFeedPosts(allPosts);
        } else {
          // For staff, admin, and other roles
          const targetGroupId = groupId || user.groupId;

          if (!targetGroupId) {
            console.warn("No group ID available for user");
            setFeedPosts([]);
            return;
          }

          const posts = await feedApi.getFeedByGroup(
            targetGroupId,
            formattedDate
          );
          setFeedPosts(posts);
        }
      } catch (error) {
        console.error("Failed to fetch feed data:", error);
        setFeedPosts([]);
      } finally {
        setIsFeedLoading(false);
      }
    },
    [user]
  );

  // Handle date change
  const handleDateChange = useCallback(
    (date: Dayjs) => {
      setSelectedDate(date);
      fetchFeedData(date);
    },
    [fetchFeedData]
  );

  // Refresh feed data
  const refreshFeed = useCallback(async () => {
    await fetchFeedData(selectedDate);
  }, [fetchFeedData, selectedDate]);

  // Clear feed data
  const clearFeed = useCallback(() => {
    setFeedPosts([]);
    setUserChildren([]);
    setSelectedDate(dayjs());
  }, []);

  // Fetch children first (for parents)
  useEffect(() => {
    if (!user) return;
    fetchChildren();
  }, [user, fetchChildren]);

  // Remove aggressive window focus listener - daily feed doesn't need constant refreshing

  const value: FeedContextType = {
    feedPosts,
    selectedDate,
    isFeedLoading,
    isLoadingChildren,
    userChildren,
    fetchFeedData,
    handleDateChange,
    refreshFeed,
    clearFeed,
  };

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
};

export const useFeed = (): FeedContextType => {
  const context = useContext(FeedContext);
  if (context === undefined) {
    throw new Error("useFeed must be used within a FeedProvider");
  }
  return context;
};
