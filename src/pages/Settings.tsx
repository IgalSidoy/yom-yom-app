import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useLanguage } from "../contexts/LanguageContext";
import { useApp } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";
import {
  organizationApi,
  Organization,
  accountApi,
  Account,
  userApi,
  User,
  groupApi,
  Group,
  childApi,
  Child,
  Parent,
} from "../services/api";
import Notification from "../components/Notification";
import AccountCard from "../components/AccountCard";
import GroupCard from "../components/GroupCard";
import UserManagementCard from "../components/UserManagementCard";
import ChildManagementCard from "../components/ChildManagementCard";

interface ChildResponse {
  children: Child[];
  total: number;
}

const Settings = () => {
  const { language, setLanguage } = useLanguage();
  const { user, setUser } = useApp();
  const { accessToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
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
  const [groups, setGroups] = useState<Group[]>([]);
  const [parents, setParents] = useState<User[]>([]);
  const [isOrganizationModified, setIsOrganizationModified] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [isChildrenInitialized, setIsChildrenInitialized] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

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

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await userApi.getUser();
        setUser(response.data.user);
      } catch (error) {
        showNotification("שגיאה בטעינת פרטי המשתמש", "error");
      }
    };

    if (!user) {
      fetchUserData();
    }
  }, [user, setUser]);

  const fetchOrganization = async (organizationId: string) => {
    try {
      setIsLoading(true);
      const response = await organizationApi.getOrganization(organizationId);
      setFormattedOrganization(response.data.organization);
    } catch (error) {
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
      return response.data.accounts;
    } catch (error) {
      showNotification("שגיאה בטעינת הסניפים", "error");
      return [];
    } finally {
      setIsLoading(false);
    }
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

  const fetchGroups = async () => {
    try {
      console.log("fetchGroups called - accounts:", accounts);
      setIsLoadingGroups(true);
      const allGroups: Group[] = [];
      for (const account of accounts) {
        console.log("Fetching groups for account:", account.id);
        const response = await groupApi.getGroups(account.id);
        console.log(
          "Group response for account",
          account.id,
          ":",
          response.data
        );
        if (response.data && Array.isArray(response.data)) {
          allGroups.push(...response.data);
        } else if (
          response.data &&
          response.data.groups &&
          Array.isArray(response.data.groups)
        ) {
          allGroups.push(...response.data.groups);
        }
      }
      console.log("All groups fetched:", allGroups);
      setGroups(allGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      showNotification("שגיאה בטעינת הקבוצות", "error");
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const fetchParents = async () => {
    try {
      console.log("Fetching parents...");
      const response = await userApi.getUsers();
      if (response.data.users) {
        const parentUsers = response.data.users.filter(
          (user: User) => user.role === "Parent"
        );
        console.log("All users:", response.data.users);
        console.log("Parent users:", parentUsers);
        setParents(parentUsers);
      }
    } catch (error) {
      console.error("Error fetching parents:", error);
      showNotification("שגיאה בטעינת ההורים", "error");
    }
  };

  const fetchChildren = async (accountId?: string) => {
    try {
      setIsLoadingChildren(true);
      const allChildren: Child[] = [];

      if (accountId) {
        // Fetch children for specific account only
        const data = await childApi.getChildrenByAccount(accountId);
        if (data.children) {
          allChildren.push(...data.children);
        }
      } else {
        // Fetch children for all accounts (original behavior)
        for (const account of accounts) {
          const data = await childApi.getChildrenByAccount(account.id);
          if (data.children) {
            allChildren.push(...data.children);
          }
        }
      }

      setChildren(allChildren);
    } catch (error) {
      console.error("Error fetching children:", error);
      showNotification("שגיאה בטעינת הילדים", "error");
      setChildren([]);
    } finally {
      setIsLoadingChildren(false);
    }
  };

  const handleAccordionChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedAccordion(isExpanded ? panel : false);

      if (isExpanded && panel === "organization") {
        if (organization.id) {
          return;
        }

        if (user?.organizationId) {
          fetchOrganization(user.organizationId);
        } else {
          userApi
            .getUser()
            .then((response) => {
              const userData = response.data;
              setUser(userData);
              if (userData?.organizationId) {
                fetchOrganization(userData.organizationId);
              } else {
                showNotification("לא נמצא מזהה ארגון", "error");
              }
            })
            .catch((error) => {
              showNotification("שגיאה בטעינת פרטי המשתמש", "error");
            });
        }
      }

      if (isExpanded && panel === "accounts" && accounts.length === 0) {
        fetchAccounts();
      }

      if (isExpanded && panel === "groups" && accounts.length === 0) {
        fetchAccounts();
      }

      if (isExpanded && panel === "children") {
        console.log("Children accordion expanded");
        console.log("Current groups length:", groups.length);
        console.log("Current accounts length:", accounts.length);

        if (accounts.length === 0) {
          console.log("No accounts, fetching accounts first");
          fetchAccounts();
        }
        // Always ensure groups and parents are loaded when accessing children section
        if (groups.length === 0) {
          console.log("No groups, fetching groups");
          fetchGroups();
        }
        if (parents.length === 0) {
          console.log("No parents, fetching parents");
          fetchParents();
        }
        if (!isChildrenInitialized) {
          console.log("Children not initialized, fetching children");
          fetchChildren();
          setIsChildrenInitialized(true);
        }
      } else if (panel === "children") {
        setIsChildrenInitialized(false);
      }
    };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      if (organization) {
        const hasChanges =
          initialOrganization.businessId !== organization.businessId ||
          initialOrganization.name !== organization.name ||
          initialOrganization.email !== organization.email ||
          initialOrganization.phone !== organization.phone;

        if (hasChanges) {
          const response = await organizationApi.updateOrganization(
            organization,
            initialOrganization
          );
          setFormattedOrganization(response.data.organization);
        }
        setIsOrganizationModified(false);
      }
      showNotification("השינויים נשמרו בהצלחה", "success");
    } catch (error) {
      showNotification("שגיאה בשמירת השינויים", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountsChange = async () => {
    await fetchAccounts();
  };

  const handleAccountDelete = () => {
    // No need to clear groups state as it's handled by the GroupCard component
  };

  const handleChildrenChange = async (accountId?: string) => {
    await fetchChildren(accountId);
  };

  const handleAccountSelection = async (accountId: string) => {
    setSelectedAccountId(accountId);

    if (accountId) {
      setIsLoadingChildren(true);
      try {
        await fetchChildren(accountId);
      } finally {
        setIsLoadingChildren(false);
      }
    } else {
      setChildren([]);
    }
  };

  // Fetch parents when children accordion is expanded
  useEffect(() => {
    if (expandedAccordion === "children" && parents.length === 0) {
      fetchParents();
    }
  }, [expandedAccordion, parents.length]);

  // Debug logging
  console.log("Settings component - groups state:", groups);
  console.log("Settings component - accounts state:", accounts);
  console.log("Settings component - parents state:", parents);
  console.log("Settings component - children state:", children);

  return (
    <Box sx={{ mt: 4, textAlign: "center", px: 2 }}>
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />

      {/* Sticky Title */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 5,
          bgcolor: "background.default",
          pt: 2,
          pb: 2,
          mb: 3,
        }}
      >
        <Typography variant="h5">הגדרות</Typography>
      </Box>

      <Box sx={{ maxWidth: 600, mx: "auto" }}>
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
                      onChange={(e) =>
                        handleOrganizationChange("phone", e.target.value)
                      }
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
                  onNotification={showNotification}
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
          expanded={expandedAccordion === "children"}
          onChange={handleAccordionChange("children")}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="children-content"
            id="children-header"
          >
            <Typography variant="h6">ילדים</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {isLoadingChildren ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
              </Box>
            ) : !accounts || accounts.length === 0 ? (
              <Typography>יש לטעון סניפים קודם</Typography>
            ) : (
              <Box sx={{ textAlign: "right" }}>
                {/* Account Selection */}
                <Box sx={{ mb: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>בחר סניף</InputLabel>
                    <Select
                      value={selectedAccountId}
                      label="בחר סניף"
                      onChange={(e) => handleAccountSelection(e.target.value)}
                      sx={{ bgcolor: "background.paper" }}
                    >
                      <MenuItem value="">
                        <em>בחר סניף</em>
                      </MenuItem>
                      {accounts.map((account) => (
                        <MenuItem key={account.id} value={account.id}>
                          {account.branchName || "שם הסניף חסר"}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Child Management Card */}
                <ChildManagementCard
                  accounts={accounts}
                  parents={parents}
                  children={children}
                  selectedAccountId={selectedAccountId}
                  isLoading={isLoadingChildren}
                  isExpanded={expandedAccordion === "children"}
                  onAccountsChange={handleAccountsChange}
                  onChildrenChange={handleChildrenChange}
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
