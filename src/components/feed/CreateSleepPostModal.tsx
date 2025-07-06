import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { VariableSizeList as VirtualList } from "react-window";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  useTheme,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Divider,
  Alert,
  AlertTitle,
  Skeleton,
  Fade,
  Slide,
  useMediaQuery,
} from "@mui/material";
import {
  Close as CloseIcon,
  Bedtime as SleepIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { CreateSleepPostData, SleepChild } from "../../types/posts";
import { Child, DailyReport } from "../../services/api";
import { SleepStatus } from "../../types/enums";
import SleepTimer from "../SleepTimer";
import { isChildSleeping } from "../../utils/sleepUtils";

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

  // Default title variations for sleep posts
  const defaultTitles = [
    "שינת צהריים - " + groupName,
    "דיווח שינה יומי - " + groupName,
    "מעקב שינת ילדים - " + groupName,
    "שינת ילדים - " + groupName,
    "דיווח שנת צהריים - " + groupName,
  ];

  const [title, setTitle] = useState("");
  const [titleIndex, setTitleIndex] = useState(0);
  const [sleepChildren, setSleepChildren] = useState<SleepChild[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [completedSleepChildren, setCompletedSleepChildren] = useState<
    Set<string>
  >(new Set());

  // Ref for virtual list to reset cache when heights change
  const virtualListRef = React.useRef<VirtualList>(null);

  // Reset virtual list cache when sleep children change
  useEffect(() => {
    if (virtualListRef.current) {
      virtualListRef.current.resetAfterIndex(0);
    }
  }, [sleepChildren, completedSleepChildren]);

  // Initialize sleep children from the children list and daily report data
  useEffect(() => {
    if (children.length > 0) {
      const initialSleepChildren: SleepChild[] = children
        .filter((child) => child.id) // Only include children with valid IDs
        .map((child) => {
          // Find existing sleep data for this child from daily report
          const existingSleepData = dailyReport?.sleepData?.children?.find(
            (sleepChild) => sleepChild.childId === child.id
          );

          // Compare with enum value since status is now properly mapped
          const isSleeping = existingSleepData?.status === SleepStatus.Sleeping;

          return {
            childId: child.id!, // Safe to use ! since we filtered for valid IDs
            firstName: child.firstName,
            lastName: child.lastName,
            sleepStartTime:
              existingSleepData?.startTimestamp ||
              (isSleeping ? new Date().toISOString() : ""),
            sleepEndTime: existingSleepData?.endTimestamp || "",
            sleepDuration: 0,
            notes: existingSleepData?.comment || "",
          };
        });
      setSleepChildren(initialSleepChildren);
    }
  }, [children, dailyReport]);

  // Set initial title when modal opens
  useEffect(() => {
    if (isOpen && !title) {
      setTitle(defaultTitles[titleIndex]);
    }
  }, [isOpen, title, defaultTitles, titleIndex]);

  // Cleanup effect when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Reset form state when modal closes
      setTitle("");
      setErrors({});
      setIsLoading(false);
      setCompletedSleepChildren(new Set());
      // Sleep children state will be reset when modal opens again
    }
  }, [isOpen]);

  const handleChildSleepToggle = (childId: string, isSleeping: boolean) => {
    setSleepChildren((prev) =>
      prev.map((child) =>
        child.childId === childId
          ? {
              ...child,
              sleepStartTime: isSleeping
                ? new Date().toISOString()
                : child.sleepStartTime,
              sleepEndTime: isSleeping ? "" : new Date().toISOString(),
              sleepDuration: isSleeping
                ? 0
                : child.sleepStartTime
                ? calculateSleepDuration(
                    child.sleepStartTime,
                    new Date().toISOString()
                  )
                : 0,
            }
          : child
      )
    );

    // Track completed sleep for animation
    if (!isSleeping) {
      setCompletedSleepChildren((prev) => new Set(prev).add(childId));
      // Remove from completed set after animation
      setTimeout(() => {
        setCompletedSleepChildren((prev) => {
          const newSet = new Set(prev);
          newSet.delete(childId);
          return newSet;
        });
      }, 2000); // Animation duration
    }
  };

  const handleSelectAllAsleep = () => {
    setSleepChildren((prev) =>
      prev.map((child) => ({
        ...child,
        sleepStartTime: new Date().toISOString(),
        sleepEndTime: "",
        sleepDuration: 0,
      }))
    );
  };

  const handleSelectNoneAsleep = () => {
    setSleepChildren((prev) =>
      prev.map((child) => ({
        ...child,
        sleepStartTime: "",
        sleepEndTime: "",
        sleepDuration: 0,
      }))
    );
  };

  const handleNextTitle = () => {
    const nextIndex = (titleIndex + 1) % defaultTitles.length;
    setTitleIndex(nextIndex);
    setTitle(defaultTitles[nextIndex]);
  };

  const handleChildUpdate = (
    childId: string,
    field: keyof SleepChild,
    value: any
  ) => {
    setSleepChildren((prev) =>
      prev.map((child) =>
        child.childId === childId ? { ...child, [field]: value } : child
      )
    );
  };

  const calculateSleepDuration = (
    startTime: string,
    endTime: string
  ): number => {
    if (!startTime || !endTime) return 0;
    const start = new Date(startTime);
    const end = new Date(endTime);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60)); // Convert to minutes
  };

  const handleSubmit = () => {
    try {
      setIsLoading(true);

      // Validation
      const newErrors: { [key: string]: string } = {};

      if (!title.trim()) {
        newErrors.title = "כותרת היא שדה חובה";
      }

      const sleepingChildren = sleepChildren.filter(
        (child) => child.sleepStartTime
      );
      if (sleepingChildren.length === 0) {
        newErrors.children = "יש לבחור לפחות ילד אחד שישן";
      }

      // Validate sleeping children have required fields
      // Note: Start and end times will be handled by the backend
      sleepingChildren.forEach((child) => {
        // Add any additional validation here if needed
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsLoading(false);
        return;
      }

      // Sleep durations will be calculated by the backend
      const updatedSleepChildren = sleepChildren.map((child) => ({
        ...child,
        sleepDuration: 0, // Will be calculated by backend
      }));

      const formData: CreateSleepPostData = {
        title: title.trim(),
        groupId,
        groupName,
        sleepDate: new Date().toISOString().split("T")[0], // Use today's date
        children: updatedSleepChildren.filter((child) => child.sleepStartTime),
      };

      // Call the parent's onSubmit function
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
  };

  const sleepingChildrenCount = sleepChildren.filter(
    (child) => child.sleepStartTime
  ).length;

  // Dynamic height calculation for virtualized items
  const getItemSize = useCallback(
    (index: number) => {
      const child = sleepChildren[index];
      if (!child) return isMobile ? 120 : 140;

      const isSleeping = isChildSleeping(
        child.sleepStartTime,
        child.sleepEndTime
      );
      const hasSleepData = child.sleepStartTime && child.sleepEndTime;
      const isCompletedSleep = hasSleepData && !isSleeping;
      const isExpanded = isSleeping || isCompletedSleep;

      // Base height for collapsed state
      let height = isMobile ? 80 : 100;

      // Add height for expanded state (sleep timer + notes)
      if (isExpanded) {
        height += isMobile ? 120 : 140; // Sleep timer + notes field
      }

      // Add margin and container padding
      height += 24; // mb: 2 (16px) + container padding (8px)

      return height;
    },
    [sleepChildren, isMobile]
  );

  // Virtualized child item component
  const ChildItem = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const child = sleepChildren[index];
      if (!child) return null;

      const isSleeping = isChildSleeping(
        child.sleepStartTime,
        child.sleepEndTime
      );
      const hasSleepData = child.sleepStartTime && child.sleepEndTime;
      const isCompletedSleep = hasSleepData && !isSleeping;
      const justCompleted = completedSleepChildren.has(child.childId);
      const isExpanded = isSleeping || isCompletedSleep;

      return (
        <div style={style}>
          <Fade in={true} timeout={300}>
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
                boxShadow: justCompleted
                  ? "0 4px 16px rgba(76, 175, 80, 0.25)"
                  : isCompletedSleep
                  ? "0 2px 8px rgba(76, 175, 80, 0.15)"
                  : "none",
                animation: justCompleted ? "pulse 2s ease-in-out" : "none",
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
                      transform: justCompleted
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
                    isSleeping
                      ? "ישן"
                      : isCompletedSleep
                      ? "סיים לישון"
                      : "לא ישן"
                  }
                />

                <ListItemSecondaryAction>
                  <Switch
                    checked={isSleeping}
                    onChange={(e) =>
                      handleChildSleepToggle(child.childId, e.target.checked)
                    }
                    color="primary"
                  />
                </ListItemSecondaryAction>
              </ListItem>

              {(isSleeping || isCompletedSleep) && (
                <Box sx={{ px: 1, pb: 1 }}>
                  {justCompleted && (
                    <Fade in={justCompleted} timeout={500}>
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
                            "0%": {
                              opacity: 0,
                              transform: "translateY(-10px)",
                            },
                            "100%": {
                              opacity: 1,
                              transform: "translateY(0)",
                            },
                          },
                        }}
                      >
                        🎉 {child.firstName} סיים לישון!
                      </Box>
                    </Fade>
                  )}
                  <SleepTimer
                    key={`${child.childId}-${isOpen}`}
                    startTime={child.sleepStartTime || ""}
                    endTime={child.sleepEndTime}
                    isSleeping={isSleeping}
                    size="medium"
                    animationIntensity={isSleeping ? "prominent" : "subtle"}
                  />
                  <Box sx={{ mt: 1 }}>
                    <TextField
                      size="small"
                      label="הערות"
                      value={child.notes}
                      onChange={(e) =>
                        handleChildUpdate(
                          child.childId,
                          "notes",
                          e.target.value
                        )
                      }
                      sx={{ width: "100%" }}
                      placeholder="הערות נוספות..."
                    />
                  </Box>
                </Box>
              )}
            </Box>
          </Fade>
        </div>
      );
    },
    [
      sleepChildren,
      completedSleepChildren,
      isOpen,
      handleChildSleepToggle,
      handleChildUpdate,
    ]
  );

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
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 99999,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: isMobile ? 0 : 2,
        }}
        onClick={onClose}
      >
        <Fade in={isOpen} timeout={100}>
          <Box
            sx={{
              transform: isOpen ? "translateY(0)" : "translateY(-100vh)",
              transition: "transform 1s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
              width: "100%",
              maxWidth: isMobile ? "100%" : 600,
              willChange: "transform",
            }}
          >
            <Box
              sx={{
                backgroundColor: "background.paper",
                borderRadius: isMobile ? 0 : 3,
                padding: isMobile ? 1 : 3,
                boxShadow: isMobile
                  ? "0 8px 32px rgba(0, 0, 0, 0.4)"
                  : "0 20px 60px rgba(0, 0, 0, 0.3)",
                display: "flex",
                flexDirection: "column",
                gap: isMobile ? 1 : 2,
                width: "100%",
                maxWidth: isMobile ? "100%" : 600,
                maxHeight: isMobile ? "100vh" : "90vh",
                overflow: "hidden",
                position: "relative",
                transform: "none",
                ...(isMobile && {
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  marginTop: 0,
                }),
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Loading overlay */}
              {isLoading && (
                <Fade in={isLoading} timeout={300}>
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      bgcolor: "rgba(0, 0, 0, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 10,
                      borderRadius: 3,
                    }}
                  >
                    <Box sx={{ textAlign: "center" }}>
                      <Skeleton
                        variant="circular"
                        width={60}
                        height={60}
                        sx={{ mb: 2 }}
                      />
                      <Skeleton variant="text" width={120} sx={{ mb: 1 }} />
                      <Skeleton variant="text" width={80} />
                    </Box>
                  </Box>
                </Fade>
              )}
              {/* Header */}
              <Fade
                in={isOpen}
                timeout={400}
                style={{ transitionDelay: "100ms" }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <SleepIcon sx={{ color: "#9C27B0", fontSize: 28 }} />
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: "text.primary",
                      }}
                    >
                      צור פוסט שינה
                    </Typography>
                    {isLoadingDailyReport && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          ml: 2,
                        }}
                      >
                        <Skeleton variant="circular" width={16} height={16} />
                        <Typography
                          variant="body2"
                          sx={{
                            color: "text.secondary",
                            fontSize: "0.875rem",
                          }}
                        >
                          טוען נתונים...
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <IconButton
                    onClick={onClose}
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
              </Fade>

              {/* Form Content */}
              <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {/* Basic Info - Fixed */}
                <Box
                  sx={{ mb: 2, pr: isMobile ? 0.5 : 1, pl: isMobile ? 0.5 : 0 }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: "text.primary",
                      mb: 1,
                    }}
                  >
                    פרטים בסיסיים
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                    <TextField
                      fullWidth
                      label="כותרת הפוסט"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
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

                {/* Children List Header - Fixed */}
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
                      sx={{
                        fontWeight: 600,
                        color: "text.primary",
                      }}
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
                      onClick={handleSelectNoneAsleep}
                      sx={{
                        borderColor: "text.secondary",
                        color: "text.secondary",
                        "&:hover": {
                          borderColor: "text.primary",
                          bgcolor: "action.hover",
                        },
                      }}
                    >
                      בטל בחירה
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

                {/* Children List - Virtualized */}
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
                    // Loading skeleton for children
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
                              secondary={
                                <Skeleton variant="text" width="40%" />
                              }
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
                      <VirtualList
                        height={isMobile ? 500 : 600} // Increased height to utilize more screen space
                        itemCount={sleepChildren.length}
                        itemSize={getItemSize}
                        width="100%"
                        itemData={sleepChildren}
                        overscanCount={5} // Render extra items for smooth scrolling
                        ref={virtualListRef}
                      >
                        {ChildItem}
                      </VirtualList>
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
          </Box>
        </Fade>
      </Box>
    </Fade>,
    document.body
  );
};

export default CreateSleepPostModal;
