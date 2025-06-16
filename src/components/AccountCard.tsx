import React, { useState } from "react";
import {
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { Account, accountApi } from "../services/api";

interface AccountCardProps {
  accounts: Account[];
  formatDate: (date: string) => string;
  onAccountsChange: () => Promise<void>;
  onNotification: (
    message: string,
    severity: "success" | "error" | "info" | "warning"
  ) => void;
}

const AccountCard: React.FC<AccountCardProps> = ({
  accounts,
  formatDate,
  onAccountsChange,
  onNotification,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<Partial<Account>>({
    branchName: "",
    branchCode: 0,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!currentAccount.branchName) {
      onNotification("יש להזין שם סניף", "error");
      return;
    }

    try {
      setIsSaving(true);
      if (currentAccount.id) {
        // Find the original account to compare changes
        const originalAccount = accounts.find(
          (acc) => acc.id === currentAccount.id
        );
        if (!originalAccount) {
          onNotification("סניף לא נמצא", "error");
          return;
        }
        await accountApi.updateAccount(
          currentAccount as Account,
          originalAccount
        );
        await onAccountsChange(); // Refresh the accounts list
        onNotification("סניף עודכן בהצלחה", "success");
      } else {
        await accountApi.createAccount({
          ...currentAccount,
          organizationId: accounts[0]?.organizationId,
        } as Omit<Account, "id" | "created" | "updated">);
        await onAccountsChange(); // Refresh the accounts list
        onNotification("סניף נוצר בהצלחה", "success");
      }
      handleCloseDrawer();
    } catch (error) {
      onNotification(
        currentAccount.id ? "שגיאה בעדכון הסניף" : "שגיאה ביצירת הסניף",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = () => {
    if (currentAccount.isPrimary) {
      onNotification("לא ניתן למחוק סניף ראשי", "error");
      return;
    }
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsSaving(true);
      await accountApi.deleteAccount(currentAccount.id!);
      await onAccountsChange();
      onNotification("סניף נמחק בהצלחה", "success");
      setIsDeleteDialogOpen(false);
      handleCloseDrawer();
    } catch (error) {
      onNotification("שגיאה במחיקת הסניף", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
  };

  const handleOpenDrawer = (account?: Account) => {
    if (account) {
      setCurrentAccount(account);
    } else {
      setCurrentAccount({
        branchName: "",
        branchCode: 0,
      });
    }
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setCurrentAccount({
      branchName: "",
      branchCode: 0,
    });
  };

  return (
    <>
      {accounts.map((account) => (
        <ListItem
          key={account.id}
          sx={{
            bgcolor: "background.paper",
            borderRadius: 2,
            mb: 1,
            border: "1px solid",
            borderColor: "divider",
            "&:hover": {
              borderColor: "primary.main",
              boxShadow: 1,
            },
          }}
        >
          <ListItemText
            primary={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 500,
                    color: account.branchName
                      ? "text.primary"
                      : "text.secondary",
                    fontStyle: account.branchName ? "normal" : "italic",
                  }}
                >
                  {account.branchName || "שם הסניף חסר"}
                </Typography>
                {account.isPrimary && (
                  <Chip
                    label="ראשי"
                    size="small"
                    color="primary"
                    sx={{
                      height: 20,
                      fontSize: "0.75rem",
                      fontWeight: 500,
                    }}
                  />
                )}
              </Box>
            }
            secondary={
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {account.branchCode || "אין קוד סניף"}
              </Typography>
            }
          />
          <IconButton
            edge="end"
            aria-label="edit"
            onClick={() => handleOpenDrawer(account)}
            sx={{
              color: "primary.main",
              "&:hover": {
                bgcolor: "primary.lighter",
              },
            }}
          >
            <EditIcon />
          </IconButton>
        </ListItem>
      ))}

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mt: 2,
        }}
      >
        <Fab
          color="primary"
          aria-label="add account"
          onClick={() => handleOpenDrawer()}
          sx={{
            boxShadow: 3,
            "&:hover": {
              boxShadow: 6,
              transform: "scale(1.05)",
            },
            transition: "all 0.2s ease-in-out",
          }}
        >
          <AddIcon />
        </Fab>
      </Box>

      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 400 },
            p: 3,
            bgcolor: "background.paper",
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {currentAccount.id ? "עריכת סניף" : "הוספת סניף חדש"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentAccount.id
                ? "עדכון פרטי הסניף הקיים"
                : "הזן את פרטי הסניף החדש"}
            </Typography>
          </Box>

          <Box sx={{ flex: 1 }}>
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
                value={currentAccount.branchName}
                onChange={(e) =>
                  setCurrentAccount({
                    ...currentAccount,
                    branchName: e.target.value,
                  })
                }
                placeholder="הזן את שם הסניף"
                required
                sx={{
                  "& .MuiInputLabel-root": {
                    fontSize: "0.95rem",
                  },
                }}
              />

              {currentAccount.id && (
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
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          fontSize: "0.75rem",
                        }}
                      >
                        קוד סניף
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.primary",
                          fontWeight: 500,
                        }}
                      >
                        {currentAccount.branchCode}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                      }}
                    >
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
                        {currentAccount.created && currentAccount.created !== ""
                          ? formatDate(currentAccount.created)
                          : "לא זמין"}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                      }}
                    >
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
                        {currentAccount.updated && currentAccount.updated !== ""
                          ? formatDate(currentAccount.updated)
                          : "לא זמין"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              mt: "auto",
              pt: 3,
              borderTop: 1,
              borderColor: "divider",
            }}
          >
            {currentAccount.id && !currentAccount.isPrimary && (
              <Button
                fullWidth
                onClick={handleDeleteClick}
                variant="outlined"
                color="error"
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  py: 1.2,
                }}
              >
                מחיקה
              </Button>
            )}
            <Button
              fullWidth
              onClick={handleCloseDrawer}
              variant="outlined"
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
              disabled={isSaving || !currentAccount.branchName}
              startIcon={isSaving ? <CircularProgress size={20} /> : null}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                py: 1.2,
              }}
            >
              {isSaving ? "שומר..." : "שמירה"}
            </Button>
          </Box>
        </Box>
      </Drawer>

      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>מחיקת סניף</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את הסניף{" "}
            {currentAccount.branchName || "זה"}?
          </Typography>
          {currentAccount.isPrimary && (
            <Typography color="error" sx={{ mt: 1 }}>
              שים לב: זהו הסניף הראשי של הארגון.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="inherit">
            ביטול
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={20} /> : null}
          >
            מחיקה
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AccountCard;
