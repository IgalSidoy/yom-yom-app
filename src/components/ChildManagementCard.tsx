import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Drawer,
  ListItem,
  ListItemText,
  Fab,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { Account, Group, User } from "../services/api";
import Notification from "./Notification";
import { useApp } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";

interface Parent {
  id: string;
  firstName: string;
  lastName: string;
  mobile: string;
}

interface Child {
  id?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  accountId: string;
  groupId?: string;
  parents: Parent[];
  created?: string;
  updated?: string;
}

interface ChildResponse {
  children: Child[];
  total: number;
}

interface ChildManagementCardProps {
  accounts: Account[];
  groups: Group[];
  parents: User[];
  children: Child[];
  isLoading: boolean;
  isExpanded: boolean;
  onAccountsChange: () => Promise<void>;
  onChildrenChange: () => Promise<void>;
}

const ChildManagementCard: React.FC<ChildManagementCardProps> = ({
  accounts,
  groups,
  parents,
  children,
  isLoading,
  isExpanded,
  onAccountsChange,
  onChildrenChange,
}) => {
  const { accessToken } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentChild, setCurrentChild] = useState<Partial<Child>>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    accountId: "",
    groupId: "",
    parents: [],
  });
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

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

  const handleOpenDrawer = (child?: Child) => {
    if (child) {
      setCurrentChild(child);
    } else {
      setCurrentChild({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        accountId: "",
        groupId: "",
        parents: [],
      });
    }
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setCurrentChild({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      accountId: "",
      groupId: "",
      parents: [],
    });
  };

  const handleChildChange = (field: keyof Child, value: any) => {
    setCurrentChild((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveChild = async () => {
    try {
      const url = currentChild.id
        ? `https://localhost:7225/api/v1/child/${currentChild.id}`
        : "https://localhost:7225/api/v1/child";

      const method = currentChild.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(currentChild),
      });

      if (!response.ok) {
        throw new Error("Failed to save child");
      }

      showNotification(
        currentChild.id ? "ילד עודכן בהצלחה" : "ילד נוצר בהצלחה"
      );
      handleCloseDrawer();
      await onChildrenChange();
    } catch (error) {
      showNotification("שגיאה בשמירת הילד", "error");
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(
        `https://localhost:7225/api/v1/child/${currentChild.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete child");
      }

      showNotification("ילד נמחק בהצלחה");
      setIsDeleteDialogOpen(false);
      handleCloseDrawer();
      await onChildrenChange();
    } catch (error) {
      showNotification("שגיאה במחיקת הילד", "error");
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === "0001-01-01T00:00:00") {
      return "לא זמין";
    }
    const date = new Date(dateStr);
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

  return (
    <>
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      ) : children.length > 0 ? (
        <>
          {children.map((child) => (
            <ListItem
              key={child.id}
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
                      color: child.firstName
                        ? "text.primary"
                        : "text.secondary",
                      fontStyle: child.firstName ? "normal" : "italic",
                    }}
                  >
                    {child.firstName && child.lastName
                      ? `${child.firstName} ${child.lastName}`
                      : "שם חסר"}
                  </Typography>
                }
                secondary={
                  <Box sx={{ mt: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      {child.dateOfBirth
                        ? formatDate(child.dateOfBirth)
                        : "תאריך לידה חסר"}
                    </Typography>
                    {child.parents && child.parents.length > 0 && (
                      <Typography variant="body2" color="text.secondary">
                        הורים:{" "}
                        {child.parents
                          .map((p) => `${p.firstName} ${p.lastName}`)
                          .join(", ")}
                      </Typography>
                    )}
                  </Box>
                }
              />
              <IconButton
                edge="end"
                aria-label="edit"
                onClick={() => handleOpenDrawer(child)}
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

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Fab
              color="primary"
              aria-label="add child"
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
      ) : (
        <Box sx={{ textAlign: "center", py: 3 }}>
          <Typography color="text.secondary">אין ילדים להצגה</Typography>
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
              {currentChild.id ? "עריכת ילד" : "הוספת ילד חדש"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentChild.id
                ? "עדכון פרטי הילד הקיים"
                : "הזן את פרטי הילד החדש"}
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
                label="שם פרטי"
                value={currentChild.firstName}
                onChange={(e) => handleChildChange("firstName", e.target.value)}
                placeholder="הזן את השם הפרטי"
                required
                sx={{
                  "& .MuiInputLabel-root": {
                    fontSize: "0.95rem",
                  },
                }}
              />

              <TextField
                fullWidth
                label="שם משפחה"
                value={currentChild.lastName}
                onChange={(e) => handleChildChange("lastName", e.target.value)}
                placeholder="הזן את שם המשפחה"
                required
                sx={{
                  "& .MuiInputLabel-root": {
                    fontSize: "0.95rem",
                  },
                }}
              />

              <TextField
                fullWidth
                label="תאריך לידה"
                type="datetime-local"
                value={currentChild.dateOfBirth}
                onChange={(e) =>
                  handleChildChange("dateOfBirth", e.target.value)
                }
                required
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  "& .MuiInputLabel-root": {
                    fontSize: "0.95rem",
                  },
                }}
              />

              <FormControl fullWidth>
                <InputLabel>סניף</InputLabel>
                <Select
                  value={currentChild.accountId || ""}
                  label="סניף"
                  onChange={(e) =>
                    handleChildChange("accountId", e.target.value)
                  }
                  required
                >
                  {accounts.map((account) => (
                    <MenuItem key={account.id} value={account.id}>
                      {account.branchName || "שם הסניף חסר"}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>קבוצה</InputLabel>
                <Select
                  value={currentChild.groupId || ""}
                  label="קבוצה"
                  onChange={(e) => handleChildChange("groupId", e.target.value)}
                >
                  <MenuItem value="">
                    <em>בחר קבוצה</em>
                  </MenuItem>
                  {groups
                    .filter(
                      (group) => group.accountId === currentChild.accountId
                    )
                    .map((group) => (
                      <MenuItem key={group.id} value={group.id}>
                        {group.name || "שם הקבוצה חסר"}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>הורים</InputLabel>
                <Select
                  multiple
                  value={currentChild.parents || []}
                  label="הורים"
                  onChange={(e) => handleChildChange("parents", e.target.value)}
                >
                  {parents
                    .filter((parent) => parent.role === "Parent")
                    .map((parent) => (
                      <MenuItem key={parent.id} value={parent.id}>
                        {parent.firstName && parent.lastName
                          ? `${parent.firstName} ${parent.lastName}`
                          : parent.email}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              {currentChild.id && (
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
                        {currentChild.created && currentChild.created !== ""
                          ? formatDate(currentChild.created)
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
                        {currentChild.updated && currentChild.updated !== ""
                          ? formatDate(currentChild.updated)
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
            {currentChild.id && (
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
              onClick={handleSaveChild}
              variant="contained"
              disabled={
                isLoading ||
                !currentChild.firstName ||
                !currentChild.lastName ||
                !currentChild.dateOfBirth ||
                !currentChild.accountId
              }
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                py: 1.2,
              }}
            >
              {isLoading ? "שומר..." : "שמירה"}
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
        <DialogTitle>מחיקת ילד</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את הילד{" "}
            {currentChild.firstName && currentChild.lastName
              ? `${currentChild.firstName} ${currentChild.lastName}`
              : "זה"}
            ?
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
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
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

export default ChildManagementCard;
