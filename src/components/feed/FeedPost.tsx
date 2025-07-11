import React from "react";
import {
  Box,
  Typography,
  Chip,
  Avatar,
  Card,
  CardContent,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Favorite,
  FavoriteBorder,
  Visibility,
  Edit,
  AccessTime,
  Group,
} from "@mui/icons-material";
import { FeedPost as FeedPostType } from "../../types/posts";
import dayjs from "dayjs";

interface FeedPostProps {
  post: FeedPostType;
  onViewDetails?: (id: string) => void;
  onEdit?: (id: string) => void;
  onLike?: (id: string) => void;
  canEdit?: boolean;
}

const FeedPost: React.FC<FeedPostProps> = ({
  post,
  onViewDetails,
  onEdit,
  onLike,
  canEdit = false,
}) => {
  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("DD/MM/YYYY HH:mm");
  };

  const formatActivityDate = (dateString: string) => {
    return dayjs(dateString).format("DD/MM/YYYY");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present":
      case "Sleeping":
        return "success";
      case "Late":
        return "warning";
      case "Sick":
      case "Absent":
      case "Awake":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "Present":
        return "נוכח";
      case "Late":
        return "מאחר";
      case "Sick":
        return "חולה";
      case "Absent":
        return "נעדר";
      case "Sleeping":
        return "ישן";
      case "Awake":
        return "ער";
      default:
        return status;
    }
  };

  const renderSleepPost = () => {
    const sleepData = post.metadata.sleepMetadata;
    if (!sleepData) return null;

    const sleepingCount = sleepData.childrenSleepData.filter(
      (child) => child.status === "Sleeping" || child.status === "Asleep"
    ).length;
    const totalCount = sleepData.childrenSleepData.length;

    return (
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Chip
            label="דיווח שינה"
            color="primary"
            size="small"
            sx={{ mr: 1 }}
          />
          <Typography variant="body2" color="text.secondary">
            {formatActivityDate(post.activityDate)}
          </Typography>
        </Box>

        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          {post.title}
        </Typography>

        <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
          {post.description}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            מצב ילדים:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {sleepData.childrenSleepData.map((child) => (
              <Chip
                key={child.childId}
                label={`${child.childFirstName} ${child.childLastName}`}
                color={getStatusColor(child.status) as any}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Group sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary">
              {sleepingCount}/{totalCount} ישנים
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  const renderAttendancePost = () => {
    const attendanceData = post.metadata.attendanceMetadata;
    if (!attendanceData) return null;

    const presentCount = attendanceData.childrenAttendanceData.filter(
      (child) => child.status === "Present"
    ).length;
    const lateCount = attendanceData.childrenAttendanceData.filter(
      (child) => child.status === "Late"
    ).length;
    const totalCount = attendanceData.childrenAttendanceData.length;

    return (
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Chip
            label="דיווח נוכחות"
            color="secondary"
            size="small"
            sx={{ mr: 1 }}
          />
          <Typography variant="body2" color="text.secondary">
            {formatActivityDate(post.activityDate)}
          </Typography>
        </Box>

        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          {post.title}
        </Typography>

        <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
          {post.description}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            מצב ילדים:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {attendanceData.childrenAttendanceData.map((child) => (
              <Chip
                key={child.childId}
                label={`${child.childFirstName} ${child.childLastName}`}
                color={getStatusColor(child.status) as any}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Group sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary">
              {presentCount + lateCount}/{totalCount} נוכחים
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Card
      sx={{
        mb: 2,
        borderRadius: 2,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: "primary.main",
              mr: 2,
            }}
          >
            {post.groupName.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {post.groupName}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AccessTime sx={{ fontSize: 14, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">
                {formatDate(post.created)}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            {onViewDetails && (
              <Tooltip title="צפה בפרטים">
                <IconButton
                  size="small"
                  onClick={() => onViewDetails(post.id)}
                  sx={{ color: "primary.main" }}
                >
                  <Visibility />
                </IconButton>
              </Tooltip>
            )}
            {canEdit && onEdit && (
              <Tooltip title="ערוך">
                <IconButton
                  size="small"
                  onClick={() => onEdit(post.id)}
                  sx={{ color: "secondary.main" }}
                >
                  <Edit />
                </IconButton>
              </Tooltip>
            )}
            {onLike && (
              <Tooltip title="אהבתי">
                <IconButton
                  size="small"
                  onClick={() => onLike(post.id)}
                  sx={{ color: "error.main" }}
                >
                  {post.isRead ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Content */}
        {post.type === "SleepPost" && renderSleepPost()}
        {post.type === "AttendancePost" && renderAttendancePost()}
      </CardContent>
    </Card>
  );
};

export default FeedPost;
