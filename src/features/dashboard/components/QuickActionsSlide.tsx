import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../config/routes";
import {
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Divider,
  useTheme,
  Box,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  PeopleAlt as PeopleIcon,
  ArrowForward as ArrowForwardIcon,
  Group as GroupIcon,
  AccountCircle as AccountIcon,
  Today as TodayIcon,
  Bedtime as BedtimeIcon,
  GetApp as GetAppIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import { useAddToHomeScreen } from "../../../hooks/useAddToHomeScreen";

interface QuickActionsSlideProps {
  onStartAttendance: () => void;
  user: any;
  currentTime: Date;
  isAttendanceClosed?: boolean;
}

const QuickActionsSlide: React.FC<QuickActionsSlideProps> = ({
  onStartAttendance,
  user,
  currentTime,
  isAttendanceClosed = false,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const {
    isInstallable,
    isInstalled,
    promptInstall,
    showManualInstallInstructions,
    checkPWACriteria,
    isIOS,
    isSafari,
  } = useAddToHomeScreen();
  const [showInstallAlert, setShowInstallAlert] = useState(false);
  const [installMessage, setInstallMessage] = useState("");
  const [showInstructionsDialog, setShowInstructionsDialog] = useState(false);

  const handleInstallClick = async () => {
    // Check PWA criteria first
    const pwaCriteria = checkPWACriteria();
    console.log("PWA Criteria check:", pwaCriteria);

    // If on iOS, show instructions dialog directly
    if (isIOS) {
      setShowInstructionsDialog(true);
      return;
    }

    // If PWA criteria not met, show manual instructions
    if (!pwaCriteria.allMet) {
      console.log("PWA criteria not met, showing manual instructions");
      setShowInstructionsDialog(true);
      return;
    }

    try {
      const success = await promptInstall();
      if (success) {
        setInstallMessage("האפליקציה נוספה בהצלחה למסך הבית!");
        setShowInstallAlert(true);
      } else {
        setInstallMessage("התקנה בוטלה או לא נתמכת בדפדפן זה");
        setShowInstallAlert(true);
      }
    } catch (error) {
      console.error("Install error:", error);
      setShowInstructionsDialog(true);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("he-IL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          mb: 2,
          color: "text.primary",
          fontSize: { xs: "1.25rem", sm: "1.5rem" },
          flexShrink: 0,
        }}
      >
        פעולות מהירות
      </Typography>

      {/* Scrollable Container for Cards */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          pr: 1,
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(0,0,0,0.2)",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "rgba(0,0,0,0.3)",
          },
        }}
      >
        {/* Add to Home Screen Card - Moved to top */}
        {!isInstalled && (
          <Card
            sx={{
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              cursor: "pointer",
              transition: "all 0.3s ease",
              mb: 3,
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              },
            }}
            onClick={handleInstallClick}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1.5,
                }}
              >
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: "#4CAF50",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <GetAppIcon sx={{ fontSize: 28 }} />
                </Box>
                <IconButton
                  sx={{
                    color: "text.secondary",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <ArrowForwardIcon />
                </IconButton>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                הוסף למסך הבית
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1.5 }}
              >
                {isInstallable
                  ? "התקן את האפליקציה למסך הבית לחוויית שימוש טובה יותר"
                  : "הוסף את האפליקציה למסך הבית לגישה מהירה"}
              </Typography>
              <Chip
                label={isInstallable ? "התקן עכשיו" : "הוסף למסך הבית"}
                size="small"
                sx={{
                  bgcolor: "#4CAF50",
                  color: "white",
                  fontWeight: 500,
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Installed Success Card - Moved to top */}
        {isInstalled && (
          <Card
            sx={{
              bgcolor: "#E8F5E8",
              border: "1px solid",
              borderColor: "#4CAF50",
              transition: "all 0.3s ease",
              mb: 3,
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 1.5,
                }}
              >
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: "#4CAF50",
                    color: "white",
                    mr: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <HomeIcon sx={{ fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#2E7D32" }}
                  >
                    האפליקציה מותקנת
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#2E7D32" }}>
                    האפליקציה זמינה במסך הבית
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Start Attendance Card */}
        {!isAttendanceClosed && (
          <Card
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: "white",
              cursor: "pointer",
              transition: "all 0.3s ease",
              mb: 2,
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
              },
            }}
            onClick={onStartAttendance}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1.5,
                }}
              >
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PeopleIcon sx={{ fontSize: 28 }} />
                </Box>
                <IconButton
                  sx={{
                    color: "white",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                  }}
                >
                  <ArrowForwardIcon />
                </IconButton>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                התחל נוכחות יומית
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 1.5 }}>
                סמן את נוכחות הילדים לקבוצה שלך היום
              </Typography>
              <Chip
                label="מומלץ להתחיל עכשיו"
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: 500,
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Group Info Card */}
        <Card
          sx={{
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            transition: "all 0.3s ease",
            mb: 3,
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            },
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 1.5,
              }}
            >
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: "secondary.main",
                  color: "white",
                  mr: 2,
                }}
              >
                <GroupIcon />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  מידע על הקבוצה
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  פרטי הקבוצה שלך
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 1.5 }} />
            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <AccountIcon
                  sx={{ fontSize: 18, color: "text.secondary", mr: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {user?.groupId ? "קבוצה מוגדרת" : "לא הוגדרה קבוצה"}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <TodayIcon
                  sx={{ fontSize: 18, color: "text.secondary", mr: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {formatDate(currentTime)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Sleep Report Card */}
        <Card
          sx={{
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            cursor: "pointer",
            transition: "all 0.3s ease",
            mb: 3,
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            },
          }}
          onClick={() => navigate(ROUTES.SLEEP_POST)}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1.5,
              }}
            >
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: "#9C27B0",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BedtimeIcon sx={{ fontSize: 28 }} />
              </Box>
              <IconButton
                sx={{
                  color: "text.secondary",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <ArrowForwardIcon />
              </IconButton>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              דוח שינה
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              צור דוח שינה עבור הילדים
            </Typography>
            <Chip
              label="חדש"
              size="small"
              sx={{
                bgcolor: "#9C27B0",
                color: "white",
                fontWeight: 500,
              }}
            />
          </CardContent>
        </Card>
      </Box>

      {/* Install Alert */}
      <Snackbar
        open={showInstallAlert}
        autoHideDuration={4000}
        onClose={() => setShowInstallAlert(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowInstallAlert(false)}
          severity={installMessage.includes("בהצלחה") ? "success" : "info"}
          sx={{ width: "100%" }}
        >
          {installMessage}
        </Alert>
      </Snackbar>

      {/* Instructions Dialog */}
      <Dialog
        open={showInstructionsDialog}
        onClose={() => setShowInstructionsDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 0,
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "primary.main",
            color: "white",
            textAlign: "center",
            py: 3,
          }}
        >
          <GetAppIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, fontSize: "1.5rem" }}>
            הוסף למסך הבית
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ textAlign: "center", py: 4, px: 3 }}>
          {isIOS ? (
            <>
              <Typography
                variant="h6"
                color="text.primary"
                sx={{
                  mb: 3,
                  fontWeight: 600,
                  fontSize: "1.2rem",
                }}
              >
                הוראות להוספה למסך הבית ב-iPhone
              </Typography>
              <Box
                sx={{
                  bgcolor: "grey.50",
                  borderRadius: 2,
                  p: 3,
                  mb: 3,
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                  1. לחץ על כפתור השיתוף (□↑) בתחתית המסך
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                  2. גלול למטה ולחץ על "הוסף למסך הבית"
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  3. לחץ על "הוסף" לאישור
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                האפליקציה תופיע במסך הבית שלך ותתנהג כמו אפליקציה רגילה
              </Typography>
            </>
          ) : (
            <>
              <Typography
                variant="h6"
                color="text.primary"
                sx={{
                  mb: 3,
                  fontWeight: 600,
                  fontSize: "1.2rem",
                }}
              >
                הוראות להוספה למסך הבית
              </Typography>

              {/* PWA Status Info */}
              <Box
                sx={{
                  bgcolor: "info.50",
                  borderRadius: 2,
                  p: 2,
                  mb: 3,
                  border: "1px solid",
                  borderColor: "info.200",
                }}
              >
                <Typography
                  variant="body2"
                  color="info.main"
                  sx={{ fontWeight: 500, mb: 1 }}
                >
                  מידע טכני:
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mb: 0.5 }}
                >
                  {checkPWACriteria().hasManifest ? "✅" : "❌"} Manifest קיים
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mb: 0.5 }}
                >
                  {checkPWACriteria().hasHttps ? "✅" : "❌"} חיבור מאובטח
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block" }}
                >
                  {checkPWACriteria().hasServiceWorker ? "✅" : "❌"} Service
                  Worker פעיל
                </Typography>
              </Box>

              <Box
                sx={{
                  bgcolor: "grey.50",
                  borderRadius: 2,
                  p: 3,
                  mb: 3,
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                  1. לחץ על התפריט (⋮) בפינה הימנית העליונה
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                  2. לחץ על "הוסף למסך הבית" או "Install app"
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  3. לחץ על "הוסף" או "Install" לאישור
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                האפליקציה תופיע במסך הבית שלך ותתנהג כמו אפליקציה רגילה
              </Typography>
            </>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: "center",
            gap: 2,
            px: 3,
            pb: 3,
            pt: 1,
          }}
        >
          <Button
            onClick={() => setShowInstructionsDialog(false)}
            variant="outlined"
            size="large"
            sx={{
              minWidth: 120,
              borderColor: "grey.300",
              color: "text.secondary",
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontSize: "0.95rem",
              fontWeight: 600,
              "&:hover": {
                borderColor: "grey.500",
                backgroundColor: "grey.50",
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            הבנתי
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuickActionsSlide;
