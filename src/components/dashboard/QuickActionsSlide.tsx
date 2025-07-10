import React from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../config/routes";
import {
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Divider,
  useTheme,
  Box,
} from "@mui/material";
import {
  PeopleAlt as PeopleIcon,
  ArrowForward as ArrowForwardIcon,
  Group as GroupIcon,
  AccountCircle as AccountIcon,
  Today as TodayIcon,
  Bedtime as BedtimeIcon,
} from "@mui/icons-material";

interface QuickActionsSlideProps {
  onStartAttendance: () => void;
  user: any;
  currentTime: Date;
  isAttendanceClosed?: boolean;
}

const QuickActionsSlide: React.FC<QuickActionsSlideProps> = ({
  onStartAttendance,
  user,
  currentTime,
  isAttendanceClosed = false,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("he-IL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
        פעולות מהירות
      </Typography>

      {/* Scrollable Container for Cards */}
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
        {/* Start Attendance Card */}
        {!isAttendanceClosed && (
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
            onClick={onStartAttendance}
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
        )}

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

        {/* Sleep Report Card */}
        <Card
          sx={{
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            cursor: "pointer",
            transition: "all 0.3s ease",
            mb: 3,
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            },
          }}
          onClick={() => navigate(ROUTES.SLEEP_POST)}
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
                  bgcolor: "#9C27B0",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BedtimeIcon sx={{ fontSize: 28 }} />
              </Box>
              <IconButton
                sx={{
                  color: "text.secondary",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <ArrowForwardIcon />
              </IconButton>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              דוח שינה
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              צור דוח שינה עבור הילדים
            </Typography>
            <Chip
              label="חדש"
              size="small"
              sx={{
                bgcolor: "#9C27B0",
                color: "white",
                fontWeight: 500,
              }}
            />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default QuickActionsSlide;
