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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useLanguage } from "../contexts/LanguageContext";
import { useApp } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";
import { userApi, User } from "../services/api";
import Notification from "../components/Notification";

const StaffSettings = () => {
  const { language, setLanguage } = useLanguage();
  const { user, setUser } = useApp();
  const { accessToken } = useAuth();
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
        }}
      >
        <Typography variant="h5">הגדרות צוות</Typography>
      </Box>

      <Box sx={{ maxWidth: 600, mx: "auto" }}>
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
      </Box>
    </Box>
  );
};

export default StaffSettings;
