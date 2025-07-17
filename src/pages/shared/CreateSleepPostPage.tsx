import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Alert,
  AlertTitle,
  Card,
  CardContent,
  Chip,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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

  // Check if sleep reporting is closed
  const isSleepReportingClosed = dailyReport?.sleepData?.status === "Closed";

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

        // If we have complete data from navigation state, use it
        if (
          locationState?.groupId &&
          locationState?.groupName &&
          locationState?.children &&
          locationState.children.length > 0
        ) {
          console.log(
            "📍 [CreateSleepPostPage] Using complete navigation state data"
          );
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
            "🔍 [CreateSleepPostPage] No navigation state, using user context"
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
          currentGroupName = "קבוצה"; // Default, will be updated after daily report fetch

          // Fetch daily report immediately with the groupId
          console.log(
            "📅 [CreateSleepPostPage] Fetching daily report with user.groupId:",
            currentGroupId
          );
          await fetchDailyReport(currentGroupId);

          // Don't load children here - let the modal handle it
          console.log(
            "ℹ️ [CreateSleepPostPage] Skipping children API call - modal will handle children data"
          );
          currentChildren = [];
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

  // Update group name when daily report is loaded
  useEffect(() => {
    if (dailyReport?.groupName && dailyReport.groupName !== groupName) {
      console.log(
        "🏷️ [CreateSleepPostPage] Updating group name from daily report:",
        dailyReport.groupName
      );
      setGroupName(dailyReport.groupName);
    }
  }, [dailyReport?.groupName, groupName]);

  // Handle modal close (cancel)
  const handleClose = () => {
    navigate("/feed"); // Navigate to feed page
  };

  // Handle form submission
  const handleSubmit = async (data: any) => {
    try {
      // Here you would typically call your API to create/update the sleep post
      console.log(
        "🎯 [CreateSleepPostPage] handleSubmit called with data:",
        data
      );
      console.log(
        "🎯 [CreateSleepPostPage] Current location:",
        window.location.pathname
      );
      console.log("🎯 [CreateSleepPostPage] About to navigate to feed...");

      // Navigate to feed page regardless of where user came from
      setTimeout(() => {
        navigate("/feed");
        console.log(
          "🎯 [CreateSleepPostPage] navigate('/feed') called successfully"
        );
      }, 0);
    } catch (error) {
      console.error("❌ [CreateSleepPostPage] Error in handleSubmit:", error);
      // Handle error appropriately
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
          height: { xs: "100dvh", sm: "100vh" }, // Use dynamic viewport height on mobile
          // Add safe area insets for mobile
          paddingTop: {
            xs: "calc(2rem + env(safe-area-inset-top))",
            sm: "2rem",
          },
          paddingBottom: {
            xs: "calc(2rem + env(safe-area-inset-bottom))",
            sm: "2rem",
          },
          paddingLeft: {
            xs: "calc(2rem + env(safe-area-inset-left))",
            sm: "2rem",
          },
          paddingRight: {
            xs: "calc(2rem + env(safe-area-inset-right))",
            sm: "2rem",
          },
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
            מכין את הטופס ליצירת פוסט שינה
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
          height: { xs: "100dvh", sm: "100vh" }, // Use dynamic viewport height on mobile
          // Add safe area insets for mobile
          paddingTop: {
            xs: "calc(2rem + env(safe-area-inset-top))",
            sm: "2rem",
          },
          paddingBottom: {
            xs: "calc(2rem + env(safe-area-inset-bottom))",
            sm: "2rem",
          },
          paddingLeft: {
            xs: "calc(2rem + env(safe-area-inset-left))",
            sm: "2rem",
          },
          paddingRight: {
            xs: "calc(2rem + env(safe-area-inset-right))",
            sm: "2rem",
          },
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
          <Alert
            severity="error"
            sx={{
              width: "100%",
              mb: 2,
              "& .MuiAlert-icon": {
                fontSize: isMobile ? "2rem" : "2.5rem",
              },
            }}
          >
            <AlertTitle
              sx={{
                fontSize: isMobile ? "1.1rem" : "1.25rem",
                fontWeight: 600,
              }}
            >
              שגיאה בטעינת הנתונים
            </AlertTitle>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          </Alert>

          <Button
            variant="contained"
            onClick={handleRetry}
            startIcon={<RefreshIcon />}
            sx={{
              bgcolor: "#9C27B0",
              "&:hover": {
                bgcolor: "#7B1FA2",
              },
              px: 3,
              py: 1.5,
              borderRadius: 2,
            }}
          >
            נסה שוב
          </Button>
        </Box>
      </Box>
    );
  }

  // Show closed status page
  if (isSleepReportingClosed) {
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
          display: "flex",
          flexDirection: "column",
          height: { xs: "100dvh", sm: "100vh" }, // Use dynamic viewport height on mobile
          overflow: "auto",
          p: isMobile ? 2 : 4,
          // Add safe area insets for mobile
          paddingTop: {
            xs: "calc(2rem + env(safe-area-inset-top))",
            sm: "2rem",
          },
          paddingBottom: {
            xs: "calc(2rem + env(safe-area-inset-bottom))",
            sm: "2rem",
          },
          paddingLeft: {
            xs: "calc(2rem + env(safe-area-inset-left))",
            sm: "2rem",
          },
          paddingRight: {
            xs: "calc(2rem + env(safe-area-inset-right))",
            sm: "2rem",
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 3,
            pb: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Button
            variant="outlined"
            onClick={handleGoBack}
            startIcon={<ArrowBackIcon />}
            sx={{
              borderColor: "primary.main",
              color: "primary.main",
              "&:hover": {
                borderColor: "primary.dark",
                bgcolor: "primary.main",
                color: "white",
              },
            }}
          >
            חזור
          </Button>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              flex: 1,
            }}
          >
            דיווח שינה - {groupName}
          </Typography>
        </Box>

        {/* Main Content */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            maxWidth: 600,
            mx: "auto",
            width: "100%",
          }}
        >
          {/* Status Icon */}
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 3,
              boxShadow: "0 8px 32px rgba(255, 152, 0, 0.3)",
            }}
          >
            <LockIcon
              sx={{
                fontSize: 60,
                color: "white",
              }}
            />
          </Box>

          {/* Status Badge */}
          <Chip
            label="דיווח שינה נסגר"
            color="warning"
            icon={<CheckCircleIcon />}
            sx={{
              mb: 3,
              fontSize: "1rem",
              fontWeight: 600,
              py: 1,
              px: 2,
              "& .MuiChip-icon": {
                fontSize: "1.2rem",
              },
            }}
          />

          {/* Title */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              mb: 2,
              fontSize: { xs: "1.75rem", sm: "2.125rem" },
            }}
          >
            דיווח השינה הושלם
          </Typography>

          {/* Description */}
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              mb: 4,
              fontSize: "1.1rem",
              lineHeight: 1.6,
              maxWidth: 500,
            }}
          >
            דיווח השינה עבור {groupName} הושלם ואין אפשרות לערוך אותו. הנתונים
            נשמרו וניתן לצפות בהם בפיד החדשות.
          </Typography>

          {/* Info Card */}
          <Card
            sx={{
              width: "100%",
              maxWidth: 500,
              mb: 4,
              bgcolor: "warning.light",
              border: "1px solid",
              borderColor: "warning.main",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: "warning.dark",
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <CheckCircleIcon sx={{ fontSize: "1.2rem" }} />
                מה קורה עכשיו?
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: "warning.dark",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: "warning.dark",
                      mt: 0.7,
                      flexShrink: 0,
                    }}
                  />
                  דיווח השינה נשמר במערכת
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "warning.dark",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: "warning.dark",
                      mt: 0.7,
                      flexShrink: 0,
                    }}
                  />
                  הורים יכולים לצפות בדיווח בפיד החדשות
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "warning.dark",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: "warning.dark",
                      mt: 0.7,
                      flexShrink: 0,
                    }}
                  />
                  לא ניתן לערוך או להוסיף נתונים נוספים
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              width: "100%",
              maxWidth: 400,
            }}
          >
            <Button
              variant="outlined"
              onClick={handleGoBack}
              sx={{
                flex: 1,
                borderColor: "primary.main",
                color: "primary.main",
                py: 1.5,
                "&:hover": {
                  borderColor: "primary.dark",
                  bgcolor: "primary.main",
                  color: "white",
                },
              }}
            >
              חזור לדשבורד
            </Button>
            <Button
              variant="contained"
              onClick={handleGoToFeed}
              sx={{
                flex: 1,
                bgcolor: "primary.main",
                py: 1.5,
                "&:hover": {
                  bgcolor: "primary.dark",
                },
              }}
            >
              צפה בפיד החדשות
            </Button>
          </Box>
        </Box>
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
    isSleepReportingClosed,
  });

  // Show the modal as a full-screen page (only when not closed)
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
        display: "flex",
        flexDirection: "column",
        height: { xs: "100dvh", sm: "100vh" }, // Use dynamic viewport height on mobile
        overflow: "hidden",
        // Add safe area insets for mobile
        paddingTop: { xs: "env(safe-area-inset-top)", sm: 0 },
        paddingBottom: { xs: "env(safe-area-inset-bottom)", sm: 0 },
        paddingLeft: { xs: "env(safe-area-inset-left)", sm: 0 },
        paddingRight: { xs: "env(safe-area-inset-right)", sm: 0 },
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
