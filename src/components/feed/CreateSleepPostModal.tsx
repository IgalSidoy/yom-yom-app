import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Modal,
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
import { createPortal } from "react-dom";
import AddIcon from "@mui/icons-material/Add";
import { isChildSleeping } from "../../utils/sleepUtils";
import SleepTimer from "../SleepTimer";
import { Child, DailyReport } from "../../services/api";
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

  // Internal state - only for UI rendering
  const [title, setTitle] = useState("");
  const [titleIndex, setTitleIndex] = useState(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [completedChildren, setCompletedChildren] = useState<Set<string>>(
    new Set()
  );

  // Internal refs for all data - no re-renders
  const titleRef = useRef("");
  const childrenRef = useRef<SleepChild[]>([]);
  const sleepStatesRef = useRef<{
    [childId: string]: { startTime: string; endTime: string };
  }>({});
  const notesRef = useRef<{ [childId: string]: string }>({});
  const bulkActionTriggerRef = useRef(0);

  // Initialize children from props only once when modal opens
  useEffect(() => {
    if (isOpen && children.length > 0) {
      const initialChildren: SleepChild[] = children
        .filter((child) => child.id)
        .map((child) => {
          // Find existing sleep data from daily report
          const existingData = dailyReport?.sleepData?.children?.find(
            (sleepChild) => sleepChild.childId === child.id
          );

          // Handle minimal dates properly
          let startTime = existingData?.startTimestamp || "";
          let endTime = existingData?.endTimestamp || "";

          if (startTime === "0001-01-01T00:00:00") startTime = "";
          if (endTime === "0001-01-01T00:00:00") endTime = "";

          const isSleeping = isChildSleeping(startTime, endTime);
          const hasFinishedSleeping = startTime && endTime && !isSleeping;

          const sleepChild: SleepChild = {
            childId: child.id!,
            firstName: child.firstName,
            lastName: child.lastName,
            sleepStartTime: isSleeping
              ? startTime || new Date().toISOString()
              : hasFinishedSleeping
              ? startTime
              : "",
            sleepEndTime: isSleeping ? "" : hasFinishedSleeping ? endTime : "",
            sleepDuration: 0,
            notes: existingData?.comment || "",
          };

          // Initialize refs
          sleepStatesRef.current[child.id!] = {
            startTime: sleepChild.sleepStartTime,
            endTime: sleepChild.sleepEndTime,
          };
          notesRef.current[child.id!] = sleepChild.notes;

          return sleepChild;
        });

      childrenRef.current = initialChildren;
    }
  }, [isOpen, children, dailyReport]);

  // Initialize title when modal opens
  useEffect(() => {
    if (isOpen && !titleRef.current) {
      const initialTitle = defaultTitles[titleIndex];
      setTitle(initialTitle);
      titleRef.current = initialTitle;
    }
  }, [isOpen, defaultTitles, titleIndex]);

  // Cleanup when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTitle("");
      setErrors({});
      setIsLoading(false);
      setCompletedChildren(new Set());
      titleRef.current = "";
      childrenRef.current = [];
      sleepStatesRef.current = {};
      notesRef.current = {};
      bulkActionTriggerRef.current = 0;
    }
  }, [isOpen]);

  // Title change handler
  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
    titleRef.current = newTitle;
  }, []);

  // Next title handler
  const handleNextTitle = useCallback(() => {
    const nextIndex = (titleIndex + 1) % defaultTitles.length;
    setTitleIndex(nextIndex);
    const newTitle = defaultTitles[nextIndex];
    setTitle(newTitle);
    titleRef.current = newTitle;
  }, [titleIndex, defaultTitles]);

  // Select all asleep handler
  const handleSelectAllAsleep = useCallback(() => {
    const currentTime = new Date().toISOString();

    childrenRef.current.forEach((child) => {
      sleepStatesRef.current[child.childId] = {
        startTime: currentTime,
        endTime: "",
      };
    });

    bulkActionTriggerRef.current += 1;
  }, []);

  // Finish all sleep handler
  const handleFinishAllSleep = useCallback(() => {
    const currentTime = new Date().toISOString();
    const completedIds: string[] = [];

    childrenRef.current.forEach((child) => {
      const currentState = sleepStatesRef.current[child.childId];
      let startTime = currentState?.startTime || child.sleepStartTime || "";
      let endTime = currentState?.endTime || child.sleepEndTime || "";

      if (startTime === "0001-01-01T00:00:00") startTime = "";
      if (endTime === "0001-01-01T00:00:00") endTime = "";

      const isCurrentlySleeping = isChildSleeping(startTime, endTime);

      if (isCurrentlySleeping) {
        sleepStatesRef.current[child.childId] = {
          startTime: startTime,
          endTime: currentTime,
        };
        completedIds.push(child.childId);
      }
    });

    setCompletedChildren(new Set(completedIds));
    setTimeout(() => setCompletedChildren(new Set()), 2000);

    bulkActionTriggerRef.current += 1;
  }, []);

  // Submit handler
  const handleSubmit = useCallback(() => {
    try {
      setIsLoading(true);
      setErrors({});

      // Validation
      const newErrors: { [key: string]: string } = {};

      if (!titleRef.current.trim()) {
        newErrors.title = "כותרת היא שדה חובה";
      }

      // Count sleeping children
      const sleepingCount = childrenRef.current.filter((child) => {
        const state = sleepStatesRef.current[child.childId];
        let startTime = state?.startTime || child.sleepStartTime || "";
        let endTime = state?.endTime || child.sleepEndTime || "";

        if (startTime === "0001-01-01T00:00:00") startTime = "";
        if (endTime === "0001-01-01T00:00:00") endTime = "";

        return isChildSleeping(startTime, endTime);
      }).length;

      if (sleepingCount === 0) {
        newErrors.children = "יש לבחור לפחות ילד אחד שישן";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsLoading(false);
        return;
      }

      // Prepare form data
      const formData: CreateSleepPostData = {
        title: titleRef.current.trim(),
        groupId,
        groupName,
        sleepDate: new Date().toISOString().split("T")[0],
        children: childrenRef.current.map((child) => {
          const state = sleepStatesRef.current[child.childId];
          return {
            ...child,
            sleepStartTime: state?.startTime || child.sleepStartTime || "",
            sleepEndTime: state?.endTime || child.sleepEndTime || "",
            notes: notesRef.current[child.childId] || child.notes || "",
            sleepDuration: 0,
          };
        }),
      };

      onSubmit(formData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error creating sleep post:", error);
      setErrors({
        submit:
          error instanceof Error ? error.message : "אירעה שגיאה בלתי צפויה",
      });
      setIsLoading(false);
    }
  }, [groupId, groupName, onSubmit]);

  // Isolated child component
  const ChildItem = React.memo<{
    child: SleepChild;
    isCompleted: boolean;
    bulkActionTrigger: number;
  }>(({ child, isCompleted, bulkActionTrigger }) => {
    const [localStartTime, setLocalStartTime] = useState(
      child.sleepStartTime || ""
    );
    const [localEndTime, setLocalEndTime] = useState(child.sleepEndTime || "");

    // Listen for bulk action changes
    useEffect(() => {
      const state = sleepStatesRef.current[child.childId];
      if (state) {
        setLocalStartTime(state.startTime);
        setLocalEndTime(state.endTime);
      }
    }, [bulkActionTrigger, child.childId]);

    // Update refs when local state changes
    useEffect(() => {
      sleepStatesRef.current[child.childId] = {
        startTime: localStartTime,
        endTime: localEndTime,
      };
    }, [localStartTime, localEndTime, child.childId]);

    const isSleeping = isChildSleeping(localStartTime, localEndTime);
    const hasSleepData = localStartTime && localEndTime;
    const isCompletedSleep = hasSleepData && !isSleeping;
    const isExpanded = isSleeping || isCompletedSleep;

    const handleToggle = useCallback((newIsSleeping: boolean) => {
      if (newIsSleeping) {
        setLocalStartTime(new Date().toISOString());
        setLocalEndTime("");
      } else {
        setLocalEndTime(new Date().toISOString());
      }
    }, []);

    return (
      <Box
        sx={{
          border: "1px solid",
          borderColor: isSleeping
            ? "#9C27B0"
            : isCompletedSleep
            ? "#4CAF50"
            : "divider",
          borderRadius: 1,
          mb: 2,
          p: 0.25,
          position: "relative",
          bgcolor: isSleeping
            ? "#9C27B005"
            : isCompletedSleep
            ? "#4CAF5005"
            : "background.paper",
          transition: "all 0.3s ease",
          boxShadow: isCompleted
            ? "0 4px 16px rgba(76, 175, 80, 0.25)"
            : "none",
          animation: isCompleted ? "pulse 2s ease-in-out" : "none",
          "@keyframes pulse": {
            "0%": { opacity: 1 },
            "50%": { opacity: 0.8 },
            "100%": { opacity: 1 },
          },
        }}
      >
        <ListItem>
          <ListItemAvatar>
            <Avatar
              sx={{
                bgcolor: isSleeping
                  ? "#9C27B0"
                  : isCompletedSleep
                  ? "#4CAF50"
                  : "#ccc",
                border: isSleeping
                  ? "2px solid #9C27B0"
                  : isCompletedSleep
                  ? "2px solid #4CAF50"
                  : "none",
                transition: "all 0.3s ease",
                transform: isCompleted
                  ? "rotate(720deg) scale(1.2)"
                  : isCompletedSleep
                  ? "rotate(360deg)"
                  : "rotate(0deg)",
              }}
            >
              {child.firstName.charAt(0)}
            </Avatar>
          </ListItemAvatar>

          <ListItemText
            primary={`${child.firstName} ${child.lastName}`}
            secondary={
              isSleeping ? "ישן" : isCompletedSleep ? "סיים לישון" : "לא ישן"
            }
          />

          <ListItemSecondaryAction>
            <Switch
              checked={isSleeping}
              onChange={(e) => handleToggle(e.target.checked)}
              color="primary"
            />
          </ListItemSecondaryAction>
        </ListItem>

        {isExpanded && (
          <Box sx={{ px: 1, pb: 1 }}>
            {isCompleted && (
              <Fade in={isCompleted} timeout={500}>
                <Box
                  sx={{
                    position: "absolute",
                    top: -8,
                    left: 8,
                    right: 8,
                    p: 1,
                    bgcolor: "#4CAF50",
                    color: "white",
                    borderRadius: 1,
                    textAlign: "center",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    zIndex: 10,
                    animation: "slideIn 0.5s ease-out",
                    "@keyframes slideIn": {
                      "0%": { opacity: 0, transform: "translateY(-10px)" },
                      "100%": { opacity: 1, transform: "translateY(0)" },
                    },
                  }}
                >
                  🎉 {child.firstName} סיים לישון!
                </Box>
              </Fade>
            )}

            <SleepTimer
              key={`${child.childId}-${isOpen}`}
              startTime={localStartTime}
              endTime={localEndTime}
              isSleeping={isSleeping}
              size="medium"
              animationIntensity={isSleeping ? "prominent" : "subtle"}
            />

            <Box sx={{ mt: 1 }}>
              <NotesField childId={child.childId} initialNotes={child.notes} />
            </Box>
          </Box>
        )}
      </Box>
    );
  });

  // Isolated notes field component
  const NotesField = React.memo<{ childId: string; initialNotes: string }>(
    ({ childId, initialNotes }) => {
      const [notes, setNotes] = useState(initialNotes || "");

      useEffect(() => {
        notesRef.current[childId] = notes;
      }, [notes, childId]);

      return (
        <TextField
          size="small"
          label="הערות"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          sx={{ width: "100%" }}
          placeholder="הערות נוספות..."
        />
      );
    }
  );

  // Calculate sleeping children count
  const sleepingChildrenCount = childrenRef.current.filter((child) => {
    const state = sleepStatesRef.current[child.childId];
    let startTime = state?.startTime || child.sleepStartTime || "";
    let endTime = state?.endTime || child.sleepEndTime || "";

    if (startTime === "0001-01-01T00:00:00") startTime = "";
    if (endTime === "0001-01-01T00:00:00") endTime = "";

    return isChildSleeping(startTime, endTime);
  }).length;

  if (!isOpen) return null;

  return createPortal(
    <Fade in={isOpen} timeout={300}>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: isMobile
            ? "background.default"
            : "rgba(0, 0, 0, 0.5)",
          zIndex: 99999,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: isMobile ? 0 : 2,
        }}
      >
        <Fade in={isOpen} timeout={300}>
          <Box
            sx={{
              width: "100%",
              maxWidth: isMobile ? "100%" : 600,
              maxHeight: isMobile ? "100%" : "90vh",
              bgcolor: "background.paper",
              borderRadius: isMobile ? 0 : 2,
              boxShadow: isMobile ? "none" : 24,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <Box
              sx={{
                p: isMobile ? 1.5 : 2,
                borderBottom: "1px solid",
                borderColor: "divider",
                bgcolor: "#9C27B0",
                color: "white",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {dailyReport?.sleepData?.status === "Updated"
                  ? "עדכן פוסט שינה"
                  : "צור פוסט שינה חדש"}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
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
              <Box
                sx={{ pr: isMobile ? 0.5 : 1, pl: isMobile ? 0.5 : 0, mb: 1 }}
              >
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
                {isLoadingDailyReport ? (
                  <Box
                    sx={{
                      bgcolor: "background.default",
                      borderRadius: 2,
                      p: 2,
                    }}
                  >
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
                            <Skeleton
                              variant="circular"
                              width={40}
                              height={40}
                            />
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
                ) : (
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
                      {childrenRef.current.map((child) => (
                        <ChildItem
                          key={child.childId}
                          child={child}
                          isCompleted={completedChildren.has(child.childId)}
                          bulkActionTrigger={bulkActionTriggerRef.current}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
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
                  "עדכן פוסט"
                ) : (
                  "צור פוסט שינה"
                )}
              </Button>
            </Box>
          </Box>
        </Fade>
      </Box>
    </Fade>,
    document.body
  );
};

export default CreateSleepPostModal;
