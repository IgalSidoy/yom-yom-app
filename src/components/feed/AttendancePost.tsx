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
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {getStatusIcon()}
          <Chip
            label={getStatusText()}
            size="small"
            color={getStatusColor() as any}
            sx={{
              fontSize: "0.75rem",
              height: 28,
              fontWeight: 600,
              "& .MuiChip-label": {
                px: 1.5,
              },
            }}
          />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: "auto" }}>
          <GroupIcon
            sx={{ fontSize: 20, color: "text.secondary", opacity: 0.7 }}
          />
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontSize: "0.9rem",
              fontWeight: 500,
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
          p: 3,
          bgcolor: "rgba(255, 145, 77, 0.03)",
          borderRadius: 3,
          border: "1px solid",
          borderColor: "rgba(255, 145, 77, 0.1)",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: "linear-gradient(90deg, #FF914D 0%, #FFB366 100%)",
          },
        }}
      >
        {/* Attendance Percentage */}
        <Box sx={{ textAlign: "center", flex: 1 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              color: "#FF914D",
              fontSize: { xs: "2rem", sm: "2.5rem" },
              lineHeight: 1,
              mb: 0.5,
              textShadow: "0 2px 4px rgba(255, 145, 77, 0.2)",
            }}
          >
            {attendancePercentage}%
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontSize: "0.8rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            נוכחות
          </Typography>
        </Box>

        {/* Divider */}
        <Box
          sx={{
            width: "1px",
            height: 60,
            bgcolor: "rgba(255, 145, 77, 0.2)",
            mx: 2,
          }}
        />

        {/* Present Count */}
        <Box sx={{ textAlign: "center", flex: 1 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              fontSize: { xs: "1.5rem", sm: "1.75rem" },
              lineHeight: 1,
              mb: 0.5,
            }}
          >
            {presentCount}/{totalCount}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontSize: "0.8rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
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
