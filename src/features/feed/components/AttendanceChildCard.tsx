import React from "react";
import { Box, Chip, Typography, Avatar } from "@mui/material";
import {
  getAttendanceStatusColor,
  ATTENDANCE_COLORS,
} from "../../../config/colors";
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  LocalHospital as LocalHospitalIcon,
  BeachAccess as BeachAccessIcon,
  Help as HelpIcon,
} from "@mui/icons-material";

interface AttendanceChildCardProps {
  child: {
    childId: string;
    childFirstName: string;
    childLastName: string;
    status: string;
  };
  isClosed?: boolean;
  getStatusText: (status: string) => string;
}

const AttendanceChildCard: React.FC<AttendanceChildCardProps> = ({
  child,
  isClosed = false,
  getStatusText,
}) => {
  const statusColor = getAttendanceStatusColor(child.status, isClosed);
  const isPresent = (() => {
    const status = child.status.toLowerCase();
    return status === "present" || status === "arrived" || status === "נוכח";
  })();

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "present":
      case "arrived":
      case "נוכח":
        return <CheckCircleIcon sx={{ fontSize: 16, color: "#fff" }} />;
      case "late":
      case "מאחר":
        return <ScheduleIcon sx={{ fontSize: 16, color: "#fff" }} />;
      case "absent":
      case "missing":
      case "נעדר":
        return <CancelIcon sx={{ fontSize: 16, color: "#fff" }} />;
      case "sick":
      case "חולה":
        return <LocalHospitalIcon sx={{ fontSize: 16, color: "#fff" }} />;
      case "vacation":
      case "חופשה":
        return <BeachAccessIcon sx={{ fontSize: 16, color: "#fff" }} />;
      default:
        return <HelpIcon sx={{ fontSize: 16, color: "#fff" }} />;
    }
  };

  // Get the exact attendance color based on status
  const getAttendanceColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "present":
      case "arrived":
      case "נוכח":
        return ATTENDANCE_COLORS.PRESENT;
      case "late":
      case "מאחר":
        return ATTENDANCE_COLORS.LATE;
      case "absent":
      case "missing":
      case "נעדר":
        return ATTENDANCE_COLORS.ABSENT;
      case "sick":
      case "חולה":
        return ATTENDANCE_COLORS.SICK;
      case "vacation":
      case "חופשה":
        return ATTENDANCE_COLORS.VACATION;
      default:
        return ATTENDANCE_COLORS.UNREPORTED;
    }
  };

  const attendanceColor = getAttendanceColor(child.status);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.75,
        p: 1,
        borderRadius: 2,
        border: "1px solid",
        borderColor: isClosed ? "grey.200" : attendanceColor.border,
        bgcolor: isClosed ? "grey.50" : attendanceColor.bg,
        transition: "all 0.2s ease-in-out",
        opacity: isClosed ? 0.7 : 1,
        minWidth: 120,
        maxWidth: 150,
        cursor: "default",
        "&:hover": {
          transform: isClosed ? "none" : "translateY(-1px)",
          boxShadow: isClosed ? "none" : "0 3px 8px rgba(0,0,0,0.12)",
          borderColor: isClosed ? "grey.200" : attendanceColor.border,
        },
      }}
    >
      {/* Status Icon */}
      <Box sx={{ flexShrink: 0 }}>{getStatusIcon(child.status)}</Box>

      {/* Child Full Name */}
      <Typography
        variant="body2"
        sx={{
          fontWeight: isPresent ? 700 : 600,
          color: isClosed ? "grey.600" : "#fff",
          fontSize: "0.75rem",
          lineHeight: 1.2,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {child.childFirstName} {child.childLastName}
      </Typography>
    </Box>
  );
};

export default AttendanceChildCard;
