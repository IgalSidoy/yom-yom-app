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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Drawer,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import { useLanguage } from "../contexts/LanguageContext";
import { useApp } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";
import { userApi, childApi, User, UserChild } from "../services/api";
import Notification from "../components/Notification";

const ParentSettings = () => {
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
  const [children, setChildren] = useState<UserChild[]>([]);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<UserChild | null>(null);
  const [childForm, setChildForm] = useState<Partial<UserChild>>({});
  const [isChildFormModified, setIsChildFormModified] = useState(false);

  const calculateAge = (dateStr: string) => {
    if (!dateStr || dateStr === "0001-01-01T00:00:00") {
      return "לא ידוע";
    }
    const birthDate = new Date(dateStr);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return `${age} שנים`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === "0001-01-01T00:00:00") {
      return "לא זמין";
    }
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("he-IL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  };

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

  const handleChildFormChange = (field: keyof UserChild, value: string) => {
    setChildForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    setIsChildFormModified(true);
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

  const fetchChildren = async () => {
    try {
      setIsLoadingChildren(true);
      const response = await userApi.getUserChildren();
      if (response.data.children) {
        setChildren(response.data.children);
      }
    } catch (error) {
      console.error("Error fetching children:", error);
      showNotification("שגיאה בטעינת הילדים", "error");
    } finally {
      setIsLoadingChildren(false);
    }
  };

  const handleAccordionChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedAccordion(isExpanded ? panel : false);

      if (isExpanded && panel === "children") {
        fetchChildren();
      }
    };

  const handleChildSelect = (child: UserChild) => {
    setSelectedChild(child);
    setChildForm({
      firstName: child.firstName,
      lastName: child.lastName,
    });
    setIsChildFormModified(false);
    setDrawerOpen(true);
  };

  const handleChildSave = async () => {
    if (!selectedChild || !isChildFormModified) return;

    try {
      setIsLoading(true);
      const response = await childApi.updateChild(selectedChild.id, childForm);
      if (response.child) {
        setChildren((prevChildren) =>
          prevChildren.map((c) =>
            c.id === response.child.id ? { ...c, ...response.child } : c
          )
        );
        setSelectedChild(null);
        setChildForm({});
        setIsChildFormModified(false);
        showNotification("הילד עודכן בהצלחה", "success");
      }
    } catch (error) {
      showNotification("שגיאה בעדכון הילד", "error");
    } finally {
      setIsLoading(false);
      setDrawerOpen(false);
    }
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
        <Typography variant="h5">הגדרות הורה</Typography>
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
          expanded={expandedAccordion === "children"}
          onChange={handleAccordionChange("children")}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="children-content"
            id="children-header"
          >
            <Typography variant="h6">הילדים שלי</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {isLoadingChildren ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
              </Box>
            ) : children.length > 0 ? (
              <List>
                {children.map((child) => (
                  <ListItem
                    key={child.id}
                    sx={{
                      bgcolor: "background.paper",
                      borderRadius: 2,
                      mb: 1,
                      border: "1px solid",
                      borderColor: "divider",
                      "&:hover": {
                        borderColor: "primary.main",
                        boxShadow: 1,
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 500,
                                color: child.firstName
                                  ? "text.primary"
                                  : "text.secondary",
                                fontStyle: child.firstName
                                  ? "normal"
                                  : "italic",
                              }}
                            >
                              {child.firstName && child.lastName
                                ? `${child.firstName} ${child.lastName}`
                                : "שם חסר"}
                            </Typography>
                            <IconButton
                              size="small"
                              aria-label="edit"
                              sx={{
                                color: "primary.main",
                                "&:hover": {
                                  bgcolor: "primary.lighter",
                                },
                              }}
                              onClick={() => handleChildSelect(child)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              flexWrap: "wrap",
                            }}
                          >
                            {child.accountName && (
                              <Chip
                                label={`סניף: ${child.accountName}`}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: "0.75rem",
                                  fontWeight: 500,
                                  bgcolor: "#2196f3",
                                  color: "white",
                                  "& .MuiChip-label": {
                                    color: "white",
                                  },
                                }}
                              />
                            )}
                            {child.groupName && (
                              <Chip
                                label={`קבוצה: ${child.groupName}`}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: "0.75rem",
                                  fontWeight: 500,
                                  bgcolor: "#9c27b0",
                                  color: "white",
                                  "& .MuiChip-label": {
                                    color: "white",
                                  },
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">
                לא נמצאו ילדים משויכים לחשבון זה
              </Typography>
            )}
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
                  label="התראות על פעילות הילדים"
                  sx={{ textAlign: "right" }}
                />
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 400 },
            p: 3,
          },
        }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              עריכת הילד
            </Typography>
            <Typography variant="body2" color="text.secondary">
              עדכון פרטי הילד
            </Typography>
          </Box>

          <Box sx={{ flex: 1 }}>
            {selectedChild && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                  "& .MuiTextField-root": {
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "primary.main",
                      },
                    },
                  },
                }}
              >
                <TextField
                  fullWidth
                  label="שם פרטי"
                  value={childForm.firstName || ""}
                  onChange={(e) =>
                    handleChildFormChange("firstName", e.target.value)
                  }
                  disabled={isLoading}
                  sx={{ direction: "rtl" }}
                />
                <TextField
                  fullWidth
                  label="שם משפחה"
                  value={childForm.lastName || ""}
                  onChange={(e) =>
                    handleChildFormChange("lastName", e.target.value)
                  }
                  disabled={isLoading}
                  sx={{ direction: "rtl" }}
                />
              </Box>
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              mt: "auto",
              pt: 3,
              borderTop: 1,
              borderColor: "divider",
            }}
          >
            <Button
              fullWidth
              onClick={() => setDrawerOpen(false)}
              variant="outlined"
              sx={{
                borderRadius: 2,
                textTransform: "none",
                py: 1.2,
              }}
            >
              ביטול
            </Button>
            <Button
              fullWidth
              onClick={handleChildSave}
              variant="contained"
              disabled={isLoading || !isChildFormModified}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                py: 1.2,
              }}
            >
              {isLoading ? "שומר..." : "שמירה"}
            </Button>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default ParentSettings;
