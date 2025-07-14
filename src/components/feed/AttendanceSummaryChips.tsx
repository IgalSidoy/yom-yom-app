import React from "react";
import { Box, Chip } from "@mui/material";
import { ATTENDANCE_COLORS } from "../../config/colors";
import { useLanguage } from "../../contexts/LanguageContext";

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
  return (
    <Box sx={{ display: "flex", gap: 1, ml: "auto" }}>
      {lateCount > 0 && (
        <Chip
          label={`${lateCount} ${getStatusLabel("late")}`}
          size="small"
          sx={{
            bgcolor: isClosed ? "grey.200" : ATTENDANCE_COLORS.LATE.chip,
            color: isClosed ? "grey.600" : ATTENDANCE_COLORS.LATE.chipText,
            fontSize: "0.7rem",
            height: 24,
          }}
        />
      )}
      {absentCount > 0 && (
        <Chip
          label={`${absentCount} ${getStatusLabel("absent")}`}
          size="small"
          sx={{
            bgcolor: isClosed ? "grey.200" : ATTENDANCE_COLORS.ABSENT.chip,
            color: isClosed ? "grey.600" : ATTENDANCE_COLORS.ABSENT.chipText,
            fontSize: "0.7rem",
            height: 24,
          }}
        />
      )}
      {sickCount > 0 && (
        <Chip
          label={`${sickCount} ${getStatusLabel("sick")}`}
          size="small"
          sx={{
            bgcolor: isClosed ? "grey.200" : ATTENDANCE_COLORS.SICK.chip,
            color: isClosed ? "grey.600" : ATTENDANCE_COLORS.SICK.chipText,
            fontSize: "0.7rem",
            height: 24,
          }}
        />
      )}
      {unreportedCount > 0 && (
        <Chip
          label={`${unreportedCount} ${getStatusLabel("unreported")}`}
          size="small"
          sx={{
            bgcolor: isClosed ? "grey.200" : ATTENDANCE_COLORS.UNREPORTED.chip,
            color: isClosed
              ? "grey.600"
              : ATTENDANCE_COLORS.UNREPORTED.chipText,
            fontSize: "0.7rem",
            height: 24,
          }}
        />
      )}
    </Box>
  );
};

export default AttendanceSummaryChips;
