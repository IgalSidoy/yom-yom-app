import React from "react";
import { Button, Alert, Box } from "@mui/material";
import { Assessment as ReportIcon } from "@mui/icons-material";
import { useDailyReport } from "../../contexts/DailyReportContext";
import { useApp } from "../../contexts/AppContext";

interface FetchDailyReportButtonProps {
  className?: string;
}

const FetchDailyReportButton: React.FC<FetchDailyReportButtonProps> = ({
  className,
}) => {
  const { dailyReport, isLoading, error, fetchDailyReport } = useDailyReport();
  const { user } = useApp();

  // Only show for staff and admin users
  const isAuthorized = user?.role === "staff" || user?.role === "admin";

  if (!isAuthorized) {
    return null;
  }

  const handleFetchReport = async () => {
    console.log("FetchDailyReportButton clicked, user:", user);
    if (user?.groupId) {
      console.log("Fetching daily report for groupId:", user.groupId);
      await fetchDailyReport(user.groupId);
    } else {
      console.log("No groupId available for user:", user);
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        variant="outlined"
        startIcon={<ReportIcon />}
        onClick={handleFetchReport}
        disabled={isLoading}
        sx={{
          borderColor: "#FF914D",
          color: "#FF914D",
          "&:hover": {
            borderColor: "#FF914D",
            backgroundColor: "rgba(255, 145, 77, 0.08)",
          },
          "&:disabled": {
            borderColor: "rgba(255, 145, 77, 0.3)",
            color: "rgba(255, 145, 77, 0.3)",
          },
        }}
        className={className}
      >
        {isLoading ? "טוען דוח יומי..." : "טען דוח יומי"}
      </Button>

      {dailyReport && (
        <Alert severity="success" sx={{ mt: 2 }}>
          דוח יומי נטען בהצלחה! {dailyReport.children?.length || 0} ילדים נמצאו
          בדוח.
        </Alert>
      )}
    </Box>
  );
};

export default FetchDailyReportButton;
