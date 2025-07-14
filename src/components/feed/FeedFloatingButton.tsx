import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  Box,
  Fab,
  Typography,
  useTheme,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Bedtime as SleepIcon,
  Restaurant as SnackIcon,
  SportsEsports as ActivityIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

interface PostTypeOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

interface FeedFloatingButtonProps {
  onPostTypeSelect: (postType: string) => Promise<void>;
  onOpen?: () => Promise<void>;
  isLoading?: boolean;
  userRole?: string;
}

const FeedFloatingButton: React.FC<FeedFloatingButtonProps> = ({
  onPostTypeSelect,
  onOpen,
  isLoading: externalLoading = false,
  userRole,
}) => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Filter post type options based on user role
  const postTypeOptions: PostTypeOption[] = [
    {
      id: "sleep",
      label: "שינה",
      icon: <SleepIcon />,
      color: "#9C27B0", // Purple
      description: "דיווח על שנת ילדים",
    },
    // Only show food post option for Staff and Admin users
    ...(userRole === "Staff" || userRole === "Admin"
      ? [
          {
            id: "snack",
            label: "ארוחה",
            icon: <SnackIcon />,
            color: "#FF9800", // Orange
            description: "דיווח על ארוחות",
          },
        ]
      : []),
    {
      id: "activity",
      label: "פעילות",
      icon: <ActivityIcon />,
      color: "#4CAF50", // Green
      description: "דיווח על פעילויות",
    },
  ];

  const handlePostTypeSelect = async (postType: string) => {
    console.log(
      "🎯 [FeedFloatingButton] handlePostTypeSelect called with:",
      postType
    );
    setIsLoading(true);
    setIsClosing(true);
    // Wait for the menu to fully close before calling the parent handler
    setTimeout(async () => {
      setIsOpen(false);
      setIsClosing(false);
      try {
        console.log("🔄 [FeedFloatingButton] Calling parent onPostTypeSelect");
        await onPostTypeSelect(postType);
        console.log(
          "✅ [FeedFloatingButton] Parent onPostTypeSelect completed"
        );
      } catch (error) {
        console.error(
          "💥 [FeedFloatingButton] Error in parent onPostTypeSelect:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    }, 200);
  };

  const handleOpen = async () => {
    console.log("🎯 [FeedFloatingButton] handleOpen called");
    if (onOpen) {
      try {
        console.log("🔄 [FeedFloatingButton] Calling parent onOpen");
        await onOpen();
        console.log("✅ [FeedFloatingButton] Parent onOpen completed");
      } catch (error) {
        console.error(
          "💥 [FeedFloatingButton] Failed to prepare data for post creation:",
          error
        );
      }
    }
    console.log("📱 [FeedFloatingButton] Setting isOpen to true");
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add post"
        onClick={handleOpen}
        disabled={isLoading || externalLoading}
        sx={{
          position: "fixed",
          bottom: { xs: 80, sm: 24 }, // More space from bottom nav on mobile, 24px on desktop
          right: 24, // Right side on both mobile and desktop
          left: "auto", // Auto on both mobile and desktop
          width: 56,
          height: 56,
          bgcolor: theme.palette.primary.main,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "scale(1.1)",
            boxShadow: "0 6px 25px rgba(0, 0, 0, 0.2)",
          },
          zIndex: 1000,
        }}
      >
        {isLoading || externalLoading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          <AddIcon />
        )}
      </Fab>

      {/* Popup Overlay */}
      {isOpen &&
        createPortal(
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 99999,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              animation: isClosing
                ? "fadeOut 0.2s ease-in-out"
                : "fadeIn 0.3s ease-in-out",
              "@keyframes fadeIn": {
                "0%": {
                  opacity: 0,
                },
                "100%": {
                  opacity: 1,
                },
              },
              "@keyframes fadeOut": {
                "0%": {
                  opacity: 1,
                },
                "100%": {
                  opacity: 0,
                },
              },
            }}
            onClick={handleClose}
          >
            {/* Popup Content */}
            <Box
              sx={{
                backgroundColor: "white",
                borderRadius: 4,
                padding: 4,
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                display: "flex",
                flexDirection: "column",
                gap: 3,
                minWidth: { xs: 320, sm: 400 },
                maxWidth: { xs: "90vw", sm: 500 },
                mx: { xs: 2, sm: 0 },
                animation: isClosing
                  ? "slideOut 0.2s ease-in-out"
                  : "slideIn 0.3s ease-in-out",
                "@keyframes slideIn": {
                  "0%": {
                    transform: "scale(0.8) translateY(-20px)",
                    opacity: 0,
                  },
                  "100%": {
                    transform: "scale(1) translateY(0)",
                    opacity: 1,
                  },
                },
                "@keyframes slideOut": {
                  "0%": {
                    transform: "scale(1) translateY(0)",
                    opacity: 1,
                  },
                  "100%": {
                    transform: "scale(0.8) translateY(-20px)",
                    opacity: 0,
                  },
                },
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: "text.primary",
                    }}
                  >
                    צור פוסט חדש
                  </Typography>
                  {externalLoading && (
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <CircularProgress size={16} />
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          fontSize: "0.75rem",
                        }}
                      >
                        מרענן נתונים...
                      </Typography>
                    </Box>
                  )}
                </Box>
                <IconButton
                  onClick={handleClose}
                  sx={{
                    color: "text.secondary",
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>

              {/* Post Type Options */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                  gap: 2,
                }}
              >
                {postTypeOptions.map((option) => (
                  <Box
                    key={option.id}
                    onClick={() => handlePostTypeSelect(option.id)}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      p: 3,
                      borderRadius: 3,
                      border: "2px solid",
                      borderColor: "divider",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
                        borderColor: option.color,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        bgcolor: option.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 2,
                        color: "white",
                        fontSize: "2rem",
                        boxShadow: `0 4px 12px ${option.color}40`,
                      }}
                    >
                      {option.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "text.primary",
                        mb: 1,
                        textAlign: "center",
                      }}
                    >
                      {option.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        textAlign: "center",
                        fontSize: "0.875rem",
                      }}
                    >
                      {option.description}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Additional Options */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mt: 2,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    textAlign: "center",
                    fontSize: "0.75rem",
                  }}
                >
                  לחץ על סוג הפוסט הרצוי כדי להתחיל
                </Typography>
              </Box>
            </Box>
          </Box>,
          document.body
        )}
    </>
  );
};

export default FeedFloatingButton;
