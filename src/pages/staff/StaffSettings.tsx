import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Snackbar,
  Alert,
  IconButton,
  InputAdornment,
  Avatar,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LogoutIcon from "@mui/icons-material/Logout";
import { useLanguage } from "../../contexts/LanguageContext";
import { useApp } from "../../contexts/AppContext";
import { useAuth } from "../../contexts/AuthContext";
import { userApi, User } from "../../services/api";
import Notification from "../../shared/components/ui/Notification";

const StaffSettings = () => {
  const { language, setLanguage } = useLanguage();
  const { user, setUser } = useApp();
  const { accessToken, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(
    false
  );
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });
  const [userProfile, setUserProfile] = useState<Partial<User>>({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
  });
  const [isProfileModified, setIsProfileModified] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [languagePreference, setLanguagePreference] = useState("he");

  const showNotification = (
    message: string,
    severity: "success" | "error" | "info" | "warning" = "success"
  ) => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const handleProfileChange = (field: keyof User, value: string) => {
    setUserProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
    setIsProfileModified(true);
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      if (user && userProfile) {
        await userApi.updateUser({
          ...user,
          ...userProfile,
        });
        setUser({ ...user, ...userProfile });
        setIsProfileModified(false);
        showNotification("הפרופיל עודכן בהצלחה", "success");
      }
    } catch (error) {
      showNotification("שגיאה בעדכון הפרופיל", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccordionChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedAccordion(isExpanded ? panel : false);
    };

  useEffect(() => {
    if (user) {
      setUserProfile({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        mobile: user.mobile || "",
      });
    }
  }, [user]);

  return (
    <Box sx={{ mt: 4, textAlign: "center", px: 2 }}>
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />

      {/* Sticky Title */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 5,
          bgcolor: "background.default",
          pt: 2,
          pb: 2,
          mb: 3,
          px: 2,
        }}
      >
        <Typography variant="h5">הגדרות צוות</Typography>
      </Box>

      <Box sx={{ width: "100%", px: 2 }}>
        <Accordion
          expanded={expandedAccordion === "profile"}
          onChange={handleAccordionChange("profile")}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="profile-content"
            id="profile-header"
          >
            <Typography variant="h6">פרופיל אישי</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ textAlign: "right" }}>
              <Box sx={{ mb: 4 }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, 1fr)",
                    },
                    gap: 2,
                  }}
                >
                  <TextField
                    fullWidth
                    label="שם פרטי"
                    value={userProfile.firstName}
                    onChange={(e) =>
                      handleProfileChange("firstName", e.target.value)
                    }
                    disabled={isLoading}
                    sx={{ direction: "rtl" }}
                  />
                  <TextField
                    fullWidth
                    label="שם משפחה"
                    value={userProfile.lastName}
                    onChange={(e) =>
                      handleProfileChange("lastName", e.target.value)
                    }
                    disabled={isLoading}
                    sx={{ direction: "rtl" }}
                  />
                  <TextField
                    name="email"
                    label="אימייל"
                    value={userProfile.email}
                    onChange={(e) =>
                      handleProfileChange("email", e.target.value)
                    }
                    disabled={isLoading}
                    sx={{
                      borderRadius: 2,
                      "& .MuiInputBase-input": {
                        direction: "ltr",
                        textAlign: "left",
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    label="נייד"
                    value={userProfile.mobile}
                    onChange={(e) =>
                      handleProfileChange("mobile", e.target.value)
                    }
                    disabled={isLoading}
                    sx={{ direction: "rtl" }}
                  />
                </Box>
                <Box
                  sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}
                >
                  <Button
                    variant="contained"
                    onClick={handleSaveProfile}
                    disabled={isLoading || !isProfileModified}
                    startIcon={
                      isLoading ? <CircularProgress size={20} /> : null
                    }
                  >
                    שמירת שינויים
                  </Button>
                </Box>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>

        <Accordion
          expanded={expandedAccordion === "preferences"}
          onChange={handleAccordionChange("preferences")}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="preferences-content"
            id="preferences-header"
          >
            <Typography variant="h6">העדפות</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ textAlign: "right" }}>
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>שפה</InputLabel>
                  <Select
                    value={languagePreference}
                    label="שפה"
                    onChange={(e) => setLanguagePreference(e.target.value)}
                  >
                    <MenuItem value="he">עברית</MenuItem>
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="ar">العربية</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationsEnabled}
                      onChange={(e) =>
                        setNotificationsEnabled(e.target.checked)
                      }
                    />
                  }
                  label="התראות"
                  sx={{ textAlign: "right" }}
                />
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>

        <Accordion
          expanded={expandedAccordion === "account"}
          onChange={handleAccordionChange("account")}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="account-content"
            id="account-header"
          >
            <Typography variant="h6">חשבון</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ textAlign: "right" }}>
              {/* User Info Display */}
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      bgcolor: "primary.main",
                      fontSize: "1.5rem",
                      fontWeight: 600,
                    }}
                  >
                    {user?.firstName?.charAt(0) || "U"}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {user?.firstName} {user?.lastName}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {user?.email}
                    </Typography>
                    <Chip
                      label="צוות"
                      size="small"
                      color="primary"
                      sx={{
                        fontSize: "0.7rem",
                        height: 24,
                        fontWeight: 500,
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Language Selector */}
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>שפה</InputLabel>
                  <Select
                    value={language}
                    label="שפה"
                    onChange={(e) => setLanguage(e.target.value as any)}
                  >
                    <MenuItem value="heb">עברית</MenuItem>
                    <MenuItem value="rus">Русский</MenuItem>
                    <MenuItem value="eng">English</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Logout Button */}
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<LogoutIcon />}
                  onClick={logout}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    py: 1.2,
                    px: 3,
                    fontWeight: 500,
                    borderWidth: 2,
                    "&:hover": {
                      borderWidth: 2,
                      backgroundColor: "error.lighter",
                    },
                  }}
                >
                  התנתק
                </Button>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
};

export default StaffSettings;
