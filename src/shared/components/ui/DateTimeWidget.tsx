import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";

interface DateTimeWidgetProps {
  showGreeting?: boolean;
  userName?: string;
  variant?: "compact" | "full";
  size?: "small" | "medium" | "large";
}

const DateTimeWidget: React.FC<DateTimeWidgetProps> = ({
  showGreeting = false,
  userName,
  variant = "full",
  size = "medium",
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          timeFontSize: "0.875rem",
          dateFontSize: "0.75rem",
          greetingFontSize: "1rem",
          padding: 1,
          minWidth: 60,
        };
      case "large":
        return {
          timeFontSize: "1.25rem",
          dateFontSize: "1rem",
          greetingFontSize: "1.5rem",
          padding: 2,
          minWidth: 90,
        };
      default: // medium
        return {
          timeFontSize: "1rem",
          dateFontSize: "0.875rem",
          greetingFontSize: "1.25rem",
          padding: 1.5,
          minWidth: 70,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  if (variant === "compact") {
    return (
      <Box
        sx={{
          textAlign: "center",
          p: sizeStyles.padding,
          borderRadius: 2,
          bgcolor: "primary.main",
          color: "white",
          minWidth: sizeStyles.minWidth,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: sizeStyles.timeFontSize,
          }}
        >
          {formatTime(currentTime)}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            opacity: 0.9,
            fontSize: sizeStyles.dateFontSize,
          }}
        >
          שעה נוכחית
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
      }}
    >
      {/* Greeting and Date */}
      <Box>
        {showGreeting && (
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              mb: 0.5,
              fontSize: sizeStyles.greetingFontSize,
            }}
          >
            {getGreeting(currentTime)}
            {userName && `, ${userName}!`}
          </Typography>
        )}
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            fontSize: sizeStyles.dateFontSize,
          }}
        >
          {formatDate(currentTime)}
        </Typography>
      </Box>

      {/* Time Widget */}
      <Box
        sx={{
          textAlign: "center",
          p: sizeStyles.padding,
          borderRadius: 2,
          bgcolor: "primary.main",
          color: "white",
          minWidth: sizeStyles.minWidth,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: sizeStyles.timeFontSize,
          }}
        >
          {formatTime(currentTime)}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            opacity: 0.9,
            fontSize: sizeStyles.dateFontSize,
          }}
        >
          שעה נוכחית
        </Typography>
      </Box>
    </Box>
  );
};

export default DateTimeWidget;
