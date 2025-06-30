import React, { useState, useEffect, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  Paper,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  PeopleAlt as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Notifications as NotificationsIcon,
  ArrowForward as ArrowForwardIcon,
  Today as TodayIcon,
  Group as GroupIcon,
  AccountCircle as AccountIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../contexts/AppContext";
import { useAttendance } from "../../contexts/AttendanceContext";
import { ApiAttendanceStatus } from "../../types/attendance";

const StaffDashboard: React.FC = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const theme = useTheme();
  const { attendanceData } = useAttendance();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = useMemo(() => {
    if (!attendanceData?.children) {
      return {
        present: 0,
        late: 0,
        absent: 0,
        attendancePercentage: 0,
        total: 0,
      };
    }

    const total = attendanceData.children.length;
    const present = attendanceData.children.filter(
      (child) => child.status === ApiAttendanceStatus.ARRIVED
    ).length;
    const late = attendanceData.children.filter(
      (child) => child.status === ApiAttendanceStatus.LATE
    ).length;
    const absent = attendanceData.children.filter(
      (child) => child.status === ApiAttendanceStatus.MISSING
    ).length;

    const attendancePercentage =
      total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    return {
      present,
      late,
      absent,
      attendancePercentage,
      total,
    };
  }, [attendanceData]);

  const handleStartAttendance = () => {
    navigate("/attendance");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("he-IL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getGreeting = (time: Date) => {
    const hour = time.getHours();
    if (hour < 12) return "בוקר טוב";
    if (hour < 18) return "צהריים טובים";
    return "ערב טוב";
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        p: 2,
        dir: "rtl",
        overflow: "hidden", // Prevent scroll during swipe
        "& .dashboard-swiper": {
          "& .swiper-pagination": {
            bottom: "10px",
            "& .swiper-pagination-bullet": {
              width: "10px",
              height: "10px",
              backgroundColor: theme.palette.grey[300],
              opacity: 1,
              margin: "0 4px",
              transition: "all 0.3s ease",
              "&.swiper-pagination-bullet-active": {
                backgroundColor: theme.palette.primary.main,
                transform: "scale(1.3)",
                boxShadow: `0 0 8px ${theme.palette.primary.main}40`,
              },
            },
          },
          "& .swiper-button-next, & .swiper-button-prev": {
            color: theme.palette.primary.main,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            "&:after": {
              fontSize: "16px",
              fontWeight: "bold",
            },
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 1)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            },
          },
          "& .swiper-button-next": {
            right: "10px",
          },
          "& .swiper-button-prev": {
            left: "10px",
          },
        },
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                mb: 0.5,
                fontSize: { xs: "1.5rem", sm: "2rem" },
              }}
            >
              {getGreeting(currentTime)}, {user?.firstName}!
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
            >
              {formatDate(currentTime)}
            </Typography>
          </Box>
          <Box
            sx={{
              textAlign: "center",
              p: 1.5,
              borderRadius: 2,
              bgcolor: "primary.main",
              color: "white",
              minWidth: 70,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1rem" }}>
              {formatTime(currentTime)}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              שעה נוכחית
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Swipeable Content */}
      <Swiper
        spaceBetween={30}
        slidesPerView={1}
        autoplay={{
          delay: 8000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: false,
        }}
        navigation={true}
        modules={[Pagination, Navigation, Autoplay]}
        className="dashboard-swiper"
        style={{
          paddingBottom: "40px", // Space for pagination
        }}
      >
        <SwiperSlide>
          {/* Section 1: Quick Actions */}
          <Box sx={{ width: "100%", flexShrink: 0 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                mb: 2,
                color: "text.primary",
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
              }}
            >
              פעולות מהירות
            </Typography>

            {/* Start Attendance Card */}
            <Card
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: "white",
                cursor: "pointer",
                transition: "all 0.3s ease",
                mb: 2,
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                },
              }}
              onClick={handleStartAttendance}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: "rgba(255,255,255,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <PeopleIcon sx={{ fontSize: 28 }} />
                  </Box>
                  <IconButton
                    sx={{
                      color: "white",
                      "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                    }}
                  >
                    <ArrowForwardIcon />
                  </IconButton>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  התחל נוכחות יומית
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1.5 }}>
                  סמן את נוכחות הילדים לקבוצה שלך היום
                </Typography>
                <Chip
                  label="מומלץ להתחיל עכשיו"
                  size="small"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                    fontWeight: 500,
                  }}
                />
              </CardContent>
            </Card>

            {/* Group Info Card */}
            <Card
              sx={{
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                transition: "all 0.3s ease",
                mb: 3,
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      bgcolor: "secondary.main",
                      color: "white",
                      mr: 2,
                    }}
                  >
                    <GroupIcon />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      מידע על הקבוצה
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      פרטי הקבוצה שלך
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 1.5 }} />
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <AccountIcon
                      sx={{ fontSize: 18, color: "text.secondary", mr: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {user?.groupId ? "קבוצה מוגדרת" : "לא הוגדרה קבוצה"}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <TodayIcon
                      sx={{ fontSize: 18, color: "text.secondary", mr: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(currentTime)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </SwiperSlide>

        <SwiperSlide>
          {/* Section 2: Statistics */}
          <Box sx={{ width: "100%", flexShrink: 0 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                mb: 2,
                color: "text.primary",
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
              }}
            >
              סטטיסטיקות יומיות
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr" },
                gap: 2,
                mb: 3,
              }}
            >
              <Paper
                sx={{
                  p: 2,
                  textAlign: "center",
                  borderRadius: 2,
                  bgcolor: "success.light",
                  color: "white",
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {stats.present}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  נוכחים היום
                </Typography>
              </Paper>

              <Paper
                sx={{
                  p: 2,
                  textAlign: "center",
                  borderRadius: 2,
                  bgcolor: "warning.light",
                  color: "white",
                }}
              >
                <ScheduleIcon sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {stats.late}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  מאחרים
                </Typography>
              </Paper>

              <Paper
                sx={{
                  p: 2,
                  textAlign: "center",
                  borderRadius: 2,
                  bgcolor: "error.light",
                  color: "white",
                }}
              >
                <NotificationsIcon sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {stats.absent}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  נעדרים
                </Typography>
              </Paper>

              <Paper
                sx={{
                  p: 2,
                  textAlign: "center",
                  borderRadius: 2,
                  bgcolor: "info.light",
                  color: "white",
                }}
              >
                <TrendingUpIcon sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {stats.attendancePercentage}%
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  אחוז נוכחות
                </Typography>
              </Paper>
            </Box>

            <Box sx={{ textAlign: "center", mb: 2 }}>
              <Typography variant="body1" color="text.secondary">
                סה"כ ילדים: {stats.total}
              </Typography>
            </Box>
          </Box>
        </SwiperSlide>

        <SwiperSlide>
          {/* Section 3: Additional Info */}
          <Box sx={{ width: "100%", flexShrink: 0 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                mb: 2,
                color: "text.primary",
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
              }}
            >
              מידע נוסף
            </Typography>

            <Card
              sx={{
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                transition: "all 0.3s ease",
                mb: 2,
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  הוראות שימוש
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  החלק ימינה או שמאלה כדי לנווט בין הסעיפים השונים
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
                  <Chip label="פעולות מהירות" size="small" color="primary" />
                  <Chip label="סטטיסטיקות" size="small" color="secondary" />
                  <Chip label="מידע נוסף" size="small" color="default" />
                </Box>
              </CardContent>
            </Card>

            <Card
              sx={{
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                transition: "all 0.3s ease",
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  תמיכה טכנית
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  אם אתה נתקל בבעיות, אנא פנה למנהל המערכת
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </SwiperSlide>
      </Swiper>
    </Box>
  );
};

export default StaffDashboard;
