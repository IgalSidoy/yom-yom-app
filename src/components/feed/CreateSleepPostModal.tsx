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
import { isChildSleeping } from "../../utils/sleepUtils";
import SleepTimer from "../SleepTimer";
import {
  Child,
  DailyReport,
  updateDailyReportSleepData,
} from "../../services/api";
import { SleepStatus } from "../../types/enums";

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

  // Default title variations
  const defaultTitles = [
    "שינת צהריים - " + groupName,
    "דיווח שינה יומי - " + groupName,
    "מעקב שינת ילדים - " + groupName,
    "שינת ילדים - " + groupName,
    "דיווח שנת צהריים - " + groupName,
  ];

  // Simple state management
  const [title, setTitle] = useState("");
  const [titleIndex, setTitleIndex] = useState(0);
  const [sleepChildren, setSleepChildren] = useState<SleepChild[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [completedChildren, setCompletedChildren] = useState<Set<string>>(
    new Set()
  );

  // Initialize data when modal opens
  useEffect(() => {
    if (isOpen) {
      // Initialize title
      const initialTitle =
        dailyReport?.sleepData?.title || defaultTitles[titleIndex];
      setTitle(initialTitle);

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
          });
      }

      setSleepChildren(initialChildren);
    }
  }, [isOpen, dailyReport?.sleepData, children, defaultTitles, titleIndex]);

  // Cleanup when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTitle("");
      setSleepChildren([]);
      setErrors({});
      setIsLoading(false);
      setCompletedChildren(new Set());
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
    setTitle(defaultTitles[nextIndex]);
  }, [titleIndex, defaultTitles]);

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

    setSleepChildren((prev) =>
      prev.map((child) => {
        const isCurrentlySleeping = isChildSleeping(
          child.sleepStartTime,
          child.sleepEndTime
        );

        if (isCurrentlySleeping) {
          completedIds.push(child.childId);
          return {
            ...child,
            sleepEndTime: currentTime,
          };
        }
        return child;
      })
    );

    setCompletedChildren(new Set(completedIds));
    setTimeout(() => setCompletedChildren(new Set()), 2000);
  }, []);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrors({});

      // Validation
      const newErrors: { [key: string]: string } = {};

      if (!title.trim()) {
        newErrors.title = "כותרת היא שדה חובה";
      }

      // Count children with sleep data
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

      // Prepare sleep data for the API
      const sleepData = {
        childrenSleepData: {
          title: title.trim(),
          children: sleepChildren.map((child) => {
            const isCurrentlySleeping = isChildSleeping(
              child.sleepStartTime,
              child.sleepEndTime
            );
            const hasFinishedSleeping =
              child.sleepStartTime &&
              child.sleepEndTime &&
              !isCurrentlySleeping;

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
        },
      };

      // Update the daily report
      await updateDailyReportSleepData(dailyReport.id, sleepData);

      // Call the original onSubmit
      const formData: CreateSleepPostData = {
        title: title.trim(),
        groupId,
        groupName,
        sleepDate: new Date().toISOString().split("T")[0],
        children: sleepChildren,
      };

      onSubmit(formData);
      setIsLoading(false);
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
  }, [title, sleepChildren, dailyReport?.id, groupId, groupName, onSubmit]);

  // Count sleeping children
  const sleepingChildrenCount = sleepChildren.filter((child) =>
    isChildSleeping(child.sleepStartTime, child.sleepEndTime)
  ).length;

  // Individual child component
  const ChildItem = React.memo<{ child: SleepChild; isCompleted: boolean }>(
    ({ child, isCompleted }) => {
      const isSleeping = isChildSleeping(
        child.sleepStartTime,
        child.sleepEndTime
      );

      const handleStartSleep = () => {
        const currentTime = new Date().toISOString();
        updateChildSleep(child.childId, currentTime, "");
      };

      const handleEndSleep = () => {
        const currentTime = new Date().toISOString();
        updateChildSleep(child.childId, child.sleepStartTime, currentTime);
      };

      const handleNotesChange = (notes: string) => {
        updateChildNotes(child.childId, notes);
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
            }}
          >
            <ListItemAvatar>
              <Avatar
                sx={{
                  bgcolor: isSleeping ? "#9C27B0" : "#757575",
                  width: 40,
                  height: 40,
                }}
              >
                {child.firstName.charAt(0)}
              </Avatar>
            </ListItemAvatar>

            <ListItemText
              primary={
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
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
                    sx={{ width: "100%", mt: 1 }}
                    placeholder="הערות נוספות..."
                  />
                </Box>
              }
            />

            <ListItemSecondaryAction>
              <Switch
                checked={isSleeping}
                onChange={isSleeping ? handleEndSleep : handleStartSleep}
                color="primary"
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: "#9C27B0",
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "#9C27B0",
                  },
                }}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </Fade>
      );
    }
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
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          יצירת פוסט שינה
        </Typography>
        <Typography variant="body2" color="text.secondary">
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
        }}
      >
        {/* Basic Details */}
        <Box sx={{ p: isMobile ? 1.5 : 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            פרטים בסיסיים
          </Typography>

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
              sx={{ fontWeight: 600, color: "text.primary" }}
            >
              ילדים בקבוצה
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label={`${sleepingChildrenCount} ילדים ישנים`}
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
              sx={{
                borderColor: "#9C27B0",
                color: "#9C27B0",
                "&:hover": {
                  borderColor: "#7B1FA2",
                  bgcolor: "#9C27B010",
                },
              }}
            >
              בחר הכל ישנים
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handleFinishAllSleep}
              sx={{
                borderColor: "#4CAF50",
                color: "#4CAF50",
                "&:hover": {
                  borderColor: "#388E3C",
                  bgcolor: "#4CAF5010",
                },
              }}
            >
              סיים שינה לכולם
            </Button>
          </Box>

          {errors.children && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {errors.children}
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
                height: isMobile ? 400 : 500,
                overflow: "auto",
                pr: 1,
              }}
            >
              {sleepChildren.map((child) => (
                <ChildItem
                  key={child.childId}
                  child={child}
                  isCompleted={completedChildren.has(child.childId)}
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
          pt: 1,
          pb: isMobile ? 1 : 0,
          borderTop: "1px solid",
          borderColor: "divider",
          p: isMobile ? 1.5 : 2,
        }}
      >
        <Button variant="outlined" onClick={onClose} sx={{ flex: 1 }}>
          ביטול
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading || isLoadingDailyReport}
          startIcon={
            isLoading ? (
              <Skeleton variant="circular" width={20} height={20} />
            ) : (
              <AddIcon />
            )
          }
          sx={{
            flex: 1,
            bgcolor: "#9C27B0",
            "&:hover": {
              bgcolor: "#7B1FA2",
            },
            "&:disabled": {
              bgcolor: "#9C27B080",
            },
          }}
        >
          {isLoading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Skeleton variant="text" width={60} />
              <Skeleton variant="circular" width={16} height={16} />
            </Box>
          ) : isLoadingDailyReport ? (
            "טוען נתונים..."
          ) : dailyReport?.sleepData?.status === "Updated" ? (
            "עדכן פוסט שינה"
          ) : (
            "צור פוסט שינה"
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default CreateSleepPostModal;
