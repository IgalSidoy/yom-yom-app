import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useApp } from "../../contexts/AppContext";
import { useDailyReport } from "../../contexts/DailyReportContext";
import { Child, updateDailyReportFoodData } from "../../services/api";
import CreateFoodPostModal from "../../components/food/CreateFoodPostModal";
import { generateGuid } from "../../utils/guid";

interface LocationState {
  groupId?: string;
  groupName?: string;
  children?: Child[];
}

const CreateFoodPostPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check if food reporting is closed
  const isFoodReportingClosed = dailyReport?.foodData?.status === "Closed";

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("🚀 [CreateFoodPostPage] Starting data load...");
        console.log("📊 [CreateFoodPostPage] Initial state:", {
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

        // If we have complete data from navigation state, use it
        if (
          locationState?.groupId &&
          locationState?.groupName &&
          locationState?.children &&
          locationState.children.length > 0
        ) {
          console.log(
            "📍 [CreateFoodPostPage] Using complete navigation state data"
          );
          currentGroupId = locationState.groupId;
          currentGroupName = locationState.groupName;
          currentChildren = locationState.children;
          console.log("📋 [CreateFoodPostPage] Navigation state data:", {
            groupId: currentGroupId,
            groupName: currentGroupName,
            childrenCount: currentChildren.length,
          });
        } else {
          console.log(
            "🔍 [CreateFoodPostPage] No navigation state, using user context"
          );

          console.log("👤 [CreateFoodPostPage] User context:", {
            userId: user?.id,
            userGroupId: user?.groupId,
            userRole: user?.role,
            accountId,
          });

          // Always use user.groupId since it's always available
          if (!user?.groupId) {
            console.error("❌ [CreateFoodPostPage] No user.groupId available");
            throw new Error("No group ID available");
          }

          console.log(
            "✅ [CreateFoodPostPage] Using user.groupId:",
            user.groupId
          );
          currentGroupId = user.groupId;
          currentGroupName = "קבוצה"; // Default, will be updated after daily report fetch

          // Fetch daily report immediately with the groupId
          console.log(
            "📅 [CreateFoodPostPage] Fetching daily report with user.groupId:",
            currentGroupId
          );
          await fetchDailyReport(currentGroupId);

          // Don't load children here - let the modal handle it
          console.log(
            "ℹ️ [CreateFoodPostPage] Skipping children API call - modal will handle children data"
          );
          currentChildren = [];
        }

        console.log("📊 [CreateFoodPostPage] Final data before state update:", {
          groupId: currentGroupId,
          groupName: currentGroupName,
          childrenCount: currentChildren.length,
        });

        // Set state with the loaded data
        setGroupId(currentGroupId);
        setGroupName(currentGroupName);
        setChildren(currentChildren);

        // Fetch daily report for the current group (only if we haven't already fetched it)
        if (currentGroupId && !user?.groupId) {
          console.log(
            "📅 [CreateFoodPostPage] Fetching daily report for groupId (from children):",
            currentGroupId
          );
          await fetchDailyReport(currentGroupId);
          console.log("✅ [CreateFoodPostPage] Daily report fetch completed");
        } else if (currentGroupId && user?.groupId) {
          console.log(
            "✅ [CreateFoodPostPage] Daily report already fetched with user.groupId"
          );
        } else {
          console.error(
            "❌ [CreateFoodPostPage] No groupId available for daily report fetch"
          );
          throw new Error("No group ID found");
        }

        console.log(
          "🎉 [CreateFoodPostPage] Data loading completed successfully"
        );
        setIsLoading(false);
        setIsModalOpen(true);
      } catch (err) {
        console.error("💥 [CreateFoodPostPage] Error loading data:", err);
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
      console.log("⏳ [CreateFoodPostPage] Waiting for user to load...");
    } else if (!locationState?.groupId && !user?.groupId) {
      console.log(
        "⚠️ [CreateFoodPostPage] No locationState.groupId or user.groupId available"
      );
    }
  }, [locationState, fetchDailyReport, isLoadingUser, user?.groupId]);

  // Update group name when daily report is loaded
  useEffect(() => {
    if (dailyReport?.groupName && dailyReport.groupName !== groupName) {
      console.log(
        "🏷️ [CreateFoodPostPage] Updating group name from daily report:",
        dailyReport.groupName
      );
      setGroupName(dailyReport.groupName);
    }
  }, [dailyReport?.groupName, groupName]);

  // Handle modal close (cancel)
  const handleClose = () => {
    setIsModalOpen(false);
    navigate("/feed"); // Navigate to feed page
  };

  // Handle form submission
  const handleSubmit = async (data: any) => {
    try {
      console.log(
        "🎯 [CreateFoodPostPage] handleSubmit called with data:",
        data
      );

      // Check if we have a daily report to update
      if (!dailyReport?.id) {
        console.error("❌ [CreateFoodPostPage] No daily report ID available");
        throw new Error("No daily report available for update");
      }

      // Check if there's an existing food event for this type
      const existingEvent = dailyReport?.foodData?.events?.find(
        (event) => event.type === data.events[0].type
      );

      // Prepare the API request data according to the new structure
      const apiData = {
        title: data.title,
        events: [
          {
            id: existingEvent?.id || generateGuid(), // Use existing ID or generate new GUID
            type: data.events[0].type,
            timestamp: existingEvent?.timestamp || new Date().toISOString(),
            children: data.events[0].children.map((child: any) => ({
              childId: child.childId,
              foodDetails: child.foodDetails,
              status: child.status,
            })),
          },
        ],
      };

      console.log(
        "🎯 [CreateFoodPostPage] Calling updateDailyReportFoodData with:",
        apiData
      );

      // Call the API to update the daily report
      await updateDailyReportFoodData(dailyReport.id, apiData);

      console.log("✅ [CreateFoodPostPage] Food data updated successfully");

      // Navigate to feed page after successful update
      navigate("/feed");
      console.log("✅ [CreateFoodPostPage] Navigated to feed successfully");
    } catch (error) {
      console.error("❌ [CreateFoodPostPage] Error in handleSubmit:", error);
      // Handle error appropriately - you might want to show an error message to the user
      throw error; // Re-throw to let the modal handle the error display
    }
  };

  // Retry loading data
  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    // Trigger the useEffect by updating a dependency
    window.location.reload();
  };

  // Handle navigation back
  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  // Handle navigation to feed
  const handleGoToFeed = () => {
    navigate("/feed");
  };

  // Show loading state
  if (isLoading || isLoadingUser) {
    return (
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
          zIndex: 1,
          p: isMobile ? 2 : 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            maxWidth: 400,
            textAlign: "center",
          }}
        >
          <CircularProgress
            size={isMobile ? 50 : 60}
            sx={{
              mb: 2,
              color: "#9C27B0",
            }}
          />
          <Typography
            variant={isMobile ? "h6" : "h5"}
            color="text.primary"
            sx={{ fontWeight: 600, mb: 1 }}
          >
            טוען נתונים...
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ opacity: 0.8 }}
          >
            מכין את הטופס ליצירת פוסט מזון
          </Typography>
        </Box>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
          zIndex: 1,
          p: isMobile ? 2 : 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            maxWidth: 400,
            textAlign: "center",
          }}
        >
          <Typography
            variant={isMobile ? "h6" : "h5"}
            color="error"
            sx={{ fontWeight: 600, mb: 1 }}
          >
            שגיאה בטעינת הנתונים
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2, opacity: 0.8 }}
          >
            {error}
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              onClick={handleRetry}
              sx={{
                bgcolor: "#9C27B0",
                "&:hover": { bgcolor: "#7B1FA2" },
              }}
            >
              נסה שוב
            </Button>
            <Button
              variant="outlined"
              onClick={handleGoBack}
              startIcon={<ArrowBackIcon />}
            >
              חזור
            </Button>
            <Button variant="outlined" onClick={handleGoToFeed}>
              עבור לפיד
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <>
      <CreateFoodPostModal
        isOpen={isModalOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        children={children}
        groupName={groupName}
        groupId={groupId}
        isLoadingDailyReport={isDailyReportLoading}
        dailyReport={dailyReport}
      />
    </>
  );
};

export default CreateFoodPostPage;
