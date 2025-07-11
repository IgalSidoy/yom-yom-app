import React from "react";
import {
  Box,
  Typography,
  Chip,
  Avatar,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { AccessTime, Group } from "@mui/icons-material";
import { FeedPost as FeedPostType } from "../../types/posts";
import SleepTimer from "../SleepTimer";
import dayjs from "dayjs";

interface FeedPostProps {
  post: FeedPostType;
}

const FeedPost: React.FC<FeedPostProps> = ({ post }) => {
  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("DD/MM/YYYY HH:mm");
  };

  const formatActivityDate = (dateString: string) => {
    return dayjs(dateString).format("DD/MM/YYYY");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present":
        return "success";
      case "Late":
        return "warning";
      case "Sick":
      case "Absent":
        return "error";
      case "Sleeping":
      case "Asleep":
        return "secondary"; // Purple for sleeping children (matches create sleep post)
      case "Awake":
        return "info"; // Blue for awake children
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
      case "Asleep":
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
    const awakeCount = sleepData.childrenSleepData.filter(
      (child) => child.status === "Awake"
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

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            מצב ילדים:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
            {sleepData.childrenSleepData.map((child) => (
              <Box
                key={child.childId}
                sx={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.5,
                  p: 1.5,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    borderColor: "primary.main",
                  },
                  ...(child.comment &&
                    child.comment.trim() && {
                      borderColor: "#9C27B0",
                      borderWidth: "2px",
                      "&:hover": {
                        borderColor: "#7B1FA2",
                      },
                    }),
                }}
              >
                <Chip
                  label={`${child.childFirstName} ${child.childLastName}`}
                  color={getStatusColor(child.status) as any}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderWidth:
                      child.status === "Sleeping" || child.status === "Asleep"
                        ? 2
                        : 1,
                    fontWeight:
                      child.status === "Sleeping" || child.status === "Asleep"
                        ? 600
                        : 400,
                    ...(child.status === "Sleeping" || child.status === "Asleep"
                      ? {
                          borderColor: "#9C27B0",
                          color: "#9C27B0",
                          "&:hover": {
                            borderColor: "#7B1FA2",
                            color: "#7B1FA2",
                            backgroundColor: "#9C27B010",
                          },
                        }
                      : {}),
                  }}
                />
                <SleepTimer
                  startTime={child.startTimestamp}
                  endTime={child.endTimestamp}
                  isSleeping={
                    child.status === "Sleeping" || child.status === "Asleep"
                  }
                  activityDate={post.activityDate}
                  size="small"
                  animationIntensity="subtle"
                  showPulse={
                    child.status === "Sleeping" || child.status === "Asleep"
                  }
                />

                {/* Modern comment indicator */}
                {child.comment && child.comment.trim() && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #9C27B0, #E1BEE7)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 8px rgba(156, 39, 176, 0.3)",
                      border: "2px solid white",
                      animation: "pulse 2s infinite",
                      "@keyframes pulse": {
                        "0%": {
                          transform: "scale(1)",
                          boxShadow: "0 2px 8px rgba(156, 39, 176, 0.3)",
                        },
                        "50%": {
                          transform: "scale(1.1)",
                          boxShadow: "0 4px 12px rgba(156, 39, 176, 0.5)",
                        },
                        "100%": {
                          transform: "scale(1)",
                          boxShadow: "0 2px 8px rgba(156, 39, 176, 0.3)",
                        },
                      },
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "white",
                        fontWeight: 600,
                        fontSize: "0.7rem",
                        lineHeight: 1,
                      }}
                    >
                      💬
                    </Typography>
                  </Box>
                )}
              </Box>
            ))}
          </Box>

          {/* Comments section - only show if there are comments */}
          {sleepData.childrenSleepData.some(
            (child) => child.comment && child.comment.trim()
          ) && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 2,
                background: "linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)",
                border: "1px solid #CE93D8",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "2px",
                  background:
                    "linear-gradient(90deg, #9C27B0, #E1BEE7, #9C27B0)",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #9C27B0, #7B1FA2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 1.5,
                    boxShadow: "0 2px 8px rgba(156, 39, 176, 0.3)",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: "white",
                      fontWeight: 600,
                      fontSize: "1rem",
                    }}
                  >
                    💬
                  </Typography>
                </Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: "#4A148C",
                    fontSize: "0.95rem",
                  }}
                >
                  הערות הצוות
                </Typography>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {sleepData.childrenSleepData
                  .filter((child) => child.comment && child.comment.trim())
                  .map((child) => (
                    <Box
                      key={child.childId}
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1,
                        p: 1.5,
                        borderRadius: 1.5,
                        bgcolor: "rgba(255, 255, 255, 0.7)",
                        border: "1px solid rgba(156, 39, 176, 0.2)",
                        backdropFilter: "blur(10px)",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          bgcolor: "rgba(255, 255, 255, 0.9)",
                          transform: "translateX(-4px)",
                          boxShadow: "0 2px 8px rgba(156, 39, 176, 0.15)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          minWidth: 40,
                          height: 40,
                          borderRadius: "50%",
                          background: `linear-gradient(135deg, ${
                            child.status === "Sleeping" ||
                            child.status === "Asleep"
                              ? "#9C27B0"
                              : "#2196F3"
                          }, ${
                            child.status === "Sleeping" ||
                            child.status === "Asleep"
                              ? "#7B1FA2"
                              : "#1976D2"
                          })`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: 600,
                          fontSize: "0.8rem",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                        }}
                      >
                        {child.childFirstName.charAt(0)}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 600,
                            color: "#4A148C",
                            mb: 0.5,
                            fontSize: "0.9rem",
                          }}
                        >
                          {child.childFirstName} {child.childLastName}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#6A1B9A",
                            fontSize: "0.85rem",
                            lineHeight: 1.5,
                            fontStyle: "italic",
                          }}
                        >
                          {child.comment}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
              </Box>
            </Box>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Group sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography
              variant="body2"
              color="secondary.main"
              sx={{
                fontWeight: 600,
                color: "#9C27B0", // Purple to match sleep theme
                fontSize: "0.9rem",
              }}
            >
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
