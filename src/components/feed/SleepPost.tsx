import React from "react";
import {
  Typography,
  Box,
  Chip,
  useTheme,
  Avatar,
  AvatarGroup,
} from "@mui/material";
import {
  Bedtime as SleepIcon,
  Group as GroupIcon,
  AccessTime as TimeIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import PostContainer from "./PostContainer";
import { SleepPost as SleepPostType } from "../../types/posts";

interface SleepPostProps extends SleepPostType {
  onViewDetails?: (id: string) => void;
  onEdit?: (id: string) => void;
  onLike?: (id: string) => void;
}

const SleepPost: React.FC<SleepPostProps> = ({
  id,
  title,
  groupName,
  sleepDate,
  children,
  totalChildren,
  sleepingChildren,
  averageSleepDuration,
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
      case "active":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "completed":
        return "הושלם";
      case "active":
        return "פעיל";
      default:
        return "לא ידוע";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return <SleepIcon sx={{ color: theme.palette.success.main }} />;
      case "active":
        return <SleepIcon sx={{ color: theme.palette.warning.main }} />;
      default:
        return <SleepIcon />;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}ש${mins > 0 ? ` ${mins}ד` : ""}`;
  };

  const sleepPercentage =
    totalChildren > 0
      ? Math.round((sleepingChildren / totalChildren) * 100)
      : 0;

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

      {/* Sleep Stats */}
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
          mb: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#9C27B0", // Purple color for sleep
              fontSize: "1.5rem",
              lineHeight: 1,
            }}
          >
            {sleepPercentage}%
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontSize: "0.7rem",
            }}
          >
            ילדים ישנים
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
            {sleepingChildren}/{totalChildren}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontSize: "0.7rem",
            }}
          >
            ילדים ישנים
          </Typography>
        </Box>

        {averageSleepDuration && (
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
              {formatDuration(averageSleepDuration)}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontSize: "0.7rem",
              }}
            >
              ממוצע שינה
            </Typography>
          </Box>
        )}
      </Box>

      {/* Children Avatars */}
      {children.length > 0 && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontSize: "0.8rem",
              fontWeight: 500,
            }}
          >
            ילדים ישנים:
          </Typography>
          <AvatarGroup
            max={5}
            sx={{
              "& .MuiAvatar-root": {
                width: 28,
                height: 28,
                fontSize: "0.75rem",
                border: "2px solid white",
              },
            }}
          >
            {children.slice(0, 5).map((child) => (
              <Avatar
                key={child.childId}
                sx={{
                  bgcolor: "#9C27B0",
                  fontSize: "0.7rem",
                }}
              >
                {child.firstName.charAt(0)}
              </Avatar>
            ))}
          </AvatarGroup>
          {children.length > 5 && (
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontSize: "0.7rem",
              }}
            >
              +{children.length - 5}
            </Typography>
          )}
        </Box>
      )}
    </PostContainer>
  );
};

export default SleepPost;
