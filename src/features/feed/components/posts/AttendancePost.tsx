import React from "react";
import {
  Box,
  Typography,
  Avatar,
  Chip,
} from "@mui/material";
import { People } from "@mui/icons-material";
import dayjs from "dayjs";
import { FeedPost as FeedPostType } from "../../../../types/posts";
import { UI_COLORS, POST_TYPE_COLORS, getChildColor, getContrastTextColor } from "../../../../config/colors";

const getStatusText = (status: string) => {
  switch (status.toLowerCase()) {
    case "present":
    case "arrived":
    case "נוכח":
      return "נוכח";
    case "late":
    case "מאחר":
      return "מאחר";
    case "absent":
    case "missing":
    case "נעדר":
      return "נעדר";
    case "sick":
    case "חולה":
      return "חולה";
    case "unreported":
    case "לא דווח":
      return "לא דווח";
    default:
      return "לא ידוע";
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "present":
    case "arrived":
    case "נוכח":
      return "success";
    case "late":
    case "מאחר":
      return "warning";
    case "absent":
    case "missing":
    case "נעדר":
    case "sick":
    case "חולה":
      return "error";
    case "unreported":
    case "לא דווח":
      return "default";
    default:
      return "default";
  }
};

interface AttendancePostProps {
  post: FeedPostType;
}

const AttendancePost: React.FC<AttendancePostProps> = ({ post }) => {
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

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return "#4CAF50"; // Green for high attendance
    if (percentage >= 75) return "#FF9800"; // Orange for medium attendance
    return "#F44336"; // Red for low attendance
  };

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

    return labels.heb[label]; // Default to Hebrew for now
  };

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
            md: "repeat(auto-fit, minmax(300px, 1fr))", // Better desktop spacing
          },
          gap: { xs: 1, sm: 1.5, md: 2 },
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
          gridTemplateColumns: {
            xs: "repeat(auto-fit, minmax(120px, 1fr))",
            sm: "repeat(auto-fit, minmax(140px, 1fr))",
            md: "repeat(auto-fit, minmax(160px, 1fr))",
          },
          gap: { xs: 1.5, sm: 2, md: 2.5 },
          mt: 3,
        }}
      >
        <Box
          sx={{
            bgcolor: "success.light",
            color: "success.contrastText",
            borderRadius: 2,
            p: { xs: 2, sm: 2.5 },
            textAlign: "center",
            border: "1px solid",
            borderColor: "success.main",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
            },
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "1.75rem", sm: "2rem" },
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
          mt: 3,
          p: { xs: 2.5, sm: 3 },
          borderRadius: 3,
          background: `linear-gradient(135deg, ${getAttendanceColor(
            attendancePercentage
          )} 0%, ${getAttendanceColor(attendancePercentage)}80 100%)`,
          color: "white",
          textAlign: "center",
          border: "1px solid",
          borderColor: getAttendanceColor(attendancePercentage),
          position: "relative",
          overflow: "hidden",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: `0 8px 20px ${getAttendanceColor(
              attendancePercentage
            )}40`,
          },
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: `linear-gradient(90deg, ${getAttendanceColor(
              attendancePercentage
            )} 0%, ${getAttendanceColor(attendancePercentage)}80 100%)`,
          },
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            fontSize: { xs: "2.5rem", sm: "3rem", md: "3.5rem" },
            lineHeight: 1,
            mb: 1,
            textShadow: `0 2px 4px ${getAttendanceColor(
              attendancePercentage
            )}40`,
          }}
        >
          {attendancePercentage}%
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            fontSize: { xs: "1rem", sm: "1.125rem" },
            textTransform: "uppercase",
            letterSpacing: 1,
            opacity: 0.9,
          }}
        >
          אחוז נוכחות
        </Typography>
        <Typography
          variant="body2"
          sx={{
            mt: 1,
            opacity: 0.8,
            fontSize: { xs: "0.875rem", sm: "1rem" },
          }}
        >
          {arrivedCount} מתוך {totalCount} ילדים נוכחים
        </Typography>
      </Box>
    </Box>
  );
};

export default AttendancePost;
