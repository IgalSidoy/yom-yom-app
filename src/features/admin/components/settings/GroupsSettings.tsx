import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Avatar,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  Fade,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Card } from "../../../../shared/components";
import { AdminSettingsLayout } from "../../../../shared/components/layout";
import { useApp } from "../../../../contexts/AppContext";
import { groupApi, Group, accountApi, Account } from "../../../../services/api";
import Notification from "../../../../shared/components/ui/Notification";
import { THEME_COLORS, UI_COLORS } from "../../../../config/colors";
import { ROUTES } from "../../../../config/routes";

const GroupsSettings: React.FC = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // SessionStorage key for persistence
  const SESSION_KEY = "groupsSettings_selectedAccountId";

  const [groups, setGroups] = useState<Group[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Save selected account ID to sessionStorage whenever it changes
  useEffect(() => {
    if (selectedAccountId) {
      sessionStorage.setItem(SESSION_KEY, selectedAccountId);
    }
  }, [selectedAccountId, SESSION_KEY]);

  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    groupId: "",
    groupName: "",
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
      const response = await accountApi.getAccounts();
      setAccounts(response.data.accounts);

      // Check for accountId from URL or restore from sessionStorage
      const accountIdFromUrl = searchParams.get("accountId");
      const savedAccountId = sessionStorage.getItem(SESSION_KEY);
      const targetAccountId = accountIdFromUrl || savedAccountId;

      if (response.data.accounts.length > 0) {
        if (targetAccountId) {
          // Restore the saved account ID
          setSelectedAccountId(targetAccountId);
        } else {
          // No saved account, use first account as fallback
          const firstAccountId = response.data.accounts[0].id;
          setSelectedAccountId((prev) => prev || firstAccountId);
        }
      }
    } catch (err) {
      setError("שגיאה בטעינת רשימת הסניפים");
      setNotification({
        open: true,
        message: "שגיאה בטעינת רשימת הסניפים",
        severity: "error",
      });
    }
  }, [searchParams, SESSION_KEY]);

  const fetchGroups = useCallback(async () => {
    if (!selectedAccountId) return;

    try {
      setError(null);
      setLoading(true); // Set loading to true when starting fetch
      const response = await groupApi.getGroups(selectedAccountId);
      setGroups(response.data.groups);
    } catch (err) {
      setError("שגיאה בטעינת רשימת הקבוצות");
      setNotification({
        open: true,
        message: "שגיאה בטעינת רשימת הקבוצות",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedAccountId]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    if (selectedAccountId) {
      fetchGroups();
    }
  }, [selectedAccountId, fetchGroups]);

  const handleCreateGroup = useCallback(() => {
    const url = selectedAccountId
      ? `${ROUTES.ADMIN_GROUP_CREATE}?accountId=${selectedAccountId}`
      : ROUTES.ADMIN_GROUP_CREATE;
    navigate(url);
  }, [navigate, selectedAccountId]);

  const handleAccountChange = useCallback(
    (accountId: string) => {
      // Clear groups immediately to prevent showing old data
      setGroups([]);
      // Show loading state immediately
      setLoading(true);
      // Update selected account
      setSelectedAccountId(accountId);
      // Update URL to reflect the selected account
      const newUrl = accountId
        ? `/admin/settings/groups?accountId=${accountId}`
        : "/admin/settings/groups";
      navigate(newUrl, { replace: true });
    },
    [navigate]
  );

  const handleEditGroup = useCallback(
    (group: Group) => {
      navigate(ROUTES.ADMIN_GROUP_EDIT.replace(":id", group.id), {
        state: { group },
      });
    },
    [navigate]
  );

  const handleDeleteClick = useCallback((group: Group) => {
    setDeleteDialog({
      open: true,
      groupId: group.id,
      groupName: group.name,
    });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      setLoading(true);
      await groupApi.deleteGroup(deleteDialog.groupId);
      await fetchGroups(); // Refresh the list
      showNotification("הקבוצה נמחקה בהצלחה", "success");
      setDeleteDialog({ open: false, groupId: "", groupName: "" });
    } catch (err) {
      setError("שגיאה במחיקת הקבוצה");
      showNotification("שגיאה במחיקת הקבוצה", "error");
    } finally {
      setLoading(false);
    }
  }, [deleteDialog.groupId, fetchGroups, showNotification]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialog({ open: false, groupId: "", groupName: "" });
  }, []);

  // Memoized components for performance
  const GroupCard = useMemo(
    () =>
      React.memo(({ group, index = 0 }: { group: Group; index?: number }) => (
        <Fade
          in={true}
          timeout={500}
          style={{
            transitionDelay: `${index * 100}ms`, // Staggered animation
          }}
        >
          <Box
            sx={{
              width: "100%",
              bgcolor: THEME_COLORS.BACKGROUND,
              backgroundColor: THEME_COLORS.BACKGROUND,
              borderRadius: 0, // Override theme border radius
              margin: 0, // Remove any margins
              paddingTop: 2, // Remove top padding to eliminate gaps
              paddingBottom: 1, // Remove bottom padding to eliminate gaps
              paddingLeft: { xs: 2, sm: 3 }, // Responsive left padding
              paddingRight: { xs: 2, sm: 3 }, // Responsive right padding
              borderBottom: "1px solid",
              borderColor: UI_COLORS.BORDER_LIGHT,
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                bgcolor: "action.hover",
              },
              "&:first-child": {
                paddingTop: { xs: 2, sm: 3 }, // Responsive top padding
              },
              "&:last-child": {
                paddingBottom: { xs: 2, sm: 3 }, // Responsive bottom padding
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
                  {group.name}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Chip
                  label="קבוצה"
                  color="primary"
                  size="small"
                  variant="filled"
                  sx={{
                    borderRadius: 1,
                    opacity: 1,
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    backgroundColor: THEME_COLORS.PRIMARY,
                    color: "white",
                    "&:hover": {
                      backgroundColor: THEME_COLORS.PRIMARY,
                      opacity: 0.9,
                    },
                  }}
                />
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => handleEditGroup(group)}
                  sx={{ borderRadius: 2, textTransform: "none" }}
                >
                  עריכה
                </Button>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => handleDeleteClick(group)}
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
              </Box>
            </Box>

            {/* Date Section */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 1.5, sm: 2 },
                mt: { xs: 1, sm: 0 },
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    mb: 0.5,
                    color: THEME_COLORS.TEXT_PRIMARY,
                    fontSize: { xs: "0.7rem", sm: "0.75rem" },
                  }}
                >
                  נוצר בתאריך
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: THEME_COLORS.TEXT_PRIMARY,
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatDate(group.created)}
                </Typography>
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    mb: 0.5,
                    color: THEME_COLORS.TEXT_PRIMARY,
                    fontSize: { xs: "0.7rem", sm: "0.75rem" },
                  }}
                >
                  עודכן בתאריך
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: THEME_COLORS.TEXT_PRIMARY,
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatDate(group.updated)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Fade>
      )),
    [formatDate, handleEditGroup, handleDeleteClick]
  );

  const GroupTableRow = useMemo(
    () =>
      React.memo(({ group, index = 0 }: { group: Group; index?: number }) => (
        <Fade
          in={true}
          timeout={500}
          style={{
            transitionDelay: `${index * 100}ms`, // Staggered animation
          }}
        >
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
                  {group.name}
                </Typography>
              </Box>
            </TableCell>
            <TableCell
              sx={{
                textAlign: "right",
              }}
            >
              <Chip
                label="קבוצה"
                color="primary"
                size="small"
                variant="filled"
                sx={{
                  borderRadius: 1,
                  opacity: 1,
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  backgroundColor: THEME_COLORS.PRIMARY,
                  color: "white",
                  "&:hover": {
                    backgroundColor: THEME_COLORS.PRIMARY,
                    opacity: 0.9,
                  },
                }}
              />
            </TableCell>
            <TableCell
              sx={{
                textAlign: "right",
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {formatDate(group.created)}
              </Typography>
            </TableCell>
            <TableCell
              sx={{
                textAlign: "right",
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {formatDate(group.updated)}
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
                  onClick={() => handleEditGroup(group)}
                  sx={{ borderRadius: 2, textTransform: "none" }}
                >
                  עריכה
                </Button>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => handleDeleteClick(group)}
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
              </Box>
            </TableCell>
          </TableRow>
        </Fade>
      )),
    [formatDate, handleEditGroup, handleDeleteClick]
  );

  // Skeleton components for loading states
  const GroupCardSkeleton = useMemo(
    () =>
      React.memo(() => (
        <Fade in={true} timeout={300}>
          <Box
            sx={{
              width: "100%",
              bgcolor: THEME_COLORS.BACKGROUND,
              borderRadius: 0,
              margin: 0,
              paddingTop: 2,
              paddingBottom: 1,
              paddingLeft: { xs: 2, sm: 3 },
              paddingRight: { xs: 2, sm: 3 },
              borderBottom: "1px solid",
              borderColor: UI_COLORS.BORDER_LIGHT,
              transition: "all 0.2s ease-in-out",
              "&:first-child": {
                paddingTop: { xs: 2, sm: 3 },
              },
              "&:last-child": {
                paddingBottom: { xs: 2, sm: 3 },
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
                <Skeleton
                  variant="text"
                  width="120px"
                  height={24}
                  sx={{
                    mb: 1,
                    bgcolor: "rgba(0,0,0,0.08)",
                    animation: "pulse 2s ease-in-out infinite",
                    "@keyframes pulse": {
                      "0%": { opacity: 1 },
                      "50%": { opacity: 0.4 },
                      "100%": { opacity: 1 },
                    },
                  }}
                />
              </Box>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Skeleton
                  variant="rectangular"
                  width={60}
                  height={24}
                  sx={{
                    borderRadius: 1,
                    bgcolor: "rgba(0,0,0,0.06)",
                    animation: "pulse 2s ease-in-out infinite",
                    "@keyframes pulse": {
                      "0%": { opacity: 1 },
                      "50%": { opacity: 0.4 },
                      "100%": { opacity: 1 },
                    },
                  }}
                />
                <Skeleton
                  variant="rectangular"
                  width={60}
                  height={32}
                  sx={{
                    borderRadius: 2,
                    bgcolor: "rgba(0,0,0,0.08)",
                    animation: "pulse 2s ease-in-out infinite",
                    "@keyframes pulse": {
                      "0%": { opacity: 1 },
                      "50%": { opacity: 0.4 },
                      "100%": { opacity: 1 },
                    },
                  }}
                />
                <Skeleton
                  variant="rectangular"
                  width={60}
                  height={32}
                  sx={{
                    borderRadius: 2,
                    bgcolor: "rgba(0,0,0,0.08)",
                    animation: "pulse 2s ease-in-out infinite",
                    "@keyframes pulse": {
                      "0%": { opacity: 1 },
                      "50%": { opacity: 0.4 },
                      "100%": { opacity: 1 },
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Date Section Skeleton */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 1.5, sm: 2 },
                mt: { xs: 1, sm: 0 },
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Skeleton
                  variant="text"
                  width="60px"
                  height={12}
                  sx={{
                    mb: 0.5,
                    bgcolor: "rgba(0,0,0,0.06)",
                    animation: "pulse 2s ease-in-out infinite",
                    "@keyframes pulse": {
                      "0%": { opacity: 1 },
                      "50%": { opacity: 0.4 },
                      "100%": { opacity: 1 },
                    },
                  }}
                />
                <Skeleton
                  variant="text"
                  width="100px"
                  height={16}
                  sx={{
                    bgcolor: "rgba(0,0,0,0.08)",
                    animation: "pulse 2s ease-in-out infinite",
                    "@keyframes pulse": {
                      "0%": { opacity: 1 },
                      "50%": { opacity: 0.4 },
                      "100%": { opacity: 1 },
                    },
                  }}
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Skeleton
                  variant="text"
                  width="60px"
                  height={12}
                  sx={{
                    mb: 0.5,
                    bgcolor: "rgba(0,0,0,0.06)",
                    animation: "pulse 2s ease-in-out infinite",
                    "@keyframes pulse": {
                      "0%": { opacity: 1 },
                      "50%": { opacity: 0.4 },
                      "100%": { opacity: 1 },
                    },
                  }}
                />
                <Skeleton
                  variant="text"
                  width="100px"
                  height={16}
                  sx={{
                    bgcolor: "rgba(0,0,0,0.08)",
                    animation: "pulse 2s ease-in-out infinite",
                    "@keyframes pulse": {
                      "0%": { opacity: 1 },
                      "50%": { opacity: 0.4 },
                      "100%": { opacity: 1 },
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Fade>
      )),
    []
  );

  const GroupTableRowSkeleton = useMemo(
    () =>
      React.memo(() => (
        <Fade in={true} timeout={300}>
          <TableRow
            sx={{
              bgcolor: "background.paper",
              transition: "all 0.2s ease-in-out",
            }}
          >
            <TableCell sx={{ textAlign: "right" }}>
              <Skeleton
                variant="text"
                width="120px"
                height={24}
                sx={{ bgcolor: "rgba(0,0,0,0.08)" }}
              />
            </TableCell>
            <TableCell sx={{ textAlign: "right" }}>
              <Skeleton
                variant="rectangular"
                width={60}
                height={24}
                sx={{ borderRadius: 1, bgcolor: "rgba(0,0,0,0.06)" }}
              />
            </TableCell>
            <TableCell sx={{ textAlign: "right" }}>
              <Skeleton
                variant="text"
                width="100px"
                height={20}
                sx={{ bgcolor: "rgba(0,0,0,0.08)" }}
              />
            </TableCell>
            <TableCell sx={{ textAlign: "right" }}>
              <Skeleton
                variant="text"
                width="100px"
                height={20}
                sx={{ bgcolor: "rgba(0,0,0,0.08)" }}
              />
            </TableCell>
            <TableCell sx={{ textAlign: "right" }}>
              <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                <Skeleton
                  variant="rectangular"
                  width={60}
                  height={32}
                  sx={{ borderRadius: 2, bgcolor: "rgba(0,0,0,0.08)" }}
                />
                <Skeleton
                  variant="rectangular"
                  width={60}
                  height={32}
                  sx={{ borderRadius: 2, bgcolor: "rgba(0,0,0,0.08)" }}
                />
              </Box>
            </TableCell>
          </TableRow>
        </Fade>
      )),
    []
  );

  if (loading && groups.length === 0) {
    return (
      <AdminSettingsLayout title="ניהול קבוצות" subtitle="טוען רשימת קבוצות...">
        <Card
          sx={{
            height: { xs: "100%", sm: "auto" },
            display: { xs: "flex", sm: "block" },
            flexDirection: { xs: "column", sm: "row" },
            minHeight: 0,
            borderRadius: 1,
            boxShadow: "none",
            border: "none",
            backgroundColor: THEME_COLORS.BACKGROUND,
          }}
        >
          <Box
            sx={{
              padding: 0,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              overflow: "hidden",
              bgcolor: THEME_COLORS.BACKGROUND,
              borderRadius: 0,
              margin: 0,
              border: "none",
            }}
          >
            {/* Mobile: Skeleton Card Layout */}
            <Box
              sx={{
                display: { xs: "block", md: "none" },
                flex: 1,
                overflowY: "auto",
                overflowX: "hidden",
                margin: 0,
                padding: 0,
                minHeight: 0,
                borderRadius: 0,
                width: "100%",
                maxWidth: "100%",
              }}
            >
              {Array.from({ length: 6 }).map((_, index) => (
                <GroupCardSkeleton key={index} />
              ))}
            </Box>

            {/* Desktop: Skeleton Table Layout */}
            <Box sx={{ display: { xs: "none", md: "block" } }}>
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
                        שם הקבוצה
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
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          fontSize: "1rem",
                          textAlign: "right",
                        }}
                      >
                        פעולות
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.from({ length: 6 }).map((_, index) => (
                      <GroupTableRowSkeleton key={index} />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        </Card>
      </AdminSettingsLayout>
    );
  }

  const selectedAccount = accounts.find((acc) => acc.id === selectedAccountId);
  const subtitle = selectedAccount
    ? `${groups.length} קבוצות זמינות עבור ${selectedAccount.branchName}`
    : `${groups.length} קבוצות זמינות`;

  return (
    <AdminSettingsLayout title="ניהול קבוצות" subtitle={subtitle}>
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />

      {/* Account Selector */}
      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth sx={{ maxWidth: { xs: "100%", sm: "400px" } }}>
          <InputLabel sx={{ fontSize: "0.95rem" }}>בחר סניף</InputLabel>
          <Select
            value={selectedAccountId}
            onChange={(e) => handleAccountChange(e.target.value)}
            label="בחר סניף"
            sx={{
              borderRadius: 2,
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "primary.main",
              },
            }}
          >
            {accounts.map((account) => (
              <MenuItem key={account.id} value={account.id}>
                {account.branchName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Card
        sx={{
          height: { xs: "100%", sm: "auto" },
          display: { xs: "flex", sm: "block" },
          flexDirection: { xs: "column", sm: "row" },
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

          {groups.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                {selectedAccount
                  ? `אין קבוצות עבור ${selectedAccount.branchName}`
                  : "אין קבוצות זמינות"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {selectedAccount
                  ? `התחל על ידי הוספת קבוצה ראשונה עבור ${selectedAccount.branchName}`
                  : "התחל על ידי הוספת קבוצה ראשונה"}
              </Typography>
              <Button
                variant="primary"
                onClick={handleCreateGroup}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                }}
              >
                הוספת קבוצה ראשונה
              </Button>
            </Box>
          ) : (
            <>
              {/* Mobile: Scrollable Card Layout */}
              <Box
                sx={{
                  display: { xs: "block", md: "none" },
                  flex: 1,
                  overflowY: "auto",
                  overflowX: "hidden", // Prevent horizontal scrolling
                  margin: 0, // Remove negative margins
                  padding: 0, // Remove padding
                  minHeight: 0, // Allow flex child to shrink
                  borderRadius: 0, // Override theme border radius
                  width: "100%", // Ensure full width
                  maxWidth: "100%", // Prevent overflow
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
                {groups.map((group, index) => (
                  <GroupCard key={group.id} group={group} index={index} />
                ))}
              </Box>

              {/* Desktop: Table Layout */}
              <Box sx={{ display: { xs: "none", md: "block" } }}>
                <Box
                  sx={{ mb: 3, display: "flex", justifyContent: "flex-end" }}
                >
                  <Button
                    variant="primary"
                    onClick={handleCreateGroup}
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
                    הוספת קבוצה חדשה
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
                          שם הקבוצה
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
                      {groups.map((group, index) => (
                        <GroupTableRow
                          key={group.id}
                          group={group}
                          index={index}
                        />
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
          aria-label="add group"
          onClick={handleCreateGroup}
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
          מחיקת קבוצה
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            האם אתה בטוח שברצונך למחוק את הקבוצה "{deleteDialog.groupName}"?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            פעולה זו לא ניתנת לביטול ותמחק את כל הנתונים הקשורים לקבוצה זו.
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

export default GroupsSettings;
