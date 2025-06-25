import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { FixedSizeList as VirtualList } from "react-window";
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
  Tooltip,
  Popover,
} from "@mui/material";
import {
  Add as AddIcon,
  Clear as ClearIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Sort as SortIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from "@mui/icons-material";
import { userApi, User, Account, Group, groupApi } from "../services/api";
import Notification from "./Notification";
import { useApp } from "../contexts/AppContext";

interface UserManagementCardProps {
  accounts: Account[];
  isExpanded: boolean;
  onAccountsChange: () => Promise<void>;
}

// Memoized User List Item Component
const UserListItem = memo<{
  user: User;
  accounts: Account[];
  groups: Group[];
  selectedRoleFilter: string;
  selectedAccountFilter: string;
  selectedGroupFilter: string;
  onRoleFilterClick: (role: string) => void;
  onAccountFilterClick: (accountId: string) => void;
  onGroupFilterClick: (groupId: string) => void;
  onEditClick: (user: User) => void;
  formatMobileNumber: (value: string) => string;
}>(
  ({
    user,
    accounts,
    groups,
    selectedRoleFilter,
    selectedAccountFilter,
    selectedGroupFilter,
    onRoleFilterClick,
    onAccountFilterClick,
    onGroupFilterClick,
    onEditClick,
    formatMobileNumber,
  }) => {
    const account = useMemo(
      () => accounts.find((acc) => acc.id === user.accountId),
      [accounts, user.accountId]
    );

    const group = useMemo(
      () => groups.find((g) => g.id === user.groupId),
      [groups, user.groupId]
    );

    return (
      <ListItem
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
                  color: user.firstName ? "text.primary" : "text.secondary",
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
                  onClick={() => onRoleFilterClick(user.role)}
                  sx={{
                    height: 20,
                    fontSize: "0.75rem",
                    fontWeight: selectedRoleFilter === user.role ? 700 : 500,
                    cursor: "pointer",
                    bgcolor:
                      selectedRoleFilter === user.role ? "#FF914D" : undefined,
                    color:
                      selectedRoleFilter === user.role ? "#4E342E" : undefined,
                    "&:hover": {
                      bgcolor:
                        selectedRoleFilter === user.role
                          ? "#FF7A1A"
                          : undefined,
                      transform: "scale(1.05)",
                    },
                    transition: "all 0.2s ease-in-out",
                    "& .MuiChip-label": {
                      color:
                        selectedRoleFilter === user.role
                          ? "#4E342E"
                          : undefined,
                      fontWeight: selectedRoleFilter === user.role ? 700 : 500,
                    },
                  }}
                />
                {user.accountId && (
                  <Chip
                    label={`סניף: ${account?.branchName || "לא ידוע"}`}
                    size="small"
                    onClick={() => onAccountFilterClick(user.accountId)}
                    sx={{
                      height: 20,
                      fontSize: "0.75rem",
                      fontWeight:
                        selectedAccountFilter === user.accountId ? 700 : 500,
                      bgcolor:
                        selectedAccountFilter === user.accountId
                          ? "#FF914D"
                          : "#009688",
                      color: "white",
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor:
                          selectedAccountFilter === user.accountId
                            ? "#FF7A1A"
                            : "#00796b",
                        transform: "scale(1.05)",
                      },
                      transition: "all 0.2s ease-in-out",
                      "& .MuiChip-label": {
                        color: "white",
                        fontWeight:
                          selectedAccountFilter === user.accountId ? 700 : 500,
                      },
                    }}
                  />
                )}
                {user.groupId && (
                  <Chip
                    label={`קבוצה: ${group?.name || "לא ידועה"}`}
                    size="small"
                    onClick={() => onGroupFilterClick(user.groupId!)}
                    sx={{
                      height: 20,
                      fontSize: "0.75rem",
                      fontWeight:
                        selectedGroupFilter === user.groupId ? 700 : 500,
                      bgcolor:
                        selectedGroupFilter === user.groupId
                          ? "#FF914D"
                          : "#9c27b0",
                      color:
                        selectedGroupFilter === user.groupId
                          ? "#4E342E"
                          : "white",
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor:
                          selectedGroupFilter === user.groupId
                            ? "#FF7A1A"
                            : "#7b1fa2",
                        transform: "scale(1.05)",
                      },
                      transition: "all 0.2s ease-in-out",
                      "& .MuiChip-label": {
                        color:
                          selectedGroupFilter === user.groupId
                            ? "#4E342E"
                            : "white",
                        fontWeight:
                          selectedGroupFilter === user.groupId ? 700 : 500,
                      },
                    }}
                  />
                )}
              </Box>
            </Box>
          }
          secondary={
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {formatMobileNumber(user.mobile)}
            </Typography>
          }
        />
        <IconButton
          edge="end"
          aria-label="edit"
          onClick={() => onEditClick(user)}
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
    );
  }
);

UserListItem.displayName = "UserListItem";

const UserManagementCard: React.FC<UserManagementCardProps> = ({
  accounts,
  isExpanded,
  onAccountsChange,
}) => {
  const { users, setUsers, user: currentAppUser, notifyUserChange } = useApp();
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
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedAccountFilter, setSelectedAccountFilter] =
    useState<string>("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("");
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"name" | "account" | "role">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [sortPopoverOpen, setSortPopoverOpen] = useState(false);
  const [sortAnchorEl, setSortAnchorEl] = useState<HTMLElement | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

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
        role: "Parent",
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
      role: "Parent",
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
      notifyUserChange();
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
      notifyUserChange();
    } catch (error) {
      showNotification("שגיאה במחיקת המשתמש", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
  };

  const handleAccountFilterClick = useCallback(
    (accountId: string) => {
      setSelectedAccountFilter(
        selectedAccountFilter === accountId ? "" : accountId
      );
    },
    [selectedAccountFilter]
  );

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

  const sortUsers = (users: User[]) => {
    return [...users].sort((a, b) => {
      let aValue: string;
      let bValue: string;

      switch (sortBy) {
        case "name":
          aValue = `${a.firstName || ""} ${a.lastName || ""}`.trim() || a.email;
          bValue = `${b.firstName || ""} ${b.lastName || ""}`.trim() || b.email;
          break;
        case "account":
          const aAccount = accounts.find((acc) => acc.id === a.accountId);
          const bAccount = accounts.find((acc) => acc.id === b.accountId);
          aValue = aAccount?.branchName || "לא ידוע";
          bValue = bAccount?.branchName || "לא ידוע";
          break;
        case "role":
          aValue = a.role;
          bValue = b.role;
          break;
        default:
          return 0;
      }

      const comparison = aValue.localeCompare(bValue, "he");
      return sortOrder === "asc" ? comparison : -comparison;
    });
  };

  // Memoized filtered users
  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Apply search filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.firstName?.toLowerCase().includes(searchLower) ||
          user.lastName?.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.mobile?.includes(searchLower)
      );
    }

    // Apply role filter
    if (selectedRoleFilter) {
      filtered = filtered.filter((user) => user.role === selectedRoleFilter);
    }

    // Apply account filter
    if (selectedAccountFilter) {
      filtered = filtered.filter(
        (user) => user.accountId === selectedAccountFilter
      );
    }

    // Apply group filter
    if (selectedGroupFilter) {
      filtered = filtered.filter(
        (user) => user.groupId === selectedGroupFilter
      );
    }

    return sortUsers(filtered);
  }, [
    users,
    debouncedSearchTerm,
    selectedRoleFilter,
    selectedAccountFilter,
    selectedGroupFilter,
    sortBy,
    sortOrder,
  ]);

  // Memoized callback functions
  const handleRoleFilterClick = useCallback(
    (role: string) => {
      setSelectedRoleFilter(selectedRoleFilter === role ? "" : role);
    },
    [selectedRoleFilter]
  );

  const handleGroupFilterClick = useCallback(
    (groupId: string) => {
      setSelectedGroupFilter(selectedGroupFilter === groupId ? "" : groupId);
    },
    [selectedGroupFilter]
  );

  const handleEditClick = useCallback((user: User) => {
    handleOpenDrawer(user);
  }, []);

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value);
    },
    []
  );

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
  };

  const clearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  const clearAllFilters = useCallback(() => {
    setSelectedRoleFilter("");
    setSelectedAccountFilter("");
    setSelectedGroupFilter("");
    setSearchTerm("");
  }, []);

  const handleRefresh = useCallback(async () => {
    try {
      setIsLoading(true);
      await fetchUsers();
      showNotification("רשימת המשתמשים עודכנה בהצלחה", "success");
    } catch (error) {
      showNotification("שגיאה בעדכון רשימת המשתמשים", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

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
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                alignItems: { xs: "stretch", sm: "center" },
              }}
            >
              {/* Top Row: Search, Sort, Refresh - Mobile only */}
              <Box
                sx={{
                  display: { xs: "flex", sm: "none" },
                  gap: 2,
                  alignItems: "center",
                }}
              >
                {/* Search Box */}
                <TextField
                  label="חיפוש"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  placeholder="חיפוש לפי שם..."
                  sx={{
                    "& .MuiInputLabel-root": {
                      fontSize: "0.95rem",
                    },
                    width: "100%",
                    transition: "width 1s ease-in-out",
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={clearSearch}
                          edge="end"
                        >
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Sort Controls */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      bgcolor: "background.paper",
                      borderRadius: 2,
                      border: 1,
                      borderColor: "divider",
                      px: 1,
                      py: 0.5,
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor: "action.hover",
                        borderColor: "primary.main",
                      },
                      transition: "all 0.2s ease-in-out",
                    }}
                    onClick={(event) => {
                      setSortPopoverOpen(true);
                      setSortAnchorEl(event.currentTarget);
                    }}
                  >
                    <SortIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                  </Box>
                </Box>

                {/* Refresh Button */}
                <Tooltip title="רענן רשימת משתמשים" placement="top">
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      bgcolor: "background.paper",
                      borderRadius: 2,
                      border: 1,
                      borderColor: "divider",
                      px: 1,
                      py: 0.5,
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor: "action.hover",
                        borderColor: "success.main",
                      },
                      transition: "all 0.2s ease-in-out",
                    }}
                    onClick={handleRefresh}
                  >
                    {isLoading ? (
                      <CircularProgress
                        size={16}
                        sx={{ color: "success.main" }}
                      />
                    ) : (
                      <RefreshIcon
                        sx={{ fontSize: 18, color: "success.main" }}
                      />
                    )}
                  </Box>
                </Tooltip>
              </Box>

              {/* Desktop Layout: Single line */}
              <Box
                sx={{
                  display: { xs: "none", sm: "flex" },
                  gap: 2,
                  alignItems: "center",
                  width: "100%",
                }}
              >
                {/* Search Box */}
                <TextField
                  label="חיפוש"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  placeholder="חיפוש לפי שם..."
                  sx={{
                    "& .MuiInputLabel-root": {
                      fontSize: "0.95rem",
                    },
                    width: isSearchFocused ? "100%" : "calc(100% - 120px)",
                    transition: "width 1s ease-in-out",
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={clearSearch}
                          edge="end"
                        >
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Sort Controls */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    alignItems: "center",
                    opacity: isSearchFocused ? 0 : 1,
                    transform: isSearchFocused
                      ? "translateX(20px)"
                      : "translateX(0)",
                    transition:
                      "opacity 1s ease-in-out, transform 1s ease-in-out",
                    pointerEvents: isSearchFocused ? "none" : "auto",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      bgcolor: "background.paper",
                      borderRadius: 2,
                      border: 1,
                      borderColor: "divider",
                      px: 1,
                      py: 0.5,
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor: "action.hover",
                        borderColor: "primary.main",
                      },
                      transition: "all 0.2s ease-in-out",
                    }}
                    onClick={(event) => {
                      setSortPopoverOpen(true);
                      setSortAnchorEl(event.currentTarget);
                    }}
                  >
                    <SortIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                  </Box>
                </Box>

                {/* Refresh Button */}
                <Tooltip title="רענן רשימת משתמשים" placement="top">
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      bgcolor: "background.paper",
                      borderRadius: 2,
                      border: 1,
                      borderColor: "divider",
                      px: 1,
                      py: 0.5,
                      cursor: "pointer",
                      opacity: isSearchFocused ? 0 : 1,
                      transform: isSearchFocused
                        ? "translateX(20px)"
                        : "translateX(0)",
                      transition:
                        "all 0.2s ease-in-out, opacity 1s ease-in-out, transform 1s ease-in-out",
                      pointerEvents: isSearchFocused ? "none" : "auto",
                      "&:hover": {
                        bgcolor: "action.hover",
                        borderColor: "success.main",
                      },
                    }}
                    onClick={handleRefresh}
                  >
                    {isLoading ? (
                      <CircularProgress
                        size={16}
                        sx={{ color: "success.main" }}
                      />
                    ) : (
                      <RefreshIcon
                        sx={{ fontSize: 18, color: "success.main" }}
                      />
                    )}
                  </Box>
                </Tooltip>

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

              {/* Bottom Row: Create Button - Mobile only */}
              <Box
                sx={{
                  display: { xs: "flex", sm: "none" },
                  justifyContent: "flex-end",
                }}
              >
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
            </Box>

            {/* Active Account/Role/Group Filter Display */}
            {(selectedAccountFilter ||
              selectedRoleFilter ||
              selectedGroupFilter ||
              sortBy !== "name" ||
              sortOrder !== "asc") && (
              <Box
                sx={{
                  mt: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                {selectedAccountFilter && (
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
                )}
                {selectedRoleFilter && (
                  <Chip
                    label={`תפקיד: ${
                      selectedRoleFilter === "Admin"
                        ? "מנהל"
                        : selectedRoleFilter === "Parent"
                        ? "הורה"
                        : "צוות"
                    }`}
                    size="small"
                    color="warning"
                    onDelete={() => setSelectedRoleFilter("")}
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 500,
                    }}
                  />
                )}
                {selectedGroupFilter && (
                  <Chip
                    label={`קבוצה: ${
                      groups.find((group) => group.id === selectedGroupFilter)
                        ?.name || "לא ידועה"
                    }`}
                    size="small"
                    color="secondary"
                    onDelete={() => setSelectedGroupFilter("")}
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 500,
                    }}
                  />
                )}
                {(sortBy !== "name" || sortOrder !== "asc") && (
                  <Chip
                    label={`מיון: ${
                      sortBy === "name"
                        ? "שם"
                        : sortBy === "account"
                        ? "סניף"
                        : sortBy === "role"
                        ? "תפקיד"
                        : "שם"
                    } ${sortOrder === "asc" ? "עולה" : "יורד"}`}
                    size="small"
                    color="info"
                    onDelete={() => {
                      setSortBy("name");
                      setSortOrder("asc");
                    }}
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 500,
                    }}
                  />
                )}
                <Typography variant="caption" color="text.secondary">
                  {selectedAccountFilter ||
                  selectedRoleFilter ||
                  selectedGroupFilter ||
                  sortBy !== "name" ||
                  sortOrder !== "asc"
                    ? `מציג משתמשים${selectedAccountFilter ? " מסניף זה" : ""}${
                        selectedRoleFilter ? " בעלי תפקיד זה" : ""
                      }${selectedGroupFilter ? " מקבוצה זו" : ""}${
                        sortBy !== "name" || sortOrder !== "asc"
                          ? " ממוינים"
                          : ""
                      } בלבד`
                    : ""}
                  {filteredUsers.length > 5 && (
                    <span style={{ marginRight: "8px" }}>
                      • מציג {filteredUsers.length} משתמשים (מצב ביצועים מיטבי)
                    </span>
                  )}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Scrollable Users List */}
          <Box
            data-testid="users-list-container"
            sx={{ flex: 1, overflow: "auto", px: 2, pt: 2 }}
          >
            {filteredUsers.length > 0 ? (
              <>
                {filteredUsers.length > 5 ? (
                  // Use virtualization for larger lists
                  <VirtualList
                    height={500}
                    itemCount={filteredUsers.length}
                    itemSize={120}
                    width="100%"
                    overscanCount={8}
                    itemKey={(index, data) => data.users[index].id}
                    itemData={{
                      users: filteredUsers,
                      accounts,
                      groups,
                      selectedRoleFilter,
                      selectedAccountFilter,
                      selectedGroupFilter,
                      onRoleFilterClick: handleRoleFilterClick,
                      onAccountFilterClick: handleAccountFilterClick,
                      onGroupFilterClick: handleGroupFilterClick,
                      onEditClick: handleEditClick,
                      formatMobileNumber,
                    }}
                  >
                    {({ index, style, data }) => (
                      <div style={style}>
                        <UserListItem
                          key={data.users[index].id}
                          user={data.users[index]}
                          accounts={data.accounts}
                          groups={data.groups}
                          selectedRoleFilter={data.selectedRoleFilter}
                          selectedAccountFilter={data.selectedAccountFilter}
                          selectedGroupFilter={data.selectedGroupFilter}
                          onRoleFilterClick={data.onRoleFilterClick}
                          onAccountFilterClick={data.onAccountFilterClick}
                          onGroupFilterClick={data.onGroupFilterClick}
                          onEditClick={data.onEditClick}
                          formatMobileNumber={data.formatMobileNumber}
                        />
                      </div>
                    )}
                  </VirtualList>
                ) : (
                  // Use regular rendering for smaller lists
                  filteredUsers.map((user: User) => (
                    <UserListItem
                      key={user.id}
                      user={user}
                      accounts={accounts}
                      groups={groups}
                      selectedRoleFilter={selectedRoleFilter}
                      selectedAccountFilter={selectedAccountFilter}
                      selectedGroupFilter={selectedGroupFilter}
                      onRoleFilterClick={handleRoleFilterClick}
                      onAccountFilterClick={handleAccountFilterClick}
                      onGroupFilterClick={handleGroupFilterClick}
                      onEditClick={handleEditClick}
                      formatMobileNumber={formatMobileNumber}
                    />
                  ))
                )}
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

      <Popover
        open={sortPopoverOpen}
        onClose={() => {
          setSortPopoverOpen(false);
          setSortAnchorEl(null);
        }}
        anchorEl={sortAnchorEl}
        anchorOrigin={{
          vertical: "center",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "center",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            minWidth: 180,
            ml: 1,
            boxShadow: 3,
            borderRadius: 2,
          },
        }}
      >
        <Box sx={{ p: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FormControl size="small" sx={{ flex: 1 }}>
              <Select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as "name" | "account" | "role");
                  setSortPopoverOpen(false);
                  setSortAnchorEl(null);
                }}
                displayEmpty
                sx={{
                  "& .MuiSelect-select": {
                    py: 1,
                    px: 1.5,
                  },
                }}
              >
                <MenuItem value="name">שם</MenuItem>
                <MenuItem value="account">סניף</MenuItem>
                <MenuItem value="role">תפקיד</MenuItem>
              </Select>
            </FormControl>

            <IconButton
              onClick={() => {
                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                setSortPopoverOpen(false);
                setSortAnchorEl(null);
              }}
              size="small"
              sx={{
                border: 1,
                borderColor: "divider",
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: "action.hover",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              <KeyboardArrowDownIcon
                sx={{
                  color: "primary.main",
                  fontSize: 20,
                  transform:
                    sortOrder === "desc" ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease-in-out",
                }}
              />
            </IconButton>
          </Box>
        </Box>
      </Popover>
    </Box>
  );
};

export default UserManagementCard;
