import React from "react";
import { Box, Typography, Chip, Avatar } from "@mui/material";
import { Bedtime, People } from "@mui/icons-material";
import { FeedPost as FeedPostType } from "../../../types/posts";
import SleepTimer from "../../../shared/components/ui/SleepTimer";
import dayjs from "dayjs";
import {
  getAttendanceStatusColor,
  getSleepStatusColor,
  getChildColor,
  getContrastTextColor,
  ATTENDANCE_COLORS,
  POST_TYPE_COLORS,
  UI_COLORS,
} from "../../../config/colors";
import AttendanceChildCard from "./AttendanceChildCard";
import FoodPost from "./FoodPost";
import { useLanguage } from "../../../contexts/LanguageContext";
import { THEME_COLORS } from "../../../config/colors";

interface FeedPostProps {
  post: FeedPostType;
  isClosed?: boolean; // Add prop to indicate if sleep post is closed
}

const FeedPost: React.FC<FeedPostProps> = ({ post, isClosed = false }) => {
  const { language } = useLanguage();

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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 2,
            p: 2,
            background: POST_TYPE_COLORS.SLEEP_POST.gradient,
            color: UI_COLORS.TEXT_WHITE,
            borderRadius: 2,
          }}
        >
          <Avatar
            sx={{
              bgcolor: UI_COLORS.AVATAR_OVERLAY,
              color: UI_COLORS.TEXT_WHITE,
            }}
          >
            <Bedtime />
          </Avatar>
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: UI_COLORS.TEXT_WHITE }}
            >
              דיווח שינה - {post.groupName}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: UI_COLORS.TEXT_WHITE_90 }}
            >
              {dayjs(post.activityDate).format("DD/MM/YYYY")}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr", // Full width on mobile
              sm: "repeat(auto-fit, minmax(280px, 1fr))", // Responsive grid on larger screens
            },
            gap: { xs: 0.5, sm: 1 },
          }}
        >
          {sleepData.childrenSleepData.map((child) => {
            const childName =
              `${child.childFirstName} ${child.childLastName}`.trim();
            const childColor = getChildColor(child.childId);
            const textColor = getContrastTextColor(childColor);
            const isSleeping =
              child.status === "Sleeping" || child.status === "Asleep";

            return (
              <Box
                key={child.childId}
                sx={{
                  mb: 1,
                  border: `1px solid ${childColor}`,
                  borderRadius: 1,
                  backgroundColor: `${childColor}10`,
                  p: { xs: 1, sm: 1.5 },
                }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: childColor,
                        color: textColor,
                        fontSize: "0.875rem",
                        fontWeight: "bold",
                      }}
                    >
                      {childName.charAt(0)}
                    </Avatar>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: "text.primary",
                        maxWidth: { xs: "100%", sm: 120 },
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {childName}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      label={getStatusText(child.status)}
                      size="small"
                      color={getStatusColor(child.status) as any}
                      variant="outlined"
                      sx={{ fontSize: "0.75rem" }}
                    />
                  </Box>
                </Box>
                <Box sx={{ mt: 1 }}>
                  <SleepTimer
                    startTime={child.startTimestamp}
                    endTime={child.endTimestamp}
                    isSleeping={isSleeping}
                    activityDate={post.activityDate}
                    size="small"
                    animationIntensity="subtle"
                    showPulse={!isClosed && isSleeping}
                  />
                </Box>
                {child.comment && child.comment.trim() && (
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 1,
                      display: "block",
                      color: "text.secondary",
                      fontStyle: "italic",
                      lineHeight: 1.4,
                    }}
                  >
                    {child.comment}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>

        {/* Summary Statistics */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: 2,
            mt: 3,
          }}
        >
          <Box
            sx={{
              bgcolor: "success.light",
              color: "success.contrastText",
              borderRadius: 1,
              p: 2,
              textAlign: "center",
              border: "1px solid",
              borderColor: "success.main",
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                fontSize: "2rem",
                lineHeight: 1,
                mb: 0.5,
              }}
            >
              {sleepingCount}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              ישנים
            </Typography>
          </Box>

          <Box
            sx={{
              bgcolor: "warning.light",
              color: "warning.contrastText",
              borderRadius: 1,
              p: 2,
              textAlign: "center",
              border: "1px solid",
              borderColor: "warning.main",
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                fontSize: "2rem",
                lineHeight: 1,
                mb: 0.5,
              }}
            >
              {awakeCount}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              ערים
            </Typography>
          </Box>

          <Box
            sx={{
              bgcolor: "info.light",
              color: "info.contrastText",
              borderRadius: 1,
              p: 2,
              textAlign: "center",
              border: "1px solid",
              borderColor: "info.main",
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                fontSize: "2rem",
                lineHeight: 1,
                mb: 0.5,
              }}
            >
              {totalCount}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              סה"כ
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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 2,
            p: 2,
            background: POST_TYPE_COLORS.ATTENDANCE_POST.gradient,
            color: UI_COLORS.TEXT_WHITE,
            borderRadius: 2,
          }}
        >
          <Avatar
            sx={{
              bgcolor: UI_COLORS.AVATAR_OVERLAY,
              color: UI_COLORS.TEXT_WHITE,
            }}
          >
            <People />
          </Avatar>
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: UI_COLORS.TEXT_WHITE }}
            >
              דיווח נוכחות - {post.groupName}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: UI_COLORS.TEXT_WHITE_90 }}
            >
              {dayjs(post.activityDate).format("DD/MM/YYYY")}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr", // Full width on mobile
              sm: "repeat(auto-fit, minmax(280px, 1fr))", // Responsive grid on larger screens
            },
            gap: { xs: 0.5, sm: 1 },
          }}
        >
          {attendanceData.childrenAttendanceData.map((child) => {
            const childName =
              `${child.childFirstName} ${child.childLastName}`.trim();
            const childColor = getChildColor(child.childId);
            const textColor = getContrastTextColor(childColor);

            return (
              <Box
                key={child.childId}
                sx={{
                  mb: 1,
                  border: `1px solid ${childColor}`,
                  borderRadius: 1,
                  backgroundColor: `${childColor}10`,
                  p: { xs: 1, sm: 1.5 },
                }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: childColor,
                        color: textColor,
                        fontSize: "0.875rem",
                        fontWeight: "bold",
                      }}
                    >
                      {childName.charAt(0)}
                    </Avatar>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: "text.primary",
                        maxWidth: { xs: "100%", sm: 120 },
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {childName}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      label={getStatusText(child.status)}
                      size="small"
                      color={getStatusColor(child.status) as any}
                      variant="outlined"
                      sx={{ fontSize: "0.75rem" }}
                    />
                  </Box>
                </Box>
                {child.checkInTime && (
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 1,
                      display: "block",
                      color: "text.secondary",
                      fontSize: "0.7rem",
                    }}
                  >
                    זמן כניסה: {dayjs(child.checkInTime).format("HH:mm")}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>

        {/* Summary Statistics */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: 2,
            mt: 3,
          }}
        >
          <Box
            sx={{
              bgcolor: "success.light",
              color: "success.contrastText",
              borderRadius: 1,
              p: 2,
              textAlign: "center",
              border: "1px solid",
              borderColor: "success.main",
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                fontSize: "2rem",
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
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {getAttendanceLabel("present")}
            </Typography>
          </Box>

          {lateCount > 0 && (
            <Box
              sx={{
                bgcolor: "warning.light",
                color: "warning.contrastText",
                borderRadius: 1,
                p: 2,
                textAlign: "center",
                border: "1px solid",
                borderColor: "warning.main",
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  fontSize: "2rem",
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
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                מאחרים
              </Typography>
            </Box>
          )}

          {absentCount > 0 && (
            <Box
              sx={{
                bgcolor: "error.light",
                color: "error.contrastText",
                borderRadius: 1,
                p: 2,
                textAlign: "center",
                border: "1px solid",
                borderColor: "error.main",
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  fontSize: "2rem",
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
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                נעדרים
              </Typography>
            </Box>
          )}

          {sickCount > 0 && (
            <Box
              sx={{
                bgcolor: "error.light",
                color: "error.contrastText",
                borderRadius: 1,
                p: 2,
                textAlign: "center",
                border: "1px solid",
                borderColor: "error.main",
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  fontSize: "2rem",
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
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                חולים
              </Typography>
            </Box>
          )}

          <Box
            sx={{
              bgcolor: "info.light",
              color: "info.contrastText",
              borderRadius: 1,
              p: 2,
              textAlign: "center",
              border: "1px solid",
              borderColor: "info.main",
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                fontSize: "2rem",
                lineHeight: 1,
                mb: 0.5,
              }}
            >
              {totalCount}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              סה"כ
            </Typography>
          </Box>
        </Box>

        {/* Attendance Percentage */}
        <Box
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 1,
            bgcolor: "primary.light",
            color: "primary.contrastText",
            textAlign: "center",
            border: "1px solid",
            borderColor: "primary.main",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 0.5,
            }}
          >
            {attendancePercentage}%
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              fontSize: "0.8rem",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            אחוז נוכחות
          </Typography>
        </Box>
      </Box>
    );
  };

  const renderFoodPost = () => {
    const foodData = post.metadata.foodMetadata;
    if (!foodData) return null;

    return (
      <FoodPost
        foodEvents={foodData.foodEvents}
        groupName={post.groupName}
        activityDate={post.activityDate}
      />
    );
  };

  return (
    <Box
      sx={{
        mb: 0,
        borderBottom: "2px solid",
        borderColor: "divider",
        pb: 4,
        bgcolor: "background.paper",
        borderRadius: 2,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          transform: "translateY(-1px)",
        },
        "&:last-child": {
          borderBottom: "none",
        },
        "&:not(:last-child)": {
          mb: 2,
        },
      }}
    >
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Content */}
        {post.type === "SleepPost" && renderSleepPost()}
        {post.type === "AttendancePost" && renderAttendancePost()}
        {post.type === "FoodPost" && renderFoodPost()}
      </Box>
    </Box>
  );
};

export default FeedPost;
