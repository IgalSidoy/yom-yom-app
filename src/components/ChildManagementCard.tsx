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
  InputAdornment,
  Popover,
  Autocomplete,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import {
  Sort as SortIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from "@mui/icons-material";
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
  readOnlyParents?: boolean;
  onAccountsChange: () => Promise<void>;
  onChildrenChange: (accountId?: string) => Promise<void>;
  onParentsRefresh?: () => Promise<void>;
}

type ChildForm = Omit<Child, "parents"> & { parents: Parent[] };

// Memoized Child List Item Component
const ChildListItem = memo<{
  child: Child;
  parents: User[];
  selectedGroupFilter: string;
  onGroupFilterClick: (groupId: string) => void;
  onEditClick: (child: Child) => void;
  calculateAge: (dateStr: string) => string;
  formatDate: (dateStr: string) => string;
}>(
  ({
    child,
    parents,
    selectedGroupFilter,
    onGroupFilterClick,
    onEditClick,
    calculateAge,
    formatDate,
  }) => {
    const parentNames = useMemo(() => {
      if (child.parents && child.parents.length > 0) {
        return child.parents
          .map((parent: string | { id: string }) => {
            const parentId = typeof parent === "string" ? parent : parent.id;
            const parentObj = parents.find((p) => p.id === parentId);
            return parentObj && parentObj.firstName && parentObj.lastName
              ? `${parentObj.firstName} ${parentObj.lastName}`
              : "הורה לא ידוע";
          })
          .join(", ");
      }
      return "אין הורים מוגדרים";
    }, [child.parents, parents]);

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
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 500,
                    color: child.firstName ? "text.primary" : "text.secondary",
                    fontStyle: child.firstName ? "normal" : "italic",
                  }}
                >
                  {child.firstName && child.lastName
                    ? `${child.firstName} ${child.lastName}`
                    : "שם חסר"}
                </Typography>
                <IconButton
                  size="small"
                  aria-label="edit"
                  onClick={() => onEditClick(child)}
                  sx={{
                    color: "primary.main",
                    "&:hover": {
                      bgcolor: "primary.lighter",
                    },
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                <Chip
                  label={`גיל: ${calculateAge(child.dateOfBirth)}`}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    bgcolor: "green",
                    color: "white",
                    "& .MuiChip-label": {
                      color: "white",
                    },
                  }}
                />
                {child.groupId && (
                  <Chip
                    label={`קבוצה: ${child.groupName || "לא ידועה"}`}
                    size="small"
                    onClick={() =>
                      child.groupId && onGroupFilterClick(child.groupId)
                    }
                    sx={{
                      height: 20,
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      bgcolor:
                        selectedGroupFilter === child.groupId
                          ? "primary.main"
                          : "#9c27b0",
                      color: "white",
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor:
                          selectedGroupFilter === child.groupId
                            ? "primary.dark"
                            : "#7b1fa2",
                        transform: "scale(1.05)",
                      },
                      transition: "all 0.2s ease-in-out",
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
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {`הורים: ${parentNames}`}
            </Typography>
          }
        />
      </ListItem>
    );
  }
);

ChildListItem.displayName = "ChildListItem";

const ChildManagementCard: React.FC<ChildManagementCardProps> = ({
  accounts,
  parents,
  children,
  selectedAccountId,
  isLoading,
  isExpanded,
  readOnlyParents,
  onAccountsChange,
  onChildrenChange,
  onParentsRefresh,
}) => {
  const { accessToken } = useAuth();
  const { userChangeTimestamp } = useApp();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"name" | "age" | "group" | "birthDate">(
    "name"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [sortPopoverOpen, setSortPopoverOpen] = useState(false);
  const [sortAnchorEl, setSortAnchorEl] = useState<HTMLElement | null>(null);
  const [parentSearchInput, setParentSearchInput] = useState("");
  const [lastParentSearch, setLastParentSearch] = useState("");
  const [lastProcessedTimestamp, setLastProcessedTimestamp] = useState(0);
  const [currentChild, setCurrentChild] = useState<ChildForm>({
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
      setIsLoadingGroups(true);
      const response = await groupApi.getGroups(accountId);

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

      setGroups(groupsData);
    } catch (error) {
      showNotification("שגיאה בטעינת הקבוצות", "error");
      setGroups([]);
    } finally {
      setIsLoadingGroups(false);
    }
  };

  // Fetch groups when selectedAccountId changes
  useEffect(() => {
    if (selectedAccountId) {
      fetchGroupsForAccount(selectedAccountId);
    } else {
      setGroups([]);
    }
  }, [selectedAccountId]);

  // Refresh parents when user changes occur and drawer is open
  useEffect(() => {
    if (
      isDrawerOpen &&
      onParentsRefresh &&
      userChangeTimestamp > 0 &&
      userChangeTimestamp !== lastProcessedTimestamp
    ) {
      setLastProcessedTimestamp(userChangeTimestamp);
      onParentsRefresh();
    }
  }, [
    userChangeTimestamp,
    isDrawerOpen,
    onParentsRefresh,
    lastProcessedTimestamp,
  ]);

  // Debug: Log when children or parents change
  useEffect(() => {
    console.log("ChildManagementCard - Parents updated:", parents);
    console.log("ChildManagementCard - Children updated:", children);
  }, [parents, children]);

  const sortChildren = (children: Child[]) => {
    return [...children].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case "name":
          aValue = `${a.firstName || ""} ${a.lastName || ""}`.toLowerCase();
          bValue = `${b.firstName || ""} ${b.lastName || ""}`.toLowerCase();
          break;
        case "age":
          aValue = calculateAge(a.dateOfBirth);
          bValue = calculateAge(b.dateOfBirth);
          break;
        case "group":
          aValue = a.groupName || "";
          bValue = b.groupName || "";
          break;
        case "birthDate":
          aValue = new Date(a.dateOfBirth);
          bValue = new Date(b.dateOfBirth);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  };

  // Filter children based on selected account, group, and search query
  const filteredChildren = useMemo(() => {
    return sortChildren(
      children
        .filter((child) =>
          selectedAccountId ? child.accountId === selectedAccountId : true
        )
        .filter((child) =>
          selectedGroupFilter ? child.groupId === selectedGroupFilter : true
        )
        .filter((child) => {
          if (!searchQuery.trim()) return true;
          const fullName = `${child.firstName || ""} ${
            child.lastName || ""
          }`.toLowerCase();
          const query = searchQuery.toLowerCase();
          return fullName.includes(query);
        })
    );
  }, [
    children,
    selectedAccountId,
    selectedGroupFilter,
    searchQuery,
    sortBy,
    sortOrder,
  ]);

  // Filter groups based on selected account
  const filteredGroups = useMemo(() => {
    return selectedAccountId
      ? groups.filter((group) => group.accountId === selectedAccountId)
      : groups;
  }, [groups, selectedAccountId]);

  // Memoized callback functions
  const handleGroupFilterClick = useCallback(
    (groupId: string) => {
      setSelectedGroupFilter(selectedGroupFilter === groupId ? "" : groupId);
    },
    [selectedGroupFilter]
  );

  const handleEditClick = useCallback((child: Child) => {
    handleEditChild(child);
  }, []);

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
    },
    []
  );

  const clearAllFilters = useCallback(() => {
    setSelectedGroupFilter("");
    setSearchQuery("");
  }, []);

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
      handleEditChild(child);
      return;
    }
    setCurrentChild({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      accountId: selectedAccountId,
      groupId: "",
      parents: [],
    });
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
    setParentSearchInput("");
    setLastParentSearch("");
  };

  const handleChildChange = (field: keyof ChildForm, value: any) => {
    setCurrentChild((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveChild = async () => {
    try {
      const childData = {
        firstName: currentChild.firstName,
        lastName: currentChild.lastName,
        dateOfBirth: currentChild.dateOfBirth
          ? new Date(currentChild.dateOfBirth).toISOString()
          : "",
        accountId: currentChild.accountId,
        groupId: currentChild.groupId || undefined,
        parents: currentChild.parents.map((p) => p.id),
      };
      if (currentChild.id) {
        await childApi.updateChild(currentChild.id, childData);
      } else {
        await childApi.createChild(childData);
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

      console.log("Deleting child:", currentChild.id);
      await childApi.deleteChild(currentChild.id);
      showNotification("ילד נמחק בהצלחה");
      setIsDeleteDialogOpen(false);
      handleCloseDrawer();
      await onChildrenChange(currentChild.accountId);
    } catch (error) {
      console.error("Error deleting child:", error);
      showNotification("שגיאה במחיקת הילד", "error");
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
  };

  const calculateAge = (dateStr: string) => {
    if (!dateStr || dateStr === "0001-01-01T00:00:00") {
      return "לא זמין";
    }
    const birthDate = new Date(dateStr);
    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();

    // Adjust if birthday hasn't occurred yet this year
    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
      years--;
      months += 12;
    }

    // Calculate decimal age (years + months/12)
    const decimalAge = years + months / 12;

    // Return age in Hebrew format
    if (years === 0) {
      if (months === 0) {
        return "תינוק";
      } else if (months === 1) {
        return "חודש";
      } else {
        return `${months} חודשים`;
      }
    } else if (years === 1) {
      if (months === 0) {
        return "שנה";
      } else {
        return `${decimalAge.toFixed(1)} שנים`;
      }
    } else if (years === 2) {
      if (months === 0) {
        return "שנתיים";
      } else {
        return `${decimalAge.toFixed(1)} שנים`;
      }
    } else {
      return `${decimalAge.toFixed(1)} שנים`;
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
    }).format(date);
  };

  const handleEditChild = (child: Child) => {
    const formatDateForInput = (dateString: string) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    };

    // Map parent IDs to Parent objects (not User)
    const parentObjects: Parent[] = (child.parents || [])
      .map((parent: string | { id: string }) => {
        const parentId = typeof parent === "string" ? parent : parent.id;
        const found = parents.find((p) => p.id === parentId);
        return found
          ? {
              id: found.id,
              firstName: found.firstName,
              lastName: found.lastName,
              mobile: found.mobile,
            }
          : null;
      })
      .filter((parent): parent is Parent => parent !== null);

    // Check if groups are already loaded for this account
    const existingGroups = groups.filter(
      (group) => group.accountId === child.accountId
    );
    const shouldSetGroupId =
      child.groupId &&
      existingGroups.some((group) => group.id === child.groupId);

    setCurrentChild({
      id: child.id,
      firstName: child.firstName,
      lastName: child.lastName,
      dateOfBirth: formatDateForInput(child.dateOfBirth),
      accountId: child.accountId,
      groupId: shouldSetGroupId ? child.groupId : "",
      parents: parentObjects,
      created: child.created,
      updated: child.updated,
    });

    if (child.accountId) {
      fetchGroupsForAccount(child.accountId).then(() => {
        // After groups are fetched, check if we need to set the groupId
        if (child.groupId && !shouldSetGroupId) {
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
    <Box
      sx={{
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Sticky Search Bar and Add Button */}
      {selectedAccountId && (
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
              placeholder="חיפוש לפי שם..."
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (searchQuery || selectedGroupFilter) && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={clearAllFilters}
                      edge="end"
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "background.paper",
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "primary.main",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "primary.main",
                  },
                },
              }}
            />

            {/* Sort Controls */}
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
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
                    borderColor: "warning.main",
                  },
                  transition: "all 0.2s ease-in-out",
                }}
                onClick={(event) => {
                  setSortPopoverOpen(true);
                  setSortAnchorEl(event.currentTarget);
                }}
              >
                <SortIcon sx={{ fontSize: 18, color: "warning.main" }} />
              </Box>
            </Box>

            <Fab
              color="primary"
              aria-label="add child"
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

          {/* Active Group Filter Display */}
          {selectedGroupFilter && (
            <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label={`קבוצה: ${
                  groups.find((group) => group.id === selectedGroupFilter)
                    ?.name || "לא ידועה"
                }`}
                size="small"
                color="primary"
                onDelete={clearAllFilters}
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 500,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                מציג ילדים מקבוצה זו בלבד
                {filteredChildren.length > 5 && (
                  <span style={{ marginRight: "8px" }}>
                    • מציג {filteredChildren.length} ילדים (מצב ביצועים מיטבי)
                  </span>
                )}
              </Typography>
            </Box>
          )}
          {!selectedGroupFilter && filteredChildren.length > 5 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                מציג {filteredChildren.length} ילדים (מצב ביצועים מיטבי)
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Scrollable Children List */}
      <Box sx={{ flex: 1, overflow: "auto", px: 2, pb: 8, pt: 2 }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : parents.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Typography color="text.secondary">טוען רשימת הורים...</Typography>
          </Box>
        ) : filteredChildren.length > 0 ? (
          <>
            {filteredChildren.length > 5 ? (
              // Use virtualization for larger lists
              <VirtualList
                height={500}
                itemCount={filteredChildren.length}
                itemSize={140}
                width="100%"
                overscanCount={8}
                itemKey={(index, data) =>
                  data.children[index]?.id || `child-${index}`
                }
                itemData={{
                  children: filteredChildren,
                  parents,
                  selectedGroupFilter,
                  onGroupFilterClick: handleGroupFilterClick,
                  onEditClick: handleEditClick,
                  calculateAge,
                  formatDate,
                }}
              >
                {({ index, style, data }) => (
                  <div style={style}>
                    <ChildListItem
                      key={data.children[index].id}
                      child={data.children[index]}
                      parents={data.parents}
                      selectedGroupFilter={data.selectedGroupFilter}
                      onGroupFilterClick={data.onGroupFilterClick}
                      onEditClick={data.onEditClick}
                      calculateAge={data.calculateAge}
                      formatDate={data.formatDate}
                    />
                  </div>
                )}
              </VirtualList>
            ) : (
              // Use regular rendering for smaller lists
              filteredChildren.map((child: Child) => (
                <ChildListItem
                  key={child.id}
                  child={child}
                  parents={parents}
                  selectedGroupFilter={selectedGroupFilter}
                  onGroupFilterClick={handleGroupFilterClick}
                  onEditClick={handleEditClick}
                  calculateAge={calculateAge}
                  formatDate={formatDate}
                />
              ))
            )}
          </>
        ) : (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Typography color="text.secondary">
              {searchQuery
                ? "לא נמצאו ילדים התואמים לחיפוש"
                : selectedAccountId
                ? "אין ילדים בסניף זה"
                : "אין ילדים להצגה"}
            </Typography>
          </Box>
        )}
      </Box>

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
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  clearOnBlur={false}
                  clearOnEscape={false}
                  disabled={readOnlyParents}
                  inputValue={parentSearchInput}
                  onInputChange={(event, newInputValue, reason) => {
                    // Only update if it's a user input, not a programmatic clear
                    if (reason === "input" || reason === "reset") {
                      setParentSearchInput(newInputValue);
                      setLastParentSearch(newInputValue);
                    } else if (reason === "clear") {
                      // Prevent clearing by restoring the last search
                      setParentSearchInput(lastParentSearch);
                    }
                  }}
                  options={parents.filter((parent) => parent.role === "Parent")}
                  getOptionLabel={(option) =>
                    option.firstName && option.lastName
                      ? `${option.firstName} ${option.lastName}`
                      : option.email
                  }
                  value={currentChild.parents.map((parent) => {
                    const foundUser = parents.find((p) => p.id === parent.id);
                    if (foundUser) {
                      return foundUser;
                    }
                    // Fallback to a complete User object if not found
                    return {
                      id: parent.id,
                      firstName: parent.firstName || "",
                      lastName: parent.lastName || "",
                      email: "",
                      mobile: parent.mobile || "",
                      accountId: "",
                      organizationId: "",
                      role: "Parent",
                      created: "",
                      updated: "",
                    };
                  })}
                  onChange={(event, newValue) => {
                    // Limit to maximum 2 parents
                    if (newValue.length > 2) {
                      showNotification("ניתן לבחור עד 2 הורים בלבד", "warning");
                      return;
                    }

                    const parentObjects = newValue.map((user) => ({
                      id: user.id,
                      firstName: user.firstName,
                      lastName: user.lastName,
                      mobile: user.mobile,
                    }));
                    handleChildChange("parents", parentObjects);
                    if (newValue.length === 1 && !currentChild.lastName) {
                      handleChildChange("lastName", newValue[0].lastName);
                    }
                  }}
                  filterOptions={(options, { inputValue }) => {
                    const filtered = options.filter((option) => {
                      const fullName = `${option.firstName || ""} ${
                        option.lastName || ""
                      }`.toLowerCase();
                      const email = (option.email || "").toLowerCase();
                      const searchLower = inputValue.toLowerCase();
                      return (
                        fullName.includes(searchLower) ||
                        email.includes(searchLower)
                      );
                    });
                    return filtered;
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={
                        readOnlyParents
                          ? "הורים (קריאה בלבד)"
                          : `הורים (${currentChild.parents.length}/2)`
                      }
                      placeholder={readOnlyParents ? "" : "חיפוש הורים..."}
                      helperText={
                        !readOnlyParents && currentChild.parents.length >= 2
                          ? "הגעת למגבלת ההורים המקסימלית (2)"
                          : ""
                      }
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: parentSearchInput && !readOnlyParents && (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setParentSearchInput("");
                                setLastParentSearch("");
                              }}
                              edge="end"
                            >
                              <ClearIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option, { selected }) => (
                    <ListItem {...props}>
                      <ListItemIcon>
                        {selected && (
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
                          option.firstName && option.lastName
                            ? `${option.firstName} ${option.lastName}`
                            : option.email
                        }
                      />
                    </ListItem>
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={
                          option.firstName && option.lastName
                            ? `${option.firstName} ${option.lastName}`
                            : option.email
                        }
                        {...getTagProps({ index })}
                        size="small"
                        onDelete={readOnlyParents ? undefined : undefined}
                        sx={{
                          bgcolor: readOnlyParents
                            ? "grey.400"
                            : "primary.light",
                          color: readOnlyParents
                            ? "text.primary"
                            : "primary.contrastText",
                          opacity: readOnlyParents ? 0.8 : 1,
                          "& .MuiChip-deleteIcon": {
                            display: readOnlyParents ? "none" : "flex",
                          },
                          "&:hover": {
                            bgcolor: readOnlyParents
                              ? "grey.400"
                              : "primary.main",
                          },
                        }}
                      />
                    ))
                  }
                  noOptionsText="לא נמצאו הורים התואמים לחיפוש"
                  loadingText="טוען הורים..."
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />

                {/* Read-only display of selected parents */}
                {currentChild.parents.length > 0 && (
                  <TextField
                    fullWidth
                    label="הורים נבחרים"
                    value={currentChild.parents
                      .map((parent) =>
                        `${parent.firstName} ${parent.lastName}`.trim()
                      )
                      .join(", ")}
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{
                      "& .MuiInputBase-root": {
                        bgcolor: "grey.100",
                        "& fieldset": {
                          borderColor: "grey.300",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "text.secondary",
                      },
                    }}
                  />
                )}

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
                      groups
                        .filter(
                          (group) => group.accountId === currentChild.accountId
                        )
                        .some((group) => group.id === currentChild.groupId)
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
                    ) : groups.filter(
                        (group) => group.accountId === currentChild.accountId
                      ).length === 0 ? (
                      <MenuItem disabled>
                        <Typography variant="body2" color="text.secondary">
                          אין קבוצות זמינות
                        </Typography>
                      </MenuItem>
                    ) : (
                      groups
                        .filter(
                          (group) => group.accountId === currentChild.accountId
                        )
                        .map((group) => (
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
                  setSortBy(
                    e.target.value as "name" | "age" | "group" | "birthDate"
                  );
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
                <MenuItem value="age">גיל</MenuItem>
                <MenuItem value="group">קבוצה</MenuItem>
                <MenuItem value="birthDate">תאריך לידה</MenuItem>
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

export default ChildManagementCard;
