import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { Button, Card } from "../../../../shared/components";
import { AdminSettingsLayout } from "../../../../shared/components/layout";
import { accountApi, Account } from "../../../../services/api";
import Notification from "../../../../shared/components/ui/Notification";
import { THEME_COLORS, UI_COLORS } from "../../../../config/colors";

const AccountsSettings: React.FC = () => {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    accountId: "",
    accountName: "",
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
      setLoading(true);
      setError(null);
      const response = await accountApi.getAccounts();
      setAccounts(response.data.accounts);
    } catch (err) {
      setError("שגיאה בטעינת רשימת הסניפים");
      showNotification("שגיאה בטעינת רשימת הסניפים", "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleCreateAccount = useCallback(() => {
    navigate("/admin/settings/accounts/new");
  }, [navigate]);

  const handleEditAccount = useCallback(
    (account: Account) => {
      navigate(`/admin/settings/accounts/${account.id}/edit`);
    },
    [navigate]
  );

  const handleDeleteClick = useCallback((account: Account) => {
    setDeleteDialog({
      open: true,
      accountId: account.id,
      accountName: account.branchName,
    });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      setLoading(true);
      await accountApi.deleteAccount(deleteDialog.accountId);
      await fetchAccounts(); // Refresh the list
      showNotification("הסניף נמחק בהצלחה", "success");
      setDeleteDialog({ open: false, accountId: "", accountName: "" });
    } catch (err) {
      setError("שגיאה במחיקת הסניף");
      showNotification("שגיאה במחיקת הסניף", "error");
    } finally {
      setLoading(false);
    }
  }, [deleteDialog.accountId, fetchAccounts, showNotification]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialog({ open: false, accountId: "", accountName: "" });
  }, []);

  // Memoized components for performance
  const AccountCard = useMemo(
    () =>
      React.memo(({ account }: { account: Account }) => (
        <Box
          sx={{
            p: 3,
            width: "100%",
            bgcolor: THEME_COLORS.BACKGROUND,
            backgroundColor: THEME_COLORS.BACKGROUND,
            borderRadius: 0, // Override theme border radius
            margin: 0, // Remove any margins
            paddingTop: 2, // Remove top padding to eliminate gaps
            paddingBottom: 1, // Remove bottom padding to eliminate gaps
            paddingLeft: 3, // Keep left padding
            paddingRight: 3, // Keep right padding
            borderBottom: "1px solid",
            borderColor: UI_COLORS.BORDER_LIGHT,
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              bgcolor: "action.hover",
            },
            "&:first-child": {
              paddingTop: 3, // Only first card has top padding
            },
            "&:last-child": {
              paddingBottom: 3, // Only last card has bottom padding
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
                {account.branchName}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              {account.isPrimary && (
                <Chip
                  label="סניף ראשי"
                  color="primary"
                  size="small"
                  variant="outlined"
                  sx={{ borderRadius: 1 }}
                />
              )}
              <Button
                variant="outline"
                size="small"
                onClick={() => handleEditAccount(account)}
                sx={{ borderRadius: 2, textTransform: "none" }}
              >
                עריכה
              </Button>
              {!account.isPrimary && (
                <Button
                  variant="text"
                  size="small"
                  onClick={() => handleDeleteClick(account)}
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
              )}
            </Box>
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
                {formatDate(account.created)}
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
                {formatDate(account.updated)}
              </Typography>
            </Box>
          </Box>
        </Box>
      )),
    [formatDate, handleEditAccount, handleDeleteClick]
  );

  const AccountTableRow = useMemo(
    () =>
      React.memo(({ account }: { account: Account }) => (
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
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {account.branchName}
              </Typography>
            </Box>
          </TableCell>
          <TableCell
            sx={{
              textAlign: "right",
            }}
          >
            {account.isPrimary && (
              <Chip
                label="סניף ראשי"
                color="primary"
                size="small"
                variant="outlined"
                sx={{ borderRadius: 1 }}
              />
            )}
          </TableCell>
          <TableCell
            sx={{
              textAlign: "right",
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {formatDate(account.created)}
            </Typography>
          </TableCell>
          <TableCell
            sx={{
              textAlign: "right",
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {formatDate(account.updated)}
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
                onClick={() => handleEditAccount(account)}
                sx={{ borderRadius: 2, textTransform: "none" }}
              >
                עריכה
              </Button>
              {!account.isPrimary && (
                <Button
                  variant="text"
                  size="small"
                  onClick={() => handleDeleteClick(account)}
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
              )}
            </Box>
          </TableCell>
        </TableRow>
      )),
    [formatDate, handleEditAccount, handleDeleteClick]
  );

  if (loading && accounts.length === 0) {
    return (
      <AdminSettingsLayout title="ניהול סניפים" subtitle="טוען רשימת סניפים...">
        <Card>
          <Box sx={{ p: 3, textAlign: "center" }}>
            <CircularProgress sx={{ color: "primary.main", mb: 2 }} />
            <Typography>טוען...</Typography>
          </Box>
        </Card>
      </AdminSettingsLayout>
    );
  }

  return (
    <AdminSettingsLayout
      title="ניהול סניפים"
      subtitle={`${accounts.length} סניפים זמינים`}
    >
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
      <Card
        sx={{
          height: "100%", // Always use full height for proper scrolling
          display: "flex",
          flexDirection: "column",
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

          {accounts.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                אין סניפים זמינים
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                התחל על ידי הוספת סניף ראשון
              </Typography>
              <Button
                variant="primary"
                onClick={handleCreateAccount}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                }}
              >
                הוספת סניף ראשון
              </Button>
            </Box>
          ) : (
            <>
              {/* Mobile: Scrollable Card Layout */}
              <Box
                sx={{
                  display: { xs: "block", md: "none" },
                  flex: 1,
                  overflow: "auto",
                  margin: 0, // Remove negative margins
                  padding: 0, // Remove padding
                  minHeight: 0, // Allow flex child to shrink
                  borderRadius: 0, // Override theme border radius
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
                {accounts.map((account) => (
                  <AccountCard key={account.id} account={account} />
                ))}
              </Box>

              {/* Desktop: Table Layout */}
              <Box sx={{ display: { xs: "none", md: "block" } }}>
                <Box
                  sx={{ mb: 3, display: "flex", justifyContent: "flex-end" }}
                >
                  <Button
                    variant="primary"
                    onClick={handleCreateAccount}
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
                    הוספת סניף חדש
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
                          שם הסניף
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            fontSize: "1rem",
                            textAlign: "right",
                          }}
                        >
                          סטטוס
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            fontSize: "1rem",
                            textAlign: "right",
                          }}
                        >
                          נוצר בתאריך
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            fontSize: "1rem",
                            textAlign: "right",
                          }}
                        >
                          עודכן בתאריך
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {accounts.map((account) => (
                        <AccountTableRow key={account.id} account={account} />
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
          aria-label="add account"
          onClick={handleCreateAccount}
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
          מחיקת סניף
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            האם אתה בטוח שברצונך למחוק את הסניף "{deleteDialog.accountName}"?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            פעולה זו לא ניתנת לביטול ותמחק את כל הנתונים הקשורים לסניף זה.
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

export default AccountsSettings;
