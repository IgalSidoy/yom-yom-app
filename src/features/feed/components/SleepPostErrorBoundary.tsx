import React, { Component, ErrorInfo, ReactNode } from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  AlertTitle,
  useTheme,
} from "@mui/material";
import {
  Bedtime as SleepIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

interface Props {
  children: ReactNode;
  onClose?: () => void;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class SleepPostErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error in SleepPost component:", error, errorInfo);
    }

    // Update state with error info
    this.setState({ error });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onRetry?.();
  };

  handleClose = () => {
    this.props.onClose?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <SleepPostErrorFallback
          onRetry={this.handleRetry}
          onClose={this.handleClose}
        />
      );
    }

    return this.props.children;
  }
}

// Custom error fallback for sleep post creation
interface SleepPostErrorFallbackProps {
  onRetry: () => void;
  onClose: () => void;
}

const SleepPostErrorFallback: React.FC<SleepPostErrorFallbackProps> = ({
  onRetry,
  onClose,
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 99999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <Box
        sx={{
          backgroundColor: "white",
          borderRadius: 3,
          padding: 3,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          width: "100%",
          maxWidth: 500,
          textAlign: "center",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              bgcolor: "#f44336",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "3rem",
              mb: 2,
            }}
          >
            <SleepIcon sx={{ fontSize: 40 }} />
          </Box>
        </Box>

        <Alert
          severity="error"
          sx={{
            mb: 3,
            "& .MuiAlert-message": {
              width: "100%",
            },
          }}
        >
          <AlertTitle sx={{ fontSize: "1.25rem", fontWeight: 700, mb: 1 }}>
            שגיאה ביצירת פוסט שינה
          </AlertTitle>
          <Typography variant="body1">
            אירעה שגיאה בעת יצירת פוסט השינה. אנא נסה שוב או סגור את החלון.
          </Typography>
        </Alert>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "center",
          }}
        >
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={onRetry}
            sx={{
              bgcolor: "#9C27B0",
              "&:hover": {
                bgcolor: "#7B1FA2",
              },
            }}
          >
            נסה שוב
          </Button>

          <Button
            variant="outlined"
            startIcon={<CloseIcon />}
            onClick={onClose}
            sx={{
              borderColor: "text.secondary",
              color: "text.secondary",
              "&:hover": {
                borderColor: "text.primary",
                bgcolor: "action.hover",
              },
            }}
          >
            סגור
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default SleepPostErrorBoundary;
