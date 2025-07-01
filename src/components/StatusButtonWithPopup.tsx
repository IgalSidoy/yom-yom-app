import React, { useState } from "react";
import { Box, Button, Typography, Chip } from "@mui/material";
import { ApiAttendanceStatus } from "../types/attendance";

interface StatusButtonWithPopupProps {
  currentStatus: ApiAttendanceStatus;
  onStatusUpdate: (status: ApiAttendanceStatus) => void;
  updateLoading?: boolean;
  availableStatuses?: ApiAttendanceStatus[];
  getStatusColor: (status: ApiAttendanceStatus) => string;
  getStatusTextColor: (status: ApiAttendanceStatus) => string;
  getStatusText: (status: ApiAttendanceStatus) => string;
}

const StatusButtonWithPopup: React.FC<StatusButtonWithPopupProps> = ({
  currentStatus,
  onStatusUpdate,
  updateLoading = false,
  availableStatuses = [
    ApiAttendanceStatus.LATE,
    ApiAttendanceStatus.SICK,
    ApiAttendanceStatus.VACATION,
  ],
  getStatusColor,
  getStatusTextColor,
  getStatusText,
}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleStatusUpdate = (status: ApiAttendanceStatus) => {
    onStatusUpdate(status);
    setIsPopupOpen(false);
  };

  return (
    <>
      {/* Status Button */}
      <Button
        variant="contained"
        onClick={() => setIsPopupOpen(true)}
        disabled={updateLoading}
        sx={{
          bgcolor: getStatusColor(currentStatus),
          color: getStatusTextColor(currentStatus),
          borderRadius: 2,
          fontWeight: 600,
          fontSize: 14,
          py: 1,
          px: 2,
          minHeight: 40,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "scale(1.02)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          },
        }}
      >
        <Chip
          label={getStatusText(currentStatus)}
          size="small"
          sx={{
            bgcolor: "rgba(255,255,255,0.2)",
            color: getStatusTextColor(currentStatus),
            fontWeight: 600,
            fontSize: 12,
            height: 24,
            "& .MuiChip-label": {
              px: 1,
            },
          }}
        />
      </Button>

      {/* Popup Overlay */}
      {isPopupOpen && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            animation: "fadeIn 0.3s ease-in-out",
            "@keyframes fadeIn": {
              "0%": {
                opacity: 0,
              },
              "100%": {
                opacity: 1,
              },
            },
          }}
          onClick={() => setIsPopupOpen(false)}
        >
          {/* Popup Content */}
          <Box
            sx={{
              backgroundColor: "white",
              borderRadius: 4,
              padding: 4,
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              minWidth: { xs: 280, sm: 300 },
              maxWidth: { xs: "90vw", sm: 400 },
              mx: { xs: 2, sm: 0 },
              animation: "slideIn 0.3s ease-in-out",
              "@keyframes slideIn": {
                "0%": {
                  transform: "scale(0.8) translateY(-20px)",
                  opacity: 0,
                },
                "100%": {
                  transform: "scale(1) translateY(0)",
                  opacity: 1,
                },
              },
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Typography
              variant="h6"
              sx={{
                textAlign: "center",
                fontWeight: 700,
                mb: 2,
                color: "text.primary",
              }}
            >
              בחר סטטוס נוכחות
            </Typography>

            {availableStatuses.map((status) => (
              <Button
                key={status}
                variant="contained"
                onClick={() => handleStatusUpdate(status)}
                disabled={updateLoading}
                sx={{
                  bgcolor: getStatusColor(status),
                  color: getStatusTextColor(status),
                  borderRadius: 3,
                  fontWeight: 700,
                  fontSize: 18,
                  py: 2,
                  px: 4,
                  minHeight: 60,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    transform: "scale(1.02)",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
                  },
                }}
              >
                {getStatusText(status)}
              </Button>
            ))}
          </Box>
        </Box>
      )}
    </>
  );
};

export default StatusButtonWithPopup;
