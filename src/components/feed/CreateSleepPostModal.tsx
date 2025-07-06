import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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

  // Debug: Log when sleepChildren state changes

  // Initialize sleep children from the children list and daily report data
  useEffect(() => {
    if (children.length > 0) {
      const initialSleepChildren: SleepChild[] = children.map((child) => {
        // Find existing sleep data for this child from daily report
        const existingSleepData = dailyReport?.sleepData?.children?.find(
          (sleepChild) => sleepChild.childId === child.id
        );

        // Compare with enum value since status is now properly mapped
        const isSleeping = existingSleepData?.status === SleepStatus.Sleeping;

        return {
          childId: child.id || "",
          firstName: child.firstName,
          lastName: child.lastName,
          sleepStartTime: isSleeping ? "now" : "",
          sleepEndTime: "",
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

  const handleChildSleepToggle = (childId: string, isSleeping: boolean) => {
    setSleepChildren((prev) =>
      prev.map((child) =>
        child.childId === childId
          ? {
              ...child,
              sleepStartTime: isSleeping ? "now" : "",
              sleepEndTime: "",
              sleepDuration: 0,
            }
          : child
      )
    );
  };

  const handleSelectAllAsleep = () => {
    setSleepChildren((prev) =>
      prev.map((child) => ({
        ...child,
        sleepStartTime: "now",
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
                backgroundColor: "white",
                borderRadius: isMobile ? "20px" : 3,
                padding: isMobile ? 2 : 3,
                boxShadow: isMobile
                  ? "0 8px 32px rgba(0, 0, 0, 0.4)"
                  : "0 20px 60px rgba(0, 0, 0, 0.3)",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                width: "100%",
                maxWidth: isMobile ? "100%" : 600,
                maxHeight: isMobile ? "85vh" : "90vh",
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
                      bgcolor: "rgba(255, 255, 255, 0.9)",
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
                    mb: 2,
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
              <Box sx={{ flex: 1, overflow: "auto", pr: 1 }}>
                {/* Basic Info */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: "text.primary",
                      mb: 2,
                    }}
                  >
                    פרטים בסיסיים
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                    <TextField
                      fullWidth
                      label="כותרת הפוסט"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      error={!!errors.title}
                      helperText={errors.title}
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

                <Divider sx={{ my: 2 }} />

                {/* Children List */}
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
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
                  <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
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
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {errors.children}
                    </Alert>
                  )}

                  {errors.submit && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      <AlertTitle>שגיאה ביצירת הפוסט</AlertTitle>
                      {errors.submit}
                    </Alert>
                  )}

                  <List sx={{ bgcolor: "background.default", borderRadius: 2 }}>
                    {isLoadingDailyReport
                      ? // Loading skeleton for children
                        Array.from({ length: 3 }).map((_, index) => (
                          <Fade
                            in={true}
                            timeout={300 + index * 100}
                            key={index}
                          >
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
                                primary={
                                  <Skeleton variant="text" width="60%" />
                                }
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
                        ))
                      : sleepChildren.map((child) => {
                          const isSleeping = !!child.sleepStartTime;
                          return (
                            <Fade in={true} timeout={300} key={child.childId}>
                              <Box
                                sx={{
                                  border: "1px solid",
                                  borderColor: isSleeping
                                    ? "#9C27B0"
                                    : "divider",
                                  borderRadius: 1,
                                  mb: 1,
                                  bgcolor: isSleeping
                                    ? "#9C27B005"
                                    : "background.paper",
                                  transition: "all 0.2s ease",
                                }}
                              >
                                <ListItem>
                                  <ListItemAvatar>
                                    <Avatar
                                      sx={{
                                        bgcolor: isSleeping
                                          ? "#9C27B0"
                                          : "#ccc",
                                        border: isSleeping
                                          ? "2px solid #9C27B0"
                                          : "none",
                                      }}
                                    >
                                      {child.firstName.charAt(0)}
                                    </Avatar>
                                  </ListItemAvatar>

                                  <ListItemText
                                    primary={`${child.firstName} ${child.lastName}`}
                                    secondary={isSleeping ? "ישן" : "לא ישן"}
                                  />

                                  <ListItemSecondaryAction>
                                    <Switch
                                      checked={isSleeping}
                                      onChange={(e) =>
                                        handleChildSleepToggle(
                                          child.childId,
                                          e.target.checked
                                        )
                                      }
                                      color="primary"
                                    />
                                  </ListItemSecondaryAction>
                                </ListItem>

                                {isSleeping && (
                                  <Box sx={{ px: 2, pb: 2 }}>
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
                                )}
                              </Box>
                            </Fade>
                          );
                        })}
                  </List>
                </Box>
              </Box>

              {/* Footer */}
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  pt: 2,
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
