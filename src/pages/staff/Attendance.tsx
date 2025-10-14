import React, { useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Lock as LockIcon,
  KeyboardArrowRight as ArrowRightIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAttendance } from "../../contexts/AttendanceContext";
import { useApp } from "../../contexts/AppContext";
import DailyAttendance from "../../shared/components/ui/DailyAttendance";
import { ROUTES } from "../../config/routes";
import MobileLayout from "../../shared/components/layout/MobileLayout";

const Attendance = () => {
  const { user } = useApp();
  const { attendanceData, isAttendanceClosed, fetchAttendance, isLoading } =
    useAttendance();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Load attendance data when component mounts
  useEffect(() => {
    if (user?.groupId) {
      const today = new Date().toISOString().split("T")[0];
      fetchAttendance(user.groupId, today);
    }
  }, [user?.groupId, fetchAttendance]);

  // Check if attendance is closed (either from context or attendance data)
  const isAttendanceClosedComputed =
    isAttendanceClosed || attendanceData?.isClosed || false;

  const handleGoBack = () => {
    navigate(ROUTES.DASHBOARD);
  };

  const getGroupName = () => {
    if (attendanceData?.groupName && attendanceData?.accountName) {
      return `${attendanceData.groupName} - ${attendanceData.accountName}`;
    } else if (attendanceData?.groupName) {
      return attendanceData.groupName;
    }
    return "קבוצה לא ידועה";
  };

  // Show closed status page
  if (isAttendanceClosedComputed) {
    return (
      <MobileLayout showBottomNav={false}>
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "background.default",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            height: { xs: "100dvh", sm: "100vh" }, // Use dynamic viewport height on mobile
            overflow: "hidden",
          }}
        >
          {/* Sticky Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              p: isMobile ? 2 : 4,
              pb: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
              bgcolor: "background.default",
              zIndex: 10,
              backdropFilter: "blur(10px)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              borderRadius: "0 0 12px 12px",
              // Add safe area insets for mobile
              paddingTop: {
                xs: "calc(2rem + env(safe-area-inset-top))",
                sm: "2rem",
              },
              paddingLeft: {
                xs: "calc(2rem + env(safe-area-inset-left))",
                sm: "2rem",
              },
              paddingRight: {
                xs: "calc(2rem + env(safe-area-inset-right))",
                sm: "2rem",
              },
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                flex: 1,
                textAlign: "center",
                background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 1px 2px rgba(0,0,0,0.1)",
              }}
            >
              נוכחות יומית - {getGroupName()}
            </Typography>
          </Box>

          {/* Scrollable Content */}
          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              p: isMobile ? 2 : 4,
              // Add safe area insets for mobile
              paddingBottom: {
                xs: "calc(2rem + env(safe-area-inset-bottom))",
                sm: "2rem",
              },
              paddingLeft: {
                xs: "calc(2rem + env(safe-area-inset-left))",
                sm: "2rem",
              },
              paddingRight: {
                xs: "calc(2rem + env(safe-area-inset-right))",
                sm: "2rem",
              },
            }}
          >
            {/* Main Content */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                py: 4,
                minHeight: "100%",
              }}
            >
              {/* Lock Icon */}
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  bgcolor: "warning.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 3,
                  boxShadow: "0 8px 32px rgba(255, 152, 0, 0.3)",
                }}
              >
                <LockIcon
                  sx={{
                    fontSize: 50,
                    color: "white",
                  }}
                />
              </Box>

              {/* Status Badge */}
              <Box
                sx={{
                  bgcolor: "warning.main",
                  color: "white",
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  mb: 3,
                  boxShadow: "0 4px 12px rgba(255, 152, 0, 0.2)",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  נוכחות נסגרה
                </Typography>
              </Box>

              {/* Title */}
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                  mb: 2,
                  fontSize: { xs: "1.5rem", sm: "2rem" },
                }}
              >
                נוכחות היום נסגרה
              </Typography>

              {/* Description */}
              <Typography
                variant="body1"
                sx={{
                  color: "text.secondary",
                  mb: 4,
                  maxWidth: 500,
                  lineHeight: 1.6,
                  fontSize: { xs: "1rem", sm: "1.1rem" },
                }}
              >
                נוכחות היום נסגרה על ידי הצוות. לא ניתן עוד לעדכן נתוני נוכחות
                ליום זה.
              </Typography>

              {/* Info Card */}
              <Box
                sx={{
                  bgcolor: "background.paper",
                  borderRadius: 3,
                  p: 3,
                  mb: 4,
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  maxWidth: 400,
                  width: "100%",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: "text.primary",
                    mb: 2,
                  }}
                >
                  פרטי הנוכחות
                </Typography>
                <Box sx={{ textAlign: "right" }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      mb: 1,
                    }}
                  >
                    <strong>קבוצה:</strong> {getGroupName()}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      mb: 1,
                    }}
                  >
                    <strong>תאריך:</strong>{" "}
                    {new Date().toLocaleDateString("he-IL")}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                    }}
                  >
                    <strong>סטטוס:</strong> נסגר
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </MobileLayout>
    );
  }

  // Show regular attendance component if not closed
  // Note: DailyAttendance component handles its own loading state with skeleton animations

  return (
    <MobileLayout showBottomNav={true}>
      <DailyAttendance />
    </MobileLayout>
  );
};

export default Attendance;
