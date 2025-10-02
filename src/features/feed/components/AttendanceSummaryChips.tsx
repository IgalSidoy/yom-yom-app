import React from "react";
import { Box, Chip, Typography } from "@mui/material";
import { ATTENDANCE_COLORS } from "../../../config/colors";
import { useLanguage } from "../../../contexts/LanguageContext";
import {
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  LocalHospital as LocalHospitalIcon,
  Help as HelpIcon,
} from "@mui/icons-material";

interface AttendanceSummaryChipsProps {
  lateCount: number;
  absentCount: number;
  sickCount: number;
  unreportedCount?: number;
  isClosed?: boolean;
}

const AttendanceSummaryChips: React.FC<AttendanceSummaryChipsProps> = ({
  lateCount,
  absentCount,
  sickCount,
  unreportedCount = 0,
  isClosed = false,
}) => {
  const { language } = useLanguage();

  // Translation mapping for attendance status labels
  const getStatusLabel = (
    status: "late" | "absent" | "sick" | "unreported"
  ) => {
    const labels = {
      heb: {
        late: "מאחרים",
        absent: "נעדרים",
        sick: "חולים",
        unreported: "לא דווח",
      },
      rus: {
        late: "Опоздали",
        absent: "Отсутствуют",
        sick: "Больны",
        unreported: "Не сообщено",
      },
      eng: {
        late: "Late",
        absent: "Absent",
        sick: "Sick",
        unreported: "Unreported",
      },
    };

    return labels[language][status];
  };

  const getStatusIcon = (status: "late" | "absent" | "sick" | "unreported") => {
    switch (status) {
      case "late":
        return <ScheduleIcon sx={{ fontSize: 16 }} />;
      case "absent":
        return <CancelIcon sx={{ fontSize: 16 }} />;
      case "sick":
        return <LocalHospitalIcon sx={{ fontSize: 16 }} />;
      case "unreported":
        return <HelpIcon sx={{ fontSize: 16 }} />;
      default:
        return <HelpIcon sx={{ fontSize: 16 }} />;
    }
  };

  const totalOther = lateCount + absentCount + sickCount + unreportedCount;

  if (totalOther === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography
        variant="subtitle2"
        sx={{
          color: "text.secondary",
          fontSize: "0.8rem",
          fontWeight: 600,
          mb: 1.5,
          textAlign: "center",
        }}
      >
        סטטוסים נוספים
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {lateCount > 0 && (
          <Chip
            icon={getStatusIcon("late")}
            label={`${lateCount} ${getStatusLabel("late")}`}
            size="small"
            sx={{
              bgcolor: isClosed ? "grey.200" : ATTENDANCE_COLORS.LATE.chip,
              color: isClosed ? "grey.600" : ATTENDANCE_COLORS.LATE.chipText,
              fontSize: "0.85rem",
              height: 32,
              fontWeight: 600,
              border: "1px solid",
              borderColor: isClosed
                ? "grey.300"
                : ATTENDANCE_COLORS.LATE.border,
              "& .MuiChip-icon": {
                color: isClosed ? "grey.600" : ATTENDANCE_COLORS.LATE.chipText,
              },
              "&:hover": {
                bgcolor: isClosed
                  ? "grey.200"
                  : `${ATTENDANCE_COLORS.LATE.chip}dd`,
              },
            }}
          />
        )}

        {absentCount > 0 && (
          <Chip
            icon={getStatusIcon("absent")}
            label={`${absentCount} ${getStatusLabel("absent")}`}
            size="small"
            sx={{
              bgcolor: isClosed ? "grey.200" : ATTENDANCE_COLORS.ABSENT.chip,
              color: isClosed ? "grey.600" : ATTENDANCE_COLORS.ABSENT.chipText,
              fontSize: "0.85rem",
              height: 32,
              fontWeight: 600,
              border: "1px solid",
              borderColor: isClosed
                ? "grey.300"
                : ATTENDANCE_COLORS.ABSENT.border,
              "& .MuiChip-icon": {
                color: isClosed
                  ? "grey.600"
                  : ATTENDANCE_COLORS.ABSENT.chipText,
              },
              "&:hover": {
                bgcolor: isClosed
                  ? "grey.200"
                  : `${ATTENDANCE_COLORS.ABSENT.chip}dd`,
              },
            }}
          />
        )}

        {sickCount > 0 && (
          <Chip
            icon={getStatusIcon("sick")}
            label={`${sickCount} ${getStatusLabel("sick")}`}
            size="small"
            sx={{
              bgcolor: isClosed ? "grey.200" : ATTENDANCE_COLORS.SICK.chip,
              color: isClosed ? "grey.600" : ATTENDANCE_COLORS.SICK.chipText,
              fontSize: "0.85rem",
              height: 32,
              fontWeight: 600,
              border: "1px solid",
              borderColor: isClosed
                ? "grey.300"
                : ATTENDANCE_COLORS.SICK.border,
              "& .MuiChip-icon": {
                color: isClosed ? "grey.600" : ATTENDANCE_COLORS.SICK.chipText,
              },
              "&:hover": {
                bgcolor: isClosed
                  ? "grey.200"
                  : `${ATTENDANCE_COLORS.SICK.chip}dd`,
              },
            }}
          />
        )}

        {unreportedCount > 0 && (
          <Chip
            icon={getStatusIcon("unreported")}
            label={`${unreportedCount} ${getStatusLabel("unreported")}`}
            size="small"
            sx={{
              bgcolor: isClosed
                ? "grey.200"
                : ATTENDANCE_COLORS.UNREPORTED.chip,
              color: isClosed
                ? "grey.600"
                : ATTENDANCE_COLORS.UNREPORTED.chipText,
              fontSize: "0.85rem",
              height: 32,
              fontWeight: 600,
              border: "1px solid",
              borderColor: isClosed
                ? "grey.300"
                : ATTENDANCE_COLORS.UNREPORTED.border,
              "& .MuiChip-icon": {
                color: isClosed
                  ? "grey.600"
                  : ATTENDANCE_COLORS.UNREPORTED.chipText,
              },
              "&:hover": {
                bgcolor: isClosed
                  ? "grey.200"
                  : `${ATTENDANCE_COLORS.UNREPORTED.chip}dd`,
              },
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default AttendanceSummaryChips;
