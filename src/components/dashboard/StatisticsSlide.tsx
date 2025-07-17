import React from "react";
import { Typography, Paper, Box } from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";

interface StatisticsSlideProps {
  stats: {
    present: number;
    late: number;
    absent: number;
    attendancePercentage: number;
    total: number;
  };
}

const StatisticsSlide: React.FC<StatisticsSlideProps> = ({ stats }) => {
  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          mb: 2,
          color: "text.primary",
          fontSize: { xs: "1.25rem", sm: "1.5rem" },
          flexShrink: 0,
        }}
      >
        סטטיסטיקות יומיות
      </Typography>

      {/* Scrollable Container */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          pr: 1,
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(0,0,0,0.2)",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "rgba(0,0,0,0.3)",
          },
        }}
      >
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
    </Box>
  );
};

export default StatisticsSlide;
