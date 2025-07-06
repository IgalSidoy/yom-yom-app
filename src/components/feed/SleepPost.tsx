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
import SleepTimer from "../SleepTimer";
import { isChildSleeping } from "../../utils/sleepUtils";

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

      {/* Sleep Stats */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 3,
          bgcolor: "rgba(156, 39, 176, 0.03)",
          borderRadius: 3,
          border: "1px solid",
          borderColor: "rgba(156, 39, 176, 0.1)",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: "linear-gradient(90deg, #9C27B0 0%, #BA68C8 100%)",
          },
        }}
      >
        {/* Sleep Percentage */}
        <Box sx={{ textAlign: "center", flex: 1 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              color: "#9C27B0",
              fontSize: { xs: "2rem", sm: "2.5rem" },
              lineHeight: 1,
              mb: 0.5,
              textShadow: "0 2px 4px rgba(156, 39, 176, 0.2)",
            }}
          >
            {sleepPercentage}%
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
            ילדים ישנים
          </Typography>
        </Box>

        {/* Divider */}
        <Box
          sx={{
            width: "1px",
            height: 60,
            bgcolor: "rgba(156, 39, 176, 0.2)",
            mx: 2,
          }}
        />

        {/* Sleeping Count */}
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
            {sleepingChildren}/{totalChildren}
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
            ילדים ישנים
          </Typography>
        </Box>

        {/* Average Sleep Duration */}
        {averageSleepDuration && averageSleepDuration > 0 && (
          <>
            <Box
              sx={{
                width: "1px",
                height: 60,
                bgcolor: "rgba(156, 39, 176, 0.2)",
                mx: 2,
              }}
            />
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
                {formatDuration(averageSleepDuration)}
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
                ממוצע שינה
              </Typography>
            </Box>
          </>
        )}
      </Box>

      {/* Children Sleep Timers */}
      {children.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontSize: "0.9rem",
              fontWeight: 600,
              mb: 1,
            }}
          >
            זמני שינה:
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              alignItems: "center",
            }}
          >
            {children.map((child) => {
              const isSleeping = isChildSleeping(
                child.sleepStartTime,
                child.sleepEndTime
              );
              return (
                <Box
                  key={child.childId}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    p: 1,
                    borderRadius: 1,
                    bgcolor: isSleeping
                      ? "rgba(156, 39, 176, 0.05)"
                      : "background.paper",
                    border: "1px solid",
                    borderColor: isSleeping
                      ? "rgba(156, 39, 176, 0.2)"
                      : "divider",
                  }}
                >
                  <Avatar
                    sx={{
                      width: 24,
                      height: 24,
                      fontSize: "0.7rem",
                      bgcolor: isSleeping ? "#9C27B0" : "#ccc",
                    }}
                  >
                    {child.firstName.charAt(0)}
                  </Avatar>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      color: "text.primary",
                    }}
                  >
                    {child.firstName}
                  </Typography>
                  <SleepTimer
                    key={`${child.childId}-${id}`}
                    startTime={child.sleepStartTime || ""}
                    endTime={child.sleepEndTime}
                    isSleeping={isSleeping}
                    size="small"
                    showPulse={isSleeping}
                    animationIntensity="subtle"
                  />
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
    </PostContainer>
  );
};

export default SleepPost;
