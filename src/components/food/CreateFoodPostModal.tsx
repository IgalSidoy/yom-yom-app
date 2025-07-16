import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Alert,
  AlertTitle,
  Divider,
  Fade,
  Skeleton,
  Tabs,
  Tab,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import CancelIcon from "@mui/icons-material/Cancel";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Child, DailyReport } from "../../services/api";
import { FoodEventType, FoodStatus } from "../../types/enums";
import { useFeed } from "../../contexts/FeedContext";

// FoodChildItem component defined outside to prevent recreation on every render
const FoodChildItem = React.memo<{
  child: FoodChild;
  isDisabled: boolean;
  onStatusChange: (childId: string, status: FoodStatus) => void;
  onFoodDetailsChange: (childId: string, foodDetails: string) => void;
}>(({ child, isDisabled, onStatusChange, onFoodDetailsChange }) => {
  const handleStatusChange = (status: FoodStatus) => {
    onStatusChange(child.childId, status);
  };

  const handleFoodDetailsChange = (foodDetails: string) => {
    onFoodDetailsChange(child.childId, foodDetails);
  };

  return (
    <ListItem
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        mb: 1,
        bgcolor: "background.paper",
        p: 2,
      }}
    >
      <ListItemAvatar>
        <Avatar
          sx={{
            bgcolor: "primary.main",
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
          <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
            {child.firstName} {child.lastName}
          </Typography>
        }
        secondary={
          <Box>
            <TextField
              fullWidth
              size="small"
              label="פרטי מזון"
              value={child.foodDetails}
              onChange={(e) => handleFoodDetailsChange(e.target.value)}
              disabled={isDisabled}
              placeholder="הכנס פרטי מזון..."
              sx={{ mb: 2 }}
            />
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                label="אכל הכל"
                size="small"
                color={
                  child.status === FoodStatus.FullyEaten ? "success" : "default"
                }
                variant={
                  child.status === FoodStatus.FullyEaten ? "filled" : "outlined"
                }
                onClick={() => handleStatusChange(FoodStatus.FullyEaten)}
                disabled={isDisabled}
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
                onClick={() => handleStatusChange(FoodStatus.PartiallyEaten)}
                disabled={isDisabled}
                sx={{ cursor: "pointer" }}
              />
              <Chip
                label="סירב"
                size="small"
                color={
                  child.status === FoodStatus.Refused ? "error" : "default"
                }
                variant={
                  child.status === FoodStatus.Refused ? "filled" : "outlined"
                }
                onClick={() => handleStatusChange(FoodStatus.Refused)}
                disabled={isDisabled}
                sx={{ cursor: "pointer" }}
              />
            </Stack>
          </Box>
        }
      />
    </ListItem>
  );
});

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

// Helper function to get food type labels
const getFoodTypeLabel = (eventType: FoodEventType): string => {
  switch (eventType) {
    case FoodEventType.Breakfast:
      return "ארוחת בוקר";
    case FoodEventType.MorningSnack:
      return "חטיף בוקר";
    case FoodEventType.Lunch:
      return "ארוחת צהריים";
    case FoodEventType.AfternoonSnack:
      return "חטיף אחר הצהריים";
    case FoodEventType.Dinner:
      return "ארוחת ערב";
    default:
      return "מזון";
  }
};

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
      "דיווח מזון יומי - " + groupName,
      "מעקב תזונה - " + groupName,
      "דיווח ארוחות - " + groupName,
      "ארוחות ילדים - " + groupName,
      "דיווח תזונה יומי - " + groupName,
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
  const [foodTypeDetails, setFoodTypeDetails] = useState<{
    [key in FoodEventType]: string;
  }>({
    [FoodEventType.Breakfast]: "",
    [FoodEventType.MorningSnack]: "",
    [FoodEventType.Lunch]: "",
    [FoodEventType.AfternoonSnack]: "",
    [FoodEventType.Dinner]: "",
  });

  // Menu states
  const [bulkMenuAnchor, setBulkMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [actionsMenuAnchor, setActionsMenuAnchor] =
    useState<null | HTMLElement>(null);

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

  // Initialize food type details from daily report
  useEffect(() => {
    if (isOpen && dailyReport?.foodData?.events) {
      const newFoodTypeDetails: { [key in FoodEventType]: string } = {
        [FoodEventType.Breakfast]: "",
        [FoodEventType.MorningSnack]: "",
        [FoodEventType.Lunch]: "",
        [FoodEventType.AfternoonSnack]: "",
        [FoodEventType.Dinner]: "",
      };

      // Load food details from existing events
      dailyReport.foodData.events.forEach((event) => {
        if (event.children.length > 0) {
          // Use the first child's food details as the common details for this event type
          newFoodTypeDetails[event.type] = event.children[0].foodDetails || "";
        }
      });

      setFoodTypeDetails(newFoodTypeDetails);
    }
  }, [isOpen, dailyReport?.foodData?.events]);

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
      setFoodTypeDetails({
        [FoodEventType.Breakfast]: "",
        [FoodEventType.MorningSnack]: "",
        [FoodEventType.Lunch]: "",
        [FoodEventType.AfternoonSnack]: "",
        [FoodEventType.Dinner]: "",
      });
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

  // Apply food details to all children
  const applyFoodDetailsToAllChildren = useCallback((foodDetails: string) => {
    setFoodChildren((prev) =>
      prev.map((child) => ({
        ...child,
        foodDetails: foodDetails,
      }))
    );
  }, []);

  // Apply status to all children
  const applyStatusToAllChildren = useCallback((status: FoodStatus) => {
    setFoodChildren((prev) =>
      prev.map((child) => ({
        ...child,
        status: status,
      }))
    );
    setBulkMenuAnchor(null);
  }, []);

  // Clear all children status
  const clearAllChildrenStatus = useCallback(() => {
    setFoodChildren((prev) =>
      prev.map((child) => ({
        ...child,
        status: FoodStatus.NotEaten,
        foodDetails: "",
      }))
    );
    setFoodTypeDetails((prev) => ({
      ...prev,
      [selectedEventType]: "",
    }));
    setActionsMenuAnchor(null);
  }, [selectedEventType]);

  // Handle food type details change
  const handleFoodTypeDetailsChange = useCallback(
    (eventType: FoodEventType, details: string) => {
      setFoodTypeDetails((prev) => ({
        ...prev,
        [eventType]: details,
      }));
    },
    []
  );

  // Handle event type change
  const handleEventTypeChange = useCallback(
    (event: React.SyntheticEvent, newValue: FoodEventType) => {
      setSelectedEventType(newValue);

      // Apply the food type details to all children when switching tabs
      const currentFoodDetails = foodTypeDetails[newValue];
      if (currentFoodDetails) {
        applyFoodDetailsToAllChildren(currentFoodDetails);
      }
    },
    [foodTypeDetails, applyFoodDetailsToAllChildren]
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
    (child) => child.status === FoodStatus.FullyEaten
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
        <Box sx={{ p: 1, borderBottom: "1px solid", borderColor: "divider" }}>
          <Typography variant="h6">יצירת פוסט מזון</Typography>
        </Box>

        <Box sx={{ flex: 1, p: 1 }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Box key={index} sx={{ mb: 1 }}>
              <Box sx={{ display: "flex", gap: 2, p: 1 }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" sx={{ mb: 1 }} />
                  <Skeleton
                    variant="text"
                    width="100%"
                    height={40}
                    sx={{ mb: 1 }}
                  />
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Skeleton variant="rectangular" width={80} height={32} />
                    <Skeleton variant="rectangular" width={90} height={32} />
                    <Skeleton variant="rectangular" width={60} height={32} />
                  </Box>
                </Box>
              </Box>
            </Box>
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
      {/* Compact Header */}
      <Box sx={{ p: 1, borderBottom: "1px solid", borderColor: "divider" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Typography variant="h6" sx={{ flex: 1 }}>
            יצירת פוסט מזון - {groupName}
          </Typography>
          <IconButton
            size="small"
            onClick={(e) => setActionsMenuAnchor(e.currentTarget)}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <TextField
            size="small"
            label="כותרת"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            error={!!errors.title}
            sx={{ flex: 1 }}
          />
          <Button
            variant="outlined"
            size="small"
            onClick={handleNextTitle}
            sx={{ minWidth: "auto", px: 1 }}
          >
            ↻
          </Button>
        </Box>
      </Box>

      {/* Compact Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={selectedEventType}
          onChange={handleEventTypeChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ minHeight: 40 }}
        >
          <Tab label="בוקר" value={FoodEventType.Breakfast} />
          <Tab label="חטיף בוקר" value={FoodEventType.MorningSnack} />
          <Tab label="צהריים" value={FoodEventType.Lunch} />
          <Tab label="חטיף אחה" value={FoodEventType.AfternoonSnack} />
          <Tab label="ערב" value={FoodEventType.Dinner} />
        </Tabs>
      </Box>

      {/* Compact Controls */}
      <Box sx={{ p: 1, borderBottom: "1px solid", borderColor: "divider" }}>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <TextField
            size="small"
            label={`פרטי מזון - ${getFoodTypeLabel(selectedEventType)}`}
            value={foodTypeDetails[selectedEventType]}
            onChange={(e) =>
              handleFoodTypeDetailsChange(selectedEventType, e.target.value)
            }
            disabled={isLoading}
            placeholder="פרטי מזון לכולם..."
            sx={{ flex: 1 }}
          />
          <Button
            variant="outlined"
            size="small"
            onClick={() =>
              applyFoodDetailsToAllChildren(foodTypeDetails[selectedEventType])
            }
            disabled={isLoading || !foodTypeDetails[selectedEventType].trim()}
          >
            החל
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={(e) => setBulkMenuAnchor(e.currentTarget)}
          >
            סמן כולם
          </Button>
        </Box>
      </Box>

      {/* Stats Bar */}
      <Box
        sx={{
          p: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Chip
            label={`אכלו: ${eatenCount}`}
            size="small"
            color="success"
            variant="outlined"
          />
          <Chip
            label={`חלקית: ${partiallyEatenCount}`}
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

      {/* Errors */}
      {(errors.children ||
        errors.submit ||
        dailyReport?.foodData?.status === "Closed") && (
        <Box sx={{ p: 1 }}>
          {errors.children && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {errors.children}
            </Alert>
          )}
          {dailyReport?.foodData?.status === "Closed" && (
            <Alert severity="warning" sx={{ mb: 1 }}>
              <AlertTitle>דיווח מזון נסגר</AlertTitle>
              לא ניתן לערוך דיווח מזון שכבר נסגר.
            </Alert>
          )}
          {errors.submit && (
            <Alert severity="error" sx={{ mb: 1 }}>
              <AlertTitle>שגיאה</AlertTitle>
              {errors.submit}
            </Alert>
          )}
        </Box>
      )}

      {/* Children List - Takes most of the space */}
      <Box sx={{ flex: 1, overflow: "auto", p: 1 }}>
        {foodChildren.map((child) => (
          <FoodChildItem
            key={child.childId}
            child={child}
            isDisabled={dailyReport?.foodData?.status === "Closed"}
            onStatusChange={handleStatusChange}
            onFoodDetailsChange={handleFoodDetailsChange}
          />
        ))}
      </Box>

      {/* Compact Footer */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
          p: 1,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
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
            ) : null
          }
          sx={{ flex: 1 }}
        >
          {isLoading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Skeleton variant="text" width={60} />
              <Skeleton variant="circular" width={16} height={16} />
            </Box>
          ) : isLoadingDailyReport ? (
            "טוען..."
          ) : dailyReport?.foodData?.status === "Closed" ? (
            "נסגר"
          ) : dailyReport?.foodData?.status === "Active" ? (
            "עדכן"
          ) : (
            "צור"
          )}
        </Button>
      </Box>

      {/* Bulk Actions Menu */}
      <Menu
        anchorEl={bulkMenuAnchor}
        open={Boolean(bulkMenuAnchor)}
        onClose={() => setBulkMenuAnchor(null)}
      >
        <MenuItem
          onClick={() => applyStatusToAllChildren(FoodStatus.FullyEaten)}
        >
          <ListItemIcon>
            <CheckCircleIcon color="success" />
          </ListItemIcon>
          אכלו הכל
        </MenuItem>
        <MenuItem
          onClick={() => applyStatusToAllChildren(FoodStatus.PartiallyEaten)}
        >
          <ListItemIcon>
            <WarningIcon color="warning" />
          </ListItemIcon>
          אכלו חלקית
        </MenuItem>
        <MenuItem onClick={() => applyStatusToAllChildren(FoodStatus.Refused)}>
          <ListItemIcon>
            <CancelIcon color="error" />
          </ListItemIcon>
          סירבו
        </MenuItem>
      </Menu>

      {/* Actions Menu */}
      <Menu
        anchorEl={actionsMenuAnchor}
        open={Boolean(actionsMenuAnchor)}
        onClose={() => setActionsMenuAnchor(null)}
      >
        <MenuItem onClick={clearAllChildrenStatus}>
          <ListItemIcon>
            <ClearIcon />
          </ListItemIcon>
          נקה הכל
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default CreateFoodPostModal;
