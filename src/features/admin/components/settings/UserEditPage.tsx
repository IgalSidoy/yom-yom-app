import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  useParams,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import { AdminSettingsLayout } from "../../../../shared/components/layout";
import { useApp } from "../../../../contexts/AppContext";
import {
  userApi,
  User,
  accountApi,
  Account,
  groupApi,
  Group,
} from "../../../../services/api";
import Notification from "../../../../shared/components/ui/Notification";
import { THEME_COLORS } from "../../../../config/colors";
import { formatPhoneNumber } from "../../../../utils/phoneUtils";

const UserEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useApp();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const isEditMode = id && id !== "new";
  const accountIdFromUrl = searchParams.get("accountId");

  // Get user data from navigation state (for edit mode) or initialize empty (for create mode)
  const userFromState = location.state?.user as User | undefined;

  const [userData, setUserData] = useState<Partial<User>>(
    userFromState || {
      firstName: "",
      lastName: "",
      email: "",
      mobile: "",
      role: "Staff",
      accountId: accountIdFromUrl || "",
      groupId: "",
    }
  );
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  const roleOptions = [
    { value: "Admin", label: "מנהל" },
    { value: "Staff", label: "צוות" },
    { value: "Parent", label: "הורה" },
  ];

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

  const fetchAccounts = useCallback(async () => {
    try {
      const response = await accountApi.getAccounts();
      setAccounts(response.data.accounts);
    } catch (err) {
      console.error("Error fetching accounts:", err);
      setError("שגיאה בטעינת רשימת הסניפים");
      showNotification("שגיאה בטעינת רשימת הסניפים", "error");
    }
  }, [showNotification]);

  const fetchGroups = useCallback(async (accountId: string) => {
    if (!accountId) {
      setGroups([]);
      return;
    }
    try {
      const response = await groupApi.getGroups(accountId);
      setGroups(response.data.groups);
    } catch (err) {
      console.error("Error fetching groups:", err);
      setGroups([]);
    }
  }, []);

  const fetchUser = useCallback(
    async (userId: string) => {
      try {
        setLoading(true);
        setError(null);
        const response = await userApi.getUserById(userId);

        if (response.data?.user) {
          setUserData(response.data.user);
          // Fetch groups for the user's account
          if (response.data.user.accountId) {
            await fetchGroups(response.data.user.accountId);
          }
        } else {
          setError("משתמש לא נמצא");
          showNotification("משתמש לא נמצא", "error");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("שגיאה בטעינת פרטי המשתמש");
        showNotification("שגיאה בטעינת פרטי המשתמש", "error");
        // Ensure user state is properly initialized even on error
        setUserData({
          firstName: "",
          lastName: "",
          email: "",
          mobile: "",
          role: "Staff",
          accountId: accountIdFromUrl || "",
          groupId: "",
        });
      } finally {
        setLoading(false);
      }
    },
    [showNotification, accountIdFromUrl, fetchGroups]
  );

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    if (isEditMode && userFromState) {
      // In edit mode, we already have the user data from navigation state
      setUserData(userFromState);
      // Fetch groups for the user's account
      if (userFromState.accountId) {
        fetchGroups(userFromState.accountId);
      }
    } else if (isEditMode && !userFromState) {
      // Fallback: fetch user data if not available in state
      fetchUser(id!);
    } else {
      // In create mode, ensure accountId is set from URL
      if (accountIdFromUrl && !userData.accountId) {
        setUserData((prev) => ({ ...prev, accountId: accountIdFromUrl }));
        // Fetch groups for the selected account
        fetchGroups(accountIdFromUrl);
      }
    }
  }, [
    isEditMode,
    id,
    accountIdFromUrl,
    userData.accountId,
    userFromState,
    fetchUser,
    fetchGroups,
  ]);

  const handleInputChange = useCallback(
    (field: keyof User, value: string | number | boolean) => {
      setUserData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const handleMobileChange = useCallback((value: string) => {
    // Store the unformatted value (digits only) for server submission
    const unformattedValue = value.replace(/\D/g, "");
    setUserData((prev) => ({
      ...prev,
      mobile: unformattedValue,
    }));
  }, []);

  const handleEmailChange = useCallback((value: string) => {
    // Allow only English letters, numbers, and common email special characters
    const allowedChars = /^[a-zA-Z0-9@._-]*$/;
    if (allowedChars.test(value)) {
      setUserData((prev) => ({
        ...prev,
        email: value,
      }));
    }
  }, []);

  const handleAccountChange = useCallback(
    (accountId: string) => {
      setUserData((prev) => ({
        ...prev,
        accountId,
        groupId: "", // Reset group when account changes
      }));
      // Fetch groups for the new account
      fetchGroups(accountId);
    },
    [fetchGroups]
  );

  const handleSave = useCallback(async () => {
    if (!userData?.firstName?.trim()) {
      showNotification("יש להזין שם פרטי", "error");
      return;
    }
    if (!userData?.lastName?.trim()) {
      showNotification("יש להזין שם משפחה", "error");
      return;
    }
    if (!userData?.email?.trim()) {
      showNotification("יש להזין כתובת אימייל", "error");
      return;
    }
    if (!userData?.accountId) {
      showNotification("יש לבחור סניף", "error");
      return;
    }

    try {
      setSaving(true);

      if (isEditMode && id) {
        await userApi.updateUser(userData as User);
        showNotification("המשתמש עודכן בהצלחה", "success");
      } else {
        // Create new user
        await userApi.createUser({
          ...userData,
          accountId: userData.accountId,
        } as Omit<User, "id">);
        showNotification("המשתמש נוצר בהצלחה", "success");
      }

      // Navigate back to users list with account context
      setTimeout(() => {
        const returnUrl = userData?.accountId
          ? `/admin/settings/users?accountId=${userData.accountId}`
          : "/admin/settings/users";
        navigate(returnUrl, { replace: true });
      }, 1500);
    } catch (err) {
      const errorMessage = isEditMode
        ? "שגיאה בעדכון המשתמש"
        : "שגיאה ביצירת המשתמש";
      setError(errorMessage);
      showNotification(errorMessage, "error");
    } finally {
      setSaving(false);
    }
  }, [userData, isEditMode, id, showNotification, navigate]);

  const handleCancel = useCallback(() => {
    const returnUrl = userData?.accountId
      ? `/admin/settings/users?accountId=${userData.accountId}`
      : "/admin/settings/users";
    navigate(returnUrl, { replace: true });
  }, [navigate, userData?.accountId]);

  if (loading) {
    return (
      <AdminSettingsLayout
        title={isEditMode ? "עריכת משתמש" : "הוספת משתמש חדש"}
        subtitle="טוען פרטי משתמש..."
      >
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <CircularProgress sx={{ color: "primary.main", mb: 2 }} />
          <Typography>טוען...</Typography>
        </Paper>
      </AdminSettingsLayout>
    );
  }

  // In edit mode, don't render the form until we have user data (either from state or API)
  if (isEditMode && !userData && !userFromState) {
    return (
      <AdminSettingsLayout
        title="עריכת משתמש"
        subtitle="שגיאה בטעינת פרטי המשתמש"
      >
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography color="error">שגיאה בטעינת פרטי המשתמש</Typography>
        </Paper>
      </AdminSettingsLayout>
    );
  }

  return (
    <AdminSettingsLayout
      title={isEditMode ? "עריכת משתמש" : "הוספת משתמש חדש"}
      subtitle={isEditMode ? "עדכון פרטי המשתמש" : "הזן את פרטי המשתמש החדש"}
      backPath="/admin/settings/users"
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
            "& .MuiFormControl-root": {
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.main",
                },
              },
            },
          }}
        >
          {/* Personal Information Section */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 3,
            }}
          >
            <TextField
              fullWidth
              label="שם פרטי"
              value={userData?.firstName || ""}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              placeholder="הזן שם פרטי"
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
              label="שם משפחה"
              value={userData?.lastName || ""}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              placeholder="הזן שם משפחה"
              required
              disabled={saving}
              sx={{
                "& .MuiInputLabel-root": {
                  fontSize: "0.95rem",
                },
              }}
            />
          </Box>

          {/* Contact Information Section */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 3,
            }}
          >
            <TextField
              fullWidth
              label="כתובת אימייל"
              type="email"
              value={userData?.email || ""}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="הזן כתובת אימייל"
              required
              disabled={saving}
              sx={{
                "& .MuiInputLabel-root": {
                  fontSize: "0.95rem",
                },
                "& .MuiInputBase-input": {
                  direction: "ltr",
                  textAlign: "left",
                },
              }}
            />
            <TextField
              fullWidth
              label="מספר נייד"
              value={userData?.mobile ? formatPhoneNumber(userData.mobile) : ""}
              onChange={(e) => handleMobileChange(e.target.value)}
              placeholder="הזן מספר נייד"
              disabled={saving}
              sx={{
                "& .MuiInputLabel-root": {
                  fontSize: "0.95rem",
                },
              }}
            />
          </Box>

          {/* Account and Role Section */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 3,
            }}
          >
            <FormControl fullWidth required disabled={saving}>
              <InputLabel sx={{ fontSize: "0.95rem" }}>סניף</InputLabel>
              <Select
                value={userData?.accountId || ""}
                onChange={(e) => handleAccountChange(e.target.value)}
                label="סניף"
                displayEmpty
              >
                {!userData?.accountId && (
                  <MenuItem value="" disabled>
                    <em>בחר סניף</em>
                  </MenuItem>
                )}
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.branchName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required disabled={saving}>
              <InputLabel sx={{ fontSize: "0.95rem" }}>תפקיד</InputLabel>
              <Select
                value={userData?.role || "Staff"}
                onChange={(e) => handleInputChange("role", e.target.value)}
                label="תפקיד"
              >
                {roleOptions.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    {role.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Group Selection Section */}
          <FormControl fullWidth disabled={saving || !userData?.accountId}>
            <InputLabel sx={{ fontSize: "0.95rem" }}>
              קבוצה (אופציונלי)
            </InputLabel>
            <Select
              value={userData?.groupId || ""}
              onChange={(e) => handleInputChange("groupId", e.target.value)}
              label="קבוצה (אופציונלי)"
              displayEmpty
            >
              <MenuItem value="">
                <em>ללא קבוצה</em>
              </MenuItem>
              {groups.map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  {group.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* System Information Section (Edit Mode Only) */}
          {isEditMode && userData?.created && (
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
                    {userData.created
                      ? new Intl.DateTimeFormat("he-IL", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })
                          .format(new Date(userData.created))
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
                    {userData.updated
                      ? new Intl.DateTimeFormat("he-IL", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })
                          .format(new Date(userData.updated))
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
            disabled={
              saving ||
              !userData?.firstName?.trim() ||
              !userData?.lastName?.trim() ||
              !userData?.email?.trim() ||
              !userData?.accountId
            }
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

export default UserEditPage;
