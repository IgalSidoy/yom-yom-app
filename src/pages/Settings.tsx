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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Container,
  Grid,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
import AccountCard from "../components/AccountCard";
import GroupCard from "../components/GroupCard";
import UserManagementCard from "../components/UserManagementCard";
import AddIcon from "@mui/icons-material/Add";

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
  const [selectedAccountForGroups, setSelectedAccountForGroups] = useState<
    string | null
  >(null);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    accounts[0]?.id || ""
  );

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
    const fetchUserData = async () => {
      try {
        console.log("Fetching user data...");
        const response = await userApi.getUser();
        console.log("User data received:", response.data);
        setUser(response.data.user);
      } catch (error) {
        console.error("Error fetching user data:", error);
        showNotification("שגיאה בטעינת פרטי המשתמש", "error");
      }
    };

    if (!user) {
      fetchUserData();
    }
  }, [user, setUser]);

  useEffect(() => {
    if (user) {
      fetchOrganization(user.organizationId);
    }
  }, [user]);

  const fetchOrganization = async (organizationId: string) => {
    try {
      console.log("Fetching organization data for ID:", organizationId);
      setIsLoading(true);
      const response = await organizationApi.getOrganization(organizationId);
      console.log("Organization data received:", response.data);
      setFormattedOrganization(response.data.organization);
    } catch (error) {
      console.error("Error fetching organization:", error);
      showNotification("שגיאה בטעינת פרטי הארגון", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      const response = await accountApi.getAccounts();
      setAccounts(response.data.accounts);
      if (response.data.accounts.length > 0) {
        setSelectedAccount(response.data.accounts[0]);
      }
      return response.data.accounts; // Return accounts for chaining
    } catch (error) {
      showNotification("שגיאה בטעינת הסניפים", "error");
      return []; // Return empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroups = async () => {
    if (accounts.length === 0) {
      showNotification("יש לטעון סניפים קודם", "warning");
      return;
    }

    // Use the first account's ID if no account is selected
    const accountId = selectedAccountForGroups || accounts[0].id;

    try {
      setIsLoadingGroups(true);
      const response = await groupApi.getGroups(accountId);
      setGroups(response.data.groups);
    } catch (error) {
      showNotification("שגיאה בטעינת הקבוצות", "error");
    } finally {
      setIsLoadingGroups(false);
    }
  };

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

  const handleDeleteClick = async (account: Account) => {
    try {
      setIsSaving(true);
      await accountApi.deleteAccount(account.id);
      await fetchAccounts();
      showNotification("הסניף נמחק בהצלחה", "success");
    } catch (error) {
      showNotification("שגיאה במחיקת הסניף", "error");
    } finally {
      setIsSaving(false);
    }
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
      console.log("Accordion change:", { panel, isExpanded, user });
      setExpandedAccordion(isExpanded ? panel : false);

      // Load organization data when organization accordion is expanded
      if (isExpanded && panel === "organization") {
        if (!user) {
          console.log("No user found, fetching user data first...");
          userApi
            .getUser()
            .then((response) => {
              console.log("User data received:", response.data);
              setUser(response.data.user);
              if (response.data.user.organizationId) {
                fetchOrganization(response.data.user.organizationId);
              }
            })
            .catch((error) => {
              console.error("Error fetching user data:", error);
              showNotification("שגיאה בטעינת פרטי המשתמש", "error");
            });
          return;
        }
        console.log("Fetching organization data for user:", user);
        fetchOrganization(user.organizationId);
      }

      // Load accounts data when accounts accordion is expanded and no accounts exist
      if (isExpanded && panel === "accounts" && accounts.length === 0) {
        fetchAccounts();
      }

      // Load accounts data when groups accordion is expanded and no accounts exist
      if (isExpanded && panel === "groups" && accounts.length === 0) {
        fetchAccounts();
      }
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
      await fetchGroups();
      handleCloseGroupDialog();
      showNotification("הקבוצה נשמרה בהצלחה", "success");
    } catch (error) {
      showNotification("שגיאה בשמירת הקבוצה", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGroupClick = async (group: Group) => {
    try {
      setIsSaving(true);
      await groupApi.deleteGroup(group.id);
      await fetchGroups();
      showNotification("הקבוצה נמחקה בהצלחה", "success");
    } catch (error) {
      showNotification("שגיאה במחיקת הקבוצה", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAccount = async () => {
    try {
      setIsLoading(true);
      const currentAccount = {
        branchName: "",
        branchCode: 0,
        organizationId: organization.id,
        isPrimary: false,
      };

      await accountApi.createAccount({
        ...currentAccount,
        organizationId: organization.id,
      } as Omit<Account, "id" | "created" | "updated">);

      await fetchAccounts();
      showNotification("חשבון נוצר בהצלחה", "success");
    } catch (error) {
      showNotification("שגיאה ביצירת חשבון", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGroup = () => {
    // Implementation of handleAddGroup
  };

  const handleAccountsChange = async (): Promise<void> => {
    await fetchAccounts();
  };

  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts]);

  const handleAccountDelete = () => {
    // Clear groups state when an account is deleted
    setGroups([]);
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
                <AccountCard
                  accounts={accounts}
                  formatDate={formatDate}
                  onAccountsChange={handleAccountsChange}
                />
              </Box>
            )}
          </AccordionDetails>
        </Accordion>

        <Accordion
          expanded={expandedAccordion === "users"}
          onChange={handleAccordionChange("users")}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="users-content"
            id="users-header"
          >
            <Typography variant="h6">משתמשים</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ textAlign: "right" }}>
                <UserManagementCard
                  accounts={accounts}
                  isExpanded={expandedAccordion === "users"}
                  onAccountsChange={handleAccountsChange}
                />
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
            {isLoadingGroups ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
              </Box>
            ) : !accounts || accounts.length === 0 ? (
              <Typography>יש לטעון סניפים קודם</Typography>
            ) : (
              <Box>
                <GroupCard
                  accounts={accounts}
                  formatDate={formatDate}
                  onAccountDelete={handleAccountDelete}
                />
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
};

export default Settings;
