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
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAttendance } from "../../contexts/AttendanceContext";
import { useApp } from "../../contexts/AppContext";
import DailyAttendance from "../../components/DailyAttendance";
import { ROUTES } from "../../config/routes";

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
          height: "100vh",
          overflow: "auto",
          p: isMobile ? 2 : 4,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 3,
            pb: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Button
            variant="outlined"
            onClick={handleGoBack}
            startIcon={<ArrowBackIcon />}
            sx={{
              borderColor: "primary.main",
              color: "primary.main",
              "&:hover": {
                borderColor: "primary.dark",
                bgcolor: "primary.main",
                color: "white",
              },
            }}
          >
            חזור
          </Button>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              flex: 1,
            }}
          >
            נוכחות יומית - {getGroupName()}
          </Typography>
        </Box>

        {/* Main Content */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            py: 4,
          }}
        >
          {/* Lock Icon */}
          <Box
            sx={{
              width: 120,
              height: 120,
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
                fontSize: 60,
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
            נוכחות היום נסגרה על ידי הצוות. לא ניתן עוד לעדכן נתוני נוכחות ליום
            זה.
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
                <strong>תאריך:</strong> {new Date().toLocaleDateString("he-IL")}
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

          {/* Navigation Buttons */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
              width: "100%",
              maxWidth: 400,
            }}
          >
            <Button
              variant="outlined"
              onClick={handleGoBack}
              fullWidth
              sx={{
                borderColor: "primary.main",
                color: "primary.main",
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
                borderRadius: 2,
                "&:hover": {
                  borderColor: "primary.dark",
                  bgcolor: "primary.main",
                  color: "white",
                },
              }}
            >
              חזור לדשבורד
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  // Show regular attendance component if not closed
  if (isLoading) {
    return (
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
          height: "100vh",
          overflow: "auto",
          p: isMobile ? 2 : 4,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 3,
            pb: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Button
            variant="outlined"
            onClick={handleGoBack}
            startIcon={<ArrowBackIcon />}
            sx={{
              borderColor: "primary.main",
              color: "primary.main",
              "&:hover": {
                borderColor: "primary.dark",
                bgcolor: "primary.main",
                color: "white",
              },
            }}
          >
            חזור
          </Button>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              flex: 1,
            }}
          >
            נוכחות יומית
          </Typography>
        </Box>

        {/* Loading Content */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            py: 4,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "text.secondary",
              mb: 2,
            }}
          >
            טוען נתוני נוכחות...
          </Typography>
        </Box>
      </Box>
    );
  }

  return <DailyAttendance />;
};

export default Attendance;
