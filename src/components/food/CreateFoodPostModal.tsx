import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Switch,
  Chip,
  Alert,
  AlertTitle,
  Divider,
  Fade,
  Skeleton,
  Tabs,
  Tab,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Child, DailyReport } from "../../services/api";
import { FoodEventType, FoodStatus } from "../../types/enums";
import { useFeed } from "../../contexts/FeedContext";

interface FoodChild {
  childId: string;
  firstName: string;
  lastName: string;
  foodDetails: string;
  status: FoodStatus;
}

interface CreateFoodPostData {
  title: string;
  groupId: string;
  groupName: string;
  foodDate: string;
  events: {
    type: FoodEventType;
    children: FoodChild[];
  }[];
}

interface CreateFoodPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateFoodPostData) => void;
  children: Child[];
  groupName: string;
  groupId: string;
  isLoadingDailyReport?: boolean;
  dailyReport?: DailyReport | null;
}

const CreateFoodPostModal: React.FC<CreateFoodPostModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  children,
  groupName,
  groupId,
  isLoadingDailyReport = false,
  dailyReport,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { refreshFeed } = useFeed();

  // Default title variations - memoized to prevent infinite loops
  const defaultTitles = React.useMemo(
    () => [
      "🍽️ דיווח מזון יומי - " + groupName,
      "🥗 מעקב תזונה - " + groupName,
      "🍎 דיווח ארוחות - " + groupName,
      "🥪 ארוחות ילדים - " + groupName,
      "🍕 דיווח תזונה יומי - " + groupName,
      "🥙 מעקב ארוחות ילדים - " + groupName,
      "🍜 דיווח מזון - " + groupName,
      "🥣 ארוחות בריאות - " + groupName,
    ],
    [groupName]
  );

  // Simple state management
  const [title, setTitle] = useState("");
  const [titleIndex, setTitleIndex] = useState(0);
  const [selectedEventType, setSelectedEventType] = useState<FoodEventType>(
    FoodEventType.Breakfast
  );
  const [foodChildren, setFoodChildren] = useState<FoodChild[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Ref to track if title has been initialized
  const titleInitializedRef = React.useRef(false);

  // Initialize children when modal opens or data changes
  useEffect(() => {
    if (isOpen) {
      // Initialize children
      let initialChildren: FoodChild[] = [];

      if (
        dailyReport?.foodData?.events &&
        dailyReport.foodData.events.length > 0
      ) {
        // Use daily report data for the selected event type
        const currentEvent = dailyReport.foodData.events.find(
          (event) => event.type === selectedEventType
        );

        if (currentEvent) {
          initialChildren = currentEvent.children.map((child) => ({
            childId: child.childId,
            firstName: child.firstName,
            lastName: child.lastName,
            foodDetails: child.foodDetails,
            status: child.status,
          }));
        }
      } else if (children.length > 0) {
        // Use props children
        initialChildren = children
          .filter((child) => child.id)
          .map((child) => ({
            childId: child.id!,
            firstName: child.firstName,
            lastName: child.lastName,
            foodDetails: "",
            status: FoodStatus.NotEaten,
          }));
      }

      setFoodChildren(initialChildren);
    }
  }, [isOpen, dailyReport?.foodData, children, selectedEventType]);

  // Initialize title when modal opens or title index changes
  useEffect(() => {
    if (isOpen) {
      if (!titleInitializedRef.current) {
        // Initial load - use daily report title or default title
        const initialTitle =
          dailyReport?.foodData?.title || defaultTitles[titleIndex];
        setTitle(initialTitle);
        titleInitializedRef.current = true;
      } else {
        // Title index changed (random button clicked) - update title
        setTitle(defaultTitles[titleIndex]);
      }
    }
  }, [isOpen, dailyReport?.foodData?.title, defaultTitles, titleIndex]);

  // Cleanup when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTitle("");
      setFoodChildren([]);
      setErrors({});
      setIsLoading(false);
      titleInitializedRef.current = false;
    }
  }, [isOpen]);

  // Title change handler
  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
  }, []);

  // Next title handler
  const handleNextTitle = useCallback(() => {
    const nextIndex = (titleIndex + 1) % defaultTitles.length;
    setTitleIndex(nextIndex);
  }, [titleIndex, defaultTitles.length]);

  // Update child food status
  const updateChildFoodStatus = useCallback(
    (childId: string, status: FoodStatus) => {
      setFoodChildren((prev) =>
        prev.map((child) =>
          child.childId === childId ? { ...child, status } : child
        )
      );
    },
    []
  );

  // Update child food details
  const updateChildFoodDetails = useCallback(
    (childId: string, foodDetails: string) => {
      setFoodChildren((prev) =>
        prev.map((child) =>
          child.childId === childId ? { ...child, foodDetails } : child
        )
      );
    },
    []
  );

  // Handle event type change
  const handleEventTypeChange = useCallback(
    (event: React.SyntheticEvent, newValue: FoodEventType) => {
      setSelectedEventType(newValue);
    },
    []
  );

  // Submit handler
  const handleSubmit = useCallback(async () => {
    console.log("🎯 [CreateFoodPostModal] handleSubmit function called");

    // Prevent multiple submissions
    if (isLoading) {
      console.log("🎯 [CreateFoodPostModal] Already loading, ignoring submit");
      return;
    }

    try {
      setIsLoading(true);
      setErrors({});

      // Validation
      const newErrors: { [key: string]: string } = {};

      if (!title.trim()) {
        newErrors.title = "כותרת היא שדה חובה";
      }

      // Count children with food data
      const childrenWithFoodData = foodChildren.filter(
        (child) => child.status !== FoodStatus.NotEaten
      ).length;

      if (childrenWithFoodData === 0) {
        newErrors.children = "יש לבחור לפחות ילד אחד עם נתוני מזון";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsLoading(false);
        return;
      }

      // Check if we have a daily report to update
      if (!dailyReport?.id) {
        setErrors({
          submit: "לא נמצא דיווח יומי לעדכון",
        });
        setIsLoading(false);
        return;
      }

      // Prepare form data for navigation
      const formData: CreateFoodPostData = {
        title: title.trim(),
        groupId,
        groupName,
        foodDate: new Date().toISOString().split("T")[0],
        events: [
          {
            type: selectedEventType,
            children: foodChildren,
          },
        ],
      };

      console.log(
        "🎯 [CreateFoodPostModal] About to call onSubmit with data:",
        formData
      );

      // Call onSubmit to trigger navigation
      onSubmit(formData);
      console.log("🎯 [CreateFoodPostModal] onSubmit called successfully");

      // Refresh feed to get updated data
      setTimeout(async () => {
        try {
          console.log("🎯 [CreateFoodPostModal] Refreshing feed data...");
          await refreshFeed();
          console.log("🎯 [CreateFoodPostModal] Feed refreshed successfully");
        } catch (apiError) {
          console.error(
            "Feed refresh failed but navigation should continue:",
            apiError
          );
        }
      }, 100);
    } catch (error) {
      console.error("Error updating food data:", error);
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : "אירעה שגיאה בעדכון נתוני המזון",
      });
      setIsLoading(false);
    }
  }, [
    title,
    foodChildren,
    selectedEventType,
    dailyReport?.id,
    groupId,
    groupName,
    onSubmit,
    isLoading,
    refreshFeed,
  ]);

  // Count children by status
  const eatenCount = foodChildren.filter(
    (child) => child.status === FoodStatus.Eaten
  ).length;
  const partiallyEatenCount = foodChildren.filter(
    (child) => child.status === FoodStatus.PartiallyEaten
  ).length;
  const refusedCount = foodChildren.filter(
    (child) => child.status === FoodStatus.Refused
  ).length;
  const totalChildrenCount = foodChildren.length;

  // Memoize callback functions to prevent unnecessary re-renders
  const handleStatusChange = React.useCallback(
    (childId: string, status: FoodStatus) => {
      updateChildFoodStatus(childId, status);
    },
    [updateChildFoodStatus]
  );

  const handleFoodDetailsChange = React.useCallback(
    (childId: string, foodDetails: string) => {
      updateChildFoodDetails(childId, foodDetails);
    },
    [updateChildFoodDetails]
  );

  // Show loading state
  if (isLoadingDailyReport) {
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
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: isMobile ? 1.5 : 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            יצירת פוסט מזון
          </Typography>
        </Box>

        <Box sx={{ flex: 1, p: isMobile ? 1.5 : 2 }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Fade in={true} timeout={300 + index * 100} key={index}>
              <ListItem
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  mb: 1,
                  bgcolor: "background.paper",
                }}
              >
                <ListItemAvatar>
                  <Skeleton variant="circular" width={40} height={40} />
                </ListItemAvatar>
                <ListItemText
                  primary={<Skeleton variant="text" width="60%" />}
                  secondary={<Skeleton variant="text" width="40%" />}
                />
                <ListItemSecondaryAction>
                  <Skeleton
                    variant="rectangular"
                    width={44}
                    height={24}
                    sx={{ borderRadius: 12 }}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </Fade>
          ))}
        </Box>
      </Box>
    );
  }

  // Main modal content
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
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: isMobile ? 1.5 : 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: "linear-gradient(90deg, #FF6B35 0%, #F7931E 100%)",
          },
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            mb: 1,
            background: "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          יצירת פוסט מזון
        </Typography>

        {/* Title Input */}
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <TextField
            fullWidth
            size="small"
            label="כותרת הפוסט"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            disabled={isLoading}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#FF6B35",
                },
                "&:hover fieldset": {
                  borderColor: "#F7931E",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#FF6B35",
                },
              },
            }}
          />
          <Button
            variant="outlined"
            size="small"
            onClick={handleNextTitle}
            disabled={isLoading}
            sx={{
              borderColor: "#FF6B35",
              color: "#FF6B35",
              "&:hover": {
                borderColor: "#F7931E",
                backgroundColor: "rgba(255, 107, 53, 0.08)",
              },
            }}
          >
            🎲
          </Button>
        </Box>

        {/* Error Display */}
        {errors.title && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {errors.title}
          </Alert>
        )}
      </Box>

      {/* Event Type Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={selectedEventType}
          onChange={handleEventTypeChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": {
              color: "#666",
              "&.Mui-selected": {
                color: "#FF6B35",
              },
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#FF6B35",
            },
          }}
        >
          <Tab label="ארוחת בוקר" value={FoodEventType.Breakfast} />
          <Tab label="חטיף בוקר" value={FoodEventType.MorningSnack} />
          <Tab label="ארוחת צהריים" value={FoodEventType.Lunch} />
          <Tab label="חטיף אחר הצהריים" value={FoodEventType.AfternoonSnack} />
          <Tab label="ארוחת ערב" value={FoodEventType.Dinner} />
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Stats */}
        <Box
          sx={{
            p: isMobile ? 1 : 1.5,
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            סיכום:
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip
              label={`אכלו: ${eatenCount}`}
              size="small"
              color="success"
              variant="outlined"
            />
            <Chip
              label={`אכלו חלקית: ${partiallyEatenCount}`}
              size="small"
              color="warning"
              variant="outlined"
            />
            <Chip
              label={`סירבו: ${refusedCount}`}
              size="small"
              color="error"
              variant="outlined"
            />
            <Chip
              label={`סה"כ: ${totalChildrenCount}`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        </Box>

        {/* Children List */}
        <Box
          sx={{
            flex: 1,
            overflow: "hidden",
            pr: isMobile ? 0.5 : 1,
            pl: isMobile ? 0.5 : 0,
            minHeight: 0,
          }}
        >
          <Box
            sx={{
              bgcolor: "background.default",
              borderRadius: 2,
              height: "100%",
              p: isMobile ? 0.5 : 1,
            }}
          >
            <Box
              sx={{
                height: "100%",
                overflow: "auto",
                pr: 1,
              }}
            >
              {foodChildren.map((child) => (
                <Fade in={true} timeout={300} key={child.childId}>
                  <ListItem
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      mb: 1,
                      bgcolor: "background.paper",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        borderColor: "primary.main",
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: "#FF6B35",
                          width: 40,
                          height: 40,
                          fontSize: "1rem",
                        }}
                      >
                        {child.firstName.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>

                    <ListItemText
                      primary={
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600 }}
                        >
                          {child.firstName} {child.lastName}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <TextField
                            size="small"
                            label="פרטי מזון"
                            value={child.foodDetails}
                            onChange={(e) =>
                              handleFoodDetailsChange(
                                child.childId,
                                e.target.value
                              )
                            }
                            disabled={isLoading}
                            sx={{ width: "100%", mb: 1 }}
                            placeholder="פרטים על המזון..."
                          />
                          <Box
                            sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}
                          >
                            <Chip
                              label="אכל"
                              size="small"
                              color={
                                child.status === FoodStatus.Eaten
                                  ? "success"
                                  : "default"
                              }
                              variant={
                                child.status === FoodStatus.Eaten
                                  ? "filled"
                                  : "outlined"
                              }
                              onClick={() =>
                                handleStatusChange(
                                  child.childId,
                                  FoodStatus.Eaten
                                )
                              }
                              sx={{ cursor: "pointer" }}
                            />
                            <Chip
                              label="אכל חלקית"
                              size="small"
                              color={
                                child.status === FoodStatus.PartiallyEaten
                                  ? "warning"
                                  : "default"
                              }
                              variant={
                                child.status === FoodStatus.PartiallyEaten
                                  ? "filled"
                                  : "outlined"
                              }
                              onClick={() =>
                                handleStatusChange(
                                  child.childId,
                                  FoodStatus.PartiallyEaten
                                )
                              }
                              sx={{ cursor: "pointer" }}
                            />
                            <Chip
                              label="סירב"
                              size="small"
                              color={
                                child.status === FoodStatus.Refused
                                  ? "error"
                                  : "default"
                              }
                              variant={
                                child.status === FoodStatus.Refused
                                  ? "filled"
                                  : "outlined"
                              }
                              onClick={() =>
                                handleStatusChange(
                                  child.childId,
                                  FoodStatus.Refused
                                )
                              }
                              sx={{ cursor: "pointer" }}
                            />
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                </Fade>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          pt: 1,
          pb: isMobile ? 1 : 0,
          borderTop: "1px solid",
          borderColor: "divider",
          p: isMobile ? 1.5 : 2,
          position: "sticky",
          bottom: 0,
          bgcolor: "background.default",
          zIndex: 10,
          boxShadow: "0 -2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Button variant="outlined" onClick={onClose} sx={{ flex: 1 }}>
          ביטול
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            isLoading ||
            isLoadingDailyReport ||
            dailyReport?.foodData?.status === "Closed"
          }
          startIcon={
            isLoading ? (
              <Skeleton variant="circular" width={20} height={20} />
            ) : dailyReport?.foodData?.status === "Closed" ? (
              <Box sx={{ color: "white", fontSize: "1.2rem" }}>🔒</Box>
            ) : (
              <AddIcon />
            )
          }
          sx={{
            flex: 1,
            bgcolor:
              dailyReport?.foodData?.status === "Closed"
                ? "#6c757d"
                : "#FF6B35",
            "&:hover": {
              bgcolor:
                dailyReport?.foodData?.status === "Closed"
                  ? "#6c757d"
                  : "#F7931E",
            },
            "&:disabled": {
              bgcolor:
                dailyReport?.foodData?.status === "Closed"
                  ? "#6c757d"
                  : "#FF6B3580",
            },
          }}
        >
          {isLoading
            ? "שולח..."
            : dailyReport?.foodData?.status === "Closed"
            ? "דיווח סגור"
            : "צור פוסט מזון"}
        </Button>
      </Box>

      {/* Error Display */}
      {errors.submit && (
        <Alert severity="error" sx={{ m: 2 }}>
          <AlertTitle>שגיאה</AlertTitle>
          {errors.submit}
        </Alert>
      )}

      {errors.children && (
        <Alert severity="warning" sx={{ m: 2 }}>
          {errors.children}
        </Alert>
      )}
    </Box>
  );
};

export default CreateFoodPostModal;
