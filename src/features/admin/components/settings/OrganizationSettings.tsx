import React, { useState, useEffect } from "react";
import { Box, Typography, Paper } from "@mui/material";
import { Button, Card, FormField } from "../../../../shared/components";
import { AdminSettingsLayout } from "../../../../shared/components/layout";
import { useApp } from "../../../../contexts/AppContext";
import { organizationApi, Organization } from "../../../../services/api";
import Notification from "../../../../shared/components/ui/Notification";

const OrganizationSettings: React.FC = () => {
  const { user } = useApp();
  const [organization, setOrganization] = useState<Organization>({
    id: "",
    businessId: "",
    name: "",
    email: "",
    phone: "",
    created: "",
    updated: "",
  });
  const [initialOrganization, setInitialOrganization] = useState<Organization>({
    id: "",
    businessId: "",
    name: "",
    email: "",
    phone: "",
    created: "",
    updated: "",
  });
  const [isModified, setIsModified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  const formatMobileNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
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

  const fetchOrganization = async (organizationId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await organizationApi.getOrganization(organizationId);
      const formattedData = {
        ...response.data.organization,
        phone: formatMobileNumber(response.data.organization.phone),
      };
      setOrganization(formattedData);
      setInitialOrganization(formattedData);
      setIsModified(false);
    } catch (err) {
      setError("שגיאה בטעינת פרטי הארגון");
      showNotification("שגיאה בטעינת פרטי הארגון", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.organizationId) {
      fetchOrganization(user.organizationId);
    }
  }, [user?.organizationId]);

  const handleChange = (field: keyof Organization, value: string) => {
    setOrganization((prev) => ({ ...prev, [field]: value }));
    setIsModified(true);
    setError(null);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      const hasChanges =
        initialOrganization.businessId !== organization.businessId ||
        initialOrganization.name !== organization.name ||
        initialOrganization.email !== organization.email ||
        initialOrganization.phone !== organization.phone;

      if (hasChanges) {
        const response = await organizationApi.updateOrganization(
          organization,
          initialOrganization
        );
        const formattedData = {
          ...response.data.organization,
          phone: formatMobileNumber(response.data.organization.phone),
        };
        setOrganization(formattedData);
        setInitialOrganization(formattedData);
      }
      setIsModified(false);
      showNotification("השינויים נשמרו בהצלחה", "success");
    } catch (err) {
      setError("שגיאה בשמירת השינויים");
      showNotification("שגיאה בשמירת השינויים", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !organization.id) {
    return (
      <AdminSettingsLayout title="פרטי הגן" subtitle="טוען פרטי הארגון...">
        <Card>
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography>טוען...</Typography>
          </Box>
        </Card>
      </AdminSettingsLayout>
    );
  }

  return (
    <AdminSettingsLayout title="פרטי הגן" subtitle="עדכון פרטי הארגון">
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
      <Card
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
            {/* Business ID and Organization Name */}
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
                  name="businessId"
                  label="מספר עוסק"
                  value={organization.businessId}
                  onChange={(e) => handleChange("businessId", e.target.value)}
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
              <Box sx={{ flex: 1, width: "100%" }}>
                <FormField
                  name="name"
                  label="שם הארגון"
                  value={organization.name}
                  onChange={(e) => handleChange("name", e.target.value)}
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

            {/* Email and Phone */}
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
                  value={organization.email}
                  onChange={(e) => handleChange("email", e.target.value)}
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
              <Box sx={{ flex: 1, width: "100%" }}>
                <FormField
                  name="phone"
                  label="נייד"
                  type="tel"
                  value={organization.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
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

            {/* Organization Info Cards */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 2, sm: 3 },
                width: "100%",
              }}
            >
              <Box sx={{ flex: 1, width: "100%" }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2, sm: 2 },
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: { xs: 2, sm: 3 },
                    bgcolor: "background.paper",
                    width: "100%",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                    },
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "block",
                      mb: 0.5,
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    }}
                  >
                    נוצר בתאריך
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                    }}
                  >
                    {formatDate(organization.created)}
                  </Typography>
                </Paper>
              </Box>
              <Box sx={{ flex: 1, width: "100%" }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2, sm: 2 },
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: { xs: 2, sm: 3 },
                    bgcolor: "background.paper",
                    width: "100%",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                    },
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "block",
                      mb: 0.5,
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    }}
                  >
                    עודכן בתאריך
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                    }}
                  >
                    {formatDate(organization.updated)}
                  </Typography>
                </Paper>
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

export default OrganizationSettings;
