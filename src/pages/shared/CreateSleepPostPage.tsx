import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Typography, CircularProgress } from "@mui/material";
import { useApp } from "../../contexts/AppContext";
import { useDailyReport } from "../../contexts/DailyReportContext";
import { childApi, DailyReport, Child } from "../../services/api";
import CreateSleepPostModal from "../../components/feed/CreateSleepPostModal";

interface LocationState {
  groupId?: string;
  groupName?: string;
  children?: Child[];
  dailyReport?: DailyReport;
}

const CreateSleepPostPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, accountId, isLoadingUser } = useApp();
  const {
    dailyReport,
    isLoading: isDailyReportLoading,
    fetchDailyReport,
  } = useDailyReport();
  const location = useLocation();
  const locationState = location.state as LocationState;

  // State
  const [children, setChildren] = useState<Child[]>([]);
  const [groupName, setGroupName] = useState("");
  const [groupId, setGroupId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("🚀 [CreateSleepPostPage] Starting data load...");
        console.log("📊 [CreateSleepPostPage] Initial state:", {
          user: user
            ? { id: user.id, groupId: user.groupId, role: user.role }
            : null,
          accountId,
          locationState: locationState
            ? {
                hasGroupId: !!locationState.groupId,
                hasGroupName: !!locationState.groupName,
                hasChildren: !!locationState.children,
                childrenCount: locationState.children?.length || 0,
              }
            : null,
        });

        setIsLoading(true);
        setError(null);

        let currentGroupId = "";
        let currentGroupName = "";
        let currentChildren: Child[] = [];

        // If we have data from navigation state, use it
        if (
          locationState?.groupId &&
          locationState?.groupName &&
          locationState?.children
        ) {
          console.log("📍 [CreateSleepPostPage] Using navigation state data");
          currentGroupId = locationState.groupId;
          currentGroupName = locationState.groupName;
          currentChildren = locationState.children;
          console.log("📋 [CreateSleepPostPage] Navigation state data:", {
            groupId: currentGroupId,
            groupName: currentGroupName,
            childrenCount: currentChildren.length,
          });
        } else {
          console.log(
            "🔍 [CreateSleepPostPage] No navigation state, loading from user context"
          );

          console.log("👤 [CreateSleepPostPage] User context:", {
            userId: user?.id,
            userGroupId: user?.groupId,
            userRole: user?.role,
            accountId,
          });

          // Always use user.groupId since it's always available
          if (!user?.groupId) {
            console.error("❌ [CreateSleepPostPage] No user.groupId available");
            throw new Error("No group ID available");
          }

          console.log(
            "✅ [CreateSleepPostPage] Using user.groupId:",
            user.groupId
          );
          currentGroupId = user.groupId;
          currentGroupName = "קבוצה"; // Will be updated when we load children

          // Fetch daily report immediately with the groupId
          console.log(
            "📅 [CreateSleepPostPage] Fetching daily report immediately with user.groupId:",
            currentGroupId
          );
          await fetchDailyReport(currentGroupId);

          // Load children for groupName and other data if we have accountId
          if (accountId) {
            console.log(
              "👶 [CreateSleepPostPage] Loading children for groupName:",
              accountId
            );
            const childrenResponse = await childApi.getChildrenByAccount(
              accountId
            );
            currentChildren =
              (childrenResponse.children as unknown as Child[]) || [];

            console.log("📈 [CreateSleepPostPage] Children loaded:", {
              totalChildren: currentChildren.length,
              firstChild: currentChildren[0]
                ? {
                    id: currentChildren[0].id,
                    groupId: currentChildren[0].groupId,
                    groupName: currentChildren[0].groupName,
                  }
                : null,
            });

            // Get groupName from children
            if (
              childrenResponse.children &&
              childrenResponse.children.length > 0
            ) {
              console.log(
                "🏷️ [CreateSleepPostPage] Getting groupName from children"
              );
              const firstChild = childrenResponse.children[0];
              currentGroupName = firstChild.groupName || "קבוצה";
              console.log(
                "📝 [CreateSleepPostPage] GroupName from child:",
                currentGroupName
              );
            }
          } else {
            console.log(
              "⚠️ [CreateSleepPostPage] No accountId available, using default groupName"
            );
            currentChildren = [];
          }
        }

        console.log(
          "📊 [CreateSleepPostPage] Final data before state update:",
          {
            groupId: currentGroupId,
            groupName: currentGroupName,
            childrenCount: currentChildren.length,
          }
        );

        // Set state with the loaded data
        setGroupId(currentGroupId);
        setGroupName(currentGroupName);
        setChildren(currentChildren);

        // Fetch daily report for the current group (only if we haven't already fetched it)
        if (currentGroupId && !user?.groupId) {
          console.log(
            "📅 [CreateSleepPostPage] Fetching daily report for groupId (from children):",
            currentGroupId
          );
          await fetchDailyReport(currentGroupId);
          console.log("✅ [CreateSleepPostPage] Daily report fetch completed");
        } else if (currentGroupId && user?.groupId) {
          console.log(
            "✅ [CreateSleepPostPage] Daily report already fetched with user.groupId"
          );
        } else {
          console.error(
            "❌ [CreateSleepPostPage] No groupId available for daily report fetch"
          );
          throw new Error("No group ID found");
        }

        console.log(
          "🎉 [CreateSleepPostPage] Data loading completed successfully"
        );
        setIsLoading(false);
      } catch (err) {
        console.error("💥 [CreateSleepPostPage] Error loading data:", err);
        setError(
          err instanceof Error ? err.message : "אירעה שגיאה בטעינת הנתונים"
        );
        setIsLoading(false);
      }
    };

    // Only load data when user is not loading and we have the necessary data
    if (!isLoadingUser && (locationState?.groupId || user?.groupId)) {
      loadData();
    } else if (isLoadingUser) {
      console.log("⏳ [CreateSleepPostPage] Waiting for user to load...");
    } else if (!locationState?.groupId && !user?.groupId) {
      console.log(
        "⚠️ [CreateSleepPostPage] No locationState.groupId or user.groupId available"
      );
    }
  }, [locationState, fetchDailyReport, isLoadingUser, user?.groupId]);

  // Handle modal close (cancel)
  const handleClose = () => {
    navigate(-1); // Go back to previous page
  };

  // Handle form submission
  const handleSubmit = async (data: any) => {
    try {
      // Here you would typically call your API to create/update the sleep post
      console.log("Submitting sleep post data:", data);

      // For now, just navigate back
      navigate(-1);
    } catch (error) {
      console.error("Error submitting sleep post:", error);
      // Handle error appropriately
    }
  };

  // Show loading state
  if (isLoading || isLoadingUser) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          טוען נתונים...
        </Typography>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          bgcolor: "background.default",
          p: 3,
        }}
      >
        <Typography
          variant="h6"
          color="error"
          sx={{ mb: 2, textAlign: "center" }}
        >
          שגיאה בטעינת הנתונים
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 3, textAlign: "center" }}
        >
          {error}
        </Typography>
        <button onClick={() => window.location.reload()}>נסה שוב</button>
      </Box>
    );
  }

  // Debug logging
  console.log("🎯 [CreateSleepPostPage] Rendering modal with:", {
    childrenCount: children.length,
    groupName,
    groupId,
    isDailyReportLoading,
    hasDailyReport: !!dailyReport,
    dailyReportId: dailyReport?.id,
    hasSleepData: !!dailyReport?.sleepData,
    sleepDataChildrenCount: dailyReport?.sleepData?.children?.length || 0,
  });

  // Show the modal as a full-screen page
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: "background.default",
        zIndex: 1,
      }}
    >
      <CreateSleepPostModal
        isOpen={true}
        onClose={handleClose}
        onSubmit={handleSubmit}
        children={children}
        groupName={groupName}
        groupId={groupId}
        isLoadingDailyReport={isDailyReportLoading}
        dailyReport={dailyReport}
      />
    </Box>
  );
};

export default CreateSleepPostPage;
