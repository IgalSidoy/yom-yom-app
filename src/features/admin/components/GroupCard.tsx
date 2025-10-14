import React, { useState, useEffect } from "react";
import {
  ListItem,
  ListItemText,
  IconButton,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Fab,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { Group, Account, groupApi } from "../../../services/api";
import Notification from "../../../shared/components/ui/Notification";

interface GroupCardProps {
  accounts: Account[];
  formatDate: (date: string) => string;
  onAccountDelete?: () => void;
}

const GroupCard: React.FC<GroupCardProps> = ({
  accounts,
  formatDate,
  onAccountDelete,
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<Partial<Group>>({
    name: "",
    description: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  const fetchGroups = async (accountId: string) => {
    try {
      setIsLoadingGroups(true);
      const response = await groupApi.getGroups(accountId);
      if (response.data && Array.isArray(response.data)) {
        setGroups(response.data);
      } else if (
        response.data &&
        response.data.groups &&
        Array.isArray(response.data.groups)
      ) {
        setGroups(response.data.groups);
      } else {
        setGroups([]);
      }
    } catch (error) {
      setGroups([]);
    } finally {
      setIsLoadingGroups(false);
    }
  };

  useEffect(() => {
    if (!accounts.find((acc) => acc.id === selectedAccountId)) {
      setSelectedAccountId("");
      setGroups([]);
    }
  }, [accounts, selectedAccountId]);

  useEffect(() => {
    if (selectedAccountId) {
      fetchGroups(selectedAccountId);
    } else {
      setGroups([]);
    }
  }, [selectedAccountId]);

  const handleAccountChange = (event: SelectChangeEvent) => {
    setSelectedAccountId(event.target.value);
  };

  const handleOpenDrawer = (group?: Group) => {
    if (group) {
      setCurrentGroup(group);
    } else {
      setCurrentGroup({
        name: "",
        description: "",
      });
    }
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setCurrentGroup({
      name: "",
      description: "",
    });
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

  const handleSave = async () => {
    try {
      setIsSaving(true);
      if (currentGroup.id) {
        await groupApi.updateGroup(currentGroup as Group);
        showNotification("קבוצה עודכנה בהצלחה");
      } else {
        await groupApi.createGroup({
          ...currentGroup,
          accountId: selectedAccountId,
        } as Omit<Group, "id" | "created" | "updated">);
        showNotification("קבוצה נוצרה בהצלחה");
      }
      await fetchGroups(selectedAccountId);
      handleCloseDrawer();
    } catch (error) {
      showNotification("שגיאה בשמירת הקבוצה", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsSaving(true);
      await groupApi.deleteGroup(currentGroup.id!);
      showNotification("קבוצה נמחקה בהצלחה");
      await fetchGroups(selectedAccountId);
      setIsDeleteDialogOpen(false);
      handleCloseDrawer();
    } catch (error) {
      showNotification("שגיאה במחיקת הקבוצה", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel id="account-select-label">בחר סניף</InputLabel>
          <Select
            labelId="account-select-label"
            id="account-select"
            value={selectedAccountId}
            label="בחר סניף"
            onChange={handleAccountChange}
            sx={{
              borderRadius: 2,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "divider",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "primary.main",
              },
            }}
          >
            <MenuItem value="">
              <em>בחר סניף</em>
            </MenuItem>
            {accounts.map((account) => (
              <MenuItem key={account.id} value={account.id}>
                {account.branchName || "שם הסניף חסר"}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {selectedAccountId ? (
        isLoadingGroups ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {groups.map((group) => (
              <ListItem
                key={group.id}
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
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 500,
                        color: group.name ? "text.primary" : "text.secondary",
                        fontStyle: group.name ? "normal" : "italic",
                      }}
                    >
                      {group.name || "שם הקבוצה חסר"}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      {group.description || "אין תיאור לקבוצה"}
                    </Typography>
                  }
                />
                <IconButton
                  edge="end"
                  aria-label="edit"
                  onClick={() => handleOpenDrawer(group)}
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
            {groups.length === 0 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 200,
                  color: "text.secondary",
                }}
              >
                <Typography>אין קבוצות בסניף זה</Typography>
              </Box>
            )}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mt: 2,
              }}
            >
              <Fab
                color="primary"
                aria-label="add group"
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
          </>
        )
      ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 200,
            color: "text.secondary",
          }}
        >
          <Typography>בחר סניף כדי לצפות בקבוצות</Typography>
        </Box>
      )}

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
              {currentGroup.id ? "עריכת קבוצה" : "הוספת קבוצה חדשה"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentGroup.id
                ? "עדכון פרטי הקבוצה הקיימת"
                : "הזן את פרטי הקבוצה החדשה"}
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
                label="שם הקבוצה"
                value={currentGroup.name}
                onChange={(e) =>
                  setCurrentGroup({
                    ...currentGroup,
                    name: e.target.value,
                  })
                }
                placeholder="הזן את שם הקבוצה"
                required
                sx={{
                  "& .MuiInputLabel-root": {
                    fontSize: "0.95rem",
                  },
                }}
              />

              <TextField
                fullWidth
                label="תיאור"
                value={currentGroup.description}
                onChange={(e) =>
                  setCurrentGroup({
                    ...currentGroup,
                    description: e.target.value,
                  })
                }
                placeholder="הזן תיאור לקבוצה"
                multiline
                rows={3}
                sx={{
                  "& .MuiInputLabel-root": {
                    fontSize: "0.95rem",
                  },
                }}
              />

              {currentGroup.id && (
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
                        נוצר בתאריך
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.primary",
                          fontWeight: 500,
                        }}
                      >
                        {currentGroup.created && currentGroup.created !== ""
                          ? formatDate(currentGroup.created)
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
                        {currentGroup.updated && currentGroup.updated !== ""
                          ? formatDate(currentGroup.updated)
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
            {currentGroup.id && (
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
              disabled={isSaving || !currentGroup.name}
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
        <DialogTitle>מחיקת קבוצה</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את הקבוצה {currentGroup.name || "זו"}?
          </Typography>
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

      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification({ ...notification, open: false })}
      />
    </>
  );
};

export default GroupCard;
