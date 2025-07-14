import React, {
  useEffect,
  useState,
  useMemo,
  memo,
  useRef,
  useCallback,
} from "react";
import { FixedSizeList as VirtualList } from "react-window";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../config/routes";
import {
  Box,
  Typography,
  Skeleton,
  Fade,
  ListItem,
  ListItemText,
  Chip,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  Button,
  ButtonGroup,
  Container,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import StatusButtonWithPopup from "./StatusButtonWithPopup";
import DateTimeWidget from "./DateTimeWidget";
import { useApp } from "../contexts/AppContext";
import { useAttendance } from "../contexts/AttendanceContext";
import {
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  Done as DoneIcon,
} from "@mui/icons-material";
import {
  ChildWithParents,
  attendanceApi,
  GroupAttendance,
  AttendanceChild,
} from "../services/api";
import {
  ComponentAttendanceStatus,
  ApiAttendanceStatus,
  mapApiStatusToComponentStatus,
  mapComponentStatusToApiStatus,
  ATTENDANCE_STATUS_OPTIONS,
  STATUS_COLORS,
  getStatusOption,
  type ComponentStatus,
} from "../types/attendance";

// Attendance status options
export type AttendanceStatus = ComponentStatus;

export interface AttendanceRecord {
  childId: string;
  status: AttendanceStatus;
  timestamp: string;
}

// Use theme/site colors
const THEME_ORANGE = "#FF9F43";
const MILD_GRAY = "#F5F5F5";
const MILD_BEIGE = "#FFF7ED";
const MILD_YELLOW = "#FFE6A7";
const MILD_BLUE = "#E3F0FF";
const MILD_PINK = "#FFE3E3";

const attendanceStatusOptions = [
  { value: "arrived", label: "נוכח/ת", color: THEME_ORANGE, textColor: "#fff" },
  { value: "missing", label: "נעדר", color: MILD_PINK, textColor: "#B85C5C" },
  { value: "sick", label: "חולה", color: MILD_YELLOW, textColor: "#B88B2A" },
  { value: "late", label: "מאחר", color: MILD_BLUE, textColor: "#3A6EA5" },
  {
    value: "vacation",
    label: "חופשה",
    color: MILD_BEIGE,
    textColor: "#B88B2A",
  },
  {
    value: "unreported",
    label: "לא דווח",
    color: MILD_GRAY,
    textColor: "#888",
  },
];

// Memoized Child List Item Component for Daily Attendance
const AttendanceChildListItem: React.FC<{
  child: ChildWithParents;
  attendanceStatus: AttendanceStatus;
  updateTime?: string;
  onStatusChange: (childId: string, status: AttendanceStatus) => Promise<void>;
  index?: number; // Add index for staggered animation
  isAttendanceClosed?: boolean;
}> = memo(
  ({
    child,
    attendanceStatus,
    updateTime,
    onStatusChange,
    index = 0,
    isAttendanceClosed = false,
  }) => {
    const rareStatuses = ATTENDANCE_STATUS_OPTIONS.filter(
      (opt) => opt.value !== ComponentAttendanceStatus.ARRIVED
    );
    const arrivedOption = getStatusOption(ComponentAttendanceStatus.ARRIVED);
    const currentOption = getStatusOption(attendanceStatus);

    const formatUpdateTime = (timestamp?: string) => {
      if (!timestamp) return "לא עודכן";
      return new Date(timestamp).toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const getStatusIcon = (status: AttendanceStatus) => {
      switch (status) {
        case ComponentAttendanceStatus.ARRIVED:
          return <CheckCircleIcon sx={{ color: "#FF9F43", fontSize: 20 }} />;
        case ComponentAttendanceStatus.LATE:
          return <ScheduleIcon sx={{ color: "#3A6EA5", fontSize: 20 }} />;

          return <CheckCircleIcon sx={{ color: "#2E7D32", fontSize: 20 }} />;
        case ComponentAttendanceStatus.MISSING:
        case ComponentAttendanceStatus.SICK:
        case ComponentAttendanceStatus.VACATION:
          return <NotificationsIcon sx={{ color: "#B85C5C", fontSize: 20 }} />;
        default:
          return null;
      }
    };

    return (
      <Box
        sx={{
          py: { xs: 1.5, sm: 2 },
          px: { xs: 0.5, sm: 3 },
          borderBottom: "1px solid",
          borderColor: "rgba(0, 0, 0, 0.04)",
          bgcolor: "background.default !important",
        }}
      >
        {/* Mobile Layout: Same line */}
        <Box
          sx={{
            display: { xs: "flex", sm: "flex" },
            flexDirection: { xs: "row", sm: "row-reverse" },
            alignItems: { xs: "center", sm: "center" },
            justifyContent: { xs: "space-between", sm: "space-between" },
            gap: { xs: 1.5, sm: 1.5 },
          }}
        >
          {/* Status Button with Popup */}
          <Box
            sx={{
              flexShrink: 0,
              order: { xs: 1, sm: 1 }, // Button first on mobile and desktop
              justifyContent: { xs: "flex-start", sm: "flex-start" },
              width: { xs: "auto", sm: "auto" },
            }}
          >
            <StatusButtonWithPopup
              currentStatus={mapComponentStatusToApiStatus(attendanceStatus)}
              onStatusUpdate={(status) =>
                onStatusChange(
                  child.id!,
                  mapApiStatusToComponentStatus(status)
                ).catch(console.error)
              }
              updateLoading={false}
              disabled={isAttendanceClosed}
              availableStatuses={[
                ApiAttendanceStatus.ARRIVED,
                ApiAttendanceStatus.LATE,

                ApiAttendanceStatus.SICK,
                ApiAttendanceStatus.VACATION,
                ApiAttendanceStatus.MISSING,
                ApiAttendanceStatus.UNREPORTED,
              ]}
              getStatusColor={(status) =>
                STATUS_COLORS[mapApiStatusToComponentStatus(status)].bg
              }
              getStatusTextColor={(status) =>
                STATUS_COLORS[mapApiStatusToComponentStatus(status)].text
              }
              getStatusText={(status) => {
                const componentStatus = mapApiStatusToComponentStatus(status);
                return getStatusOption(componentStatus)?.label || "לא ידוע";
              }}
            />
          </Box>

          {/* Child Name and Time - Mobile: same line, Desktop: separate */}
          <Box
            sx={{
              display: { xs: "flex", sm: "block" },
              flexDirection: { xs: "row", sm: "column" },
              alignItems: { xs: "center", sm: "stretch" },
              justifyContent: { xs: "flex-end", sm: "flex-start" },
              order: { xs: 2, sm: 2 },
              width: { xs: "auto", sm: "auto" },
              gap: { xs: 1, sm: 0 },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                textAlign: { xs: "right", sm: "right" },
                fontSize: { xs: "0.85rem", sm: "1rem" },
                whiteSpace: "nowrap",
              }}
            >
              עודכן {formatUpdateTime(updateTime)}
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                minWidth: 0,
                flexShrink: 1,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                  textAlign: { xs: "right", sm: "right" },
                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                noWrap
              >
                {child.firstName} {child.lastName}
              </Typography>
              {/* Status icon for mobile view */}
              <Box sx={{ display: { xs: "flex", sm: "none" } }}>
                {getStatusIcon(attendanceStatus)}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Second row: update time - Desktop only */}
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            textAlign: { xs: "center", sm: "right" },
            mt: 0.5,
            fontSize: { xs: "0.95rem", sm: "1rem" },
            display: { xs: "none", sm: "block" },
          }}
        >
          עודכן {formatUpdateTime(updateTime)}
        </Typography>
      </Box>
    );
  }
);

AttendanceChildListItem.displayName = "AttendanceChildListItem";

// Skeleton component for attendance list items
const AttendanceSkeleton: React.FC = () => (
  <Box
    sx={{
      py: { xs: 1.5, sm: 2 },
      px: { xs: 0.5, sm: 3 },
      borderBottom: { xs: "none", sm: "1px solid" },
      borderColor: "divider",
    }}
  >
    <Box
      sx={{
        display: { xs: "flex", sm: "flex" },
        flexDirection: { xs: "column", sm: "row-reverse" },
        alignItems: { xs: "stretch", sm: "center" },
        justifyContent: { xs: "flex-start", sm: "space-between" },
        gap: { xs: 1.5, sm: 1.5 },
      }}
    >
      {/* Child Name and Time skeleton */}
      <Box
        sx={{
          display: { xs: "flex", sm: "block" },
          flexDirection: { xs: "row", sm: "column" },
          alignItems: { xs: "center", sm: "stretch" },
          justifyContent: { xs: "flex-start", sm: "flex-start" },
          order: { xs: 1, sm: 2 },
          width: { xs: "100%", sm: "auto" },
          gap: { xs: 1, sm: 0 },
        }}
      >
        <Skeleton
          variant="text"
          width="60%"
          height={32}
          sx={{
            borderRadius: 1,
            bgcolor: "rgba(0, 0, 0, 0.08)",
            animation: "pulse 2s ease-in-out infinite",
            "@keyframes pulse": {
              "0%": {
                opacity: 1,
              },
              "50%": {
                opacity: 0.4,
              },
              "100%": {
                opacity: 1,
              },
            },
          }}
        />
        <Skeleton
          variant="text"
          width="40%"
          height={20}
          sx={{
            borderRadius: 1,
            bgcolor: "rgba(0, 0, 0, 0.06)",
            animation: "pulse 2s ease-in-out infinite",
            "@keyframes pulse": {
              "0%": {
                opacity: 1,
              },
              "50%": {
                opacity: 0.4,
              },
              "100%": {
                opacity: 1,
              },
            },
          }}
        />
      </Box>

      {/* Buttons skeleton */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
          order: { xs: 2, sm: 1 },
          justifyContent: { xs: "flex-end", sm: "flex-start" },
          width: { xs: "100%", sm: "auto" },
        }}
      >
        <Skeleton
          variant="rounded"
          width={80}
          height={36}
          sx={{
            borderRadius: 3,
            bgcolor: "rgba(0, 0, 0, 0.08)",
            animation: "pulse 2s ease-in-out infinite",
            "@keyframes pulse": {
              "0%": {
                opacity: 1,
              },
              "50%": {
                opacity: 0.4,
              },
              "100%": {
                opacity: 1,
              },
            },
          }}
        />
        <Skeleton
          variant="rounded"
          width={70}
          height={36}
          sx={{
            borderRadius: 3,
            bgcolor: "rgba(0, 0, 0, 0.08)",
            animation: "pulse 2s ease-in-out infinite",
            "@keyframes pulse": {
              "0%": {
                opacity: 1,
              },
              "50%": {
                opacity: 0.4,
              },
              "100%": {
                opacity: 1,
              },
            },
          }}
        />
        <Skeleton
          variant="rounded"
          width={70}
          height={36}
          sx={{
            borderRadius: 3,
            bgcolor: "rgba(0, 0, 0, 0.08)",
            animation: "pulse 2s ease-in-out infinite",
            "@keyframes pulse": {
              "0%": {
                opacity: 1,
              },
              "50%": {
                opacity: 0.4,
              },
              "100%": {
                opacity: 1,
              },
            },
          }}
        />
      </Box>
    </Box>
  </Box>
);

const DailyAttendance: React.FC = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const {
    attendanceData,
    isLoading,
    error,
    isAttendanceClosed,
    updateAttendance,
    fetchAttendance,
    markAttendanceAsClosed,
  } = useAttendance();
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<
    AttendanceStatus | ""
  >("");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [listHeight, setListHeight] = useState(400);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if attendance is closed (either from context or attendance data)
  const isAttendanceClosedComputed = useMemo(() => {
    const result = isAttendanceClosed || attendanceData?.isClosed || false;
    return result;
  }, [isAttendanceClosed, attendanceData?.isClosed]);

  const showNotification = useCallback(
    (message: string, severity: "success" | "error" | "info" | "warning") => {
      setNotification({
        open: true,
        message,
        severity,
      });
    },
    []
  );

  // Convert attendance data to component format
  const {
    children,
    attendanceRecords,
    attendanceTimestamps,
    groupName,
    accountName,
  } = useMemo(() => {
    if (!attendanceData?.children) {
      return {
        children: [],
        attendanceRecords: {},
        attendanceTimestamps: {},
        groupName: "",
        accountName: "",
      };
    }

    const records: Record<string, AttendanceStatus> = {};
    const timestamps: Record<string, string> = {};
    const childrenData: ChildWithParents[] = [];

    attendanceData.children.forEach((attendanceChild) => {
      const status = mapApiStatusToComponentStatus(attendanceChild.status);
      records[attendanceChild.childId] = status;
      timestamps[attendanceChild.childId] = attendanceChild.timestamp;

      childrenData.push({
        id: attendanceChild.childId,
        firstName: attendanceChild.firstName,
        lastName: attendanceChild.lastName,
        dateOfBirth: attendanceChild.dateOfBirth || "",
        accountId: attendanceData.accountId,
        groupId: attendanceData.groupId,
        groupName: attendanceData.groupName,
        parents: [],
        created: "",
        updated: "",
      });
    });

    return {
      children: childrenData,
      attendanceRecords: records,
      attendanceTimestamps: timestamps,
      groupName: attendanceData.groupName,
      accountName: attendanceData.accountName,
    };
  }, [attendanceData]);

  // Set initial loading based on context loading state
  useEffect(() => {
    setIsInitialLoading(isLoading);
  }, [isLoading]);

  // Show warning notification when attendance is closed
  useEffect(() => {
    if (isAttendanceClosedComputed) {
    }
  }, [isAttendanceClosedComputed, showNotification]);

  // Calculate dynamic heights based on viewport
  useEffect(() => {
    const calculateHeights = () => {
      const viewportHeight = window.innerHeight;
      const navbarHeight = 0; // No navbar anymore
      const bottomNavHeight = 72; // Fixed bottom nav height
      const topMargin = 0; // No top margin
      const bottomMargin = 0; // No bottom margin needed

      // Calculate available height for container
      const availableHeight =
        viewportHeight -
        navbarHeight -
        bottomNavHeight -
        topMargin -
        bottomMargin;

      // Set container height dynamically
      if (containerRef.current) {
        containerRef.current.style.height = `${availableHeight}px`;
      }

      // Calculate list height with dynamic header estimation
      if (containerRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        const headerHeight =
          containerRef.current.querySelector("[data-header]")?.clientHeight ||
          150;
        const availableListHeight = Math.max(
          containerHeight - headerHeight,
          200
        );
        setListHeight(availableListHeight);
      }
    };

    calculateHeights();
    window.addEventListener("resize", calculateHeights);

    return () => window.removeEventListener("resize", calculateHeights);
  }, [children, selectedStatusFilter]);

  const formatCurrentDate = () => {
    const today = new Date();
    return new Intl.DateTimeFormat("he-IL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(today);
  };

  const getGroupName = () => {
    if (groupName && accountName) {
      return `${groupName} - ${accountName}`;
    } else if (groupName) {
      return groupName;
    } else if (children.length > 0 && children[0].groupName) {
      return children[0].groupName;
    }
    // Fallback to a default name
    return "קבוצה לא ידועה";
  };

  const handleStatusChange = async (
    childId: string,
    status: AttendanceStatus
  ) => {
    if (!user?.groupId || !attendanceData || isAttendanceClosedComputed) return;

    const today = new Date().toISOString().split("T")[0];
    const apiStatus = mapComponentStatusToApiStatus(status);

    // Find the child name for the notification
    const child = attendanceData.children.find((c) => c.childId === childId);
    const childName = child ? `${child.firstName} ${child.lastName}` : "ילד";
    const statusText = getStatusOption(status)?.label || "לא ידוע";

    try {
      // Create updated attendance data
      const updatedChildren = attendanceData.children.map((child) =>
        child.childId === childId
          ? { ...child, status: apiStatus, timestamp: new Date().toISOString() }
          : child
      );

      const updatedAttendanceData: GroupAttendance = {
        ...attendanceData,
        children: updatedChildren,
      };

      // Update via context
      await updateAttendance(user.groupId, today, updatedAttendanceData);

      // Show success notification
      showNotification("עודכן בהצלחה", "success");
    } catch (error) {
      console.error("Failed to update attendance status:", error);

      // Show error notification
      showNotification("שגיאה", "error");
    }
  };

  const getAttendanceSummary = () => {
    const summary: Record<AttendanceStatus, number> = {
      arrived: 0,
      missing: 0,
      sick: 0,
      late: 0,
      vacation: 0,
      unreported: 0,
    };

    Object.values(attendanceRecords).forEach((status) => {
      summary[status]++;
    });

    return summary;
  };

  const summary = getAttendanceSummary();

  // Filter children based on selected status
  const filteredChildren = useMemo(() => {
    if (!selectedStatusFilter) return children;
    return children.filter(
      (child) => attendanceRecords[child.id!] === selectedStatusFilter
    );
  }, [children, attendanceRecords, selectedStatusFilter]);

  const handleStatusFilterClick = (status: AttendanceStatus) => {
    // Prevent any race conditions by using a callback
    setSelectedStatusFilter((prevFilter) => {
      // If clicking the same filter, clear it
      if (prevFilter === status) {
        return "";
      }
      // Otherwise, set the new filter
      return status;
    });
  };

  const clearStatusFilter = () => {
    setSelectedStatusFilter("");
  };

  const handleRefresh = () => {
    if (user?.groupId) {
      const today = new Date().toISOString().split("T")[0];
      fetchAttendance(user.groupId, today, true);
      // Remove focus from the button after clicking
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
  };

  const handleCompleteAttendance = () => {
    setShowCompleteDialog(true);
  };

  const handleConfirmComplete = async () => {
    try {
      if (!user?.groupId || !attendanceData) {
        throw new Error("Missing group or attendance data");
      }

      const today = new Date().toISOString().split("T")[0];

      // Create updated attendance data with isClosed flag
      const updatedAttendanceData: GroupAttendance = {
        ...attendanceData,
        isClosed: true,
      };

      // Immediately mark attendance as closed in the UI
      markAttendanceAsClosed();

      // Update attendance with closed status using the API
      await attendanceApi.updateGroupAttendance(
        user.groupId,
        today,
        updatedAttendanceData
      );

      // Show success notification
      showNotification("נוכחות נסגרה בהצלחה", "success");

      // Close dialog and navigate to dashboard
      setShowCompleteDialog(false);

      // Navigate to dashboard after a short delay to show the success message
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Failed to close attendance session:", error);

      // Show error notification
      showNotification("שגיאה", "error");

      // Close dialog without navigating
      setShowCompleteDialog(false);
    }
  };

  const handleCancelComplete = () => {
    setShowCompleteDialog(false);
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        mt: 0,
        mb: 0,
        pb: 0,
        position: "relative",
        bgcolor: "background.paper",
        borderRadius: { xs: 0, sm: 2 },
        border: { xs: "none", sm: "1px solid" },
        borderColor: { xs: "transparent", sm: "divider" },
        boxShadow: { xs: "none", sm: "0 2px 8px rgba(0, 0, 0, 0.1)" },
        overflow: "hidden",
        px: { xs: 0, sm: 2 },
      }}
      ref={containerRef}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header with Group Info and Date - Improved Layout */}
        <Fade in={!isInitialLoading} timeout={400}>
          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              py: { xs: 2, sm: 2.5 },
              flexShrink: 0,
              borderBottom: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
            data-header
          >
            {/* Main Header Row */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1.5,
              }}
            >
              {/* Title, Group Name, and Refresh Button */}
              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: "1.25rem", sm: "1.5rem" },
                      color: "text.primary",
                      mt: -1.25, // Move title up by ~10px
                    }}
                  >
                    נוכחות יומית
                  </Typography>
                  <IconButton
                    onClick={handleRefresh}
                    disabled={isLoading}
                    size="small"
                    sx={{
                      color: "primary.main",
                      bgcolor: "primary.50",
                      mt: -1.25, // Align with title
                      "&:hover": {
                        backgroundColor: "primary.main",
                        color: "white",
                      },
                      "&:disabled": {
                        bgcolor: "grey.100",
                        color: "grey.400",
                      },
                    }}
                  >
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
                  <Typography
                    variant="body1"
                    color="primary"
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: "0.95rem", sm: "1.1rem" },
                    }}
                  >
                    {getGroupName()}
                  </Typography>
                  {isAttendanceClosedComputed && (
                    <Box
                      sx={{
                        bgcolor: "warning.main",
                        color: "white",
                        borderRadius: 1.5,
                        px: 1.5,
                        py: 0.5,
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.7rem",
                        }}
                      >
                        נסגר
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* DateTime Widget and Complete Button */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 1.5,
                }}
              >
                <DateTimeWidget variant="compact" size="large" />
                {!isAttendanceClosedComputed && (
                  <Button
                    onClick={handleCompleteAttendance}
                    size="small"
                    variant="contained"
                    startIcon={<DoneIcon />}
                    sx={{
                      bgcolor: "primary.main",
                      color: "white",
                      px: 2,
                      py: 1,
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      borderRadius: 2,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      "&:hover": {
                        bgcolor: "primary.dark",
                        color: "white",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                        transform: "translateY(-1px)",
                      },
                      transition: "all 0.2s ease-in-out",
                    }}
                  >
                    סגור נוכחות
                  </Button>
                )}
              </Box>
            </Box>

            {/* Attendance Summary - Compact mobile design */}
            {children.length > 0 && (
              <Fade in={!isInitialLoading && children.length > 0} timeout={400}>
                <Box
                  sx={{
                    mt: { xs: 1.5, sm: 2 },
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: { xs: 1, sm: 1 },
                    flexWrap: { xs: "nowrap", sm: "wrap" },
                  }}
                >
                  {/* Mobile: Compact horizontal scroll */}
                  <Box
                    sx={{
                      display: { xs: "flex", sm: "none" },
                      gap: 1.5,
                      pb: 0.5,
                      justifyContent: "space-evenly",
                      px: 0,
                      py: 1,
                    }}
                  >
                    {attendanceStatusOptions.map((option, index) => {
                      const isArrived = option.value === "arrived";
                      const count =
                        summary[option.value as keyof typeof summary];
                      return (
                        <Box
                          key={option.value}
                          onClick={() =>
                            handleStatusFilterClick(
                              option.value as AttendanceStatus
                            )
                          }
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: 0,
                            flex: 1,
                            py: 2,
                            px: 1,
                            bgcolor:
                              selectedStatusFilter === option.value
                                ? STATUS_COLORS[
                                    option.value as AttendanceStatus
                                  ].bg
                                : isArrived
                                ? STATUS_COLORS[
                                    option.value as AttendanceStatus
                                  ].bg
                                : "rgba(255, 255, 255, 0.9)",
                            color:
                              selectedStatusFilter === option.value
                                ? "#fff"
                                : isArrived
                                ? STATUS_COLORS[
                                    option.value as AttendanceStatus
                                  ].text
                                : STATUS_COLORS[
                                    option.value as AttendanceStatus
                                  ].text,
                            border: `2px solid ${
                              STATUS_COLORS[option.value as AttendanceStatus]
                                .border
                            }`,
                            borderRadius: 3,
                            cursor: "pointer",
                            minHeight: 70,
                            position: "relative",
                            overflow: "hidden",
                            transform:
                              selectedStatusFilter === option.value
                                ? "scale(1.02)"
                                : "scale(1)",
                            boxShadow:
                              selectedStatusFilter === option.value
                                ? "0 4px 12px rgba(0,0,0,0.25)"
                                : "none",
                            outline: "none",
                            WebkitTapHighlightColor: "transparent",
                            WebkitTouchCallout: "none",
                            WebkitUserSelect: "none",
                            "& *": {
                              outline: "none",
                              WebkitTapHighlightColor: "transparent",
                            },
                            "&:focus": {
                              outline: "none",
                              borderRadius: 3,
                              WebkitTapHighlightColor: "transparent",
                              "& *": {
                                outline: "none",
                              },
                            },
                            "&:focus-visible": {
                              outline: "none",
                              borderRadius: 3,
                              WebkitTapHighlightColor: "transparent",
                              "& *": {
                                outline: "none",
                              },
                            },
                            "&:active": {
                              borderRadius: 3,
                              WebkitTapHighlightColor: "transparent",
                              outline: "none",
                              "& *": {
                                outline: "none",
                              },
                            },
                            "&:hover": {
                              transform: "scale(1.05)",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                              borderRadius: 3,
                              outline: "none",
                              "& *": {
                                outline: "none",
                              },
                            },
                            "&::before": {
                              content: '""',
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              height: "3px",
                              bgcolor:
                                STATUS_COLORS[option.value as AttendanceStatus]
                                  .border,
                            },
                          }}
                        >
                          {/* Status Icon/Indicator */}
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: isArrived
                                ? "rgba(255, 255, 255, 0.8)"
                                : STATUS_COLORS[
                                    option.value as AttendanceStatus
                                  ].bg,
                              mb: 1,
                              border: `1px solid ${
                                STATUS_COLORS[option.value as AttendanceStatus]
                                  .border
                              }`,
                            }}
                          />

                          {/* Count Number */}
                          <Typography
                            variant="h4"
                            sx={{
                              fontSize: "1.8rem",
                              fontWeight: 800,
                              lineHeight: 1,
                              textAlign: "center",
                              mb: 0.5,
                              color: isArrived
                                ? "#fff"
                                : STATUS_COLORS[
                                    option.value as AttendanceStatus
                                  ].text,
                            }}
                          >
                            {count}
                          </Typography>

                          {/* Status Label */}
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              lineHeight: 1,
                              textAlign: "center",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              color: isArrived
                                ? "rgba(255, 255, 255, 0.9)"
                                : STATUS_COLORS[
                                    option.value as AttendanceStatus
                                  ].text,
                            }}
                          >
                            {option.label}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>

                  {/* Desktop: Original design */}
                  <Box
                    sx={{
                      display: { xs: "none", sm: "flex" },
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    {attendanceStatusOptions.map((option, index) => {
                      const isArrived = option.value === "arrived";
                      return (
                        <Box
                          key={option.value}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Box
                            sx={{
                              bgcolor: isArrived
                                ? STATUS_COLORS[
                                    option.value as AttendanceStatus
                                  ].bg
                                : "rgba(255, 255, 255, 0.8)",
                              color: isArrived
                                ? STATUS_COLORS[
                                    option.value as AttendanceStatus
                                  ].text
                                : STATUS_COLORS[
                                    option.value as AttendanceStatus
                                  ].text,
                              border: `1px solid ${
                                STATUS_COLORS[option.value as AttendanceStatus]
                                  .border
                              }`,
                              borderRadius: isArrived ? 3 : 2,
                              fontWeight: isArrived ? 700 : 500,
                              fontSize: isArrived ? 16 : 14,
                              px: isArrived ? 2 : 1.5,
                              py: isArrived ? 1 : 0.8,
                              width: isArrived ? 90 : 85,
                              height: isArrived ? 36 : 28,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              mr: 0.5,
                              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              cursor: "pointer",
                              outline: "none",
                              WebkitTapHighlightColor: "transparent",
                              WebkitTouchCallout: "none",
                              WebkitUserSelect: "none",
                              userSelect: "none",
                              "&:hover": {
                                transform: "scale(1.02)",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                              },
                            }}
                            onClick={() =>
                              handleStatusFilterClick(
                                option.value as AttendanceStatus
                              )
                            }
                          >
                            {option.label}:{" "}
                            {summary[option.value as keyof typeof summary]}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </Fade>
            )}

            {/* Active Filter Display - Compact mobile */}
            {selectedStatusFilter && (
              <Fade in={!!selectedStatusFilter} timeout={300}>
                <Box
                  sx={{
                    mt: { xs: 1, sm: 2 },
                    mb: { xs: 0.5, sm: 1 },
                    display: "flex",
                    flexDirection: { xs: "row", sm: "row" },
                    alignItems: { xs: "center", sm: "center" },
                    gap: 1,
                    justifyContent: { xs: "flex-start", sm: "flex-start" },
                  }}
                >
                  <Chip
                    label={`סטטוס: ${
                      attendanceStatusOptions.find(
                        (opt) => opt.value === selectedStatusFilter
                      )?.label || ""
                    }`}
                    size="small"
                    color="primary"
                    onDelete={clearStatusFilter}
                    sx={{
                      fontSize: { xs: "0.7rem", sm: "0.75rem" },
                      fontWeight: 500,
                    }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: "0.7rem", sm: "0.75rem" },
                      textAlign: { xs: "left", sm: "left" },
                    }}
                  >
                    מציג {filteredChildren.length} מתוך {children.length} ילדים
                  </Typography>
                </Box>
              </Fade>
            )}
          </Box>
        </Fade>

        {/* Children List - Maximized height for mobile */}
        <Box
          sx={{
            flex: 1,
            overflow: "hidden",
            px: { xs: 0, sm: 2 },
            pb: 0,
            mt: { xs: 0.5, sm: 0 },
            position: "relative",
          }}
        >
          {isInitialLoading ? (
            <Box sx={{ height: "100%", pb: 2 }}>
              {/* Show multiple skeleton items while loading */}
              {Array.from({ length: 8 }).map((_, index) => (
                <AttendanceSkeleton key={index} />
              ))}
            </Box>
          ) : filteredChildren.length === 0 ? (
            <Fade in={!isInitialLoading} timeout={700}>
              <Box sx={{ textAlign: "center", py: 3 }}>
                <Typography color="text.secondary">
                  {selectedStatusFilter
                    ? `לא נמצאו ילדים עם סטטוס "${
                        attendanceStatusOptions.find(
                          (opt) => opt.value === selectedStatusFilter
                        )?.label
                      }"`
                    : children.length === 0
                    ? "לא נמצאו נתוני נוכחות להיום. נתוני נוכחות ייווצרו כאשר תתחיל לסמן נוכחות."
                    : "לא נמצאו ילדים לקבוצה זו"}
                </Typography>
              </Box>
            </Fade>
          ) : filteredChildren.length > 5 ? (
            // Use virtualization for larger lists
            <Fade in={!isInitialLoading} timeout={500}>
              <Box sx={{ height: "100%", px: { xs: 2, sm: 2 }, pb: 4 }}>
                <VirtualList
                  height={listHeight}
                  itemCount={filteredChildren.length}
                  itemSize={100} // Reduced item size for smaller gaps
                  width="100%"
                  overscanCount={8}
                  itemKey={(index, data) =>
                    data.children[index]?.id || `child-${index}`
                  }
                  itemData={{
                    children: filteredChildren,
                    attendanceRecords,
                    attendanceTimestamps,
                    onStatusChange: handleStatusChange,
                  }}
                >
                  {({ index, style, data }) => (
                    <div style={style}>
                      <AttendanceChildListItem
                        key={data.children[index].id}
                        child={data.children[index]}
                        attendanceStatus={
                          data.attendanceRecords[data.children[index].id!] ||
                          "missing"
                        }
                        updateTime={
                          data.attendanceTimestamps[data.children[index].id!]
                        }
                        onStatusChange={data.onStatusChange}
                        index={index}
                        isAttendanceClosed={isAttendanceClosedComputed}
                      />
                    </div>
                  )}
                </VirtualList>
                {/* Small spacer for extra scroll space */}
                <Box sx={{ height: 20 }} />
              </Box>
            </Fade>
          ) : (
            // Use regular rendering for smaller lists
            <Fade in={!isInitialLoading} timeout={500}>
              <Box sx={{ height: "100%", px: { xs: 2, sm: 2 }, pb: 4 }}>
                {filteredChildren.map((child, index) => (
                  <AttendanceChildListItem
                    key={child.id}
                    child={child}
                    attendanceStatus={attendanceRecords[child.id!] || "missing"}
                    updateTime={attendanceTimestamps[child.id!]}
                    onStatusChange={handleStatusChange}
                    index={index}
                    isAttendanceClosed={isAttendanceClosedComputed}
                  />
                ))}
                {/* Small spacer for extra scroll space */}
                <Box sx={{ height: 20 }} />
              </Box>
            </Fade>
          )}
        </Box>
      </Box>

      {/* Confirmation Dialog for Completing Attendance */}
      <Dialog
        open={showCompleteDialog}
        onClose={handleCancelComplete}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 0,
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          },
        }}
      >
        <Box
          sx={{
            bgcolor: "primary.main",
            color: "white",
            p: 3,
            textAlign: "center",
          }}
        >
          <DoneIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              fontSize: "1.5rem",
            }}
          >
            סיום נוכחות יומית
          </Typography>
        </Box>

        <DialogContent sx={{ textAlign: "center", py: 3, px: 3 }}>
          <Typography
            variant="body1"
            color="text.primary"
            sx={{
              mb: 2,
              fontWeight: 500,
              fontSize: "1.1rem",
            }}
          >
            האם אתה בטוח שברצונך לסגור את נוכחות היום?
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ lineHeight: 1.6 }}
          >
            פעולה זו תסגור את נוכחות היום ותחזיר אותך לדשבורד הראשי.
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: "center",
            gap: 2,
            px: 3,
            pb: 3,
            pt: 1,
          }}
        >
          <Button
            onClick={handleCancelComplete}
            variant="outlined"
            size="large"
            sx={{
              minWidth: 120,
              borderColor: "grey.300",
              color: "text.secondary",
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontSize: "0.95rem",
              fontWeight: 600,
              "&:hover": {
                borderColor: "grey.500",
                backgroundColor: "grey.50",
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            ביטול
          </Button>
          <Button
            onClick={handleConfirmComplete}
            variant="contained"
            size="large"
            startIcon={<DoneIcon />}
            sx={{
              minWidth: 140,
              bgcolor: "primary.main",
              color: "white",
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontSize: "0.95rem",
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              "&:hover": {
                bgcolor: "primary.dark",
                color: "white",
                boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            סגור
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{
          mt: { xs: 2, sm: 3 }, // Higher positioning
        }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{
            width: "100%",
            fontSize: "0.95rem",
            fontWeight: 500,
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            "&.MuiAlert-standardSuccess, &.MuiAlert-filledSuccess": {
              backgroundColor: "#66BB6A",
              color: "white",
            },
            "&.MuiAlert-standardError, &.MuiAlert-filledError": {
              backgroundColor: "#F44336",
              color: "white",
            },
            "&.MuiAlert-standardWarning, &.MuiAlert-filledWarning": {
              backgroundColor: "#FF9800",
              color: "white",
            },
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DailyAttendance;
