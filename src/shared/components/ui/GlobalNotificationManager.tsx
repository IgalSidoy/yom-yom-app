import React from "react";
import { Snackbar, Alert, Fade } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";
import { useNotification } from "../../../contexts/NotificationContext";

interface Notification {
  id: string;
  message: string;
  severity: "success" | "error" | "info" | "warning";
  open: boolean;
}

const GlobalNotificationManager: React.FC = () => {
  const { notifications, hideNotification } = useNotification();

  const getIcon = (severity: string) => {
    switch (severity) {
      case "success":
        return <CheckCircleIcon />;
      case "error":
        return <ErrorIcon />;
      case "warning":
        return <WarningIcon />;
      case "info":
        return <InfoIcon />;
      default:
        return <CheckCircleIcon />;
    }
  };

  return (
    <>
      {notifications.map((notification: Notification) => (
        <Snackbar
          key={notification.id}
          open={notification.open}
          onClose={() => hideNotification(notification.id)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          sx={{
            "& .MuiSnackbar-root": {
              top: `${
                24 + notifications.indexOf(notification) * 80
              }px !important`,
            },
          }}
        >
          <Alert
            severity={notification.severity}
            variant="filled"
            icon={getIcon(notification.severity)}
            onClose={() => hideNotification(notification.id)}
            sx={{
              width: "100%",
              minWidth: "300px",
              maxWidth: "400px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              borderRadius: "12px",
              padding: "12px 16px",
              fontSize: "0.95rem",
              fontWeight: 500,
              "& .MuiAlert-icon": {
                padding: "0 8px 0 0",
                alignItems: "center",
              },
              "& .MuiAlert-message": {
                padding: "0 8px",
                display: "flex",
                alignItems: "center",
              },
              "&.MuiAlert-standardSuccess": {
                backgroundColor: "#2e7d32",
              },
              "&.MuiAlert-standardError": {
                backgroundColor: "#d32f2f",
              },
              "&.MuiAlert-standardWarning": {
                backgroundColor: "#ed6c02",
              },
              "&.MuiAlert-standardInfo": {
                backgroundColor: "#0288d1",
              },
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};

export default GlobalNotificationManager;
