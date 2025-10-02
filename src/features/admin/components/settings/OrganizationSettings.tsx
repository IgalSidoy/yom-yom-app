import React, { useState, useEffect } from "react";
import { Box, Typography, Paper } from "@mui/material";
import { Button, Card, FormField } from "../../../../shared/components";
import { AdminSettingsLayout } from "../../../../shared/components/layout";
import { useApp } from "../../../../contexts/AppContext";
import { organizationApi, Organization } from "../../../../services/api";

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
    } catch (err) {
      setError("שגיאה בשמירת השינויים");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !organization.id) {
    return (
      <AdminSettingsLayout
        title="פרטי הגן"
        subtitle="טוען פרטי הארגון..."
      >
        <Card>
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography>טוען...</Typography>
          </Box>
        </Card>
      </AdminSettingsLayout>
    );
  }

  return (
    <AdminSettingsLayout
      title="פרטי הגן"
      subtitle="עדכון פרטי הארגון"
    >
      <Card>
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
                  name="businessId"
                  label="מספר עוסק"
                  value={organization.businessId}
                  onChange={(e) => handleChange("businessId", e.target.value)}
                  disabled={loading}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <FormField
                  name="name"
                  label="שם הארגון"
                  value={organization.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  disabled={loading}
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
                  value={organization.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  disabled={loading}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <FormField
                  name="phone"
                  label="נייד"
                  type="tel"
                  value={organization.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  disabled={loading}
                />
              </Box>
            </Box>

            {/* Organization Info */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 3,
              }}
            >
              <Box sx={{ flex: 1 }}>
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
              </Box>
              <Box sx={{ flex: 1 }}>
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

export default OrganizationSettings;
