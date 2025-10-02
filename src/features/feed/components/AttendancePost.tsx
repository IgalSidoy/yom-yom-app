import React from "react";
import { Typography, Box, Chip, useTheme, useMediaQuery } from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  Lock as LockIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import PostContainer from "./PostContainer";
import { useLanguage } from "../../../contexts/LanguageContext";

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
  isClosed?: boolean;
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
  isClosed = false,
  onViewDetails,
  onEdit,
  onLike,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { language } = useLanguage();

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

  const getAttendanceColor = () => {
    if (attendancePercentage >= 90) return "#4CAF50"; // Green for high attendance
    if (attendancePercentage >= 75) return "#FF9800"; // Orange for medium attendance
    return "#F44336"; // Red for low attendance
  };

  // Translation mapping for attendance post title
  const getAttendanceTitle = () => {
    const titles = {
      heb: "נוכחות יומית",
      rus: "Ежедневная посещаемость",
      eng: "Daily Attendance",
    };
    return titles[language] || titles.eng;
  };

  return (
    <PostContainer
      id={id}
      publishDate={publishDate}
      title={getAttendanceTitle()}
      isLiked={isLiked}
      likeCount={likeCount}
      onViewDetails={onViewDetails}
      onEdit={onEdit}
      onLike={onLike}
    >
      {/* Header Section */}
      <Box sx={{ mb: 3 }}>
        {/* Status and Group Row */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          {/* Status Indicators */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
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

            {/* Closed status badge */}
            {isClosed && (
              <Box
                sx={{
                  bgcolor: "warning.main",
                  color: "white",
                  borderRadius: 1.5,
                  px: 1.5,
                  py: 0.5,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <LockIcon sx={{ fontSize: "0.8rem" }} />
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.7rem",
                  }}
                >
                  סגור
                </Typography>
              </Box>
            )}
          </Box>

          {/* Group Info */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <GroupIcon
              sx={{ fontSize: 18, color: "text.secondary", opacity: 0.7 }}
            />
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontSize: "0.85rem",
                fontWeight: 500,
              }}
            >
              {groupName}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Attendance Stats Card */}
      <Box
        sx={{
          p: { xs: 2.5, sm: 3 },
          bgcolor: "rgba(76, 175, 80, 0.02)",
          borderRadius: 3,
          border: "1px solid",
          borderColor: "rgba(76, 175, 80, 0.08)",
          position: "relative",
          overflow: "hidden",
          mb: 3,
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: `linear-gradient(90deg, ${getAttendanceColor()} 0%, ${getAttendanceColor()}80 100%)`,
          },
        }}
      >
        {/* Stats Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: { xs: 2, sm: 3 },
            alignItems: "center",
          }}
        >
          {/* Attendance Percentage */}
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                color: getAttendanceColor(),
                fontSize: { xs: "2.5rem", sm: "3rem" },
                lineHeight: 1,
                mb: 0.5,
                textShadow: `0 2px 4px ${getAttendanceColor()}20`,
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

          {/* Present Count */}
          <Box sx={{ textAlign: "center" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                mb: 0.5,
              }}
            >
              <PeopleIcon sx={{ fontSize: 20, color: getAttendanceColor() }} />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                  fontSize: { xs: "1.75rem", sm: "2rem" },
                  lineHeight: 1,
                }}
              >
                {presentCount}
              </Typography>
            </Box>
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
              נוכחים
            </Typography>
          </Box>
        </Box>

        {/* Progress Bar */}
        <Box sx={{ mt: 2 }}>
          <Box
            sx={{
              width: "100%",
              height: 4,
              bgcolor: "rgba(0,0,0,0.08)",
              borderRadius: 2,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <Box
              sx={{
                width: `${attendancePercentage}%`,
                height: "100%",
                bgcolor: getAttendanceColor(),
                borderRadius: 2,
                transition: "width 0.3s ease-in-out",
                position: "relative",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
                  animation: "shimmer 2s infinite",
                },
              }}
            />
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: "text.primary",
              fontSize: "0.7rem",
              mt: 0.5,
              display: "block",
              textAlign: "center",
              fontWeight: 500,
            }}
          >
            {presentCount} מתוך {totalCount} ילדים נוכחים
          </Typography>
        </Box>
      </Box>

      {/* Additional Info Row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          bgcolor: "rgba(0,0,0,0.02)",
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            fontSize: "0.85rem",
            fontWeight: 500,
          }}
        >
          תאריך: {new Date(attendanceDate).toLocaleDateString("he-IL")}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            fontSize: "0.85rem",
            fontWeight: 500,
          }}
        >
          מורה: {teacherName}
        </Typography>
      </Box>
    </PostContainer>
  );
};

export default AttendancePost;
