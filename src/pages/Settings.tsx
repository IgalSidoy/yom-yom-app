import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Grid,
} from "@mui/material";
import { useLanguage } from "../contexts/LanguageContext";
import {
  organizationApi,
  Organization,
  accountApi,
  Account,
  userApi,
  User,
} from "../services/api";
import Notification from "../components/Notification";

const Settings = () => {
  const { language, setLanguage } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization>({
    id: "",
    businessId: "",
    name: "",
    email: "",
    phone: "",
    created: "",
    updated: "",
  });
  const [account, setAccount] = useState<Account>({
    id: "",
    branchName: "",
    branchCode: -1,
    organizationId: "",
    created: "",
    updated: "",
  });

  const formatMobileNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "");

    // Format as Israeli mobile number (050-1234567)
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(
        6,
        10
      )}`;
    }
  };

  const setFormattedOrganization = (data: Organization) => {
    setOrganization({
      ...data,
      phone: formatMobileNumber(data.phone),
    });
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

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const response = await userApi.getUser();
      const userData = response.data.user;
      setUser(userData);
      await Promise.all([
        fetchOrganization(userData.organizationId),
        fetchAccount(userData.accountId),
      ]);
    } catch (error) {
      showNotification("שגיאה בטעינת פרטי המשתמש", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrganization = async (organizationId: string) => {
    try {
      const response = await organizationApi.getOrganization(organizationId);
      setFormattedOrganization(response.data.organization);
    } catch (error) {
      showNotification("שגיאה בטעינת פרטי הארגון", "error");
    }
  };

  const fetchAccount = async (accountId: string) => {
    try {
      const response = await accountApi.getAccount(accountId);
      setAccount(response.data.account);
    } catch (error) {
      showNotification("שגיאה בטעינת פרטי הסניף", "error");
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await organizationApi.updateOrganization(organization);
      showNotification("השינויים נשמרו בהצלחה", "success");
    } catch (error) {
      showNotification("שגיאה בשמירת השינויים", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAccount = async () => {
    try {
      setIsSaving(true);
      await accountApi.updateAccount(account);
      showNotification("השינויים נשמרו בהצלחה", "success");
    } catch (error) {
      showNotification("שגיאה בשמירת השינויים", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    let formattedValue = value;
    if (value.length > 0) {
      formattedValue = value.replace(/(\d{3})(?=\d)/g, "$1-");
    }
    setOrganization({ ...organization, phone: formattedValue });
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "0001-01-01T00:00:00") {
      return "לא זמין";
    }
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("he-IL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
      .format(date)
      .replace(",", ":");
  };

  return (
    <Box sx={{ mt: 4, textAlign: "center", px: 2 }}>
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />

      <Typography variant="h5" sx={{ mb: 3 }}>
        הגדרות
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4, maxWidth: 600, mx: "auto" }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          הגדרת שפה
        </Typography>
        <FormControl fullWidth sx={{ maxWidth: 300, mx: "auto" }}>
          <InputLabel id="language-select-label">Language</InputLabel>
          <Select
            labelId="language-select-label"
            id="language-select"
            value={language}
            label="Language"
            onChange={(e) =>
              setLanguage(e.target.value as "heb" | "rus" | "eng")
            }
          >
            <MenuItem value="heb">Hebrew</MenuItem>
            <MenuItem value="rus">Russian</MenuItem>
            <MenuItem value="eng">English</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 4, maxWidth: 600, mx: "auto" }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          פרטי הגן
        </Typography>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ textAlign: "right" }}>
            <Box sx={{ mb: 4 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr", // One column on mobile
                    sm: "repeat(2, 1fr)", // Two columns on tablet and up
                  },
                  gap: 2,
                }}
              >
                <TextField
                  fullWidth
                  label="מספר עוסק"
                  value={organization.businessId}
                  onChange={(e) =>
                    setOrganization({
                      ...organization,
                      businessId: e.target.value,
                    })
                  }
                  disabled={isLoading}
                  sx={{ direction: "rtl" }}
                />
                <TextField
                  fullWidth
                  label="שם הארגון"
                  value={organization.name}
                  onChange={(e) =>
                    setOrganization({ ...organization, name: e.target.value })
                  }
                  disabled={isLoading}
                  sx={{ direction: "rtl" }}
                />
                <TextField
                  fullWidth
                  label="אימייל"
                  type="email"
                  value={organization.email}
                  onChange={(e) =>
                    setOrganization({
                      ...organization,
                      email: e.target.value,
                    })
                  }
                  disabled={isLoading}
                  sx={{ direction: "rtl" }}
                />
                <TextField
                  fullWidth
                  label="נייד"
                  value={organization.phone}
                  onChange={handleMobileChange}
                  disabled={isLoading}
                  sx={{ direction: "rtl" }}
                />
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    bgcolor: "background.paper",
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 0.5 }}
                  >
                    נוצר בתאריך
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formatDate(organization.created)}
                  </Typography>
                </Paper>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    bgcolor: "background.paper",
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 0.5 }}
                  >
                    עודכן בתאריך
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formatDate(organization.updated)}
                  </Typography>
                </Paper>
              </Box>
              <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} /> : null}
                >
                  שמירת שינויים
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Paper>

      <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          פרטי הסניף
        </Typography>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ textAlign: "right" }}>
            <Box sx={{ mb: 4 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr", // One column on mobile
                    sm: "repeat(2, 1fr)", // Two columns on tablet and up
                  },
                  gap: 2,
                }}
              >
                <TextField
                  fullWidth
                  label="שם הסניף"
                  value={account.branchName}
                  onChange={(e) =>
                    setAccount({
                      ...account,
                      branchName: e.target.value,
                    })
                  }
                  disabled={isLoading}
                  sx={{ direction: "rtl" }}
                />
                <TextField
                  fullWidth
                  label="קוד סניף"
                  type="number"
                  value={account.branchCode === -1 ? "" : account.branchCode}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      setAccount({
                        ...account,
                        branchCode: -1,
                      });
                    } else {
                      const numValue = parseInt(value);
                      if (numValue >= 0 && numValue <= 999) {
                        setAccount({
                          ...account,
                          branchCode: numValue,
                        });
                      }
                    }
                  }}
                  inputProps={{
                    min: 0,
                    max: 999,
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                  }}
                  disabled={isLoading}
                  sx={{ direction: "rtl" }}
                  helperText="אופציונלי, מספר חיובי עד 999"
                />
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    bgcolor: "background.paper",
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 0.5 }}
                  >
                    נוצר בתאריך
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formatDate(account.created)}
                  </Typography>
                </Paper>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    bgcolor: "background.paper",
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 0.5 }}
                  >
                    עודכן בתאריך
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formatDate(account.updated)}
                  </Typography>
                </Paper>
              </Box>
              <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  onClick={handleSaveAccount}
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} /> : null}
                >
                  שמירת שינויים
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Settings;
