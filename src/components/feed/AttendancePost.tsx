import React from "react";
import { Typography, Box, Chip, useTheme } from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
} from "@mui/icons-material";
import PostContainer from "./PostContainer";

interface AttendancePostProps {
  id: string;
  title: string;
  groupName: string;
  attendanceDate: string;
  presentCount: number;
  totalCount: number;
  status: "completed" | "in-progress" | "pending";
  teacherName: string;
  teacherAvatar?: string;
  publishDate: string;
  isLiked?: boolean;
  likeCount?: number;
  onViewDetails?: (id: string) => void;
  onEdit?: (id: string) => void;
  onLike?: (id: string) => void;
}

const AttendancePost: React.FC<AttendancePostProps> = ({
  id,
  title,
  groupName,
  attendanceDate,
  presentCount,
  totalCount,
  status,
  teacherName,
  teacherAvatar,
  publishDate,
  isLiked = false,
  likeCount = 0,
  onViewDetails,
  onEdit,
  onLike,
}) => {
  const theme = useTheme();

  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return "success";
      case "in-progress":
        return "warning";
      case "pending":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "completed":
        return "הושלם";
      case "in-progress":
        return "בתהליך";
      case "pending":
        return "ממתין";
      default:
        return "לא ידוע";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon sx={{ color: theme.palette.success.main }} />;
      case "in-progress":
        return <ScheduleIcon sx={{ color: theme.palette.warning.main }} />;
      case "pending":
        return <ScheduleIcon sx={{ color: theme.palette.grey[500] }} />;
      default:
        return <ScheduleIcon />;
    }
  };

  const attendancePercentage =
    totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  return (
    <PostContainer
      id={id}
      publishDate={publishDate}
      title={title}
      isLiked={isLiked}
      likeCount={likeCount}
      onViewDetails={onViewDetails}
      onEdit={onEdit}
      onLike={onLike}
    >
      {/* Status and Group Info */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        {getStatusIcon()}
        <Chip
          label={getStatusText()}
          size="small"
          color={getStatusColor() as any}
          sx={{
            fontSize: "0.7rem",
            height: 24,
            "& .MuiChip-label": {
              px: 1,
            },
          }}
        />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: "auto" }}>
          <GroupIcon sx={{ fontSize: 18, color: "text.secondary" }} />
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontSize: "0.85rem",
            }}
          >
            {groupName}
          </Typography>
        </Box>
      </Box>

      {/* Attendance Stats */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 1.5,
          bgcolor: "background.default",
          borderRadius: 1.5,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "primary.main",
              fontSize: "1.5rem",
              lineHeight: 1,
            }}
          >
            {attendancePercentage}%
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontSize: "0.7rem",
            }}
          >
            נוכחות
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "text.primary",
              fontSize: "1.1rem",
              lineHeight: 1,
            }}
          >
            {presentCount}/{totalCount}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontSize: "0.7rem",
            }}
          >
            ילדים נוכחים
          </Typography>
        </Box>
      </Box>
    </PostContainer>
  );
};

export default AttendancePost;
