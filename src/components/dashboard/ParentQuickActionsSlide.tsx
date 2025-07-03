import React from "react";
import {
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Box,
  useTheme,
} from "@mui/material";
import {
  PeopleAlt as PeopleIcon,
  ArrowForward as ArrowForwardIcon,
  Notifications as NotificationsIcon,
  Message as MessageIcon,
} from "@mui/icons-material";

interface ParentQuickActionsSlideProps {
  onViewAttendance: () => void;
  onViewMessages: () => void;
  childrenCount: number;
  hasUnreadMessages: boolean;
}

const ParentQuickActionsSlide: React.FC<ParentQuickActionsSlideProps> = ({
  onViewAttendance,
  onViewMessages,
  childrenCount,
  hasUnreadMessages,
}) => {
  const theme = useTheme();

  return (
    <>
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

      {/* View Attendance Card */}
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
        onClick={onViewAttendance}
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
            צפה בנוכחות ילדי
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mb: 1.5 }}>
            בדוק את נוכחות ילדיך בגן היום
          </Typography>
          <Chip
            label={`${childrenCount} ילדים`}
            size="small"
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              color: "white",
              fontWeight: 500,
            }}
          />
        </CardContent>
      </Card>

      {/* Messages Card */}
      <Card
        sx={{
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          transition: "all 0.3s ease",
          mb: 3,
          cursor: "pointer",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          },
        }}
        onClick={onViewMessages}
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
                p: 1,
                borderRadius: 2,
                bgcolor: "secondary.main",
                color: "white",
                mr: 2,
                position: "relative",
              }}
            >
              <MessageIcon />
              {hasUnreadMessages && (
                <Box
                  sx={{
                    position: "absolute",
                    top: -5,
                    right: -5,
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    bgcolor: "error.main",
                    border: "2px solid white",
                  }}
                />
              )}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                הודעות מהגן
              </Typography>
              <Typography variant="body2" color="text.secondary">
                הודעות ועדכונים מהצוות
              </Typography>
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
          {hasUnreadMessages && (
            <Chip
              label="הודעות חדשות"
              size="small"
              color="error"
              sx={{ fontWeight: 500 }}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default ParentQuickActionsSlide;
