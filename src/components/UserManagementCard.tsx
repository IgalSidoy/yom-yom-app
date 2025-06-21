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
  Chip,
  Fab,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { userApi, User, Account, Group, groupApi } from "../services/api";
import Notification from "./Notification";
import { useApp } from "../contexts/AppContext";

interface UserManagementCardProps {
  accounts: Account[];
  isExpanded: boolean;
  onAccountsChange: () => Promise<void>;
}

const UserManagementCard: React.FC<UserManagementCardProps> = ({
  accounts,
  isExpanded,
  onAccountsChange,
}) => {
  const { users, setUsers, user: currentAppUser } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User>>({
    email: "",
    firstName: "",
    lastName: "",
    mobile: "",
    role: "Staff",
    accountId: "",
    groupId: "",
  });
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });
  const [search, setSearch] = useState("");
  const [selectedAccountFilter, setSelectedAccountFilter] =
    useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      if (isExpanded && !isInitialized) {
        if (accounts.length === 0) {
          await onAccountsChange();
        }
        if (users.length === 0) {
          await fetchUsers();
        }
        // Fetch groups for all accounts to display group names in user list
        if (accounts.length > 0) {
          const allGroups: Group[] = [];
          for (const account of accounts) {
            try {
              const response = await groupApi.getGroups(account.id);
              if (response.data.groups) {
                allGroups.push(...response.data.groups);
              }
            } catch (error) {
              console.error(
                `Error fetching groups for account ${account.id}:`,
                error
              );
            }
          }
          setGroups(allGroups);
        }
        setIsInitialized(true);
      } else if (!isExpanded) {
        setIsInitialized(false);
      }
    };
    fetchData();
  }, [isExpanded, accounts.length]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await userApi.getUsers();
      if (response.data.users) {
        setUsers(response.data.users);
      } else {
        setUsers([]);
      }
    } catch (error) {
      showNotification("שגיאה בטעינת המשתמשים", "error");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroupsForAccount = async (accountId: string) => {
    try {
      setIsLoadingGroups(true);
      const response = await groupApi.getGroups(accountId);
      let groupsData: Group[] = [];
      if (response.data.groups) {
        groupsData = response.data.groups;
      }
      setGroups(groupsData);
      return groupsData;
    } catch (error) {
      showNotification("שגיאה בטעינת הקבוצות", "error");
      setGroups([]);
      return [];
    } finally {
      setIsLoadingGroups(false);
    }
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

  const handleOpenDrawer = (user?: User) => {
    if (user) {
      setCurrentUser({
        ...user,
        accountId: user.accountId || "",
        groupId: "", // Start with empty groupId, will be set after groups load
      });
      // Fetch groups for the user's account and then set the groupId
      if (user.accountId) {
        fetchGroupsForAccount(user.accountId).then((groupsData) => {
          // After groups are fetched, check if we need to set the groupId
          if (
            user.groupId &&
            groupsData.some((group) => group.id === user.groupId)
          ) {
            setCurrentUser((prev) => ({
              ...prev,
              groupId: user.groupId,
            }));
          }
        });
      }
    } else {
      setCurrentUser({
        email: "",
        firstName: "",
        lastName: "",
        mobile: "",
        role: "Staff",
        accountId: "",
        groupId: "",
      });
      setGroups([]);
    }
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setCurrentUser({
      email: "",
      firstName: "",
      lastName: "",
      mobile: "",
      role: "Staff",
      accountId: "",
      groupId: "",
    });
  };

  const handleUserChange = (field: keyof User, value: string) => {
    setCurrentUser((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };

      // If accountId changed, fetch groups for the new account and clear groupId
      if (field === "accountId" && value !== prev.accountId) {
        if (value) {
          fetchGroupsForAccount(value);
        } else {
          setGroups([]);
        }
        updated.groupId = "";
      }

      // If role changed from Staff to something else, clear groupId
      if (field === "role" && prev.role === "Staff" && value !== "Staff") {
        updated.groupId = "";
      }

      return updated;
    });
  };

  const handleSaveUser = async () => {
    try {
      // Validate that Staff users have a group assigned
      if (
        currentUser.role === "Staff" &&
        (!currentUser.groupId || currentUser.groupId === "")
      ) {
        showNotification("עובדי צוות חייבים להיות משויכים לקבוצה", "warning");
        return;
      }

      setIsLoading(true);
      if (currentUser.id) {
        // Update existing user
        await userApi.updateUser(currentUser as User);
        showNotification("משתמש עודכן בהצלחה");
      } else {
        // Create new user
        await userApi.createUser(currentUser as Omit<User, "id">);
        showNotification("משתמש נוצר בהצלחה");
      }
      handleCloseDrawer();
      fetchUsers();
    } catch (error: any) {
      // Extract error message from API response
      let errorMessage = "שגיאה בשמירת המשתמש";

      if (error.response?.data?.Message) {
        // Translate common API error messages to Hebrew
        const apiMessage = error.response.data.Message;
        switch (apiMessage) {
          case "mobile number already in use":
            errorMessage = "מספר הטלפון כבר קיים במערכת";
            break;
          case "email already in use":
            errorMessage = "כתובת האימייל כבר קיימת במערכת";
            break;
          case "user not found":
            errorMessage = "המשתמש לא נמצא";
            break;
          case "invalid email format":
            errorMessage = "פורמט אימייל לא תקין";
            break;
          case "invalid mobile format":
            errorMessage = "פורמט מספר טלפון לא תקין";
            break;
          case "account not found":
            errorMessage = "הסניף לא נמצא";
            break;
          case "group not found":
            errorMessage = "הקבוצה לא נמצאה";
            break;
          default:
            // Use the original message if no translation is available
            errorMessage = apiMessage;
        }
      } else if (error.response?.status === 422) {
        // Handle 422 validation errors
        errorMessage = "שגיאה בנתונים שהוזנו";
      } else if (error.message) {
        // Use the error message if available
        errorMessage = error.message;
      }

      showNotification(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsLoading(true);
      await userApi.deleteUser(currentUser.id!);
      showNotification("משתמש נמחק בהצלחה");
      setIsDeleteDialogOpen(false);
      handleCloseDrawer();
      fetchUsers();
    } catch (error) {
      showNotification("שגיאה במחיקת המשתמש", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
  };

  const handleAccountFilterClick = (accountId: string) => {
    if (selectedAccountFilter === accountId) {
      // If clicking the same account, clear the filter
      setSelectedAccountFilter("");
    } else {
      // Set the new account filter
      setSelectedAccountFilter(accountId);
    }
  };

  const clearAccountFilter = () => {
    setSelectedAccountFilter("");
  };

  const formatMobileNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(
        6,
        10
      )}`;
    }
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

  const filteredUsers = users.filter((user: User) => {
    // Filter by account if selected
    if (selectedAccountFilter && user.accountId !== selectedAccountFilter) {
      return false;
    }

    // Filter by search query
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  return (
    <Box
      sx={{
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      ) : users.length > 0 ? (
        <>
          {/* Sticky Search Bar and Add Button */}
          <Box
            sx={{
              position: "sticky",
              top: 60,
              zIndex: 20,
              bgcolor: "background.default",
              pt: 1,
              pb: 1,
              borderBottom: 1,
              borderColor: "divider",
              mt: -1,
            }}
          >
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                fullWidth
                label="חיפוש"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="חיפוש לפי שם..."
                sx={{
                  "& .MuiInputLabel-root": {
                    fontSize: "0.95rem",
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (search || selectedAccountFilter) && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSearch("");
                          clearAccountFilter();
                        }}
                        edge="end"
                      >
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Fab
                color="primary"
                aria-label="add user"
                onClick={() => handleOpenDrawer()}
                sx={{
                  boxShadow: 3,
                  flexShrink: 0,
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

            {/* Active Account Filter Display */}
            {selectedAccountFilter && (
              <Box
                sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}
              >
                <Chip
                  label={`סניף: ${
                    accounts.find((acc) => acc.id === selectedAccountFilter)
                      ?.branchName || "לא ידוע"
                  }`}
                  size="small"
                  color="primary"
                  onDelete={clearAccountFilter}
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 500,
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  מציג משתמשים מסניף זה בלבד
                </Typography>
              </Box>
            )}
          </Box>

          {/* Scrollable Users List */}
          <Box sx={{ flex: 1, overflow: "auto", px: 2 }}>
            {filteredUsers.length > 0 ? (
              <>
                {filteredUsers.map((user: User) => (
                  <ListItem
                    key={user.id}
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
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 500,
                              color: user.firstName
                                ? "text.primary"
                                : "text.secondary",
                              fontStyle: user.firstName ? "normal" : "italic",
                            }}
                          >
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user.email}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              flexWrap: "wrap",
                            }}
                          >
                            <Chip
                              label={
                                user.role === "Admin"
                                  ? "מנהל"
                                  : user.role === "Parent"
                                  ? "הורה"
                                  : "צוות"
                              }
                              size="small"
                              color={
                                user.role === "Admin"
                                  ? "primary"
                                  : user.role === "Parent"
                                  ? "success"
                                  : "info"
                              }
                              sx={{
                                height: 20,
                                fontSize: "0.75rem",
                                fontWeight: 500,
                              }}
                            />
                            {user.accountId && (
                              <Chip
                                label={`סניף: ${
                                  accounts.find(
                                    (account) => account.id === user.accountId
                                  )?.branchName || "לא ידוע"
                                }`}
                                size="small"
                                onClick={() =>
                                  handleAccountFilterClick(user.accountId)
                                }
                                sx={{
                                  height: 20,
                                  fontSize: "0.75rem",
                                  fontWeight: 500,
                                  bgcolor:
                                    selectedAccountFilter === user.accountId
                                      ? "primary.main"
                                      : "#009688",
                                  color: "white",
                                  cursor: "pointer",
                                  "&:hover": {
                                    bgcolor:
                                      selectedAccountFilter === user.accountId
                                        ? "primary.dark"
                                        : "#00796b",
                                    transform: "scale(1.05)",
                                  },
                                  transition: "all 0.2s ease-in-out",
                                  "& .MuiChip-label": {
                                    color: "white",
                                  },
                                }}
                              />
                            )}
                            {user.groupId && (
                              <Chip
                                label={`קבוצה: ${
                                  groups.find(
                                    (group) => group.id === user.groupId
                                  )?.name || "לא ידועה"
                                }`}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: "0.75rem",
                                  fontWeight: 500,
                                  bgcolor: "#9c27b0",
                                  color: "white",
                                  "& .MuiChip-label": {
                                    color: "white",
                                  },
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          {formatMobileNumber(user.mobile)}
                        </Typography>
                      }
                    />
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() => handleOpenDrawer(user)}
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
                  לא נמצאו משתמשים התואמים לחיפוש
                </Typography>
              </Box>
            )}
          </Box>
        </>
      ) : (
        <Box sx={{ textAlign: "center", py: 3 }}>
          <Typography color="text.secondary">אין משתמשים להצגה</Typography>
        </Box>
      )}

      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 400 },
            bgcolor: "background.paper",
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Sticky Header */}
          <Box
            sx={{
              p: 3,
              pb: 2,
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
              zIndex: 1,
            }}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
              {currentUser.id ? "עריכת משתמש" : "הוספת משתמש חדש"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentUser.id
                ? "עדכון פרטי המשתמש הקיים"
                : "הזן את פרטי המשתמש החדש"}
            </Typography>
          </Box>

          {/* Scrollable Content */}
          <Box sx={{ flex: 1, overflow: "auto", p: 3, pt: 2 }}>
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
                label="אימייל"
                value={currentUser.email}
                onChange={(e) => handleUserChange("email", e.target.value)}
                placeholder="הזן את כתובת האימייל"
                required
                sx={{
                  "& .MuiInputLabel-root": {
                    fontSize: "0.95rem",
                  },
                }}
              />
              <TextField
                fullWidth
                label="שם פרטי"
                value={currentUser.firstName}
                onChange={(e) => handleUserChange("firstName", e.target.value)}
                placeholder="הזן את השם הפרטי"
                sx={{
                  "& .MuiInputLabel-root": {
                    fontSize: "0.95rem",
                  },
                }}
              />
              <TextField
                fullWidth
                label="שם משפחה"
                value={currentUser.lastName}
                onChange={(e) => handleUserChange("lastName", e.target.value)}
                placeholder="הזן את שם המשפחה"
                sx={{
                  "& .MuiInputLabel-root": {
                    fontSize: "0.95rem",
                  },
                }}
              />
              <TextField
                fullWidth
                label="טלפון"
                value={currentUser.mobile}
                onChange={(e) =>
                  handleUserChange("mobile", formatMobileNumber(e.target.value))
                }
                placeholder="הזן מספר טלפון"
                sx={{
                  "& .MuiInputLabel-root": {
                    fontSize: "0.95rem",
                  },
                }}
              />
              <FormControl fullWidth>
                <InputLabel>תפקיד</InputLabel>
                <Select
                  value={currentUser.role}
                  label="תפקיד"
                  onChange={(e) => handleUserChange("role", e.target.value)}
                  disabled={
                    currentUser.id === currentAppUser?.id &&
                    currentUser.role === "Admin"
                  }
                >
                  <MenuItem value="Admin">מנהל</MenuItem>
                  <MenuItem value="Staff">צוות</MenuItem>
                  <MenuItem value="Parent">הורה</MenuItem>
                </Select>
                {currentUser.id === currentAppUser?.id &&
                  currentUser.role === "Admin" && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 0.5, display: "block" }}
                    >
                      לא ניתן לשנות את התפקיד של המשתמש הנוכחי
                    </Typography>
                  )}
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>סניף</InputLabel>
                <Select
                  value={currentUser.accountId || ""}
                  label="סניף"
                  onChange={(e) =>
                    handleUserChange("accountId", e.target.value)
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

              {currentUser.role === "Staff" && (
                <FormControl fullWidth>
                  <InputLabel>קבוצה</InputLabel>
                  <Select
                    value={currentUser.groupId || ""}
                    label="קבוצה"
                    onChange={(e) =>
                      handleUserChange("groupId", e.target.value)
                    }
                    disabled={isLoadingGroups || !currentUser.accountId}
                  >
                    <MenuItem value="">
                      <em>בחר קבוצה (אופציונלי)</em>
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
                          אין קבוצות זמינות בסניף זה
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
              )}

              {currentUser.id && (
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
                        {currentUser.created && currentUser.created !== ""
                          ? formatDate(currentUser.created)
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
                        {currentUser.updated && currentUser.updated !== ""
                          ? formatDate(currentUser.updated)
                          : "לא זמין"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>

          {/* Fixed Bottom Buttons */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              p: 3,
              pt: 2,
              pb: 3,
              borderTop: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              zIndex: 1,
            }}
          >
            {currentUser.id && currentUser.role !== "Admin" && (
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
              onClick={handleSaveUser}
              variant="contained"
              disabled={isLoading || !currentUser.email}
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
        <DialogTitle>מחיקת משתמש</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את המשתמש{" "}
            {currentUser.firstName && currentUser.lastName
              ? `${currentUser.firstName} ${currentUser.lastName}`
              : currentUser.email}
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

export default UserManagementCard;
