import React from "react";
import { Box, Typography, Chip, Avatar, Divider } from "@mui/material";
import { AccessTime, Group, Lock } from "@mui/icons-material";
import { FeedPost as FeedPostType } from "../../types/posts";
import SleepTimer from "../SleepTimer";
import dayjs from "dayjs";
import {
  getAttendanceStatusColor,
  getSleepStatusColor,
  getChildColor,
  getContrastTextColor,
  ATTENDANCE_COLORS,
} from "../../config/colors";
import AttendanceChildCard from "./AttendanceChildCard";
import { useLanguage } from "../../contexts/LanguageContext";
import { THEME_COLORS } from "../../config/colors";

interface FeedPostProps {
  post: FeedPostType;
  isClosed?: boolean; // Add prop to indicate if sleep post is closed
}

const FeedPost: React.FC<FeedPostProps> = ({ post, isClosed = false }) => {
  const { language } = useLanguage();

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("DD/MM/YYYY HH:mm");
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
    const statusLabels = {
      heb: {
        Present: "נוכח",
        Arrived: "נוכח",
        Late: "מאחר",
        Sick: "חולה",
        Absent: "נעדר",
        Missing: "נעדר",
        Sleeping: "ישן",
        Asleep: "ישן",
        Awake: "ער",
        Vacation: "חופשה",
        Unreported: "לא דווח",
      },
      rus: {
        Present: "Присутствует",
        Arrived: "Присутствует",
        Late: "Опоздал",
        Sick: "Болен",
        Absent: "Отсутствует",
        Missing: "Отсутствует",
        Sleeping: "Спит",
        Asleep: "Спит",
        Awake: "Бодрствует",
        Vacation: "Отпуск",
        Unreported: "Не сообщено",
      },
      eng: {
        Present: "Present",
        Arrived: "Present",
        Late: "Late",
        Sick: "Sick",
        Absent: "Absent",
        Missing: "Absent",
        Sleeping: "Sleeping",
        Asleep: "Sleeping",
        Awake: "Awake",
        Vacation: "Vacation",
        Unreported: "Unreported",
      },
    };

    return (statusLabels[language] as any)[status] || status;
  };

  const getPostTypeLabel = () => {
    const postTypeLabels = {
      heb: {
        SleepPost: "דיווח שינה",
        AttendancePost: "דיווח נוכחות",
        default: "פוסט",
      },
      rus: {
        SleepPost: "Отчет о сне",
        AttendancePost: "Отчет о посещаемости",
        default: "Пост",
      },
      eng: {
        SleepPost: "Sleep Report",
        AttendancePost: "Attendance Report",
        default: "Post",
      },
    };

    return (
      postTypeLabels[language][post.type] || postTypeLabels[language].default
    );
  };

  const getPostTypeColor = () => {
    switch (post.type) {
      case "SleepPost":
        return "primary";
      case "AttendancePost":
        return "secondary";
      default:
        return "default";
    }
  };

  // Translation mapping for attendance post titles
  const getAttendancePostTitle = (originalTitle: string) => {
    // Simple translation mapping for attendance post titles
    const attendanceTitles = {
      heb: "נוכחות יומית",
      rus: "Ежедневная посещаемость",
      eng: "Daily Attendance",
    };

    // Always return the translated title for attendance posts
    return attendanceTitles[language] || attendanceTitles.eng;
  };

  // Translation mapping for attendance labels
  const getAttendanceLabel = (
    label: "attendance" | "present" | "childrenStatus" | "closed"
  ) => {
    const labels = {
      heb: {
        attendance: "נוכחות",
        present: "נוכחים",
        childrenStatus: "מצב ילדים",
        closed: "נסגר",
      },
      rus: {
        attendance: "Посещаемость",
        present: "Присутствуют",
        childrenStatus: "Статус детей",
        closed: "Закрыто",
      },
      eng: {
        attendance: "Attendance",
        present: "Present",
        childrenStatus: "Children Status",
        closed: "Closed",
      },
    };

    return labels[language][label];
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
                  borderColor: isClosed ? "grey.300" : "divider",
                  bgcolor: isClosed ? "grey.50" : "background.paper",
                  transition: "all 0.2s ease-in-out",
                  opacity: isClosed ? 0.8 : 1,
                  "&:hover": {
                    transform: isClosed ? "none" : "translateY(-2px)",
                    boxShadow: isClosed ? "none" : "0 4px 12px rgba(0,0,0,0.1)",
                    borderColor: isClosed ? "grey.300" : "primary.main",
                  },
                  ...(child.comment &&
                    child.comment.trim() && {
                      borderColor: isClosed ? "grey.400" : "#9C27B0",
                      borderWidth: "2px",
                      "&:hover": {
                        borderColor: isClosed ? "grey.400" : "#7B1FA2",
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
                    opacity: isClosed ? 0.7 : 1,
                    ...(child.status === "Sleeping" || child.status === "Asleep"
                      ? {
                          borderColor: isClosed ? "grey.400" : "#9C27B0",
                          color: isClosed ? "grey.600" : "#9C27B0",
                          "&:hover": {
                            borderColor: isClosed ? "grey.400" : "#7B1FA2",
                            color: isClosed ? "grey.600" : "#7B1FA2",
                            backgroundColor: isClosed
                              ? "transparent"
                              : "#9C27B010",
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
                    !isClosed &&
                    (child.status === "Sleeping" || child.status === "Asleep")
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
                      background: isClosed
                        ? "linear-gradient(135deg, #9E9E9E, #BDBDBD)"
                        : "linear-gradient(135deg, #9C27B0, #E1BEE7)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: isClosed
                        ? "0 2px 8px rgba(158, 158, 158, 0.3)"
                        : "0 2px 8px rgba(156, 39, 176, 0.3)",
                      border: "2px solid white",
                      animation: isClosed ? "none" : "pulse 2s infinite",
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
                background: isClosed
                  ? "linear-gradient(135deg, #F5F5F5 0%, #E0E0E0 100%)"
                  : "linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)",
                border: `1px solid ${isClosed ? "#BDBDBD" : "#CE93D8"}`,
                position: "relative",
                overflow: "hidden",
                opacity: isClosed ? 0.8 : 1,
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "2px",
                  background: isClosed
                    ? "linear-gradient(90deg, #9E9E9E, #BDBDBD, #9E9E9E)"
                    : "linear-gradient(90deg, #9C27B0, #E1BEE7, #9C27B0)",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: isClosed
                      ? "linear-gradient(135deg, #9E9E9E, #757575)"
                      : "linear-gradient(135deg, #9C27B0, #7B1FA2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 1.5,
                    boxShadow: isClosed
                      ? "0 2px 8px rgba(158, 158, 158, 0.3)"
                      : "0 2px 8px rgba(156, 39, 176, 0.3)",
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
                    color: isClosed ? "#616161" : "#4A148C",
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
                        bgcolor: isClosed
                          ? "rgba(255, 255, 255, 0.5)"
                          : "rgba(255, 255, 255, 0.7)",
                        border: `1px solid ${
                          isClosed
                            ? "rgba(158, 158, 158, 0.2)"
                            : "rgba(156, 39, 176, 0.2)"
                        }`,
                        backdropFilter: "blur(10px)",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          bgcolor: isClosed
                            ? "rgba(255, 255, 255, 0.6)"
                            : "rgba(255, 255, 255, 0.9)",
                          transform: isClosed ? "none" : "translateX(-4px)",
                          boxShadow: isClosed
                            ? "none"
                            : "0 2px 8px rgba(156, 39, 176, 0.15)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          minWidth: 40,
                          height: 40,
                          borderRadius: "50%",
                          background: isClosed
                            ? "linear-gradient(135deg, #9E9E9E, #757575)"
                            : `linear-gradient(135deg, ${
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
                          opacity: isClosed ? 0.7 : 1,
                        }}
                      >
                        {child.childFirstName.charAt(0)}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 600,
                            color: isClosed ? "#616161" : "#4A148C",
                            mb: 0.5,
                            fontSize: "0.9rem",
                          }}
                        >
                          {child.childFirstName} {child.childLastName}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: isClosed ? "#757575" : "#6A1B9A",
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
                color: isClosed ? "#9E9E9E" : "#9C27B0", // Gray when closed, purple when open
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

    // Count by actual status values (case-insensitive and handle multiple possible values)
    const arrivedCount = attendanceData.childrenAttendanceData.filter(
      (child) => {
        const status = child.status.toLowerCase();
        return (
          status === "present" || status === "arrived" || status === "נוכח"
        );
      }
    ).length;
    const lateCount = attendanceData.childrenAttendanceData.filter((child) => {
      const status = child.status.toLowerCase();
      return status === "late" || status === "מאחר";
    }).length;
    const absentCount = attendanceData.childrenAttendanceData.filter(
      (child) => {
        const status = child.status.toLowerCase();
        return status === "absent" || status === "missing" || status === "נעדר";
      }
    ).length;
    const sickCount = attendanceData.childrenAttendanceData.filter((child) => {
      const status = child.status.toLowerCase();
      return status === "sick" || status === "חולה";
    }).length;
    const unreportedCount = attendanceData.childrenAttendanceData.filter(
      (child) => {
        const status = child.status.toLowerCase();
        return status === "unreported" || status === "לא דווח";
      }
    ).length;
    const totalCount = attendanceData.childrenAttendanceData.length;

    const attendancePercentage =
      totalCount > 0 ? Math.round((arrivedCount / totalCount) * 100) : 0;

    return (
      <Box>
        {/* Modern Status Overview */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
            gap: 1,
            mb: 3,
          }}
        >
          {/* Present */}
          <Box
            sx={{
              bgcolor: "success.light",
              color: "success.contrastText",
              borderRadius: 2,
              p: 1.5,
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                bgcolor: "success.main",
              },
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                fontSize: "1.8rem",
                lineHeight: 1,
                mb: 0.5,
              }}
            >
              {arrivedCount}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {getAttendanceLabel("present")}
            </Typography>
          </Box>

          {/* Late */}
          {lateCount > 0 && (
            <Box
              sx={{
                bgcolor: "warning.light",
                color: "warning.contrastText",
                borderRadius: 2,
                p: 1.5,
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  bgcolor: "warning.main",
                },
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  fontSize: "1.8rem",
                  lineHeight: 1,
                  mb: 0.5,
                }}
              >
                {lateCount}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                מאחרים
              </Typography>
            </Box>
          )}

          {/* Absent */}
          {absentCount > 0 && (
            <Box
              sx={{
                bgcolor: "error.light",
                color: "error.contrastText",
                borderRadius: 2,
                p: 1.5,
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  bgcolor: "error.main",
                },
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  fontSize: "1.8rem",
                  lineHeight: 1,
                  mb: 0.5,
                }}
              >
                {absentCount}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                נעדרים
              </Typography>
            </Box>
          )}

          {/* Sick */}
          {sickCount > 0 && (
            <Box
              sx={{
                bgcolor: "info.light",
                color: "info.contrastText",
                borderRadius: 2,
                p: 1.5,
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  bgcolor: "info.main",
                },
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  fontSize: "1.8rem",
                  lineHeight: 1,
                  mb: 0.5,
                }}
              >
                {sickCount}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                חולים
              </Typography>
            </Box>
          )}

          {/* Unreported */}
          {unreportedCount > 0 && (
            <Box
              sx={{
                bgcolor: "grey.300",
                color: "grey.700",
                borderRadius: 2,
                p: 1.5,
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  bgcolor: "grey.500",
                },
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  fontSize: "1.8rem",
                  lineHeight: 1,
                  mb: 0.5,
                }}
              >
                {unreportedCount}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                לא דווח
              </Typography>
            </Box>
          )}
        </Box>

        {/* Summary Bar */}
        <Box
          sx={{
            bgcolor: "background.paper",
            borderRadius: 2,
            p: 2,
            mb: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
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
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: "text.primary",
              }}
            >
              סה"כ נוכחות
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: THEME_COLORS.PRIMARY,
              }}
            >
              {attendancePercentage}%
            </Typography>
          </Box>
          <Box
            sx={{
              width: "100%",
              height: 8,
              bgcolor: "grey.200",
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                width: `${attendancePercentage}%`,
                height: "100%",
                bgcolor: THEME_COLORS.PRIMARY,
                borderRadius: 4,
                transition: "width 0.3s ease",
              }}
            />
          </Box>
        </Box>

        {/* Children Section */}
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              mb: 2,
              fontWeight: 600,
              color: "text.primary",
              fontSize: "1rem",
            }}
          >
            ילדים נוכחים:
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: 1.5,
            }}
          >
            {attendanceData.childrenAttendanceData.map((child) => (
              <AttendanceChildCard
                key={child.childId}
                child={child}
                isClosed={isClosed}
                getStatusText={getStatusText}
              />
            ))}
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        mb: 0,
        borderBottom: "1px solid",
        borderColor: "divider",
        pb: 3,
        bgcolor: "background.paper",
        "&:last-child": {
          borderBottom: "none",
        },
      }}
    >
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
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
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {post.groupName}
              </Typography>
              <Chip
                label={getPostTypeLabel()}
                color={getPostTypeColor() as any}
                size="small"
                sx={{ fontSize: "0.7rem", height: 20 }}
              />
              {/* Closed status badge - simplified */}
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
                  <Lock sx={{ fontSize: "0.8rem" }} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.7rem",
                    }}
                  >
                    {getAttendanceLabel("closed")}
                  </Typography>
                </Box>
              )}
            </Box>
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
      </Box>
    </Box>
  );
};

export default FeedPost;
