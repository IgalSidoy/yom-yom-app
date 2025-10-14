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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { isChildSleeping } from "../../../utils/sleepUtils";
import SleepTimer from "../../../shared/components/ui/SleepTimer";
import {
  Child,
  DailyReport,
  updateDailyReportSleepData,
} from "../../../services/api";
import { SleepStatus } from "../../../types/enums";
import { useFeed } from "../../../contexts/FeedContext";

// ChildItem component defined outside to prevent recreation on every render
const ChildItem = React.memo<{
  child: SleepChild;
  isCompleted: boolean;
  isCelebrating: boolean;
  isDisabled: boolean;
  onStartSleep: (childId: string) => void;
  onEndSleep: (childId: string, startTime: string) => void;
  onNotesChange: (childId: string, notes: string) => void;
}>(
  ({
    child,
    isCompleted,
    isCelebrating,
    isDisabled,
    onStartSleep,
    onEndSleep,
    onNotesChange,
  }) => {
    const isSleeping = isChildSleeping(
      child.sleepStartTime,
      child.sleepEndTime
    );
    const [showCelebration, setShowCelebration] = React.useState(false);

    // Trigger celebration when isCelebrating prop changes
    React.useEffect(() => {
      if (isCelebrating && !showCelebration) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 700);
      }
    }, [isCelebrating, showCelebration]);

    const handleStartSleep = () => {
      onStartSleep(child.childId);
    };

    const handleEndSleep = () => {
      onEndSleep(child.childId, child.sleepStartTime);
      // Trigger celebration animation
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 700);
    };

    const handleNotesChange = (notes: string) => {
      onNotesChange(child.childId, notes);
    };

    return (
      <Fade in={true} timeout={300}>
        <ListItem
          sx={{
            border: "1px solid",
            borderColor: isCompleted ? "#4CAF50" : "divider",
            borderRadius: 1,
            mb: 1,
            bgcolor: isCompleted ? "#4CAF5010" : "background.paper",
            transition: "all 0.3s ease",
            position: "relative",
            overflow: "hidden",
            listStyle: "none",
            "&::marker": {
              display: "none",
            },
          }}
        >
          {/* Green swipe animation overlay */}
          {showCelebration && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 10,
                pointerEvents: "none",
                background:
                  "linear-gradient(90deg, rgba(76,175,80,0.15) 0%, rgba(76,175,80,0.35) 40%, rgba(76,175,80,0.15) 100%)",
                animation: "swipeGreen 0.7s cubic-bezier(0.4,0,0.2,1) forwards",
              }}
            />
          )}

          <ListItemAvatar sx={{ position: "relative", zIndex: 2 }}>
            <Avatar
              sx={{
                bgcolor: isSleeping ? "#9C27B0" : "#757575",
                width: 40,
                height: 40,
                transition: "all 0.3s ease",
                transform: showCelebration ? "scale(1.05)" : "scale(1)",
                boxShadow: showCelebration
                  ? "0 0 10px rgba(76, 175, 80, 0.25)"
                  : "none",
              }}
            >
              {child.firstName.charAt(0)}
            </Avatar>
          </ListItemAvatar>

          <ListItemText
            sx={{ position: "relative", zIndex: 2 }}
            primary={
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: showCelebration ? "#388e3c" : "inherit",
                  transition: "color 0.3s ease",
                }}
              >
                {child.firstName} {child.lastName}
              </Typography>
            }
            secondary={
              <Box sx={{ mt: 0.5 }}>
                <SleepTimer
                  startTime={child.sleepStartTime}
                  endTime={child.sleepEndTime}
                  isSleeping={isSleeping}
                />
                <TextField
                  size="small"
                  label="הערות"
                  value={child.notes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  disabled={isDisabled}
                  sx={{ width: "100%", mt: 1 }}
                  placeholder="הערות נוספות..."
                />
              </Box>
            }
          />

          <ListItemSecondaryAction sx={{ position: "relative", zIndex: 2 }}>
            <Switch
              checked={isSleeping}
              onChange={isSleeping ? handleEndSleep : handleStartSleep}
              disabled={isDisabled}
              color="primary"
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": {
                  color: "#9C27B0",
                },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  backgroundColor: "#9C27B0",
                },
                "& .MuiSwitch-switchBase.Mui-disabled": {
                  color: "#9C27B080",
                },
                "& .MuiSwitch-switchBase.Mui-disabled + .MuiSwitch-track": {
                  backgroundColor: "#9C27B040",
                },
              }}
            />
          </ListItemSecondaryAction>

          {/* CSS Animation for swipe */}
          <style>
            {`
              @keyframes swipeGreen {
                0% {
                  transform: translateX(-100%);
                  opacity: 0.7;
                }
                60% {
                  opacity: 1;
                }
                80% {
                  opacity: 0.7;
                }
                100% {
                  transform: translateX(100%);
                  opacity: 0;
                }
              }
            `}
          </style>
        </ListItem>
      </Fade>
    );
  }
);

interface SleepChild {
  childId: string;
  firstName: string;
  lastName: string;
  sleepStartTime: string;
  sleepEndTime: string;
  sleepDuration: number;
  notes: string;
}

interface CreateSleepPostData {
  title: string;
  groupId: string;
  groupName: string;
  sleepDate: string;
  children: SleepChild[];
}

interface CreateSleepPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSleepPostData) => void;
  children: Child[];
  groupName: string;
  groupId: string;
  isLoadingDailyReport?: boolean;
  dailyReport?: DailyReport | null;
}

const CreateSleepPostModal: React.FC<CreateSleepPostModalProps> = ({
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
      "😴 שינת צהריים מתוקה - " + groupName,
      "🌙 דיווח שינה יומי - " + groupName,
      "💤 מעקב שינת ילדים - " + groupName,
      "🛏️ שינת ילדים - " + groupName,
      "✨ דיווח שנת צהריים - " + groupName,
      "🌟 שינת ילדים מאושרים - " + groupName,
      "💫 דיווח שינה יומי - " + groupName,
      "🌠 שינת צהריים רגועה - " + groupName,
    ],
    [groupName]
  );

  // Simple state management
  const [title, setTitle] = useState("");
  const [titleIndex, setTitleIndex] = useState(0);
  const [sleepChildren, setSleepChildren] = useState<SleepChild[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [completedChildren, setCompletedChildren] = useState<Set<string>>(
    new Set()
  );
  const [celebratingChildren, setCelebratingChildren] = useState<Set<string>>(
    new Set()
  );

  // Ref to track if title has been initialized
  const titleInitializedRef = React.useRef(false);

  // Initialize children when modal opens or data changes
  useEffect(() => {
    if (isOpen) {
      // Initialize children
      let initialChildren: SleepChild[] = [];

      if (
        dailyReport?.sleepData?.children &&
        dailyReport.sleepData.children.length > 0
      ) {
        // Use daily report data
        initialChildren = dailyReport.sleepData.children
          .filter((sleepChild) => sleepChild.childId)
          .map((sleepChild) => {
            let startTime = sleepChild.startTimestamp || "";
            let endTime = sleepChild.endTimestamp || "";

            if (startTime === "0001-01-01T00:00:00") startTime = "";
            if (endTime === "0001-01-01T00:00:00") endTime = "";

            const isSleeping = isChildSleeping(startTime, endTime);
            const hasFinishedSleeping = startTime && endTime && !isSleeping;

            return {
              childId: sleepChild.childId,
              firstName: sleepChild.firstName,
              lastName: sleepChild.lastName,
              sleepStartTime: isSleeping
                ? startTime || new Date().toISOString()
                : hasFinishedSleeping
                ? startTime
                : "",
              sleepEndTime: isSleeping
                ? ""
                : hasFinishedSleeping
                ? endTime
                : "",
              sleepDuration: 0,
              notes: sleepChild.comment || "",
            };
          })
          // Filter out children who have already finished sleeping
          .filter((child) => {
            const hasFinishedSleeping =
              child.sleepStartTime &&
              child.sleepEndTime &&
              !isChildSleeping(child.sleepStartTime, child.sleepEndTime);
            return !hasFinishedSleeping;
          });
      } else if (children.length > 0) {
        // Use props children
        initialChildren = children
          .filter((child) => child.id)
          .map((child) => {
            const existingData = dailyReport?.sleepData?.children?.find(
              (sleepChild) => sleepChild.childId === child.id
            );

            let startTime = existingData?.startTimestamp || "";
            let endTime = existingData?.endTimestamp || "";

            if (startTime === "0001-01-01T00:00:00") startTime = "";
            if (endTime === "0001-01-01T00:00:00") endTime = "";

            const isSleeping = isChildSleeping(startTime, endTime);
            const hasFinishedSleeping = startTime && endTime && !isSleeping;

            return {
              childId: child.id!,
              firstName: child.firstName,
              lastName: child.lastName,
              sleepStartTime: isSleeping
                ? startTime || new Date().toISOString()
                : hasFinishedSleeping
                ? startTime
                : "",
              sleepEndTime: isSleeping
                ? ""
                : hasFinishedSleeping
                ? endTime
                : "",
              sleepDuration: 0,
              notes: existingData?.comment || "",
            };
          })
          // Filter out children who have already finished sleeping
          .filter((child) => {
            const hasFinishedSleeping =
              child.sleepStartTime &&
              child.sleepEndTime &&
              !isChildSleeping(child.sleepStartTime, child.sleepEndTime);
            return !hasFinishedSleeping;
          });
      }

      setSleepChildren(initialChildren);
    }
  }, [isOpen, dailyReport?.sleepData, children, groupName]);

  // Initialize title when modal opens or title index changes
  useEffect(() => {
    if (isOpen) {
      if (!titleInitializedRef.current) {
        // Initial load - use daily report title or default title
        const initialTitle =
          dailyReport?.sleepData?.title || defaultTitles[titleIndex];
        setTitle(initialTitle);
        titleInitializedRef.current = true;
      } else {
        // Title index changed (random button clicked) - update title
        setTitle(defaultTitles[titleIndex]);
      }
    }
  }, [isOpen, dailyReport?.sleepData?.title, defaultTitles, titleIndex]);

  // Cleanup when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTitle("");
      setSleepChildren([]);
      setErrors({});
      setIsLoading(false);
      setCompletedChildren(new Set());
      setCelebratingChildren(new Set());
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

  // Update child sleep state
  const updateChildSleep = useCallback(
    (childId: string, startTime: string, endTime: string) => {
      setSleepChildren((prev) =>
        prev.map((child) =>
          child.childId === childId
            ? { ...child, sleepStartTime: startTime, sleepEndTime: endTime }
            : child
        )
      );
    },
    []
  );

  // Update child notes
  const updateChildNotes = useCallback((childId: string, notes: string) => {
    setSleepChildren((prev) =>
      prev.map((child) =>
        child.childId === childId ? { ...child, notes } : child
      )
    );
  }, []);

  // Select all asleep handler
  const handleSelectAllAsleep = useCallback(() => {
    const currentTime = new Date().toISOString();
    setSleepChildren((prev) =>
      prev.map((child) => ({
        ...child,
        sleepStartTime: currentTime,
        sleepEndTime: "",
      }))
    );
  }, []);

  // Finish all sleep handler
  const handleFinishAllSleep = useCallback(() => {
    const currentTime = new Date().toISOString();
    const completedIds: string[] = [];
    const celebratingIds: string[] = [];

    setSleepChildren((prev) =>
      prev.map((child) => {
        const isCurrentlySleeping = isChildSleeping(
          child.sleepStartTime,
          child.sleepEndTime
        );

        if (isCurrentlySleeping) {
          completedIds.push(child.childId);
          celebratingIds.push(child.childId);
          return {
            ...child,
            sleepEndTime: currentTime,
          };
        }
        return child;
      })
    );

    setCompletedChildren(new Set(completedIds));
    setCelebratingChildren(new Set(celebratingIds));

    // Clear celebrations after animation
    setTimeout(() => {
      setCompletedChildren(new Set());
      setCelebratingChildren(new Set());
    }, 2000);
  }, []);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    console.log("🎯 [CreateSleepPostModal] handleSubmit function called");

    // Prevent multiple submissions
    if (isLoading) {
      console.log("🎯 [CreateSleepPostModal] Already loading, ignoring submit");
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

      // Count children with sleep data (only children who haven't finished sleeping are shown)
      const childrenWithSleepData = sleepChildren.filter((child) => {
        const isSleeping = isChildSleeping(
          child.sleepStartTime,
          child.sleepEndTime
        );
        const hasFinishedSleeping =
          child.sleepStartTime && child.sleepEndTime && !isSleeping;
        return isSleeping || hasFinishedSleeping;
      }).length;

      if (childrenWithSleepData === 0) {
        newErrors.children = "יש לבחור לפחות ילד אחד עם נתוני שינה";
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

      // Prepare sleep data for the API (only children who haven't finished sleeping are included)
      const sleepData = {
        title: title.trim(),
        children: sleepChildren.map((child) => {
          const isCurrentlySleeping = isChildSleeping(
            child.sleepStartTime,
            child.sleepEndTime
          );
          const hasFinishedSleeping =
            child.sleepStartTime && child.sleepEndTime && !isCurrentlySleeping;

          let status: SleepStatus;
          if (isCurrentlySleeping) {
            status = SleepStatus.Sleeping;
          } else if (hasFinishedSleeping) {
            status = SleepStatus.Awake;
          } else {
            status = SleepStatus.Awake;
          }

          return {
            childId: child.childId,
            status: status,
            comment: child.notes,
          };
        }),
      };

      // Prepare form data for navigation
      const formData: CreateSleepPostData = {
        title: title.trim(),
        groupId,
        groupName,
        sleepDate: new Date().toISOString().split("T")[0],
        children: sleepChildren,
      };

      console.log(
        "🎯 [CreateSleepPostModal] About to update daily report sleep data:",
        sleepData
      );

      // Update the daily report first, then navigate on success
      try {
        await updateDailyReportSleepData(dailyReport.id, sleepData);
        console.log(
          "🎯 [CreateSleepPostModal] Sleep data updated successfully"
        );

        // Refresh feed to get updated timestamps
        console.log("🎯 [CreateSleepPostModal] Refreshing feed data...");
        await refreshFeed();
        console.log("🎯 [CreateSleepPostModal] Feed refreshed successfully");

        // Only navigate after successful API update and feed refresh
        console.log(
          "🎯 [CreateSleepPostModal] About to call onSubmit with data:",
          formData
        );
        onSubmit(formData);
        console.log("🎯 [CreateSleepPostModal] onSubmit called successfully");
      } catch (apiError) {
        console.error("API update failed:", apiError);
        setErrors({
          submit:
            apiError instanceof Error
              ? apiError.message
              : "אירעה שגיאה בעדכון נתוני השינה",
        });
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error("Error updating sleep data:", error);
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : "אירעה שגיאה בעדכון נתוני השינה",
      });
      setIsLoading(false);
    }
  }, [
    title,
    sleepChildren,
    dailyReport?.id,
    groupId,
    groupName,
    onSubmit,
    isLoading,
    refreshFeed,
  ]);

  // Count sleeping children
  const sleepingChildrenCount = sleepChildren.filter((child) =>
    isChildSleeping(child.sleepStartTime, child.sleepEndTime)
  ).length;

  // Count total children available for sleep marking
  const totalChildrenCount = sleepChildren.length;

  // Memoize callback functions to prevent unnecessary re-renders
  const handleStartSleep = React.useCallback(
    (childId: string) => {
      const currentTime = new Date().toISOString();
      updateChildSleep(childId, currentTime, "");
    },
    [updateChildSleep]
  );

  const handleEndSleep = React.useCallback(
    (childId: string, startTime: string) => {
      const currentTime = new Date().toISOString();
      updateChildSleep(childId, startTime, currentTime);
    },
    [updateChildSleep]
  );

  const handleNotesChange = React.useCallback(
    (childId: string, notes: string) => {
      updateChildNotes(childId, notes);
    },
    [updateChildNotes]
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
            יצירת פוסט שינה
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
        height: { xs: "100dvh", sm: "100vh" }, // Use dynamic viewport height on mobile
        overflow: "hidden",
        // Add safe area insets for mobile
        paddingTop: { xs: "env(safe-area-inset-top)", sm: 0 },
        paddingBottom: { xs: "env(safe-area-inset-bottom)", sm: 0 },
        paddingLeft: { xs: "env(safe-area-inset-left)", sm: 0 },
        paddingRight: { xs: "env(safe-area-inset-right)", sm: 0 },
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
            background: "linear-gradient(90deg, #9C27B0 0%, #4CAF50 100%)",
          },
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            mb: 1,
            background: "linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textAlign: "center",
            letterSpacing: "0.5px",
          }}
        >
          יצירת פוסט שינה
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            textAlign: "center",
            fontWeight: 500,
            opacity: 0.8,
            "&::before": {
              content: '"🏠"',
              marginRight: "8px",
            },
          }}
        >
          {groupName}
        </Typography>
      </Box>

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          pb: isMobile ? 2 : 0, // Increased bottom padding to prevent overlap with sticky footer
        }}
      >
        {/* Basic Details */}
        <Box sx={{ p: isMobile ? 1.5 : 2 }}>
          <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
            <TextField
              fullWidth
              label="כותרת הפוסט"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              error={!!errors.title}
              helperText={errors.title}
              size="small"
            />
            <Button
              variant="outlined"
              onClick={handleNextTitle}
              sx={{
                minWidth: "auto",
                px: 2,
                borderColor: "#9C27B0",
                color: "#9C27B0",
                "&:hover": {
                  borderColor: "#7B1FA2",
                  bgcolor: "#9C27B010",
                },
              }}
              title="כותרת הבאה"
            >
              ↻
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* Children List Header */}
        <Box sx={{ pr: isMobile ? 0.5 : 1, pl: isMobile ? 0.5 : 0, mb: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#2c3e50",
                textAlign: "center",
                position: "relative",
                "&::before": {
                  content: '"👶"',
                  marginLeft: "8px",
                  fontSize: "1.2em",
                },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: -4,
                  left: 0,
                  right: 0,
                  height: "2px",
                  background:
                    "linear-gradient(90deg, #9C27B0 0%, #4CAF50 100%)",
                  borderRadius: "1px",
                },
              }}
            >
              ילדים בקבוצה
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label={`${sleepingChildrenCount}/${totalChildrenCount} ילדים ישנים`}
                color="primary"
                size="small"
              />
            </Box>
          </Box>

          {/* Quick Selection Buttons */}
          <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleSelectAllAsleep}
              disabled={dailyReport?.sleepData?.status === "Closed"}
              sx={{
                borderColor: "#9C27B0",
                color: "#9C27B0",
                "&:hover": {
                  borderColor: "#7B1FA2",
                  bgcolor: "#9C27B010",
                },
                "&:disabled": {
                  borderColor: "#6c757d",
                  color: "#6c757d",
                },
              }}
            >
              בחר הכל ישנים
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handleFinishAllSleep}
              disabled={dailyReport?.sleepData?.status === "Closed"}
              sx={{
                borderColor: "#4CAF50",
                color: "#4CAF50",
                "&:hover": {
                  borderColor: "#388E3C",
                  bgcolor: "#4CAF5010",
                },
                "&:disabled": {
                  borderColor: "#6c757d",
                  color: "#6c757d",
                },
              }}
            >
              סיים שינה לכולם
            </Button>
          </Box>

          {/* Info about filtered children */}
          {dailyReport?.sleepData?.children &&
            dailyReport.sleepData.children.some((child) => {
              const hasFinishedSleeping =
                child.startTimestamp &&
                child.endTimestamp &&
                child.startTimestamp !== "0001-01-01T00:00:00" &&
                child.endTimestamp !== "0001-01-01T00:00:00" &&
                !isChildSleeping(child.startTimestamp, child.endTimestamp);
              return hasFinishedSleeping;
            }) && (
              <Alert severity="info" sx={{ mb: 1, fontSize: "0.875rem" }}>
                ילדים שכבר סיימו לישון לא מוצגים ברשימה זו
              </Alert>
            )}

          {errors.children && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {errors.children}
            </Alert>
          )}

          {dailyReport?.sleepData?.status === "Closed" && (
            <Alert severity="warning" sx={{ mb: 1 }}>
              <AlertTitle>דיווח שינה נסגר</AlertTitle>
              לא ניתן לערוך דיווח שינה שכבר נסגר. הדיווח הושלם ואין אפשרות
              להוסיף או לשנות נתונים.
            </Alert>
          )}

          {errors.submit && (
            <Alert severity="error" sx={{ mb: 1 }}>
              <AlertTitle>שגיאה ביצירת הפוסט</AlertTitle>
              {errors.submit}
            </Alert>
          )}
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
              {sleepChildren.map((child) => (
                <ChildItem
                  key={child.childId}
                  child={child}
                  isCompleted={completedChildren.has(child.childId)}
                  isCelebrating={celebratingChildren.has(child.childId)}
                  isDisabled={dailyReport?.sleepData?.status === "Closed"}
                  onStartSleep={handleStartSleep}
                  onEndSleep={handleEndSleep}
                  onNotesChange={handleNotesChange}
                />
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
          p: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          "@media (max-width: 600px)": {
            p: 2,
            position: "sticky",
            bottom: 0,
            zIndex: 10,
            boxShadow: "0 -2px 8px rgba(0,0,0,0.1)",
          },
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            flex: 1,
            "@media (max-width: 600px)": {
              py: 1.5,
              fontSize: "1rem",
            },
          }}
        >
          ביטול
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            isLoading ||
            isLoadingDailyReport ||
            dailyReport?.sleepData?.status === "Closed"
          }
          sx={{
            flex: 1,
            bgcolor: "primary.main",
            "&:hover": {
              bgcolor: "primary.dark",
            },
            "@media (max-width: 600px)": {
              py: 1.5,
              fontSize: "1rem",
            },
          }}
        >
          {isLoading
            ? "שומר..."
            : dailyReport?.sleepData?.status === "Closed"
            ? "נסגר"
            : "שמור"}
        </Button>
      </Box>
    </Box>
  );
};

export default CreateSleepPostModal;
