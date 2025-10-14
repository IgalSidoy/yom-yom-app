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
  Card,
  CardContent,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Menu,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  List,
  ListItemButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import CancelIcon from "@mui/icons-material/Cancel";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import ClearIcon from "@mui/icons-material/Clear";
import { Child, DailyReport } from "../../../services/api";
import { FoodEventType, FoodStatus } from "../../../types/enums";
import { useFeed } from "../../../contexts/FeedContext";

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

// Quick Actions Panel Component
interface QuickActionsPanelProps {
  bulkFoodDetails: string;
  onBulkFoodDetailsChange: (value: string) => void;
  onApplyFoodDetails: () => void;
  onApplyStatus: (status: FoodStatus) => void;
  onClearAll: () => void;
}

const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({
  bulkFoodDetails,
  onBulkFoodDetailsChange,
  onApplyFoodDetails,
  onApplyStatus,
  onClearAll,
}) => {
  const statusActions = [
    {
      label: "אכלו הכל",
      status: FoodStatus.FullyEaten,
      icon: <CheckCircleIcon />,
      color: "success" as const,
    },
    {
      label: "אכלו חלקית",
      status: FoodStatus.PartiallyEaten,
      icon: <WarningIcon />,
      color: "warning" as const,
    },
    {
      label: "סירבו",
      status: FoodStatus.Refused,
      icon: <CancelIcon />,
      color: "error" as const,
    },
  ];

  const panelStyles = {
    position: "absolute" as const,
    top: "100%",
    left: "50%",
    transform: "translateX(-50%)",
    mt: 1,
    zIndex: 1000,
    width: "calc(100% - 32px)",
    maxWidth: 320,
    bgcolor: "background.paper",
    borderRadius: 3,
    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
    border: "1px solid",
    borderColor: "divider",
    overflow: "hidden",
    animation: "slideIn 0.2s ease-out",
    "@keyframes slideIn": {
      "0%": {
        opacity: 0,
        transform: "translateX(-50%) translateY(-8px) scale(0.96)",
      },
      "100%": {
        opacity: 1,
        transform: "translateX(-50%) translateY(0) scale(1)",
      },
    },
  };

  const textFieldStyles = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      "&:hover": {
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "primary.main",
        },
      },
      "&.Mui-focused": {
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "primary.main",
        },
      },
    },
  };

  const buttonStyles = {
    borderRadius: 2,
    py: 1.2,
    fontSize: "0.875rem",
  };

  return (
    <Box sx={panelStyles}>
      <Box sx={{ p: 2 }}>
        {/* Food Details Section */}
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            multiline
            rows={2}
            value={bulkFoodDetails}
            onChange={(e) => onBulkFoodDetailsChange(e.target.value)}
            placeholder="פרטי מזון לכולם..."
            sx={textFieldStyles}
          />
          <Button
            fullWidth
            variant="contained"
            onClick={onApplyFoodDetails}
            disabled={!bulkFoodDetails.trim()}
            endIcon={<RestaurantIcon />}
            sx={{
              mt: 1,
              bgcolor: "primary.main",
              "&:hover": {
                bgcolor: "primary.dark",
              },
              borderRadius: 2,
              py: 1.2,
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            החל מזון
          </Button>
        </Box>

        {/* Status Actions */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {statusActions.map((action) => (
            <Button
              key={action.status}
              fullWidth
              variant="outlined"
              color={action.color}
              onClick={() => onApplyStatus(action.status)}
              endIcon={action.icon}
              sx={{
                ...buttonStyles,
                borderColor: `${action.color}.main`,
                color: `${action.color}.main`,
                "&:hover": {
                  bgcolor: `${action.color}.main`,
                  color: "white",
                },
              }}
            >
              {action.label}
            </Button>
          ))}

          <Button
            fullWidth
            variant="outlined"
            onClick={onClearAll}
            endIcon={<ClearIcon />}
            sx={{
              ...buttonStyles,
              borderColor: "grey.400",
              color: "grey.600",
              "&:hover": {
                bgcolor: "grey.100",
                borderColor: "grey.500",
              },
            }}
          >
            נקה הכל
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

// Simplified FoodChildItem component
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
    <Card
      sx={{
        mb: 2,
        border: "1px solid",
        borderColor: "divider",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        },
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
          {child.firstName} {child.lastName}
        </Typography>

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

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
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
            icon={
              child.status === FoodStatus.FullyEaten ? (
                <CheckCircleIcon />
              ) : undefined
            }
            sx={{ cursor: "pointer" }}
          />
          <Chip
            label="אכל חלקית"
            size="small"
            color={
              child.status === FoodStatus.PartiallyEaten ? "warning" : "default"
            }
            variant={
              child.status === FoodStatus.PartiallyEaten ? "filled" : "outlined"
            }
            onClick={() => handleStatusChange(FoodStatus.PartiallyEaten)}
            disabled={isDisabled}
            icon={
              child.status === FoodStatus.PartiallyEaten ? (
                <WarningIcon />
              ) : undefined
            }
            sx={{ cursor: "pointer" }}
          />
          <Chip
            label="סירב"
            size="small"
            color={child.status === FoodStatus.Refused ? "error" : "default"}
            variant={
              child.status === FoodStatus.Refused ? "filled" : "outlined"
            }
            onClick={() => handleStatusChange(FoodStatus.Refused)}
            disabled={isDisabled}
            icon={
              child.status === FoodStatus.Refused ? <CancelIcon /> : undefined
            }
            sx={{ cursor: "pointer" }}
          />
        </Box>
      </CardContent>
    </Card>
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

  // State with food event type selection
  const [selectedEventType, setSelectedEventType] = useState<FoodEventType>(
    FoodEventType.Lunch
  );
  const [foodChildren, setFoodChildren] = useState<FoodChild[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Mobile shortcuts state
  const [showShortcutsDrawer, setShowShortcutsDrawer] = useState(false);
  const [showFoodDetailsDialog, setShowFoodDetailsDialog] = useState(false);
  const [bulkFoodDetails, setBulkFoodDetails] = useState("");

  // Initialize children when modal opens
  useEffect(() => {
    if (isOpen) {
      let initialChildren: FoodChild[] = [];

      if (
        dailyReport?.foodData?.events &&
        dailyReport.foodData.events.length > 0
      ) {
        // Use existing data for the selected event type
        const currentEvent = dailyReport.foodData.events.find(
          (event) => event.type === selectedEventType
        );

        if (currentEvent) {
          // Create a map of child names from props for fallback
          const childNameMap = new Map<
            string,
            { firstName: string; lastName: string }
          >();
          children.forEach((child) => {
            if (child.id) {
              childNameMap.set(child.id, {
                firstName: child.firstName,
                lastName: child.lastName,
              });
            }
          });

          initialChildren = currentEvent.children.map((child) => {
            // Use child names from food event, fallback to props if empty
            let firstName = child.firstName;
            let lastName = child.lastName;

            if (!firstName || !lastName) {
              const nameFromProps = childNameMap.get(child.childId);
              if (nameFromProps) {
                firstName = nameFromProps.firstName;
                lastName = nameFromProps.lastName;
              }
            }

            return {
              childId: child.childId,
              firstName: firstName || "",
              lastName: lastName || "",
              foodDetails: child.foodDetails,
              status: child.status,
            };
          });
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

  // Cleanup when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFoodChildren([]);
      setErrors({});
      setIsLoading(false);
      setSelectedEventType(FoodEventType.Lunch);
      setShowShortcutsDrawer(false);
      setShowFoodDetailsDialog(false);
      setBulkFoodDetails("");
    }
  }, [isOpen]);

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
  const handleEventTypeChange = useCallback((eventType: FoodEventType) => {
    setSelectedEventType(eventType);
  }, []);

  // Bulk actions
  const applyStatusToAllChildren = useCallback((status: FoodStatus) => {
    setFoodChildren((prev) =>
      prev.map((child) => ({
        ...child,
        status: status,
      }))
    );
    setShowShortcutsDrawer(false);
  }, []);

  const applyFoodDetailsToAllChildren = useCallback(() => {
    if (bulkFoodDetails.trim()) {
      setFoodChildren((prev) =>
        prev.map((child) => ({
          ...child,
          foodDetails: bulkFoodDetails.trim(),
        }))
      );
      setBulkFoodDetails("");
      setShowShortcutsDrawer(false);
    }
  }, [bulkFoodDetails]);

  const clearAllChildrenStatus = useCallback(() => {
    setFoodChildren((prev) =>
      prev.map((child) => ({
        ...child,
        status: FoodStatus.NotEaten,
        foodDetails: "",
      }))
    );
    setShowShortcutsDrawer(false);
  }, []);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      setErrors({});

      // Validation
      const newErrors: { [key: string]: string } = {};

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

      if (!dailyReport?.id) {
        setErrors({
          submit: "לא נמצא דיווח יומי לעדכון",
        });
        setIsLoading(false);
        return;
      }

      const formData: CreateFoodPostData = {
        title: `דיווח מזון - ${groupName}`,
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

      onSubmit(formData);

      setTimeout(async () => {
        try {
          await refreshFeed();
        } catch (apiError) {
          console.error("Feed refresh failed:", apiError);
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
    foodChildren,
    selectedEventType,
    dailyReport?.id,
    groupId,
    groupName,
    onSubmit,
    isLoading,
    refreshFeed,
  ]);

  // Memoize callback functions
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
          "@media (max-width: 600px)": {
            height: "100dvh",
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <Typography variant="h6">טוען נתונים...</Typography>
        </Box>
        <Box sx={{ flex: 1, p: 2 }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Skeleton
                variant="rectangular"
                height={120}
                sx={{ borderRadius: 2 }}
              />
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
        "@media (max-width: 600px)": {
          height: "100dvh",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          position: "relative",
          "@media (max-width: 600px)": {
            p: 2,
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <IconButton onClick={onClose} sx={{ color: "text.secondary" }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              flex: 1,
              "@media (max-width: 600px)": {
                fontSize: "1.1rem",
              },
            }}
          >
            דיווח מזון - {groupName}
          </Typography>
          {/* Mobile Shortcuts Button */}
          {isMobile && (
            <IconButton
              onClick={() => setShowShortcutsDrawer(true)}
              sx={{
                color: "white",
                bgcolor: "primary.main",
                width: 40,
                height: 40,
                boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
                "&:hover": {
                  bgcolor: "primary.dark",
                  boxShadow: "0 6px 16px rgba(25, 118, 210, 0.4)",
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              <RestaurantIcon />
            </IconButton>
          )}
        </Box>

        {/* Food Event Type Selection */}
        <FormControl fullWidth size="small">
          <InputLabel>סוג ארוחה</InputLabel>
          <Select
            value={selectedEventType}
            onChange={(e) =>
              handleEventTypeChange(e.target.value as FoodEventType)
            }
            disabled={isLoading}
            label="סוג ארוחה"
          >
            <MenuItem value={FoodEventType.Breakfast}>ארוחת בוקר</MenuItem>
            <MenuItem value={FoodEventType.MorningSnack}>חטיף בוקר</MenuItem>
            <MenuItem value={FoodEventType.Lunch}>ארוחת צהריים</MenuItem>
            <MenuItem value={FoodEventType.AfternoonSnack}>
              חטיף אחר הצהריים
            </MenuItem>
            <MenuItem value={FoodEventType.Dinner}>ארוחת ערב</MenuItem>
          </Select>
        </FormControl>

        {/* Quick Actions Section - Mobile Only */}
        {isMobile && showShortcutsDrawer && (
          <QuickActionsPanel
            bulkFoodDetails={bulkFoodDetails}
            onBulkFoodDetailsChange={setBulkFoodDetails}
            onApplyFoodDetails={applyFoodDetailsToAllChildren}
            onApplyStatus={applyStatusToAllChildren}
            onClearAll={clearAllChildrenStatus}
          />
        )}
      </Box>

      {/* Stats Summary */}
      <Box
        sx={{
          p: 2,
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
        <Box sx={{ p: 2 }}>
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

      {/* Children List */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: 2,
          "@media (max-width: 600px)": {
            pb: 2,
          },
        }}
      >
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
            dailyReport?.foodData?.status === "Closed"
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
            : dailyReport?.foodData?.status === "Closed"
            ? "נסגר"
            : "שמור"}
        </Button>
      </Box>
    </Box>
  );
};

export default CreateFoodPostModal;
