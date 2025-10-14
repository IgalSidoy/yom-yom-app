import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Paper,
} from "@mui/material";
import {
  useParams,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import { AdminSettingsLayout } from "../../../../shared/components/layout";
import { useApp } from "../../../../contexts/AppContext";
import { groupApi, Group } from "../../../../services/api";
import Notification from "../../../../shared/components/ui/Notification";

const GroupEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useApp();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const isEditMode = id && id !== "new";
  const accountIdFromUrl = searchParams.get("accountId");

  // Get group data from navigation state (for edit mode) or initialize empty (for create mode)
  const groupFromState = location.state?.group as Group | undefined;

  const [group, setGroup] = useState<Partial<Group>>(
    groupFromState || {
      name: "",
      description: "",
      accountId: accountIdFromUrl || "",
    }
  );
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

  const fetchGroup = useCallback(
    async (groupId: string) => {
      try {
        setLoading(true);
        setError(null);
        const response = await groupApi.getGroupById(groupId);

        if (response.data?.group) {
          setGroup(response.data.group);
        } else {
          setError("קבוצה לא נמצאה");
          showNotification("קבוצה לא נמצאה", "error");
        }
      } catch (err) {
        console.error("Error fetching group:", err);
        setError("שגיאה בטעינת פרטי הקבוצה");
        showNotification("שגיאה בטעינת פרטי הקבוצה", "error");
        // Ensure group state is properly initialized even on error
        setGroup({
          name: "",
          description: "",
          accountId: accountIdFromUrl || "",
        });
      } finally {
        setLoading(false);
      }
    },
    [showNotification]
  );

  useEffect(() => {
    if (isEditMode && groupFromState) {
      // In edit mode, we already have the group data from navigation state
      setGroup(groupFromState);
    } else if (isEditMode && !groupFromState) {
      // Fallback: fetch group data if not available in state
      fetchGroup(id!);
    } else {
      // In create mode, ensure accountId is set from URL
      if (accountIdFromUrl && !group.accountId) {
        setGroup((prev) => ({ ...prev, accountId: accountIdFromUrl }));
      }
    }
  }, [
    isEditMode,
    id,
    accountIdFromUrl,
    group.accountId,
    groupFromState,
    fetchGroup,
  ]);

  const handleInputChange = useCallback(
    (field: keyof Group, value: string | number | boolean) => {
      setGroup((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const handleSave = useCallback(async () => {
    if (!group?.name?.trim()) {
      showNotification("יש להזין שם קבוצה", "error");
      return;
    }

    try {
      setSaving(true);

      if (isEditMode && id) {
        await groupApi.updateGroup(group as Group);
        showNotification("הקבוצה עודכנה בהצלחה", "success");
      } else {
        // Create new group
        await groupApi.createGroup({
          ...group,
          accountId: group.accountId,
        } as Omit<Group, "id" | "created" | "updated">);
        showNotification("הקבוצה נוצרה בהצלחה", "success");
      }

      // Navigate back to groups list with account context
      setTimeout(() => {
        const returnUrl = group?.accountId
          ? `/admin/settings/groups?accountId=${group.accountId}`
          : "/admin/settings/groups";
        navigate(returnUrl, { replace: true });
      }, 1500);
    } catch (err) {
      const errorMessage = isEditMode
        ? "שגיאה בעדכון הקבוצה"
        : "שגיאה ביצירת הקבוצה";
      setError(errorMessage);
      showNotification(errorMessage, "error");
    } finally {
      setSaving(false);
    }
  }, [group, isEditMode, id, showNotification, navigate]);

  const handleCancel = useCallback(() => {
    const returnUrl = group?.accountId
      ? `/admin/settings/groups?accountId=${group.accountId}`
      : "/admin/settings/groups";
    navigate(returnUrl, { replace: true });
  }, [navigate, group?.accountId]);

  if (loading) {
    return (
      <AdminSettingsLayout
        title={isEditMode ? "עריכת קבוצה" : "הוספת קבוצה חדשה"}
        subtitle="טוען פרטי קבוצה..."
      >
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <CircularProgress sx={{ color: "primary.main", mb: 2 }} />
          <Typography>טוען...</Typography>
        </Paper>
      </AdminSettingsLayout>
    );
  }

  // In edit mode, don't render the form until we have group data (either from state or API)
  if (isEditMode && !group && !groupFromState) {
    return (
      <AdminSettingsLayout
        title="עריכת קבוצה"
        subtitle="שגיאה בטעינת פרטי הקבוצה"
      >
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography color="error">שגיאה בטעינת פרטי הקבוצה</Typography>
        </Paper>
      </AdminSettingsLayout>
    );
  }

  return (
    <AdminSettingsLayout
      title={isEditMode ? "עריכת קבוצה" : "הוספת קבוצה חדשה"}
      subtitle={isEditMode ? "עדכון פרטי הקבוצה" : "הזן את פרטי הקבוצה החדשה"}
      backPath="/admin/settings/groups"
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
            label="שם הקבוצה"
            value={group?.name || ""}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="הזן את שם הקבוצה"
            required
            disabled={saving}
            sx={{
              "& .MuiInputLabel-root": {
                fontSize: "0.95rem",
              },
            }}
          />

          <TextField
            fullWidth
            label="תיאור הקבוצה"
            value={group?.description || ""}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="הזן תיאור לקבוצה (אופציונלי)"
            multiline
            rows={3}
            disabled={saving}
            sx={{
              "& .MuiInputLabel-root": {
                fontSize: "0.95rem",
              },
            }}
          />

          {isEditMode && group?.created && (
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
                    {group.created
                      ? new Intl.DateTimeFormat("he-IL", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })
                          .format(new Date(group.created))
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
                    {group.updated
                      ? new Intl.DateTimeFormat("he-IL", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })
                          .format(new Date(group.updated))
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
            disabled={saving || !group?.name?.trim()}
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

export default GroupEditPage;
