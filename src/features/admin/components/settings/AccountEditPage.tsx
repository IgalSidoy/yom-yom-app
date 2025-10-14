import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Paper,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { AdminSettingsLayout } from "../../../../shared/components/layout";
import { useApp } from "../../../../contexts/AppContext";
import { accountApi, Account } from "../../../../services/api";
import Notification from "../../../../shared/components/ui/Notification";

const AccountEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useApp();

  const isEditMode = id && id !== "new";

  const [account, setAccount] = useState<Partial<Account>>({
    branchName: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  const showNotification = useCallback(
    (
      message: string,
      severity: "success" | "error" | "info" | "warning" = "success"
    ) => {
      setNotification({
        open: true,
        message,
        severity,
      });
    },
    []
  );

  const handleCloseNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, open: false }));
  }, []);

  const fetchAccount = useCallback(
    async (accountId: string) => {
      try {
        setLoading(true);
        setError(null);
        const response = await accountApi.getAccounts();
        const foundAccount = response.data.accounts.find(
          (acc: Account) => acc.id === accountId
        );

        if (foundAccount) {
          setAccount(foundAccount);
        } else {
          setError("סניף לא נמצא");
          showNotification("סניף לא נמצא", "error");
        }
      } catch (err) {
        setError("שגיאה בטעינת פרטי הסניף");
        showNotification("שגיאה בטעינת פרטי הסניף", "error");
      } finally {
        setLoading(false);
      }
    },
    [showNotification]
  );

  useEffect(() => {
    if (isEditMode && id) {
      fetchAccount(id);
    }
  }, [isEditMode, id, fetchAccount]);

  const handleInputChange = useCallback(
    (field: keyof Account, value: string | number | boolean) => {
      setAccount((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const handleSave = useCallback(async () => {
    if (!account.branchName?.trim()) {
      showNotification("יש להזין שם סניף", "error");
      return;
    }

    try {
      setSaving(true);

      if (isEditMode && id) {
        // Find the original account for comparison
        const response = await accountApi.getAccounts();
        const originalAccount = response.data.accounts.find(
          (acc: Account) => acc.id === id
        );

        if (!originalAccount) {
          showNotification("סניף לא נמצא", "error");
          return;
        }

        await accountApi.updateAccount(account as Account, originalAccount);
        showNotification("הסניף עודכן בהצלחה", "success");
      } else {
        // Create new account
        await accountApi.createAccount({
          ...account,
          organizationId: user?.organizationId || "",
        } as Omit<Account, "id" | "created" | "updated">);
        showNotification("הסניף נוצר בהצלחה", "success");
      }

      // Navigate back to accounts list
      setTimeout(() => {
        navigate("/admin/settings/accounts");
      }, 1500);
    } catch (err) {
      const errorMessage = isEditMode
        ? "שגיאה בעדכון הסניף"
        : "שגיאה ביצירת הסניף";
      setError(errorMessage);
      showNotification(errorMessage, "error");
    } finally {
      setSaving(false);
    }
  }, [
    account,
    isEditMode,
    id,
    user?.organizationId,
    showNotification,
    navigate,
  ]);

  const handleCancel = useCallback(() => {
    navigate("/admin/settings/accounts");
  }, [navigate]);

  if (loading) {
    return (
      <AdminSettingsLayout
        title={isEditMode ? "עריכת סניף" : "הוספת סניף חדש"}
        subtitle="טוען פרטי סניף..."
      >
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <CircularProgress sx={{ color: "primary.main", mb: 2 }} />
          <Typography>טוען...</Typography>
        </Paper>
      </AdminSettingsLayout>
    );
  }

  return (
    <AdminSettingsLayout
      title={isEditMode ? "עריכת סניף" : "הוספת סניף חדש"}
      subtitle={isEditMode ? "עדכון פרטי הסניף" : "הזן את פרטי הסניף החדש"}
    >
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />

      <Paper
        sx={{
          p: 3,
          mb: { xs: 3, sm: 0 }, // Add bottom margin on mobile for better form visibility
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
        }}
      >
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

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
            label="שם הסניף"
            value={account.branchName || ""}
            onChange={(e) => handleInputChange("branchName", e.target.value)}
            placeholder="הזן את שם הסניף"
            required
            disabled={saving}
            sx={{
              "& .MuiInputLabel-root": {
                fontSize: "0.95rem",
              },
            }}
          />

          {isEditMode && account.created && (
            <Box
              sx={{
                mt: 2,
                pt: 3,
                borderTop: 1,
                borderColor: "divider",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  mb: 1,
                  color: "text.primary",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                פרטי מערכת
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  bgcolor: "background.default",
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.75rem",
                    }}
                  >
                    נוצר בתאריך
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.primary",
                      fontWeight: 500,
                    }}
                  >
                    {account.created
                      ? new Intl.DateTimeFormat("he-IL", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })
                          .format(new Date(account.created))
                          .replace(",", ":")
                      : "לא זמין"}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.75rem",
                    }}
                  >
                    עודכן בתאריך
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.primary",
                      fontWeight: 500,
                    }}
                  >
                    {account.updated
                      ? new Intl.DateTimeFormat("he-IL", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })
                          .format(new Date(account.updated))
                          .replace(",", ":")
                      : "לא זמין"}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            mt: 4,
            pt: 3,
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <Button
            fullWidth
            onClick={handleCancel}
            variant="outlined"
            disabled={saving}
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
            onClick={handleSave}
            variant="contained"
            disabled={saving || !account.branchName?.trim()}
            startIcon={saving ? <CircularProgress size={20} /> : null}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              py: 1.2,
              boxShadow: "0 2px 8px rgba(255, 145, 77, 0.3)",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(255, 145, 77, 0.4)",
                transform: "translateY(-1px)",
              },
            }}
          >
            {saving ? "שומר..." : "שמירה"}
          </Button>
        </Box>
      </Paper>
    </AdminSettingsLayout>
  );
};

export default AccountEditPage;
