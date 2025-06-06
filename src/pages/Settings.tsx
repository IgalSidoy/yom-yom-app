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
    branchCode: -1,
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
      const response = await groupApi.getGroups(accountId);
      setGroups(response.data.groups);
    } catch (error) {
      showNotification("שגיאה בטעינת הקבוצות", "error");
    }
  };

  useEffect(() => {
    if (organization.id) {
      fetchAccounts();
    }
  }, [organization.id]);

  useEffect(() => {
    if (selectedAccount) {
      fetchGroups(selectedAccount.id);
    }
  }, [selectedAccount]);

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
        branchCode: -1,
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
      branchCode: -1,
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
          accountId: selectedAccount?.id,
        } as Omit<Group, "id" | "created" | "updated">);
      }
      await fetchGroups(selectedAccount?.id || "");
      handleCloseGroupDialog();
      showNotification("הקבוצה נשמרה בהצלחה", "success");
    } catch (error) {
      showNotification("שגיאה בשמירת הקבוצה", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      setIsSaving(true);
      await groupApi.deleteGroup(groupId);
      await fetchGroups(selectedAccount?.id || "");
      showNotification("הקבוצה נמחקה בהצלחה", "success");
    } catch (error) {
      showNotification("שגיאה במחיקת הקבוצה", "error");
    } finally {
      setIsSaving(false);
    }
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
                <Box
                  sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}
                >
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenAccountDialog()}
                  >
                    הוספת סניף
                  </Button>
                </Box>
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
                        {!account.isPrimary && (
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleDeleteClick(account)}
                            sx={{
                              color: "#d32f2f",
                              "&:hover": {
                                bgcolor: "rgba(211, 47, 47, 0.08)",
                                color: "#b71c1c",
                              },
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
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
                <Box
                  sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}
                >
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenGroupDialog()}
                  >
                    הוספת קבוצה
                  </Button>
                </Box>
                <List>
                  {groups.map((group) => (
                    <ListItem
                      key={group.id}
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      <ListItemText
                        primary={group.name}
                        secondary={group.description}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="edit"
                          onClick={() => handleOpenGroupDialog(group)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeleteGroup(group.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
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
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            {currentAccount.id ? "עריכת סניף" : "הוספת סניף חדש"}
          </Typography>

          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
              />
              <TextField
                fullWidth
                label="קוד סניף"
                type="number"
                value={
                  currentAccount.branchCode === -1
                    ? ""
                    : currentAccount.branchCode
                }
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    setCurrentAccount({
                      ...currentAccount,
                      branchCode: -1,
                    });
                  } else {
                    const numValue = parseInt(value);
                    if (numValue >= 0 && numValue <= 999) {
                      setCurrentAccount({
                        ...currentAccount,
                        branchCode: numValue,
                      });
                    }
                  }
                }}
                inputProps={{
                  min: 0,
                  max: 999,
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                }}
                helperText="אופציונלי, מספר חיובי עד 999"
              />
              {currentAccount.id && (
                <Box
                  sx={{
                    mt: 2,
                    pt: 2,
                    borderTop: 1,
                    borderColor: "divider",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    נוצר בתאריך:{" "}
                    {currentAccount.created && currentAccount.created !== ""
                      ? formatDate(currentAccount.created)
                      : "לא זמין"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    עודכן בתאריך:{" "}
                    {currentAccount.updated && currentAccount.updated !== ""
                      ? formatDate(currentAccount.updated)
                      : "לא זמין"}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              mt: "auto",
              pt: 2,
              borderTop: 1,
              borderColor: "divider",
            }}
          >
            <Button
              fullWidth
              onClick={handleCloseAccountDialog}
              variant="outlined"
            >
              ביטול
            </Button>
            <Button
              fullWidth
              onClick={handleSaveAccount}
              variant="contained"
              disabled={isSaving}
              startIcon={isSaving ? <CircularProgress size={20} /> : null}
            >
              שמירה
            </Button>
          </Box>
        </Box>
      </Drawer>

      <Dialog open={isGroupDialogOpen} onClose={handleCloseGroupDialog}>
        <DialogTitle>
          {currentGroup.id ? "עריכת קבוצה" : "הוספת קבוצה חדשה"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="שם הקבוצה"
              value={currentGroup.name}
              onChange={(e) =>
                setCurrentGroup({ ...currentGroup, name: e.target.value })
              }
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
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseGroupDialog}>ביטול</Button>
          <Button
            onClick={handleSaveGroup}
            variant="contained"
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={20} /> : null}
          >
            שמירה
          </Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
};

export default Settings;
