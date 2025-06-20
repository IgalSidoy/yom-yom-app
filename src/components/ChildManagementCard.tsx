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
  Tooltip,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Card,
  CardContent,
  Grid,
  Chip,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import {
  Account,
  Group,
  User,
  childApi,
  Child,
  Parent,
  groupApi,
} from "../services/api";
import Notification from "./Notification";
import { useApp } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";
import { SelectChangeEvent } from "@mui/material/Select";
import BottomNav from "./BottomNav";

interface ChildManagementCardProps {
  accounts: Account[];
  parents: User[];
  children: Child[];
  selectedAccountId: string;
  isLoading: boolean;
  isExpanded: boolean;
  onAccountsChange: () => Promise<void>;
  onChildrenChange: (accountId?: string) => Promise<void>;
}

const ChildManagementCard: React.FC<ChildManagementCardProps> = ({
  accounts,
  parents,
  children,
  selectedAccountId,
  isLoading,
  isExpanded,
  onAccountsChange,
  onChildrenChange,
}) => {
  const { accessToken } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
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

  // Debug effect to log when groups change
  useEffect(() => {
    console.log("ChildManagementCard - Groups updated:", groups);
    console.log("ChildManagementCard - Accounts:", accounts);
  }, [groups, accounts]);

  // Fetch groups when selectedAccountId changes
  useEffect(() => {
    if (selectedAccountId) {
      fetchGroupsForAccount(selectedAccountId);
    } else {
      setGroups([]);
    }
  }, [selectedAccountId]);

  // Initialize data when accordion is expanded
  useEffect(() => {
    const initializeData = async () => {
      if (isExpanded) {
        if (accounts.length === 0) {
          await onAccountsChange();
        }
        if (parents.length === 0) {
          // Fetch parents if needed
          // This would need to be implemented in the parent component
        }
      }
    };
    initializeData();
  }, [isExpanded, accounts.length, parents.length]);

  // Function to fetch groups for a specific account
  const fetchGroupsForAccount = async (accountId: string) => {
    try {
      console.log("Fetching groups for account:", accountId);
      setIsLoadingGroups(true);
      const response = await groupApi.getGroups(accountId);
      console.log("Groups response:", response.data);

      let groupsData: Group[] = [];
      if (response.data.groups) {
        groupsData = response.data.groups.map((group: any) => ({
          id: group.id,
          name: group.name,
          description: group.description || "",
          accountId: group.accountId,
          created: group.created,
          updated: group.updated,
        }));
      }

      console.log("Groups data:", groupsData);
      setGroups(groupsData);
    } catch (error) {
      console.error("Error fetching groups:", error);
      showNotification("שגיאה בטעינת הקבוצות", "error");
      setGroups([]);
    } finally {
      setIsLoadingGroups(false);
    }
  };

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
        accountId: selectedAccountId, // Use the selected account from props
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
    // Format the date for date input (YYYY-MM-DD)
    const formatDateForInput = (dateString: string) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    };

    console.log("Editing child:", child);
    console.log("Child accountId:", child.accountId);

    // Set child data without groupId initially
    setCurrentChild({
      id: child.id,
      firstName: child.firstName,
      lastName: child.lastName,
      dateOfBirth: formatDateForInput(child.dateOfBirth),
      accountId: child.accountId,
      groupId: "", // Don't set groupId until groups are loaded
      parents: child.parents,
      created: child.created,
      updated: child.updated,
    });

    // Always fetch groups for the child's account and then set groupId
    if (child.accountId) {
      fetchGroupsForAccount(child.accountId).then(() => {
        // After groups are loaded, set the groupId if it exists in the loaded groups
        if (
          child.groupId &&
          groups.some((group) => group.id === child.groupId)
        ) {
          setCurrentChild((prev) => ({
            ...prev,
            groupId: child.groupId,
          }));
        }
      });
    }

    setIsDrawerOpen(true);
  };

  return (
    <Box sx={{ position: "relative", minHeight: "200px", pb: 8 }}>
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      ) : filteredChildren.length > 0 ? (
        <>
          {filteredChildren.map((child: Child) => (
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
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                    <Chip
                      label={formatDate(child.dateOfBirth)}
                      size="small"
                      color="info"
                      sx={{
                        height: 20,
                        fontSize: "0.75rem",
                        fontWeight: 500,
                      }}
                    />
                  </Box>
                }
                secondary={
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {child.parents && child.parents.length > 0
                      ? `הורים: ${child.parents
                          .map((parent) =>
                            parent.firstName && parent.lastName
                              ? `${parent.firstName} ${parent.lastName}`
                              : "הורה לא ידוע"
                          )
                          .join(", ")}`
                      : "אין הורים מוגדרים"}
                  </Typography>
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
          ))}
        </>
      ) : (
        <Box sx={{ textAlign: "center", py: 3 }}>
          <Typography color="text.secondary">
            {selectedAccountId ? "אין ילדים בסניף זה" : "אין ילדים להצגה"}
          </Typography>
        </Box>
      )}

      {/* Add button - show when account is selected */}
      {selectedAccountId && (
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

                <DatePicker
                  label="תאריך לידה"
                  value={
                    currentChild.dateOfBirth
                      ? dayjs(currentChild.dateOfBirth)
                      : null
                  }
                  onChange={(newValue) => {
                    handleChildChange(
                      "dateOfBirth",
                      newValue?.format("YYYY-MM-DD") || ""
                    );
                  }}
                  slots={{
                    leftArrowIcon: KeyboardArrowRightIcon,
                    rightArrowIcon: KeyboardArrowLeftIcon,
                  }}
                  slotProps={{
                    openPickerButton: { sx: { color: "primary.main" } },
                    textField: {
                      fullWidth: true,
                      required: true,
                      sx: {
                        "& .MuiInputLabel-root": {
                          fontSize: "0.95rem",
                          color: "text.secondary",
                        },
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "primary.main",
                            borderWidth: "2px",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "primary.main",
                            borderWidth: "2px",
                          },
                          "& .MuiInputBase-input": {
                            fontSize: "0.95rem",
                            color: "text.primary",
                            padding: "12px 14px",
                          },
                        },
                      },
                    },
                  }}
                  sx={{
                    "& .MuiPickersArrowSwitcher-button": {
                      color: "primary.main",
                    },
                  }}
                />

                <FormControl fullWidth>
                  <InputLabel>קבוצה</InputLabel>
                  <Select
                    value={
                      currentChild.groupId &&
                      groups.some((group) => group.id === currentChild.groupId)
                        ? currentChild.groupId
                        : ""
                    }
                    label="קבוצה"
                    onChange={(e) =>
                      handleChildChange("groupId", e.target.value)
                    }
                    disabled={isLoadingGroups}
                  >
                    <MenuItem value="">
                      <em>בחר קבוצה</em>
                    </MenuItem>
                    {isLoadingGroups ? (
                      <MenuItem disabled>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <CircularProgress size={16} />
                          <Typography variant="body2">
                            טוען קבוצות...
                          </Typography>
                        </Box>
                      </MenuItem>
                    ) : groups.length === 0 ? (
                      <MenuItem disabled>
                        <Typography variant="body2" color="text.secondary">
                          אין קבוצות זמינות
                        </Typography>
                      </MenuItem>
                    ) : (
                      groups.map((group) => (
                        <MenuItem key={group.id} value={group.id}>
                          {group.name || "שם הקבוצה חסר"}
                        </MenuItem>
                      ))
                    )}
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
                          סניף
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "text.primary",
                            fontWeight: 500,
                          }}
                        >
                          {currentChild.accountId
                            ? accounts.find(
                                (acc) => acc.id === currentChild.accountId
                              )?.branchName || "שם הסניף חסר"
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
    </Box>
  );
};

export default ChildManagementCard;
