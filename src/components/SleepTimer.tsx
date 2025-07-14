import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { AccessTime as TimerIcon } from "@mui/icons-material";
import {
  isValidEndTime,
  calculateSleepDuration,
  formatDuration,
} from "../utils/sleepUtils";

interface SleepTimerProps {
  startTime: string;
  endTime?: string;
  isSleeping: boolean;
  activityDate?: string; // The date this sleep activity is for
  size?: "small" | "medium" | "large";
  showIcon?: boolean;
  showPulse?: boolean;
  animationIntensity?: "subtle" | "normal" | "prominent";
}

const SleepTimer: React.FC<SleepTimerProps> = ({
  startTime,
  endTime,
  isSleeping,
  activityDate,
  size = "medium",
  showIcon = true,
  showPulse = true,
  animationIntensity = "normal",
}) => {
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  // Helper function to check if this is for a previous date
  const isPreviousDate = (): boolean => {
    if (!activityDate) return false;
    const activity = new Date(activityDate);
    const today = new Date();
    return activity.toDateString() !== today.toDateString();
  };

  // Helper function to check if sleep data is valid for display
  const isValidSleepData = (): boolean => {
    if (!startTime) return false;

    // If it's a previous date and no end time, don't show timer
    if (isPreviousDate() && !isValidEndTime(endTime)) {
      return false;
    }

    // If start and end time are the same or invalid, don't show timer
    if (startTime === endTime || startTime === "0001-01-01T00:00:00") {
      return false;
    }

    return true;
  };

  useEffect(() => {
    if (!isValidSleepData()) {
      setElapsedTime(0);
      return;
    }

    // For previous dates, only show duration if there's a valid end time
    if (isPreviousDate()) {
      if (isValidEndTime(endTime)) {
        setElapsedTime(calculateSleepDuration(startTime, endTime));
      } else {
        setElapsedTime(0);
      }
      return;
    }

    // For current date, use normal logic
    setElapsedTime(calculateSleepDuration(startTime, endTime));

    // If child is still sleeping and no valid end time, update timer every second
    if (isSleeping && !isValidEndTime(endTime)) {
      const interval = setInterval(() => {
        setElapsedTime(calculateSleepDuration(startTime, endTime));
      }, 1000);

      return () => clearInterval(interval);
    } else {
      // If not sleeping or has valid end time, just set the final elapsed time once
      setElapsedTime(calculateSleepDuration(startTime, endTime));
    }
  }, [startTime, endTime, isSleeping, activityDate]);

  // Always show timer, even when no sleep data
  const displayTime = isValidSleepData()
    ? formatDuration(elapsedTime)
    : "00:00";

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          fontSize: "0.75rem",
          iconSize: 14,
          pulseSize: 4,
        };
      case "large":
        return {
          fontSize: "1rem",
          iconSize: 20,
          pulseSize: 8,
        };
      default: // medium
        return {
          fontSize: "0.875rem",
          iconSize: 16,
          pulseSize: 6,
        };
    }
  };

  const getAnimationStyles = () => {
    const isActive = isSleeping && !isValidEndTime(endTime);

    switch (animationIntensity) {
      case "subtle":
        return {
          iconRotation: isActive ? "rotate 3s linear infinite" : "none",
          textBreathing: isActive ? "breathe 4s ease-in-out infinite" : "none",
          pulseSpeed: isActive
            ? "pulse 2s ease-in-out infinite"
            : "pulse 2s infinite",
          pulseScale: isActive ? 1.1 : 1,
        };
      case "prominent":
        return {
          iconRotation: isActive ? "rotate 1s linear infinite" : "none",
          textBreathing: isActive ? "breathe 2s ease-in-out infinite" : "none",
          pulseSpeed: isActive
            ? "pulse 1s ease-in-out infinite"
            : "pulse 2s infinite",
          pulseScale: isActive ? 1.3 : 1,
        };
      default: // normal
        return {
          iconRotation: isActive ? "rotate 2s linear infinite" : "none",
          textBreathing: isActive ? "breathe 3s ease-in-out infinite" : "none",
          pulseSpeed: isActive
            ? "pulse 1.5s ease-in-out infinite"
            : "pulse 2s infinite",
          pulseScale: isActive ? 1.2 : 1,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const animationStyles = getAnimationStyles();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        color: isValidSleepData()
          ? isSleeping
            ? "#9C27B0"
            : "text.secondary"
          : "text.disabled",
        fontSize: sizeStyles.fontSize,
        fontWeight: 500,
      }}
    >
      {showIcon && (
        <TimerIcon
          sx={{
            fontSize: sizeStyles.iconSize,
            animation: animationStyles.iconRotation,
            "@keyframes rotate": {
              "0%": { transform: "rotate(0deg)" },
              "100%": { transform: "rotate(360deg)" },
            },
          }}
        />
      )}
      <Typography
        variant="body2"
        sx={{
          color: "inherit",
          fontWeight: 600,
          fontFamily: "monospace",
          fontSize: sizeStyles.fontSize,
          animation: animationStyles.textBreathing,
          "@keyframes breathe": {
            "0%, 100%": { opacity: 1 },
            "50%": { opacity: 0.7 },
          },
        }}
      >
        {displayTime}
      </Typography>
      {isSleeping && showPulse && (
        <Box
          sx={{
            width: sizeStyles.pulseSize,
            height: sizeStyles.pulseSize,
            borderRadius: "50%",
            bgcolor: "#9C27B0",
            animation: animationStyles.pulseSpeed,
            "@keyframes pulse": {
              "0%": {
                opacity: 1,
                transform: "scale(1)",
              },
              "50%": {
                opacity: !isValidEndTime(endTime) ? 0.5 : 0.3,
                transform: `scale(${animationStyles.pulseScale})`,
              },
              "100%": {
                opacity: 1,
                transform: "scale(1)",
              },
            },
          }}
        />
      )}
    </Box>
  );
};

export default SleepTimer;
