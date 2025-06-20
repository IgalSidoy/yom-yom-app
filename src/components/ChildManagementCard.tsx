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
  ListItemIcon,
  OutlinedInput,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { Account, Group, User, childApi, Child, Parent } from "../services/api";
import Notification from "./Notification";
import { useApp } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";
import { SelectChangeEvent } from "@mui/material/Select";
import BottomNav from "./BottomNav";

interface ChildManagementCardProps {
  accounts: Account[];
  groups: Group[];
  parents: User[];
  children: Child[];
  isLoading: boolean;
  isExpanded: boolean;
  onAccountsChange: () => Promise<void>;
  onChildrenChange: (accountId?: string) => Promise<void>;
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
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [currentChild, setCurrentChild] = useState<Child>({
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

  // Filter children based on selected account
  const filteredChildren = selectedAccountId
    ? children.filter((child) => child.accountId === selectedAccountId)
    : children;

  // Filter groups based on selected account
  const filteredGroups = selectedAccountId
    ? groups.filter((group) => group.accountId === selectedAccountId)
    : groups;

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

  const handleAccountChange = async (event: SelectChangeEvent<string>) => {
    const accountId = event.target.value;
    setSelectedAccountId(accountId);

    // Reset current child's account and group when changing accounts
    // Only clear groupId if we're creating a new child (no id) or if the account actually changed
    if (currentChild.accountId !== accountId) {
      handleChildChange("accountId", accountId);
      // Only clear groupId if we're not editing an existing child
      if (!currentChild.id) {
        handleChildChange("groupId", "");
      }
    }

    // Trigger children refresh when account changes
    if (accountId) {
      await onChildrenChange(accountId);
    }
  };

  const handleSaveChild = async () => {
    try {
      if (currentChild.id) {
        await childApi.updateChild(currentChild.id, currentChild);
      } else {
        await childApi.createChild(currentChild);
      }

      showNotification(
        currentChild.id ? "ילד עודכן בהצלחה" : "ילד נוצר בהצלחה"
      );
      handleCloseDrawer();
      await onChildrenChange(currentChild.accountId);
    } catch (error) {
      showNotification("שגיאה בשמירת הילד", "error");
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (!currentChild.id) {
        throw new Error("No child ID provided");
      }

      await childApi.deleteChild(currentChild.id);
      showNotification("ילד נמחק בהצלחה");
      setIsDeleteDialogOpen(false);
      handleCloseDrawer();
      await onChildrenChange(currentChild.accountId);
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

  const handleEditChild = (child: Child) => {
    // Format the date for datetime-local input (YYYY-MM-DDTHH:mm)
    const formatDateForInput = (dateString: string) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
    };

    console.log("Editing child:", child); // Debug log
    console.log("Child groupId:", child.groupId); // Debug log

    setCurrentChild({
      id: child.id,
      firstName: child.firstName,
      lastName: child.lastName,
      dateOfBirth: formatDateForInput(child.dateOfBirth),
      accountId: child.accountId,
      groupId: child.groupId,
      parents: child.parents,
      created: child.created,
      updated: child.updated,
    });

    // Ensure the child's group is available in the groups list
    // This is needed in case the groups data doesn't include the child's group
    if (child.groupId && !groups.some((group) => group.id === child.groupId)) {
      // If the child's group is not in the groups list, we need to fetch it
      // For now, we'll add a placeholder group to ensure the UI works
      // In a real implementation, you might want to fetch the specific group
      console.warn(`Child's group ${child.groupId} not found in groups list`);
    }

    setIsDrawerOpen(true);
  };

  return (
    <Box sx={{ position: "relative", minHeight: "200px", pb: 8 }}>
      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>סניף</InputLabel>
          <Select
            value={selectedAccountId}
            label="סניף"
            onChange={handleAccountChange}
            sx={{ bgcolor: "background.paper" }}
          >
            <MenuItem value="">
              <em>הצג את כל הסניפים</em>
            </MenuItem>
            {accounts.map((account) => (
              <MenuItem key={account.id} value={account.id}>
                {account.branchName || "שם הסניף חסר"}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {filteredChildren.length > 0 ? (
            filteredChildren.map((child) => (
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
                  onClick={() => handleEditChild(child)}
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
            ))
          ) : (
            <Box sx={{ textAlign: "center", py: 3 }}>
              <Typography color="text.secondary">
                {selectedAccountId ? "אין ילדים בסניף זה" : "אין ילדים להצגה"}
              </Typography>
            </Box>
          )}
        </>
      )}

      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 400 },
            p: 3,
          },
        }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
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
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>הורים</InputLabel>
                  <Select
                    multiple
                    value={currentChild.parents?.map((p) => p.id) || []}
                    label="הורים"
                    onChange={(e) => {
                      const selectedIds = e.target.value as string[];
                      const selectedParents = parents
                        .filter((parent) => selectedIds.includes(parent.id))
                        .map((parent) => ({
                          id: parent.id,
                          firstName: parent.firstName,
                          lastName: parent.lastName,
                          mobile: parent.mobile,
                        }));
                      handleChildChange("parents", selectedParents);

                      // If this is the first parent being selected and the child's last name is empty,
                      // set it to match the parent's last name
                      if (
                        selectedParents.length === 1 &&
                        !currentChild.lastName
                      ) {
                        handleChildChange(
                          "lastName",
                          selectedParents[0].lastName
                        );
                      }
                    }}
                    input={<OutlinedInput label="הורים" />}
                    renderValue={(selected) => {
                      const selectedParents = parents
                        .filter((parent) => selected.includes(parent.id))
                        .map(
                          (parent) => `${parent.firstName} ${parent.lastName}`
                        )
                        .join(", ");
                      return selectedParents || "בחר הורים";
                    }}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                        },
                      },
                    }}
                  >
                    {parents
                      .filter((parent) => parent.role === "Parent")
                      .map((parent) => (
                        <MenuItem key={parent.id} value={parent.id}>
                          <ListItemIcon>
                            {currentChild.parents?.some(
                              (p) => p.id === parent.id
                            ) && (
                              <CheckIcon
                                sx={{
                                  fontSize: 20,
                                  color: "primary.main",
                                }}
                              />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              parent.firstName && parent.lastName
                                ? `${parent.firstName} ${parent.lastName}`
                                : parent.email
                            }
                          />
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="שם פרטי"
                  value={currentChild.firstName}
                  onChange={(e) =>
                    handleChildChange("firstName", e.target.value)
                  }
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
                  onChange={(e) =>
                    handleChildChange("lastName", e.target.value)
                  }
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
                    onChange={(e) =>
                      handleChildChange("groupId", e.target.value)
                    }
                  >
                    <MenuItem value="">
                      <em>בחר קבוצה</em>
                    </MenuItem>
                    {(() => {
                      // Debug logs
                      console.log(
                        "Current child groupId:",
                        currentChild.groupId
                      );
                      console.log("All groups:", groups);
                      console.log(
                        "Current child accountId:",
                        currentChild.accountId
                      );

                      // Get groups for the current account
                      const accountGroups = groups.filter(
                        (group) => group.accountId === currentChild.accountId
                      );

                      console.log("Account groups:", accountGroups);

                      // If we're editing a child and their group is not in the account groups,
                      // we need to ensure it's available for selection
                      if (currentChild.id && currentChild.groupId) {
                        const childGroup = groups.find(
                          (group) => group.id === currentChild.groupId
                        );
                        console.log("Child group found:", childGroup);
                        if (
                          childGroup &&
                          !accountGroups.some(
                            (group) => group.id === childGroup.id
                          )
                        ) {
                          accountGroups.push(childGroup);
                          console.log("Added child group to account groups");
                        }
                      }

                      return accountGroups.map((group) => (
                        <MenuItem key={group.id} value={group.id}>
                          {group.name || "שם הקבוצה חסר"}
                        </MenuItem>
                      ));
                    })()}
                  </Select>
                </FormControl>

                {currentChild.id && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      bgcolor: "background.default",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                      מידע נוסף
                    </Typography>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: 2,
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
                sx={{
                  color: "error.main",
                  borderColor: "error.main",
                  "&:hover": {
                    borderColor: "error.dark",
                    bgcolor: "error.lighter",
                  },
                }}
                variant="outlined"
              >
                מחק ילד
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

      <Fab
        color="primary"
        aria-label="add"
        onClick={() => handleOpenDrawer()}
        sx={{
          position: "sticky",
          bottom: 24,
          right: 24,
          mt: 2,
          zIndex: 1000,
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default ChildManagementCard;
