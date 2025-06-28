import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  IconButton,
  Paper,
  Divider,
  Fade,
  useTheme,
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
import Container from "../../components/Container";
import { useAttendance } from "../../contexts/AttendanceContext";

const StaffDashboard: React.FC = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const theme = useTheme();
  const { attendanceData, isLoading: isLoadingAttendance } = useAttendance();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const calculateStats = () => {
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
      (child) => child.status === "present"
    ).length;
    const late = attendanceData.children.filter(
      (child) => child.status === "late"
    ).length;
    const absent = attendanceData.children.filter(
      (child) => child.status === "absent"
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
  };

  const stats = calculateStats();

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

  const handleStartAttendance = () => {
    navigate("/attendance");
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "בוקר טוב";
    if (hour < 18) return "צהריים טובים";
    return "ערב טוב";
  };

  return (
    <Container>
      <Box sx={{ py: 3, px: { xs: 2, sm: 3 } }}>
        {/* Header Section */}
        <Fade in timeout={600}>
          <Box sx={{ mb: 4 }}>
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
                    fontSize: { xs: "1.75rem", sm: "2.125rem" },
                  }}
                >
                  {getGreeting()}, {user?.firstName}!
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ fontSize: { xs: "1rem", sm: "1.125rem" } }}
                >
                  {formatDate(currentTime)}
                </Typography>
              </Box>
              <Box
                sx={{
                  textAlign: "center",
                  p: 2,
                  borderRadius: 3,
                  bgcolor: "primary.main",
                  color: "white",
                  minWidth: 80,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {formatTime(currentTime)}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  שעה נוכחית
                </Typography>
              </Box>
            </Box>
          </Box>
        </Fade>

        {/* Quick Actions Section */}
        <Fade in timeout={800}>
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                mb: 3,
                color: "text.primary",
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
              }}
            >
              פעולות מהירות
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 3,
              }}
            >
              {/* Start Attendance Card */}
              <Box
                sx={{
                  flex: "1 1 300px",
                  minWidth: 0,
                }}
              >
                <Card
                  sx={{
                    height: "100%",
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: "white",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                    },
                  }}
                  onClick={handleStartAttendance}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: "rgba(255,255,255,0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <PeopleIcon sx={{ fontSize: 32 }} />
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
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
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
              </Box>

              {/* Group Info Card */}
              <Box
                sx={{
                  flex: "1 1 300px",
                  minWidth: 0,
                }}
              >
                <Card
                  sx={{
                    height: "100%",
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          p: 1.5,
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
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ space: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 1.5,
                        }}
                      >
                        <AccountIcon
                          sx={{ fontSize: 20, color: "text.secondary", mr: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {user?.groupId ? "קבוצה מוגדרת" : "לא הוגדרה קבוצה"}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 1.5,
                        }}
                      >
                        <TodayIcon
                          sx={{ fontSize: 20, color: "text.secondary", mr: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(currentTime)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Box>
        </Fade>

        {/* Stats Section */}
        <Fade in timeout={1000}>
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                mb: 3,
                color: "text.primary",
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
              }}
            >
              סטטיסטיקות יומיות
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 3,
              }}
            >
              <Box
                sx={{
                  flex: "1 1 200px",
                  minWidth: 0,
                }}
              >
                <Paper
                  sx={{
                    p: 3,
                    textAlign: "center",
                    borderRadius: 3,
                    bgcolor: "success.light",
                    color: "white",
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {stats.present}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    נוכחים היום
                  </Typography>
                </Paper>
              </Box>
              <Box
                sx={{
                  flex: "1 1 200px",
                  minWidth: 0,
                }}
              >
                <Paper
                  sx={{
                    p: 3,
                    textAlign: "center",
                    borderRadius: 3,
                    bgcolor: "warning.light",
                    color: "white",
                  }}
                >
                  <ScheduleIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {stats.late}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    מאחרים
                  </Typography>
                </Paper>
              </Box>
              <Box
                sx={{
                  flex: "1 1 200px",
                  minWidth: 0,
                }}
              >
                <Paper
                  sx={{
                    p: 3,
                    textAlign: "center",
                    borderRadius: 3,
                    bgcolor: "error.light",
                    color: "white",
                  }}
                >
                  <NotificationsIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {stats.absent}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    נעדרים
                  </Typography>
                </Paper>
              </Box>
              <Box
                sx={{
                  flex: "1 1 200px",
                  minWidth: 0,
                }}
              >
                <Paper
                  sx={{
                    p: 3,
                    textAlign: "center",
                    borderRadius: 3,
                    bgcolor: "info.light",
                    color: "white",
                  }}
                >
                  <TrendingUpIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {stats.attendancePercentage}%
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    אחוז נוכחות
                  </Typography>
                </Paper>
              </Box>
            </Box>
          </Box>
        </Fade>
      </Box>
    </Container>
  );
};

export default StaffDashboard;
