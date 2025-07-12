import React, { useState } from "react";
import { Typography, Box, useTheme, useMediaQuery } from "@mui/material";
import { Skeleton, Fade, Slide, Box as MuiBox } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../config/routes";
import Container from "../Container";
import FeedFloatingButton from "./FeedFloatingButton";
import { useAttendance } from "../../contexts/AttendanceContext";
import { useDailyReport } from "../../contexts/DailyReportContext";
import { Child } from "../../services/api";

interface FeedContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  isPostsLoading?: boolean;
  headerContent?: React.ReactNode;
  showFloatingButton?: boolean;
  onPostTypeSelect?: (postType: string) => Promise<void>;
}

const FeedContainer: React.FC<FeedContainerProps> = ({
  title,
  subtitle,
  children,
  isLoading = false,
  isPostsLoading = false,
  headerContent,
  showFloatingButton = false,
  onPostTypeSelect,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { attendanceData } = useAttendance();
  const {
    dailyReport,
    fetchDailyReport,
    isLoading: isDailyReportLoading,
  } = useDailyReport();

  // State for post creation
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  const handlePostTypeSelect = async (postType: string) => {
    console.log(
      "🎯 [FeedContainer] handlePostTypeSelect called with:",
      postType
    );

    // Call the parent's onPostTypeSelect if provided
    if (onPostTypeSelect) {
      await onPostTypeSelect(postType);
    }

    // Handle post type selection
    switch (postType) {
      case "sleep":
        console.log("🛏️ [FeedContainer] Navigating to sleep post");
        // Navigate to the sleep post creation page
        navigate(ROUTES.SLEEP_POST);
        break;
      case "food":
      case "snack":
        console.log("🍽️ [FeedContainer] Navigating to food post");
        // Navigate to the food post creation page (both "food" and "snack" go to food post)
        navigate(ROUTES.FOOD_POST);
        break;
      case "activity":
        console.log("🎮 [FeedContainer] Activity post not implemented yet");
        // TODO: Implement activity post creation
        break;
      default:
        console.warn("⚠️ [FeedContainer] Unknown post type:", postType);
        // Unknown post type
        break;
    }
  };

  // Function to prepare data when floating button is opened
  const handleFloatingButtonOpen = async () => {
    // No longer need to fetch daily report here since the page will handle it
  };

  // Get post creation handler from context or prop
  const postTypeHandler = handlePostTypeSelect;

  // Skeleton components
  const PostSkeleton = () => (
    <Slide direction="up" in={true} timeout={600}>
      <MuiBox
        sx={{
          p: 2,
          mb: 2,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 1,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* Header skeleton */}
        <MuiBox sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <MuiBox sx={{ ml: 2, flex: 1 }}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={16} />
          </MuiBox>
          <Skeleton variant="text" width={80} height={16} />
        </MuiBox>

        {/* Title skeleton */}
        <Skeleton variant="text" width="80%" height={28} sx={{ mb: 1 }} />

        {/* Content skeleton */}
        <MuiBox sx={{ display: "flex", gap: 1, mb: 2 }}>
          <Skeleton
            variant="rectangular"
            width={60}
            height={24}
            sx={{ borderRadius: 1 }}
          />
          <Skeleton
            variant="rectangular"
            width={80}
            height={24}
            sx={{ borderRadius: 1 }}
          />
        </MuiBox>

        {/* Stats skeleton */}
        <MuiBox
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 1.5,
            bgcolor: "background.default",
            borderRadius: 1.5,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <MuiBox>
            <Skeleton variant="text" width={60} height={32} />
            <Skeleton variant="text" width={50} height={16} />
          </MuiBox>
          <MuiBox sx={{ textAlign: "center" }}>
            <Skeleton variant="text" width={40} height={24} />
            <Skeleton variant="text" width={80} height={16} />
          </MuiBox>
        </MuiBox>

        {/* Actions skeleton */}
        <MuiBox
          sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
        >
          <Skeleton
            variant="rectangular"
            width={100}
            height={32}
            sx={{ borderRadius: 1 }}
          />
          <MuiBox sx={{ display: "flex", gap: 1 }}>
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
          </MuiBox>
        </MuiBox>
      </MuiBox>
    </Slide>
  );

  const FeedSkeleton = () => (
    <Fade in={true} timeout={800}>
      <MuiBox>
        {[1, 2, 3].map((index) => (
          <PostSkeleton key={index} />
        ))}
      </MuiBox>
    </Fade>
  );

  return (
    <Box
      sx={{
        height: "100vh",
        bgcolor: "background.default",
        p: { xs: 0, sm: 2, md: 3 },
        dir: "rtl",
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
      }}
    >
      {/* Mobile Container */}
      {isMobile && (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            bgcolor: "background.paper",
            borderRadius: 0,
            boxShadow: "none",
            overflow: "hidden",
            border: "none",
            display: "flex",
            flexDirection: "column",
            px: 0,
          }}
        >
          {/* Mobile Header */}
          <Box
            sx={{
              px: 2,
              py: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              position: "relative",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                textAlign: "center",
                fontSize: "1.25rem",
              }}
            >
              {title}
            </Typography>
            {headerContent && <Box sx={{ mt: 2 }}>{headerContent}</Box>}
          </Box>

          {/* Mobile Content */}
          <Box
            sx={{
              px: 0,
              py: 1,
              pb: 10,
              flex: 1,
              bgcolor: "background.default",
              overflow: "auto",
              position: "relative",
            }}
          >
            {isLoading ? (
              <FeedSkeleton />
            ) : (
              <>
                {(isPostsLoading || isCreatingPost) && (
                  <Slide direction="down" in={true} timeout={400}>
                    <MuiBox
                      sx={{
                        p: 2,
                        mb: 2,
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        borderRadius: 2,
                        textAlign: "center",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                      }}
                    >
                      <Skeleton variant="circular" width={16} height={16} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        מוסיף פוסט חדש...
                      </Typography>
                    </MuiBox>
                  </Slide>
                )}
                {children}
              </>
            )}

            {/* Floating Action Button for Mobile */}
            {showFloatingButton && postTypeHandler && (
              <FeedFloatingButton
                onPostTypeSelect={postTypeHandler}
                onOpen={handleFloatingButtonOpen}
                isLoading={false}
              />
            )}
          </Box>
        </Box>
      )}

      {/* Desktop/Tablet Container */}
      {!isMobile && (
        <Box
          sx={{
            width: "100%",
            maxWidth: {
              sm: "600px",
              md: "700px",
              lg: "800px",
              xl: "900px",
            },
            height: "calc(100vh - 150px)",
            mx: "auto",
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          {/* Desktop Header */}
          <Box
            sx={{
              p: { sm: 3, md: 4 },
              borderBottom: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              position: "relative",
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                textAlign: "center",
                fontSize: { sm: "1.5rem", md: "1.75rem" },
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  textAlign: "center",
                  mt: 1,
                  fontSize: { sm: "0.875rem", md: "1rem" },
                }}
              >
                {subtitle}
              </Typography>
            )}
            {headerContent && <Box sx={{ mt: 2 }}>{headerContent}</Box>}
          </Box>

          {/* Desktop Content */}
          <Box
            sx={{
              p: { sm: 3, md: 4 },
              flex: 1,
              bgcolor: "background.default",
              overflow: "auto",
              position: "relative",
            }}
          >
            {isLoading ? (
              <FeedSkeleton />
            ) : (
              <>
                {(isPostsLoading || isCreatingPost) && (
                  <Slide direction="down" in={true} timeout={400}>
                    <MuiBox
                      sx={{
                        p: 2,
                        mb: 2,
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        borderRadius: 2,
                        textAlign: "center",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                      }}
                    >
                      <Skeleton variant="circular" width={16} height={16} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        מוסיף פוסט חדש...
                      </Typography>
                    </MuiBox>
                  </Slide>
                )}
                {children}
              </>
            )}

            {/* Floating Action Button for Desktop */}
            {showFloatingButton && postTypeHandler && (
              <FeedFloatingButton
                onPostTypeSelect={postTypeHandler}
                onOpen={handleFloatingButtonOpen}
                isLoading={false}
              />
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default FeedContainer;
