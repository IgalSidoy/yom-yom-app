import React from "react";
import { Box, Chip, Typography } from "@mui/material";
import { getAttendanceStatusColor } from "../../config/colors";

interface AttendanceChildCardProps {
  child: {
    childId: string;
    childFirstName: string;
    childLastName: string;
    status: string;
  };
  isClosed?: boolean;
  getStatusText: (status: string) => string;
}

const AttendanceChildCard: React.FC<AttendanceChildCardProps> = ({
  child,
  isClosed = false,
  getStatusText,
}) => {
  const statusColor = getAttendanceStatusColor(child.status, isClosed);
  const isPresent = (() => {
    const status = child.status.toLowerCase();
    return status === "present" || status === "arrived" || status === "נוכח";
  })();

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.5,
        p: 1.5,
        borderRadius: 2,
        border: "1px solid",
        borderColor: isClosed ? "grey.300" : "divider",
        bgcolor: isClosed ? "grey.50" : "background.paper",
        transition: "all 0.2s ease-in-out",
        opacity: isClosed ? 0.8 : 1,
        "&:hover": {
          transform: isClosed ? "none" : "translateY(-2px)",
          boxShadow: isClosed ? "none" : "0 4px 12px rgba(0,0,0,0.1)",
          borderColor: isClosed ? "grey.300" : statusColor.border,
        },
      }}
    >
      {/* Child Name Chip */}
      <Chip
        label={`${child.childFirstName} ${child.childLastName}`}
        size="small"
        variant="outlined"
        sx={{
          borderWidth: isPresent ? 2 : 1,
          fontWeight: isPresent ? 600 : 400,
          opacity: isClosed ? 0.7 : 1,
          bgcolor: isClosed ? "grey.100" : statusColor.bg,
          borderColor: isClosed ? "grey.400" : statusColor.border,
          color: isClosed ? "grey.600" : statusColor.text,
          "&:hover": {
            borderColor: isClosed ? "grey.400" : statusColor.border,
            color: isClosed ? "grey.600" : statusColor.text,
            backgroundColor: isClosed ? "transparent" : `${statusColor.bg}20`,
          },
        }}
      />

      {/* Status Indicator */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          mt: 0.5,
        }}
      >
        {/* Status Dot */}
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: statusColor.bg,
            opacity: isClosed ? 0.5 : 1,
          }}
        />

        {/* Status Text */}
        <Typography
          variant="caption"
          sx={{
            fontSize: "0.7rem",
            fontWeight: 500,
            color: isClosed ? "grey.600" : "text.primary",
          }}
        >
          {getStatusText(child.status)}
        </Typography>
      </Box>
    </Box>
  );
};

export default AttendanceChildCard;
