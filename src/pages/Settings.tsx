import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  FormControlLabel,
  Switch,
  Chip,
  Fab,
  Slide,
  SwipeableDrawer,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { useLanguage } from "../contexts/LanguageContext";
import { useApp } from "../contexts/AppContext";
import {
  organizationApi,
  Organization,
  accountApi,
  Account,
  userApi,
  User,
  groupApi,
  Group,
} from "../services/api";
import Notification from "../components/Notification";

const Settings = () => {
  const { language, setLanguage } = useLanguage();
  const { user, setUser } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(
    false
  );
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });
  const [organization, setOrganization] = useState<Organization>({
    id: "",
    businessId: "",
    name: "",
    email: "",
    phone: "",
    created: "",
    updated: "",
  });
  const [initialOrganization, setInitialOrganization] = useState<Organization>({
    id: "",
    businessId: "",
    name: "",
    email: "",
    phone: "",
    created: "",
    updated: "",
  });
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<Partial<Account>>({
    branchName: "",
    created: "",
    updated: "",
  });
  const [groups, setGroups] = useState<Group[]>([]);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<Partial<Group>>({
    name: "",
    description: "",
  });
  const [isOrganizationModified, setIsOrganizationModified] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [selectedAccountForGroups, setSelectedAccountForGroups] =
    useState<string>("");
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [deleteGroupDialogOpen, setDeleteGroupDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);

  const formatMobileNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "");

    // Format as Israeli mobile number (050-1234567)
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

  const setFormattedOrganization = (data: Organization) => {
    const formattedData = {
      ...data,
      phone: formatMobileNumber(data.phone),
    };
    setOrganization(formattedData);
    setInitialOrganization(formattedData);
    setIsOrganizationModified(false);
  };

  const handleOrganizationChange = (
    field: keyof Organization,
    value: string
  ) => {
    setOrganization((prev) => ({
      ...prev,
      [field]: value,
    }));
    setIsOrganizationModified(true);
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

  useEffect(() => {
    if (!user) {
      fetchUser();
    } else {
      // If we have the user, fetch organization and accounts
      fetchOrganization(user.organizationId);
      fetchAccounts();
    }
  }, [user]);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const response = await userApi.getUser();
      const userData = response.data.user;
      setUser(userData);
      await Promise.all([
        fetchOrganization(userData.organizationId),
        fetchAccounts(),
      ]);
    } catch (error) {
      showNotification("שגיאה בטעינת פרטי המשתמש", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrganization = async (organizationId: string) => {
    try {
      const response = await organizationApi.getOrganization(organizationId);
      setFormattedOrganization(response.data.organization);
    } catch (error) {
      showNotification("שגיאה בטעינת פרטי הארגון", "error");
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await accountApi.getAccounts();
      setAccounts(response.data.accounts);
      if (response.data.accounts.length > 0) {
        setSelectedAccount(response.data.accounts[0]);
      }
    } catch (error) {
      showNotification("שגיאה בטעינת הסניפים", "error");
    }
  };

  const fetchGroups = async (accountId: string) => {
    try {
      setIsLoadingGroups(true);
      const response = await groupApi.getGroups(accountId);
      console.log("Groups API Response:", response); // Debug log
      if (response.data && Array.isArray(response.data)) {
        setGroups(response.data);
      } else if (
        response.data &&
        response.data.groups &&
        Array.isArray(response.data.groups)
      ) {
        setGroups(response.data.groups);
      } else {
        console.log("No groups found in response:", response); // Debug log
        setGroups([]);
      }
    } catch (error) {
      console.error("Error fetching groups:", error); // Debug log
      showNotification("שגיאה בטעינת הקבוצות", "error");
      setGroups([]);
    } finally {
      setIsLoadingGroups(false);
    }
  };

  useEffect(() => {
    if (organization.id) {
      fetchAccounts();
    }
  }, [organization.id]);

  useEffect(() => {
    if (selectedAccountForGroups) {
      fetchGroups(selectedAccountForGroups);
      // Automatically expand the groups accordion when an account is selected
      setExpandedAccordion("groups");
    } else {
      setGroups([]);
    }
  }, [selectedAccountForGroups]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      if (organization) {
        // Compare with initial state
        const hasChanges =
          initialOrganization.businessId !== organization.businessId ||
          initialOrganization.name !== organization.name ||
          initialOrganization.email !== organization.email ||
          initialOrganization.phone !== organization.phone;

        // Only update if there are actual changes
        if (hasChanges) {
          const response = await organizationApi.updateOrganization(
            organization,
            initialOrganization
          );
          // Update both current and initial states with the response data
          setFormattedOrganization(response.data.organization);
        }
        // Disable the button regardless of whether there were changes or not
        setIsOrganizationModified(false);
      }
      if (selectedAccount) {
        // Compare with initial state
        const hasChanges =
          selectedAccount.branchName !== selectedAccount.branchName ||
          selectedAccount.branchCode !== selectedAccount.branchCode;

        // Only update if there are actual changes
        if (hasChanges) {
          const response = await accountApi.updateAccount(
            selectedAccount,
            selectedAccount
          );
          // Update the local state with the response data
          setSelectedAccount(response.data.account);
        }
      }
      showNotification("השינויים נשמרו בהצלחה", "success");
    } catch (error) {
      showNotification("שגיאה בשמירת השינויים", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAccount = async () => {
    try {
      setIsSaving(true);
      if (currentAccount.id) {
        // Compare with the original account state
        const originalAccount = accounts.find(
          (acc) => acc.id === currentAccount.id
        );
        if (!originalAccount) {
          throw new Error("Account not found");
        }

        // Only update if there are actual changes
        const hasChanges =
          originalAccount.branchName !== currentAccount.branchName ||
          originalAccount.branchCode !== currentAccount.branchCode;

        if (hasChanges) {
          await accountApi.updateAccount(
            currentAccount as Account,
            originalAccount
          );
        }
      } else {
        await accountApi.createAccount({
          ...currentAccount,
          organizationId: organization.id,
        } as Omit<Account, "id" | "created" | "updated">);
      }
      await fetchAccounts();
      handleCloseAccountDialog();
      showNotification("הסניף נשמר בהצלחה", "success");
    } catch (error) {
      showNotification("שגיאה בשמירת הסניף", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (account: Account) => {
    setAccountToDelete(account);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (accountToDelete) {
      try {
        setIsSaving(true);
        await accountApi.deleteAccount(accountToDelete.id);
        await fetchAccounts();
        showNotification("הסניף נמחק בהצלחה", "success");
        handleCloseAccountDialog();
      } catch (error) {
        showNotification("שגיאה במחיקת הסניף", "error");
      } finally {
        setIsSaving(false);
        setDeleteDialogOpen(false);
        setAccountToDelete(null);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setAccountToDelete(null);
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    let formattedValue = value;
    if (value.length > 0) {
      formattedValue = value.replace(/(\d{3})(?=\d)/g, "$1-");
    }
    setOrganization((prev) => ({ ...prev, phone: formattedValue }));
    setIsOrganizationModified(true);
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const formatDate = (dateString: string) => {
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
  };

  const handleAccordionChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedAccordion(isExpanded ? panel : false);
    };

  const handleOpenAccountDialog = (account?: Account) => {
    if (account) {
      setCurrentAccount(account);
    } else {
      setCurrentAccount({
        branchName: "",
        created: "",
        updated: "",
      });
    }
    setIsAccountDialogOpen(true);
  };

  const handleCloseAccountDialog = () => {
    setIsAccountDialogOpen(false);
    setCurrentAccount({
      branchName: "",
      created: "",
      updated: "",
    });
  };

  const handleOpenGroupDialog = (group?: Group) => {
    if (group) {
      setCurrentGroup(group);
    } else {
      setCurrentGroup({
        name: "",
        description: "",
      });
    }
    setIsGroupDialogOpen(true);
  };

  const handleCloseGroupDialog = () => {
    setIsGroupDialogOpen(false);
    setCurrentGroup({
      name: "",
      description: "",
    });
  };

  const handleSaveGroup = async () => {
    try {
      setIsSaving(true);
      if (currentGroup.id) {
        await groupApi.updateGroup(currentGroup as Group);
      } else {
        await groupApi.createGroup({
          ...currentGroup,
          accountId: selectedAccountForGroups,
        } as Omit<Group, "id" | "created" | "updated">);
      }
      await fetchGroups(selectedAccountForGroups);
      handleCloseGroupDialog();
      showNotification("הקבוצה נשמרה בהצלחה", "success");
    } catch (error) {
      showNotification("שגיאה בשמירת הקבוצה", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGroupClick = (group: Group) => {
    setGroupToDelete(group);
    setDeleteGroupDialogOpen(true);
  };

  const handleDeleteGroupConfirm = async () => {
    if (groupToDelete) {
      try {
        setIsSaving(true);
        await groupApi.deleteGroup(groupToDelete.id);
        await fetchGroups(selectedAccount?.id || "");
        showNotification("הקבוצה נמחקה בהצלחה", "success");
        handleCloseGroupDialog();
      } catch (error) {
        showNotification("שגיאה במחיקת הקבוצה", "error");
      } finally {
        setIsSaving(false);
        setDeleteGroupDialogOpen(false);
        setGroupToDelete(null);
      }
    }
  };

  const handleDeleteGroupCancel = () => {
    setDeleteGroupDialogOpen(false);
    setGroupToDelete(null);
  };

  return (
    <Box sx={{ mt: 4, textAlign: "center", px: 2 }}>
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />

      <Typography variant="h5" sx={{ mb: 3 }}>
        הגדרות
      </Typography>

      <Box sx={{ maxWidth: 600, mx: "auto" }}>
        <Accordion
          expanded={expandedAccordion === "language"}
          onChange={handleAccordionChange("language")}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="language-content"
            id="language-header"
          >
            <Typography variant="h6">הגדרת שפה</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormControl fullWidth sx={{ maxWidth: 300, mx: "auto" }}>
              <InputLabel id="language-select-label">Language</InputLabel>
              <Select
                labelId="language-select-label"
                id="language-select"
                value={language}
                label="Language"
                onChange={(e) =>
                  setLanguage(e.target.value as "heb" | "rus" | "eng")
                }
              >
                <MenuItem value="heb">Hebrew</MenuItem>
                <MenuItem value="rus">Russian</MenuItem>
                <MenuItem value="eng">English</MenuItem>
              </Select>
            </FormControl>
          </AccordionDetails>
        </Accordion>

        <Accordion
          expanded={expandedAccordion === "organization"}
          onChange={handleAccordionChange("organization")}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="organization-content"
            id="organization-header"
          >
            <Typography variant="h6">פרטי הגן</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ textAlign: "right" }}>
                <Box sx={{ mb: 4 }}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, 1fr)",
                      },
                      gap: 2,
                    }}
                  >
                    <TextField
                      fullWidth
                      label="מספר עוסק"
                      value={organization.businessId}
                      onChange={(e) =>
                        handleOrganizationChange("businessId", e.target.value)
                      }
                      disabled={isLoading}
                      sx={{ direction: "rtl" }}
                    />
                    <TextField
                      fullWidth
                      label="שם הארגון"
                      value={organization.name}
                      onChange={(e) =>
                        handleOrganizationChange("name", e.target.value)
                      }
                      disabled={isLoading}
                      sx={{ direction: "rtl" }}
                    />
                    <TextField
                      name="email"
                      label="אימייל"
                      value={organization.email}
                      onChange={(e) =>
                        handleOrganizationChange("email", e.target.value)
                      }
                      disabled={isLoading}
                      sx={{
                        borderRadius: 2,
                        "& .MuiInputBase-input": {
                          direction: "ltr",
                          textAlign: "left",
                        },
                      }}
                    />
                    <TextField
                      fullWidth
                      label="נייד"
                      value={organization.phone}
                      onChange={handleMobileChange}
                      disabled={isLoading}
                      sx={{ direction: "rtl" }}
                    />
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                        bgcolor: "background.paper",
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mb: 0.5 }}
                      >
                        נוצר בתאריך
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formatDate(organization.created)}
                      </Typography>
                    </Paper>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                        bgcolor: "background.paper",
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mb: 0.5 }}
                      >
                        עודכן בתאריך
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formatDate(organization.updated)}
                      </Typography>
                    </Paper>
                  </Box>
                  <Box
                    sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}
                  >
                    <Button
                      variant="contained"
                      onClick={handleSave}
                      disabled={isLoading || !isOrganizationModified}
                      startIcon={
                        isLoading ? <CircularProgress size={20} /> : null
                      }
                    >
                      שמירת שינויים
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>

        <Accordion
          expanded={expandedAccordion === "accounts"}
          onChange={handleAccordionChange("accounts")}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="accounts-content"
            id="accounts-header"
          >
            <Typography variant="h6">סניפים</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ textAlign: "right" }}>
                <List>
                  {accounts.map((account) => (
                    <ListItem
                      key={account.id}
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        mb: 2,
                        bgcolor: "background.paper",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          boxShadow: 1,
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 500,
                                color: account.branchName
                                  ? "text.primary"
                                  : "text.secondary",
                                fontStyle: account.branchName
                                  ? "normal"
                                  : "italic",
                              }}
                            >
                              {account.branchName || "שם הסניף חסר"}
                            </Typography>
                            {account.isPrimary && (
                              <Chip
                                label="סניף ראשי"
                                size="small"
                                color="primary"
                                sx={{
                                  height: 20,
                                  "& .MuiChip-label": {
                                    px: 1,
                                    fontSize: "0.75rem",
                                  },
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
                            קוד סניף: {account.branchCode}
                          </Typography>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="edit"
                          onClick={() => handleOpenAccountDialog(account)}
                          sx={{
                            mr: 1,
                            color: "primary.main",
                            "&:hover": {
                              bgcolor: "primary.lighter",
                            },
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
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
                    onClick={() => handleOpenAccountDialog()}
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
              </Box>
            )}
          </AccordionDetails>
        </Accordion>

        <Accordion
          expanded={expandedAccordion === "groups"}
          onChange={handleAccordionChange("groups")}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="groups-content"
            id="groups-header"
          >
            <Typography variant="h6">קבוצות</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ textAlign: "right" }}>
                <Box sx={{ mb: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel id="account-select-label">בחר סניף</InputLabel>
                    <Select
                      labelId="account-select-label"
                      id="account-select"
                      value={selectedAccountForGroups}
                      label="בחר סניף"
                      onChange={(e) =>
                        setSelectedAccountForGroups(e.target.value)
                      }
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
                      {accounts.map((account) => (
                        <MenuItem key={account.id} value={account.id}>
                          {account.branchName || "שם הסניף חסר"}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {selectedAccountForGroups ? (
                  <>
                    {isLoadingGroups ? (
                      <Box
                        sx={{ display: "flex", justifyContent: "center", p: 3 }}
                      >
                        <CircularProgress />
                      </Box>
                    ) : (
                      <>
                        {groups.length > 0 && (
                          <List>
                            {groups.map((group) => (
                              <ListItem
                                key={group.id}
                                sx={{
                                  border: "1px solid",
                                  borderColor: "divider",
                                  borderRadius: 2,
                                  mb: 2,
                                  bgcolor: "background.paper",
                                  transition: "all 0.2s ease-in-out",
                                  "&:hover": {
                                    boxShadow: 1,
                                    transform: "translateY(-2px)",
                                  },
                                }}
                              >
                                <ListItemText
                                  primary={
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                      }}
                                    >
                                      <Typography
                                        variant="subtitle1"
                                        sx={{
                                          fontWeight: 500,
                                          color: group.name
                                            ? "text.primary"
                                            : "text.secondary",
                                          fontStyle: group.name
                                            ? "normal"
                                            : "italic",
                                        }}
                                      >
                                        {group.name || "שם הקבוצה חסר"}
                                      </Typography>
                                    </Box>
                                  }
                                  secondary={
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{ mt: 0.5 }}
                                    >
                                      {group.description || "אין תיאור"}
                                    </Typography>
                                  }
                                />
                                <ListItemSecondaryAction>
                                  <IconButton
                                    edge="end"
                                    aria-label="edit"
                                    onClick={() => handleOpenGroupDialog(group)}
                                    sx={{
                                      mr: 1,
                                      color: "primary.main",
                                      "&:hover": {
                                        bgcolor: "primary.lighter",
                                      },
                                    }}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </ListItemSecondaryAction>
                              </ListItem>
                            ))}
                          </List>
                        )}
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
                            onClick={() => handleOpenGroupDialog()}
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
                    )}
                  </>
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
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      </Box>

      <Drawer
        anchor="right"
        open={isAccountDialogOpen}
        onClose={handleCloseAccountDialog}
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
                onClick={() => handleDeleteClick(currentAccount as Account)}
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
              onClick={handleCloseAccountDialog}
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
              onClick={handleSaveAccount}
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

      <Drawer
        anchor="right"
        open={isGroupDialogOpen}
        onClose={handleCloseGroupDialog}
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
                  setCurrentGroup({ ...currentGroup, name: e.target.value })
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
                multiline
                rows={3}
                placeholder="הזן תיאור לקבוצה"
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
                onClick={() => handleDeleteGroupClick(currentGroup as Group)}
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
              onClick={handleCloseGroupDialog}
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
              onClick={handleSaveGroup}
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
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>מחיקת סניף</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את הסניף{" "}
            {accountToDelete?.branchName || "זה"}?
          </Typography>
          {accountToDelete?.isPrimary && (
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

      <Dialog
        open={deleteGroupDialogOpen}
        onClose={handleDeleteGroupCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>מחיקת קבוצה</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את הקבוצה {groupToDelete?.name || "זו"}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteGroupCancel} color="inherit">
            ביטול
          </Button>
          <Button
            onClick={handleDeleteGroupConfirm}
            color="error"
            variant="contained"
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={20} /> : null}
          >
            מחיקה
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;
