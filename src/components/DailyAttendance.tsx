import React, { useEffect, useState, useMemo, memo } from "react";
import { FixedSizeList as VirtualList } from "react-window";
import {
  Box,
  Typography,
  CircularProgress,
  ListItem,
  ListItemText,
  Chip,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  Button,
  ButtonGroup,
} from "@mui/material";
import { useApp } from "../contexts/AppContext";
import { childApi, ChildWithParents } from "../services/api";

// Attendance status options
export type AttendanceStatus =
  | "arrived"
  | "missing"
  | "sick"
  | "late"
  | "vacation"
  | "other";

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
  { value: "other", label: "אחר", color: MILD_GRAY, textColor: "#888" },
];

// Memoized Child List Item Component for Daily Attendance
const AttendanceChildListItem = memo<{
  child: ChildWithParents;
  attendanceStatus: AttendanceStatus;
  onStatusChange: (childId: string, status: AttendanceStatus) => void;
}>(({ child, attendanceStatus, onStatusChange }) => {
  const updateTime = child.updated
    ? new Date(child.updated).toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "08:30";

  const rareStatuses = attendanceStatusOptions.filter(
    (opt) => opt.value !== "arrived"
  );
  const getStatusOption = (val: string) =>
    attendanceStatusOptions.find((o) => o.value === val);
  const arrivedOption = getStatusOption("arrived");
  const currentOption = getStatusOption(attendanceStatus);

  return (
    <Box
      sx={{
        py: { xs: 1.5, sm: 2 },
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      {/* Top row: Buttons (left), Name (right) */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row-reverse",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            textAlign: "right",
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
        <ButtonGroup variant="text" sx={{ boxShadow: "none", flexShrink: 0 }}>
          <Button
            variant={attendanceStatus === "arrived" ? "contained" : "outlined"}
            onClick={() => onStatusChange(child.id!, "arrived")}
            sx={{
              bgcolor: attendanceStatus === "arrived" ? "#FF9F43" : "#fff",
              color: attendanceStatus === "arrived" ? "#fff" : "#FF9F43",
              borderColor: "#FF9F43",
              borderRadius: 3,
              fontWeight: 700,
              fontSize: 16,
              py: 1.2,
              px: 3,
              minWidth: 80,
              boxShadow: "none",
              "&:hover, &:focus, &:active": {
                bgcolor: attendanceStatus === "arrived" ? "#FF9F43" : "#fff",
                color: attendanceStatus === "arrived" ? "#fff" : "#FF9F43",
                borderColor: "#FF9F43",
              },
            }}
          >
            {arrivedOption?.label}
          </Button>
          <Button
            variant={attendanceStatus !== "arrived" ? "contained" : "outlined"}
            onClick={() => {
              const idx = rareStatuses.findIndex(
                (s) => s.value === attendanceStatus
              );
              const next =
                rareStatuses[(idx + 1) % rareStatuses.length]?.value ||
                rareStatuses[0].value;
              onStatusChange(child.id!, next as AttendanceStatus);
            }}
            sx={{
              bgcolor: attendanceStatus !== "arrived" ? "#FFF7ED" : "#fff",
              color: attendanceStatus !== "arrived" ? "#FF9F43" : "#FF9F43",
              borderColor: "#FF9F43",
              borderRadius: 3,
              fontWeight: 700,
              fontSize: 16,
              py: 1.2,
              px: 2,
              minWidth: 80,
              boxShadow: "none",
              "&:hover, &:focus, &:active": {
                bgcolor: attendanceStatus !== "arrived" ? "#FFF7ED" : "#fff",
                color: "#FF9F43",
                borderColor: "#FF9F43",
              },
            }}
          >
            {attendanceStatus !== "arrived"
              ? currentOption?.label
              : "סטטוס נוסף"}
          </Button>
        </ButtonGroup>
      </Box>
      {/* Second row: update time */}
      <Typography
        variant="body2"
        sx={{
          color: "text.secondary",
          textAlign: "right",
          mt: 0.5,
          fontSize: { xs: "0.95rem", sm: "1rem" },
        }}
      >
        עדכון: {updateTime}
      </Typography>
    </Box>
  );
});

AttendanceChildListItem.displayName = "AttendanceChildListItem";

const DailyAttendance: React.FC = () => {
  const { user } = useApp();
  const [children, setChildren] = useState<ChildWithParents[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<
    Record<string, AttendanceStatus>
  >({});

  useEffect(() => {
    const fetchChildren = async () => {
      if (!user?.accountId || !user?.groupId) return;
      setIsLoading(true);
      try {
        const response = await childApi.getChildrenByAccountWithGroupFilter(
          user.accountId,
          user.groupId
        );
        setChildren(response.children || []);

        // Initialize attendance records for all children
        const initialRecords: Record<string, AttendanceStatus> = {};
        response.children?.forEach((child) => {
          initialRecords[child.id!] = "missing"; // Default status
        });
        setAttendanceRecords(initialRecords);
      } catch (error) {
        console.error("Error fetching children:", error);
        setChildren([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChildren();
  }, [user]);

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
    if (children.length > 0 && children[0].groupName) {
      return children[0].groupName;
    }
    return "קבוצה לא ידועה";
  };

  const handleStatusChange = (childId: string, status: AttendanceStatus) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [childId]: status,
    }));
  };

  const getAttendanceSummary = () => {
    const summary = {
      arrived: 0,
      missing: 0,
      sick: 0,
      late: 0,
      vacation: 0,
      other: 0,
    };

    Object.values(attendanceRecords).forEach((status) => {
      summary[status]++;
    });

    return summary;
  };

  const summary = getAttendanceSummary();

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header with Group Info and Date */}
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          נוכחות יומית
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Typography variant="body1" color="primary" sx={{ fontWeight: 500 }}>
            {getGroupName()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatCurrentDate()}
          </Typography>
        </Box>

        {/* Attendance Summary */}
        {children.length > 0 && (
          <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
            {attendanceStatusOptions.map((option) => (
              <Chip
                key={option.value}
                label={`${option.label}: ${
                  summary[option.value as keyof typeof summary]
                }`}
                size="small"
                color={option.color as any}
                variant={
                  summary[option.value as keyof typeof summary] > 0
                    ? "filled"
                    : "outlined"
                }
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Scrollable Children List */}
      <Box sx={{ flex: 1, overflow: "auto", px: 2, pb: 8 }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : children.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Typography color="text.secondary">
              לא נמצאו ילדים לקבוצה זו
            </Typography>
          </Box>
        ) : children.length > 5 ? (
          // Use virtualization for larger lists
          <VirtualList
            height={500}
            itemCount={children.length}
            itemSize={160}
            width="100%"
            overscanCount={8}
            itemKey={(index, data) =>
              data.children[index]?.id || `child-${index}`
            }
            itemData={{
              children,
              attendanceRecords,
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
                  onStatusChange={data.onStatusChange}
                />
              </div>
            )}
          </VirtualList>
        ) : (
          // Use regular rendering for smaller lists
          children.map((child) => (
            <AttendanceChildListItem
              key={child.id}
              child={child}
              attendanceStatus={attendanceRecords[child.id!] || "missing"}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </Box>
    </Box>
  );
};

export default DailyAttendance;
