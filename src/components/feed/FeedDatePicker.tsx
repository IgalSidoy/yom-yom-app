import React from "react";
import { Box, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import dayjs, { Dayjs } from "dayjs";

interface FeedDatePickerProps {
  selectedDate: Dayjs;
  onDateChange: (date: Dayjs) => void;
  label?: string;
}

const FeedDatePicker: React.FC<FeedDatePickerProps> = ({
  selectedDate,
  onDateChange,
  label = "בחר תאריך",
}) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        {label}
      </Typography>
      <DatePicker
        value={selectedDate}
        onChange={(newValue) => {
          if (newValue) {
            onDateChange(newValue);
          }
        }}
        slots={{
          leftArrowIcon: KeyboardArrowRightIcon,
          rightArrowIcon: KeyboardArrowLeftIcon,
        }}
        slotProps={{
          openPickerButton: { sx: { color: "primary.main" } },
          textField: {
            fullWidth: true,
            size: "small",
            sx: {
              "& .MuiInputLabel-root": {
                fontSize: "0.875rem",
                color: "text.secondary",
              },
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.main",
                  borderWidth: "2px",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.main",
                  borderWidth: "2px",
                },
                "& .MuiInputBase-input": {
                  fontSize: "0.875rem",
                  color: "text.primary",
                  padding: "10px 12px",
                },
              },
            },
          },
        }}
        sx={{
          "& .MuiPickersArrowSwitcher-button": {
            color: "primary.main",
          },
        }}
      />
    </Box>
  );
};

export default FeedDatePicker;
