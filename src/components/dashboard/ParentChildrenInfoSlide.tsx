import React from "react";
import {
  Typography,
  Card,
  CardContent,
  Box,
  Avatar,
  Chip,
  Divider,
} from "@mui/material";
import {
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";

interface Child {
  id: string;
  name: string;
  status: "present" | "late" | "absent";
  groupName: string;
  avatar?: string;
}

interface ParentChildrenInfoSlideProps {
  children: Child[];
  currentTime: Date;
}

const ParentChildrenInfoSlide: React.FC<ParentChildrenInfoSlideProps> = ({
  children,
  currentTime,
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircleIcon sx={{ color: "success.main", fontSize: 20 }} />;
      case "late":
        return <ScheduleIcon sx={{ color: "warning.main", fontSize: 20 }} />;
      case "absent":
        return <NotificationsIcon sx={{ color: "error.main", fontSize: 20 }} />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "present":
        return "נוכח";
      case "late":
        return "מאחר";
      case "absent":
        return "נעדר";
      default:
        return "לא ידוע";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "success";
      case "late":
        return "warning";
      case "absent":
        return "error";
      default:
        return "default";
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("he-IL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
        מידע על ילדי
      </Typography>

      {/* Date Card */}
      <Card
        sx={{
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          transition: "all 0.3s ease",
          mb: 2,
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            סיכום יומי
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatDate(currentTime)}
          </Typography>
        </CardContent>
      </Card>

      {/* Children List */}
      {children.map((child) => (
        <Card
          key={child.id}
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
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 1.5,
              }}
            >
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  mr: 2,
                  bgcolor: "primary.main",
                }}
                src={child.avatar}
              >
                <PersonIcon />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {child.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {child.groupName}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                {getStatusIcon(child.status)}
                <Chip
                  label={getStatusText(child.status)}
                  size="small"
                  color={getStatusColor(child.status) as any}
                  sx={{ fontWeight: 500 }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}

      {/* Summary */}
      {children.length > 0 && (
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
              סיכום
            </Typography>
            <Divider sx={{ my: 1.5 }} />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                סה"כ ילדים:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {children.length}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                נוכחים היום:
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, color: "success.main" }}
              >
                {children.filter((c) => c.status === "present").length}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default ParentChildrenInfoSlide;
