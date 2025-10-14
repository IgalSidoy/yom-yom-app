import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { Button, Card, FormField } from "../../../../shared/components";
import { AdminSettingsLayout } from "../../../../shared/components/layout";
import { useApp } from "../../../../contexts/AppContext";
import { userApi } from "../../../../services/api";
import Notification from "../../../../shared/components/ui/Notification";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
}

const ProfileSettings: React.FC = () => {
  const { user, setUser } = useApp();
  const [profile, setProfile] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
  });
  const [isModified, setIsModified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  // Initialize profile when user data is available
  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        mobile: user.mobile || "",
      });
    }
  }, [user]);

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

  const handleChange = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setIsModified(true);
    setError(null);
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const response = await userApi.updateUser({
        ...user,
        ...profile,
      });

      setUser(response.data.user);
      setIsModified(false);
      showNotification("הפרופיל עודכן בהצלחה", "success");
    } catch (err) {
      setError("שגיאה בעדכון הפרופיל");
      showNotification("שגיאה בעדכון הפרופיל", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminSettingsLayout title="פרופיל אישי">
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
      <Card
        title="עדכון פרטי המשתמש"
        sx={{
          borderRadius: { xs: 2, sm: 3 },
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
            transform: "translateY(-2px)",
          },
        }}
      >
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            width: "100%",
          }}
        >
          {error && (
            <Typography
              color="error"
              sx={{
                mb: 2,
                fontSize: { xs: "0.875rem", sm: "1rem" },
                px: { xs: 1, sm: 0 },
              }}
            >
              {error}
            </Typography>
          )}

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: { xs: 2, sm: 3 },
            }}
          >
            {/* First Name and Last Name */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 2, sm: 3 },
                width: "100%",
              }}
            >
              <Box sx={{ flex: 1, width: "100%" }}>
                <FormField
                  name="firstName"
                  label="שם פרטי"
                  value={profile.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  disabled={loading}
                  validation={{ required: true }}
                  sx={{
                    width: "100%",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: { xs: 2, sm: 3 },
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                      minHeight: { xs: "48px", sm: "56px" },
                    },
                  }}
                />
              </Box>
              <Box sx={{ flex: 1, width: "100%" }}>
                <FormField
                  name="lastName"
                  label="שם משפחה"
                  value={profile.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  disabled={loading}
                  validation={{ required: true }}
                  sx={{
                    width: "100%",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: { xs: 2, sm: 3 },
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                      minHeight: { xs: "48px", sm: "56px" },
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Email and Mobile */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 2, sm: 3 },
                width: "100%",
              }}
            >
              <Box sx={{ flex: 1, width: "100%" }}>
                <FormField
                  name="email"
                  label="אימייל"
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  disabled={loading}
                  validation={{ required: true }}
                  sx={{
                    width: "100%",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: { xs: 2, sm: 3 },
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                      minHeight: { xs: "48px", sm: "56px" },
                    },
                  }}
                />
              </Box>
              <Box sx={{ flex: 1, width: "100%" }}>
                <FormField
                  name="mobile"
                  label="נייד"
                  type="tel"
                  value={profile.mobile}
                  onChange={(e) => handleChange("mobile", e.target.value)}
                  disabled={loading}
                  sx={{
                    width: "100%",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: { xs: 2, sm: 3 },
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                      minHeight: { xs: "48px", sm: "56px" },
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* Save Button - Mobile-friendly */}
          <Box
            sx={{
              mt: { xs: 3, sm: 4 },
              display: "flex",
              justifyContent: { xs: "center", sm: "flex-end" },
              width: "100%",
            }}
          >
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={loading || !isModified}
              loading={loading}
              sx={{
                width: { xs: "100%", sm: "auto" },
                minHeight: { xs: "48px", sm: "40px" },
                borderRadius: { xs: 2, sm: 3 },
                textTransform: "none",
                fontWeight: 600,
                fontSize: { xs: "1rem", sm: "0.875rem" },
                px: { xs: 3, sm: 4 },
                py: { xs: 1.5, sm: 1 },
                boxShadow: "0 2px 8px rgba(255, 145, 77, 0.3)",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(255, 145, 77, 0.4)",
                  transform: "translateY(-1px)",
                },
                "&:disabled": {
                  opacity: 0.6,
                  transform: "none",
                },
              }}
            >
              שמירת שינויים
            </Button>
          </Box>
        </Box>
      </Card>
    </AdminSettingsLayout>
  );
};

export default ProfileSettings;
