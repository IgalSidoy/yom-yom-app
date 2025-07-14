import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { ChevronLeft, ChevronRight, Today } from "@mui/icons-material";
import dayjs, { Dayjs } from "dayjs";

interface FeedDateSelectorProps {
  selectedDate: Dayjs;
  onDateChange: (date: Dayjs) => void;
  label?: string;
}

const FeedDateSelector: React.FC<FeedDateSelectorProps> = ({
  selectedDate,
  onDateChange,
  label = "בחר תאריך",
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handlePreviousDay = () => {
    const newDate = selectedDate.subtract(1, "day");
    // Don't allow future dates
    if (newDate.isBefore(dayjs(), "day")) {
      onDateChange(newDate);
    }
  };

  const handleNextDay = () => {
    const newDate = selectedDate.add(1, "day");
    // Don't allow future dates
    if (newDate.isSame(dayjs(), "day") || newDate.isBefore(dayjs(), "day")) {
      onDateChange(newDate);
    }
  };

  const handleToday = () => {
    onDateChange(dayjs());
  };

  const formatDate = (date: Dayjs) => {
    const today = dayjs();
    const yesterday = dayjs().subtract(1, "day");

    if (date.isSame(today, "day")) {
      return "היום";
    } else if (date.isSame(yesterday, "day")) {
      return "אתמול";
    } else {
      return date.format("DD/MM");
    }
  };

  if (!isMobile) {
    return null; // Only show on mobile
  }

  return (
    <Box sx={{ mb: 1 }}>
      <Paper
        elevation={1}
        sx={{
          p: 1.5,
          borderRadius: 2,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* Compact date selector */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <IconButton
            onClick={handlePreviousDay}
            disabled={selectedDate.isSame(dayjs().subtract(6, "day"), "day")}
            size="small"
            sx={{
              color: "primary.main",
              "&:disabled": {
                color: "text.disabled",
              },
            }}
          >
            <ChevronLeft />
          </IconButton>

          <Box sx={{ textAlign: "center", flex: 1, mx: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: "primary.main" }}
            >
              {formatDate(selectedDate)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {selectedDate.format("DD/MM/YYYY")}
            </Typography>
          </Box>

          <IconButton
            onClick={handleNextDay}
            disabled={selectedDate.isSame(dayjs(), "day")}
            size="small"
            sx={{
              color: "primary.main",
              "&:disabled": {
                color: "text.disabled",
              },
            }}
          >
            <ChevronRight />
          </IconButton>

          <IconButton
            onClick={handleToday}
            disabled={selectedDate.isSame(dayjs(), "day")}
            size="small"
            sx={{
              ml: 1,
              bgcolor: selectedDate.isSame(dayjs(), "day")
                ? "primary.main"
                : "transparent",
              color: selectedDate.isSame(dayjs(), "day")
                ? "primary.contrastText"
                : "primary.main",
              border: "1px solid",
              borderColor: "primary.main",
              "&:hover": {
                bgcolor: selectedDate.isSame(dayjs(), "day")
                  ? "primary.dark"
                  : "primary.light",
              },
              "&:disabled": {
                bgcolor: "primary.main",
                color: "primary.contrastText",
              },
            }}
          >
            <Today sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default FeedDateSelector;
