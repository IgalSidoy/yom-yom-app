import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Card } from "../../../../shared/components";
import { AdminSettingsLayout } from "../../../../shared/components/layout";
import { useApp } from "../../../../contexts/AppContext";
import { userApi, User, accountApi, Account } from "../../../../services/api";
import Notification from "../../../../shared/components/ui/Notification";
import { THEME_COLORS, UI_COLORS } from "../../../../config/colors";
import { ROUTES } from "../../../../config/routes";
import { formatPhoneNumber } from "../../../../utils/phoneUtils";

const UsersSettings: React.FC = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // SessionStorage key for persistence
  const SESSION_KEY = "usersSettings_selectedAccountId";

  const [users, setUsers] = useState<User[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Save selected account ID to sessionStorage whenever it changes
  useEffect(() => {
    if (selectedAccountId) {
      sessionStorage.setItem(SESSION_KEY, selectedAccountId);
    }
  }, [selectedAccountId, SESSION_KEY]);

  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    userId: "",
    userName: "",
  });

  // Memoized date formatter to prevent unnecessary re-renders
  const formatDate = useCallback((dateString: string) => {
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
  }, []);

  const getRoleColor = useCallback((role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "error";
      case "staff":
        return "primary";
      case "parent":
        return "success";
      default:
        return "default";
    }
  }, []);

  const getRoleLabel = useCallback((role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "מנהל";
      case "staff":
        return "צוות";
      case "parent":
        return "הורה";
      default:
        return role;
    }
  }, []);

  const getGroupName = useCallback((user: User) => {
    return user.groupName || null;
  }, []);

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

      // Check for accountId from URL or restore from sessionStorage
      const accountIdFromUrl = searchParams.get("accountId");
      const savedAccountId = sessionStorage.getItem(SESSION_KEY);
      const targetAccountId = accountIdFromUrl || savedAccountId;

      if (response.data.accounts.length > 0) {
        if (targetAccountId) {
          // Restore the saved account ID
          setSelectedAccountId(targetAccountId);
        } else {
          // No saved account, use first account as fallback
          const firstAccountId = response.data.accounts[0].id;
          setSelectedAccountId((prev) => prev || firstAccountId);
        }
      }
    } catch (err) {
      setError("שגיאה בטעינת רשימת הסניפים");
      setNotification({
        open: true,
        message: "שגיאה בטעינת רשימת הסניפים",
        severity: "error",
      });
    }
  }, [searchParams, SESSION_KEY]);

  const fetchUsers = useCallback(async () => {
    try {
      setError(null);
      const response = await userApi.getUsers();
      // Filter users by selected account ID
      const filteredUsers = selectedAccountId
        ? response.data.users.filter(
            (user) => user.accountId === selectedAccountId
          )
        : response.data.users;
      setUsers(filteredUsers);
    } catch (err) {
      setError("שגיאה בטעינת רשימת המשתמשים");
      setNotification({
        open: true,
        message: "שגיאה בטעינת רשימת המשתמשים",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedAccountId]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    if (selectedAccountId) {
      fetchUsers();
    }
  }, [selectedAccountId, fetchUsers]);

  const handleCreateUser = useCallback(() => {
    const url = selectedAccountId
      ? `${ROUTES.ADMIN_USER_CREATE}?accountId=${selectedAccountId}`
      : ROUTES.ADMIN_USER_CREATE;
    navigate(url);
  }, [navigate, selectedAccountId]);

  const handleAccountChange = useCallback(
    (accountId: string) => {
      // Clear users immediately to prevent showing old data
      setUsers([]);
      // Show loading state immediately
      setLoading(true);
      // Update selected account
      setSelectedAccountId(accountId);
      // Update URL to reflect the selected account
      const newUrl = accountId
        ? `/admin/settings/users?accountId=${accountId}`
        : "/admin/settings/users";
      navigate(newUrl, { replace: true });
    },
    [navigate]
  );

  const handleEditUser = useCallback(
    (user: User) => {
      navigate(ROUTES.ADMIN_USER_EDIT.replace(":id", user.id), {
        state: { user },
      });
    },
    [navigate]
  );

  const handleDeleteClick = useCallback((user: User) => {
    setDeleteDialog({
      open: true,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
    });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      setLoading(true);
      await userApi.deleteUser(deleteDialog.userId);
      await fetchUsers(); // Refresh the list
      showNotification("המשתמש נמחק בהצלחה", "success");
      setDeleteDialog({ open: false, userId: "", userName: "" });
    } catch (err) {
      setError("שגיאה במחיקת המשתמש");
      showNotification("שגיאה במחיקת המשתמש", "error");
    } finally {
      setLoading(false);
    }
  }, [deleteDialog.userId, fetchUsers, showNotification]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialog({ open: false, userId: "", userName: "" });
  }, []);

  // Memoized components for performance
  const UserCard = useMemo(
    () =>
      React.memo(({ user }: { user: User }) => (
        <Box
          sx={{
            width: "100%",
            bgcolor: THEME_COLORS.BACKGROUND,
            backgroundColor: THEME_COLORS.BACKGROUND,
            borderRadius: 0, // Override theme border radius
            margin: 0, // Remove any margins
            paddingTop: 2, // Remove top padding to eliminate gaps
            paddingBottom: 1, // Remove bottom padding to eliminate gaps
            paddingLeft: { xs: 2, sm: 3 }, // Responsive left padding
            paddingRight: { xs: 2, sm: 3 }, // Responsive right padding
            borderBottom: "1px solid",
            borderColor: UI_COLORS.BORDER_LIGHT,
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              bgcolor: "action.hover",
            },
            "&:first-child": {
              paddingTop: { xs: 2, sm: 3 }, // Responsive top padding
            },
            "&:last-child": {
              paddingBottom: { xs: 2, sm: 3 }, // Responsive bottom padding
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 1,
                  color: THEME_COLORS.TEXT_PRIMARY,
                }}
              >
                {user.firstName} {user.lastName}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: THEME_COLORS.TEXT_SECONDARY,
                  fontSize: "0.875rem",
                  mb: 0.5,
                }}
              >
                {user.email}
              </Typography>
              {user.mobile && (
                <Typography
                  variant="body2"
                  sx={{
                    color: THEME_COLORS.TEXT_SECONDARY,
                    fontSize: "0.8rem",
                  }}
                >
                  {formatPhoneNumber(user.mobile)}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Button
                variant="outline"
                size="small"
                onClick={() => handleEditUser(user)}
                sx={{ borderRadius: 2, textTransform: "none" }}
              >
                עריכה
              </Button>
              <Button
                variant="text"
                size="small"
                onClick={() => handleDeleteClick(user)}
                sx={{
                  color: "error.main",
                  borderRadius: 2,
                  textTransform: "none",
                  border: "1px solid",
                  borderColor: "error.main",
                  opacity: 0.7,
                  "&:hover": {
                    backgroundColor: "error.main",
                    color: "white",
                    opacity: 1,
                  },
                }}
              >
                מחיקה
              </Button>
            </Box>
          </Box>

          {/* Badges Section */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              mb: 2,
              justifyContent: "flex-start",
            }}
          >
            <Chip
              label={getRoleLabel(user.role)}
              color={getRoleColor(user.role) as any}
              size="small"
              variant="filled"
              sx={{
                borderRadius: 1,
                opacity: 1,
                fontWeight: 600,
                fontSize: "0.75rem",
                backgroundColor:
                  getRoleColor(user.role) === "primary"
                    ? THEME_COLORS.PRIMARY
                    : undefined,
                color: "white",
                "&:hover": {
                  opacity: 0.9,
                },
              }}
            />
            {getGroupName(user) && (
              <Chip
                label={getGroupName(user)!}
                size="small"
                variant="outlined"
                sx={{
                  borderRadius: 1,
                  fontWeight: 500,
                  fontSize: "0.7rem",
                  borderColor: THEME_COLORS.SECONDARY,
                  color: THEME_COLORS.TEXT_PRIMARY,
                  backgroundColor: THEME_COLORS.SECONDARY,
                  "&:hover": {
                    backgroundColor: THEME_COLORS.SECONDARY,
                    opacity: 0.8,
                  },
                }}
              />
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mb: 0.5,
                  color: THEME_COLORS.TEXT_PRIMARY,
                  fontSize: "0.75rem",
                }}
              >
                נוצר בתאריך
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: THEME_COLORS.TEXT_PRIMARY,
                }}
              >
                {formatDate(user.created)}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mb: 0.5,
                  color: THEME_COLORS.TEXT_PRIMARY,
                  fontSize: "0.75rem",
                }}
              >
                עודכן בתאריך
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: THEME_COLORS.TEXT_PRIMARY,
                }}
              >
                {formatDate(user.updated)}
              </Typography>
            </Box>
          </Box>
        </Box>
      )),
    [
      formatDate,
      getRoleColor,
      getRoleLabel,
      getGroupName,
      handleEditUser,
      handleDeleteClick,
    ]
  );

  const UserTableRow = useMemo(
    () =>
      React.memo(({ user }: { user: User }) => (
        <TableRow
          hover
          sx={{
            bgcolor: "background.paper",
            "&:hover": {
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
              transform: "translateY(-2px)",
            },
            transition: "all 0.2s ease-in-out",
          }}
        >
          <TableCell
            sx={{
              textAlign: "right",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: THEME_COLORS.PRIMARY,
                  width: 40,
                  height: 40,
                  fontSize: "1rem",
                  fontWeight: 600,
                }}
              >
                {user.firstName.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
            </Box>
          </TableCell>
          <TableCell
            sx={{
              textAlign: "right",
            }}
          >
            <Chip
              label={getRoleLabel(user.role)}
              color={getRoleColor(user.role) as any}
              size="small"
              variant="filled"
              sx={{
                borderRadius: 1,
                opacity: 1,
                fontWeight: 600,
                fontSize: "0.75rem",
                backgroundColor:
                  getRoleColor(user.role) === "primary"
                    ? THEME_COLORS.PRIMARY
                    : undefined,
                color: "white",
                "&:hover": {
                  opacity: 0.9,
                },
              }}
            />
          </TableCell>
          <TableCell
            sx={{
              textAlign: "right",
            }}
          >
            {getGroupName(user) ? (
              <Chip
                label={getGroupName(user)!}
                size="small"
                variant="outlined"
                sx={{
                  borderRadius: 1,
                  fontWeight: 500,
                  fontSize: "0.75rem",
                  borderColor: THEME_COLORS.SECONDARY,
                  color: THEME_COLORS.TEXT_PRIMARY,
                  backgroundColor: THEME_COLORS.SECONDARY,
                  "&:hover": {
                    backgroundColor: THEME_COLORS.SECONDARY,
                    opacity: 0.8,
                  },
                }}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                ללא קבוצה
              </Typography>
            )}
          </TableCell>
          <TableCell
            sx={{
              textAlign: "right",
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {user.mobile ? formatPhoneNumber(user.mobile) : "לא זמין"}
            </Typography>
          </TableCell>
          <TableCell
            sx={{
              textAlign: "right",
            }}
          >
            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
              <Button
                variant="outline"
                size="small"
                onClick={() => handleEditUser(user)}
                sx={{ borderRadius: 2, textTransform: "none" }}
              >
                עריכה
              </Button>
              <Button
                variant="text"
                size="small"
                onClick={() => handleDeleteClick(user)}
                sx={{
                  color: "error.main",
                  borderRadius: 2,
                  textTransform: "none",
                  border: "1px solid",
                  borderColor: "error.main",
                  opacity: 0.7,
                  "&:hover": {
                    backgroundColor: "error.main",
                    color: "white",
                    opacity: 1,
                  },
                }}
              >
                מחיקה
              </Button>
            </Box>
          </TableCell>
        </TableRow>
      )),
    [
      formatDate,
      getRoleColor,
      getRoleLabel,
      getGroupName,
      handleEditUser,
      handleDeleteClick,
    ]
  );

  if (loading && users.length === 0) {
    return (
      <AdminSettingsLayout
        title="ניהול משתמשים"
        subtitle="טוען רשימת משתמשים..."
      >
        <Card>
          <Box sx={{ p: 3, textAlign: "center" }}>
            <CircularProgress sx={{ color: "primary.main", mb: 2 }} />
            <Typography>טוען...</Typography>
          </Box>
        </Card>
      </AdminSettingsLayout>
    );
  }

  const selectedAccount = accounts.find((acc) => acc.id === selectedAccountId);
  const subtitle = selectedAccount
    ? `${users.length} משתמשים זמינים עבור ${selectedAccount.branchName}`
    : `${users.length} משתמשים זמינים`;

  return (
    <AdminSettingsLayout title="ניהול משתמשים" subtitle={subtitle}>
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />

      {/* Account Selector */}
      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth sx={{ maxWidth: { xs: "100%", sm: "400px" } }}>
          <InputLabel sx={{ fontSize: "0.95rem" }}>בחר סניף</InputLabel>
          <Select
            value={selectedAccountId}
            onChange={(e) => handleAccountChange(e.target.value)}
            label="בחר סניף"
            sx={{
              borderRadius: 2,
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "primary.main",
              },
            }}
          >
            {accounts.map((account) => (
              <MenuItem key={account.id} value={account.id}>
                {account.branchName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Card
        sx={{
          height: { xs: "100%", sm: "auto" },
          display: { xs: "flex", sm: "block" },
          flexDirection: { xs: "column", sm: "row" },
          minHeight: 0, // Allow flex child to shrink
          borderRadius: 1, // Override Card component border radius
          boxShadow: "none", // Remove any shadows
          border: "none", // Remove any borders
          backgroundColor: THEME_COLORS.BACKGROUND,
        }}
      >
        <Box
          sx={{
            padding: 0, // Remove all padding
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0, // Allow flex child to shrink
            overflow: "hidden",
            bgcolor: THEME_COLORS.BACKGROUND, // Use theme background color
            borderRadius: 0, // Override theme border radius
            margin: 0, // Remove margins
            border: "none", // Remove borders
          }}
        >
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          {users.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                {selectedAccount
                  ? `אין משתמשים עבור ${selectedAccount.branchName}`
                  : "אין משתמשים זמינים"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {selectedAccount
                  ? `התחל על ידי הוספת משתמש ראשון עבור ${selectedAccount.branchName}`
                  : "התחל על ידי הוספת משתמש ראשון"}
              </Typography>
              <Button
                variant="primary"
                onClick={handleCreateUser}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                }}
              >
                הוספת משתמש ראשון
              </Button>
            </Box>
          ) : (
            <>
              {/* Mobile: Scrollable Card Layout */}
              <Box
                sx={{
                  display: { xs: "block", md: "none" },
                  flex: 1,
                  overflowY: "auto",
                  overflowX: "hidden", // Prevent horizontal scrolling
                  margin: 0, // Remove negative margins
                  padding: 0, // Remove padding
                  minHeight: 0, // Allow flex child to shrink
                  borderRadius: 0, // Override theme border radius
                  width: "100%", // Ensure full width
                  maxWidth: "100%", // Prevent overflow
                  "&::-webkit-scrollbar": {
                    width: "4px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "transparent",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "rgba(0, 0, 0, 0.2)",
                    borderRadius: "2px",
                  },
                  "&::-webkit-scrollbar-thumb:hover": {
                    background: "rgba(0, 0, 0, 0.3)",
                  },
                }}
              >
                {users.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </Box>

              {/* Desktop: Table Layout */}
              <Box sx={{ display: { xs: "none", md: "block" } }}>
                <Box
                  sx={{ mb: 3, display: "flex", justifyContent: "flex-end" }}
                >
                  <Button
                    variant="primary"
                    onClick={handleCreateUser}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      px: 3,
                      py: 1.5,
                      boxShadow: "0 2px 8px rgba(255, 145, 77, 0.3)",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(255, 145, 77, 0.4)",
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    הוספת משתמש חדש
                  </Button>
                </Box>
                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{
                    border: "none",
                    borderRadius: 0,
                    boxShadow: "none",
                    margin: 0,
                    padding: 0,
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow
                        sx={{
                          bgcolor: "background.paper",
                          borderBottom: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            fontSize: "1rem",
                            textAlign: "right",
                          }}
                        >
                          משתמש
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            fontSize: "1rem",
                            textAlign: "right",
                          }}
                        >
                          תפקיד
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            fontSize: "1rem",
                            textAlign: "right",
                          }}
                        >
                          קבוצה
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            fontSize: "1rem",
                            textAlign: "right",
                          }}
                        >
                          נייד
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            fontSize: "1rem",
                            textAlign: "right",
                          }}
                        >
                          פעולות
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map((user) => (
                        <UserTableRow key={user.id} user={user} />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </>
          )}
        </Box>

        {/* Floating Add Button - Mobile only */}
        <Fab
          color="primary"
          aria-label="add user"
          onClick={handleCreateUser}
          sx={{
            position: "fixed",
            bottom: {
              xs: "calc(72px + env(safe-area-inset-bottom) + 24px)",
              sm: "96px",
            },
            right: 24,
            display: { xs: "flex", sm: "none" }, // Only show on mobile
            boxShadow: "0 4px 16px rgba(255, 145, 77, 0.4)",
            "&:hover": {
              boxShadow: "0 6px 20px rgba(255, 145, 77, 0.5)",
              transform: "scale(1.05)",
            },
            transition: "all 0.2s ease-in-out",
            zIndex: 1000,
          }}
        >
          <AddIcon />
        </Fab>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: "1.25rem" }}>
          מחיקת משתמש
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            האם אתה בטוח שברצונך למחוק את המשתמש "{deleteDialog.userName}"?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            פעולה זו לא ניתנת לביטול ותמחק את כל הנתונים הקשורים למשתמש זה.
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{
            p: 3,
            gap: 2,
            display: "flex",
            justifyContent: "center", // Center buttons
            flexDirection: { xs: "column", sm: "row" }, // Stack on mobile, row on desktop
            alignItems: "center",
            "& .MuiButton-root": {
              minWidth: { xs: "120px", sm: "auto" }, // Ensure consistent button width on mobile
              flex: { xs: "none", sm: "none" },
            },
          }}
        >
          <Button
            onClick={handleDeleteCancel}
            variant="outline"
            disabled={loading}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              py: 1.2,
            }}
          >
            ביטול
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              py: 1.2,
            }}
          >
            {loading ? "מוחק..." : "מחיקה"}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminSettingsLayout>
  );
};

export default UsersSettings;
