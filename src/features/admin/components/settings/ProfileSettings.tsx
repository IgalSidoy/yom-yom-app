import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { Button, Card, FormField } from "../../../../shared/components";
import { useApp } from "../../../../contexts/AppContext";
import { userApi } from "../../../../services/api";
import AdminSettingsLayout from "../layout/AdminSettingsLayout";

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
    } catch (err) {
      setError("שגיאה בעדכון הפרופיל");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminSettingsLayout title="פרופיל אישי">
      <Card title="עדכון פרטי המשתמש">
        <Box sx={{ p: 3 }}>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 3,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <FormField
                  name="firstName"
                  label="שם פרטי"
                  value={profile.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  disabled={loading}
                  validation={{ required: true }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <FormField
                  name="lastName"
                  label="שם משפחה"
                  value={profile.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  disabled={loading}
                  validation={{ required: true }}
                />
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 3,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <FormField
                  name="email"
                  label="אימייל"
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  disabled={loading}
                  validation={{ required: true }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <FormField
                  name="mobile"
                  label="נייד"
                  type="tel"
                  value={profile.mobile}
                  onChange={(e) => handleChange("mobile", e.target.value)}
                  disabled={loading}
                />
              </Box>
            </Box>
          </Box>

          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={loading || !isModified}
              loading={loading}
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
