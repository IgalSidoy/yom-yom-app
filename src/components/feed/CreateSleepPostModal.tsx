import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
} from "@mui/material";
import {
  Close as CloseIcon,
  Bedtime as SleepIcon,
  AccessTime as TimeIcon,
  Star as StarIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import {
  CreateSleepPostData,
  SleepChild,
  SLEEP_QUALITY_OPTIONS,
} from "../../types/posts";
import { Child } from "../../services/api";

interface CreateSleepPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSleepPostData) => void;
  children: Child[];
  groupName: string;
  groupId: string;
}

const CreateSleepPostModal: React.FC<CreateSleepPostModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  children,
  groupName,
  groupId,
}) => {
  const theme = useTheme();
  const [title, setTitle] = useState("");
  const [sleepDate, setSleepDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [sleepChildren, setSleepChildren] = useState<SleepChild[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Initialize sleep children from the children list
  useEffect(() => {
    if (children.length > 0) {
      const initialSleepChildren: SleepChild[] = children.map((child) => ({
        childId: child.id || "",
        firstName: child.firstName,
        lastName: child.lastName,
        sleepStartTime: "",
        sleepEndTime: "",
        sleepDuration: 0,
        sleepQuality: undefined,
        notes: "",
      }));
      setSleepChildren(initialSleepChildren);
    }
  }, [children]);

  const handleChildSleepToggle = (childId: string, isSleeping: boolean) => {
    setSleepChildren((prev) =>
      prev.map((child) =>
        child.childId === childId
          ? {
              ...child,
              sleepStartTime: isSleeping
                ? new Date().toISOString().slice(0, 16)
                : "",
              sleepEndTime: isSleeping
                ? ""
                : new Date().toISOString().slice(0, 16),
              sleepDuration: isSleeping ? 0 : child.sleepDuration,
            }
          : child
      )
    );
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
      // Validation
      const newErrors: { [key: string]: string } = {};

      if (!title.trim()) {
        newErrors.title = "כותרת היא שדה חובה";
      }

      if (!sleepDate) {
        newErrors.sleepDate = "תאריך שינה הוא שדה חובה";
      }

      const sleepingChildren = sleepChildren.filter(
        (child) => child.sleepStartTime
      );
      if (sleepingChildren.length === 0) {
        newErrors.children = "יש לבחור לפחות ילד אחד שישן";
      }

      // Validate sleeping children have required fields
      sleepingChildren.forEach((child) => {
        if (!child.sleepStartTime) {
          newErrors[`child_${child.childId}_start`] =
            "זמן התחלת שינה הוא שדה חובה";
        }
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      // Calculate sleep durations
      const updatedSleepChildren = sleepChildren.map((child) => ({
        ...child,
        sleepDuration:
          child.sleepStartTime && child.sleepEndTime
            ? calculateSleepDuration(child.sleepStartTime, child.sleepEndTime)
            : 0,
      }));

      const formData: CreateSleepPostData = {
        title: title.trim(),
        groupId,
        groupName,
        sleepDate,
        children: updatedSleepChildren.filter((child) => child.sleepStartTime),
      };

      // Simulate potential API error for demonstration
      if (Math.random() < 0.1) {
        // 10% chance of error for testing
        throw new Error("Network error: Failed to create sleep post");
      }

      onSubmit(formData);
    } catch (error) {
      console.error("Error creating sleep post:", error);
      setErrors({
        submit:
          error instanceof Error ? error.message : "אירעה שגיאה בלתי צפויה",
      });
    }
  };

  const sleepingChildrenCount = sleepChildren.filter(
    (child) => child.sleepStartTime
  ).length;

  if (!isOpen) return null;

  return createPortal(
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
        p: 2,
      }}
      onClick={onClose}
    >
      <Box
        sx={{
          backgroundColor: "white",
          borderRadius: 3,
          padding: 3,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          width: "100%",
          maxWidth: 600,
          maxHeight: "90vh",
          overflow: "hidden",
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

            <TextField
              fullWidth
              label="כותרת הפוסט"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={!!errors.title}
              helperText={errors.title}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              type="date"
              label="תאריך שינה"
              value={sleepDate}
              onChange={(e) => setSleepDate(e.target.value)}
              error={!!errors.sleepDate}
              helperText={errors.sleepDate}
              InputLabelProps={{ shrink: true }}
            />
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
              <Chip
                label={`${sleepingChildrenCount} ילדים ישנים`}
                color="primary"
                size="small"
              />
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
              {sleepChildren.map((child) => {
                const isSleeping = !!child.sleepStartTime;
                return (
                  <ListItem
                    key={child.childId}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: "background.paper",
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: "#9C27B0" }}>
                        {child.firstName.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>

                    <ListItemText
                      primary={`${child.firstName} ${child.lastName}`}
                      secondary={
                        isSleeping ? (
                          <Box sx={{ mt: 1 }}>
                            <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                              <TextField
                                size="small"
                                type="datetime-local"
                                label="זמן התחלה"
                                value={child.sleepStartTime}
                                onChange={(e) =>
                                  handleChildUpdate(
                                    child.childId,
                                    "sleepStartTime",
                                    e.target.value
                                  )
                                }
                                error={!!errors[`child_${child.childId}_start`]}
                                helperText={
                                  errors[`child_${child.childId}_start`]
                                }
                                InputLabelProps={{ shrink: true }}
                                sx={{ flex: 1 }}
                              />
                              <TextField
                                size="small"
                                type="datetime-local"
                                label="זמן סיום"
                                value={child.sleepEndTime}
                                onChange={(e) =>
                                  handleChildUpdate(
                                    child.childId,
                                    "sleepEndTime",
                                    e.target.value
                                  )
                                }
                                InputLabelProps={{ shrink: true }}
                                sx={{ flex: 1 }}
                              />
                            </Box>

                            <FormControl
                              size="small"
                              sx={{ minWidth: 120, mr: 1 }}
                            >
                              <InputLabel>איכות שינה</InputLabel>
                              <Select
                                value={child.sleepQuality || ""}
                                onChange={(e) =>
                                  handleChildUpdate(
                                    child.childId,
                                    "sleepQuality",
                                    e.target.value
                                  )
                                }
                                label="איכות שינה"
                              >
                                {SLEEP_QUALITY_OPTIONS.map((option) => (
                                  <MenuItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          width: 12,
                                          height: 12,
                                          borderRadius: "50%",
                                          bgcolor: option.color,
                                        }}
                                      />
                                      {option.label}
                                    </Box>
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>

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
                              sx={{ flex: 1 }}
                            />
                          </Box>
                        ) : (
                          "לא ישן"
                        )
                      }
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
            startIcon={<AddIcon />}
            sx={{
              flex: 1,
              bgcolor: "#9C27B0",
              "&:hover": {
                bgcolor: "#7B1FA2",
              },
            }}
          >
            צור פוסט שינה
          </Button>
        </Box>
      </Box>
    </Box>,
    document.body
  );
};

export default CreateSleepPostModal;
