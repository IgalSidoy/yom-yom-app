import React, { useEffect, useState, useMemo, memo, useRef } from "react";
import { FixedSizeList as VirtualList } from "react-window";
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
} from "@mui/material";
import { useApp } from "../contexts/AppContext";
import { useAttendance } from "../contexts/AttendanceContext";
import {
  ChildWithParents,
  attendanceApi,
  GroupAttendance,
  AttendanceChild,
} from "../services/api";

// Attendance status options
export type AttendanceStatus =
  | "arrived"
  | "missing"
  | "sick"
  | "late"
  | "vacation"
  | "unreported";

export interface AttendanceRecord {
  childId: string;
  status: AttendanceStatus;
  timestamp: string;
}

// Status mapping function to convert between API status values and component status types
const mapApiStatusToComponentStatus = (apiStatus: string): AttendanceStatus => {
  const statusMap: Record<string, AttendanceStatus> = {
    Arrived: "arrived",
    Missing: "missing",
    Sick: "sick",
    Late: "late",
    Vacation: "vacation",
  };
  return statusMap[apiStatus] || "unreported";
};

const mapComponentStatusToApiStatus = (
  componentStatus: AttendanceStatus
): string => {
  const statusMap: Record<AttendanceStatus, string> = {
    arrived: "Arrived",
    missing: "Missing",
    sick: "Sick",
    late: "Late",
    vacation: "Vacation",
    unreported: "Unreported",
  };
  return statusMap[componentStatus];
};

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

const STATUS_COLORS: Record<
  AttendanceStatus,
  { bg: string; text: string; border: string }
> = {
  arrived: { bg: "#FF9F43", text: "#fff", border: "#FF9F43" },
  missing: { bg: "#FFE3E3", text: "#B85C5C", border: "#F5B5B5" },
  sick: { bg: "#FFF7C2", text: "#B88B2A", border: "#FFE6A7" },
  late: { bg: "#E3F0FF", text: "#3A6EA5", border: "#B3D4F7" },
  vacation: { bg: "#E3FFE3", text: "#3A9A5A", border: "#B3E6B3" },
  unreported: { bg: "#F5F5F5", text: "#888", border: "#E0E0E0" },
};

// Memoized Child List Item Component for Daily Attendance
const AttendanceChildListItem: React.FC<{
  child: ChildWithParents;
  attendanceStatus: AttendanceStatus;
  updateTime?: string;
  onStatusChange: (childId: string, status: AttendanceStatus) => Promise<void>;
  index?: number; // Add index for staggered animation
}> = memo(
  ({ child, attendanceStatus, updateTime, onStatusChange, index = 0 }) => {
    const rareStatuses = attendanceStatusOptions.filter(
      (opt) => opt.value !== "arrived"
    );
    const getStatusOption = (val: string) =>
      attendanceStatusOptions.find((o) => o.value === val);
    const arrivedOption = getStatusOption("arrived");
    const currentOption = getStatusOption(attendanceStatus);

    const formatUpdateTime = (timestamp?: string) => {
      if (!timestamp) return "לא עודכן";
      return new Date(timestamp).toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    return (
      <Box
        sx={{
          py: { xs: 1.5, sm: 2 },
          px: { xs: 0.5, sm: 3 },
          borderBottom: "1px solid",
          borderColor: "rgba(0, 0, 0, 0.04)",
        }}
      >
        {/* Mobile Layout: Stacked vertically */}
        <Box
          sx={{
            display: { xs: "flex", sm: "flex" },
            flexDirection: { xs: "column", sm: "row-reverse" },
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: { xs: "flex-start", sm: "space-between" },
            gap: { xs: 1.5, sm: 1.5 },
          }}
        >
          {/* Child Name and Time - Mobile: same line, Desktop: separate */}
          <Box
            sx={{
              display: { xs: "flex", sm: "block" },
              flexDirection: { xs: "row", sm: "column" },
              alignItems: { xs: "center", sm: "stretch" },
              justifyContent: { xs: "space-between", sm: "flex-start" },
              order: { xs: 1, sm: 2 },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                textAlign: { xs: "right", sm: "right" },
                minWidth: 0,
                flexShrink: 1,
                fontSize: { xs: "1.1rem", sm: "1.25rem" },
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              noWrap
            >
              {child.firstName} {child.lastName}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                textAlign: { xs: "left", sm: "right" },
                fontSize: { xs: "0.85rem", sm: "1rem" },
                order: { xs: -1, sm: 0 },
              }}
            >
              עודכן {formatUpdateTime(updateTime)}
            </Typography>
          </Box>

          {/* Buttons */}
          <ButtonGroup
            variant="text"
            sx={{
              boxShadow: "none",
              flexShrink: 0,
              order: { xs: 2, sm: 1 }, // Buttons second on mobile, first on desktop
              justifyContent: { xs: "center", sm: "flex-start" },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            <Button
              variant={
                attendanceStatus === "arrived" ? "contained" : "outlined"
              }
              onClick={() =>
                onStatusChange(child.id!, "arrived").catch(console.error)
              }
              sx={{
                bgcolor:
                  attendanceStatus === "arrived"
                    ? STATUS_COLORS.arrived.bg
                    : "#fff",
                color:
                  attendanceStatus === "arrived"
                    ? STATUS_COLORS.arrived.text
                    : STATUS_COLORS.arrived.bg,
                borderColor: STATUS_COLORS.arrived.border,
                borderRadius: 3,
                fontWeight: 700,
                fontSize: { xs: 14, sm: 16 },
                py: { xs: 1, sm: 1.2 },
                px: { xs: 2, sm: 3 },
                minWidth: { xs: 70, sm: 80 },
                flex: { xs: 1, sm: "none" },
                boxShadow: "none",
                outline: "none",
                WebkitTapHighlightColor: "transparent",
                WebkitTouchCallout: "none",
                WebkitUserSelect: "none",
                userSelect: "none",
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
              }}
            >
              {arrivedOption?.label}
            </Button>
            <Button
              variant={
                attendanceStatus !== "arrived" ? "contained" : "outlined"
              }
              onClick={() => {
                const idx = rareStatuses.findIndex(
                  (s) => s.value === attendanceStatus
                );
                const next =
                  rareStatuses[(idx + 1) % rareStatuses.length]?.value ||
                  rareStatuses[0].value;
                onStatusChange(child.id!, next as AttendanceStatus).catch(
                  console.error
                );
              }}
              sx={{
                bgcolor:
                  attendanceStatus !== "arrived"
                    ? STATUS_COLORS[attendanceStatus].bg
                    : "#fff",
                color:
                  attendanceStatus !== "arrived"
                    ? STATUS_COLORS[attendanceStatus].text
                    : STATUS_COLORS.missing.text,
                borderColor:
                  attendanceStatus !== "arrived"
                    ? STATUS_COLORS[attendanceStatus].border
                    : STATUS_COLORS.missing.border,
                borderRadius: 3,
                fontWeight: 700,
                fontSize: { xs: 14, sm: 16 },
                py: { xs: 1, sm: 1.2 },
                px: { xs: 2, sm: 2 },
                minWidth: { xs: 70, sm: 80 },
                flex: { xs: 1, sm: "none" },
                boxShadow: "none",
                outline: "none",
                WebkitTapHighlightColor: "transparent",
                WebkitTouchCallout: "none",
                WebkitUserSelect: "none",
                userSelect: "none",
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
              }}
            >
              {attendanceStatus !== "arrived"
                ? currentOption?.label
                : "סטטוס נוסף"}
            </Button>
          </ButtonGroup>
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
          justifyContent: { xs: "space-between", sm: "flex-start" },
          order: { xs: 1, sm: 2 },
          width: { xs: "100%", sm: "auto" },
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
          justifyContent: { xs: "center", sm: "flex-start" },
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
  const { attendanceData, isLoading, updateAttendance } = useAttendance();
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<
    AttendanceStatus | ""
  >("");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [listHeight, setListHeight] = useState(400);
  const containerRef = useRef<HTMLDivElement>(null);

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
    if (!user?.groupId || !attendanceData) return;

    const today = new Date().toISOString().split("T")[0];
    const apiStatus = mapComponentStatusToApiStatus(status);

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
    } catch (error) {
      console.error("Failed to update attendance status:", error);
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
        {/* Header with Group Info and Date - Compact for mobile */}
        <Fade in={!isInitialLoading} timeout={400}>
          <Box
            sx={{
              px: { xs: 1, sm: 2 },
              pt: 2,
              pb: 1,
              flexShrink: 0,
              borderBottom: { xs: "1px solid", sm: "none" },
              borderColor: { xs: "divider", sm: "transparent" },
              mb: { xs: 1, sm: 0 },
            }}
            data-header
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
              >
                נוכחות יומית
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
              >
                {formatCurrentDate()}
              </Typography>
            </Box>

            <Typography
              variant="body2"
              color="primary"
              sx={{ fontWeight: 500, fontSize: { xs: "0.9rem", sm: "1rem" } }}
            >
              {getGroupName()}
            </Typography>

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
                  />
                ))}
                {/* Small spacer for extra scroll space */}
                <Box sx={{ height: 20 }} />
              </Box>
            </Fade>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default DailyAttendance;
