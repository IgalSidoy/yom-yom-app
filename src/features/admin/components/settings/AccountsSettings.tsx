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
  useTheme,
  useMediaQuery,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { FixedSizeList as List } from "react-window";
import { useNavigate } from "react-router-dom";
import { Button, Card } from "../../../../shared/components";
import { AdminSettingsLayout } from "../../../../shared/components/layout";
import { useApp } from "../../../../contexts/AppContext";
import { accountApi, Account } from "../../../../services/api";
import Notification from "../../../../shared/components/ui/Notification";

const AccountsSettings: React.FC = () => {
  const { user } = useApp();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
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
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 2,
            borderRadius: 2,
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
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
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
                color="text.secondary"
                sx={{ display: "block", mb: 0.5 }}
              >
                נוצר בתאריך
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {formatDate(account.created)}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
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
            </Box>
          </Box>
        </Paper>
      )),
    [formatDate, handleEditAccount, handleDeleteClick]
  );

  const AccountTableRow = useMemo(
    () =>
      React.memo(({ account }: { account: Account }) => (
        <TableRow
          hover
          sx={{
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

  // Virtualized list item renderer for mobile
  const VirtualizedItem = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => (
      <div style={style}>
        <AccountCard account={accounts[index]} />
      </div>
    ),
    [accounts, AccountCard]
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
        actions={
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
        }
      >
        <Box sx={{ p: 3 }}>
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
              {/* Mobile: Virtualized Card Layout */}
              <Box sx={{ display: { xs: "block", md: "none" } }}>
                <List
                  height={Math.min(600, accounts.length * 200)} // Dynamic height based on content
                  itemCount={accounts.length}
                  itemSize={200} // Height per card
                  width="100%"
                >
                  {VirtualizedItem}
                </List>
              </Box>

              {/* Desktop: Table Layout */}
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  display: { xs: "none", md: "block" },
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
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
            </>
          )}
        </Box>
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
        <DialogActions sx={{ p: 3, gap: 2 }}>
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
