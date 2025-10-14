import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Typography,
  useTheme,
  useMediaQuery,
  Paper,
} from "@mui/material";
import { Account, Group } from "../../../services/api";
import { accountApi, groupApi } from "../../../services/api";

interface AdminFeedFiltersProps {
  selectedAccount: Account | null;
  selectedGroup: Group | null;
  onAccountChange: (account: Account | null) => void;
  onGroupChange: (group: Group | null) => void;
  isLoading?: boolean;
}

const AdminFeedFilters: React.FC<AdminFeedFiltersProps> = ({
  selectedAccount,
  selectedGroup,
  onAccountChange,
  onGroupChange,
  isLoading = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // State
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all accounts
  const fetchAccounts = useCallback(async () => {
    try {
      setIsLoadingAccounts(true);
      setError(null);
      const response = await accountApi.getAccounts();
      setAccounts(response.data.accounts);

      // Auto-select first account if none selected
      if (!selectedAccount && response.data.accounts.length > 0) {
        onAccountChange(response.data.accounts[0]);
      }
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
      setError("שגיאה בטעינת הסניפים");
    } finally {
      setIsLoadingAccounts(false);
    }
  }, [selectedAccount, onAccountChange]);

  // Fetch groups for selected account
  const fetchGroups = useCallback(
    async (accountId: string) => {
      try {
        setIsLoadingGroups(true);
        setError(null);
        const response = await groupApi.getGroups(accountId);
        setGroups(response.data.groups);

        // Auto-select first group if none selected
        if (!selectedGroup && response.data.groups.length > 0) {
          onGroupChange(response.data.groups[0]);
        }
      } catch (err) {
        console.error("Failed to fetch groups:", err);
        setError("שגיאה בטעינת הקבוצות");
        setGroups([]);
      } finally {
        setIsLoadingGroups(false);
      }
    },
    [selectedGroup, onGroupChange]
  );

  // Load accounts on mount
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Load groups when account changes
  useEffect(() => {
    if (selectedAccount) {
      fetchGroups(selectedAccount.id);
    } else {
      setGroups([]);
      onGroupChange(null);
    }
  }, [selectedAccount, fetchGroups, onGroupChange]);

  // Handle account change
  const handleAccountChange = (accountId: string) => {
    const account = accounts.find((acc) => acc.id === accountId) || null;
    onAccountChange(account);
  };

  // Handle group change
  const handleGroupChange = (groupId: string) => {
    const group = groups.find((grp) => grp.id === groupId) || null;
    onGroupChange(group);
  };

  // Mobile layout - stacked vertically
  if (isMobile) {
    return (
      <Paper
        sx={{
          p: { xs: 3, sm: 3.5 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          backgroundColor: "#fff",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
            borderColor: "primary.light",
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Account Selector */}
          <FormControl fullWidth size="small">
            <InputLabel id="account-select-label">סניף</InputLabel>
            <Select
              labelId="account-select-label"
              value={selectedAccount?.id || ""}
              label="סניף"
              onChange={(e) => handleAccountChange(e.target.value)}
              disabled={isLoadingAccounts || isLoading}
              sx={{
                "& .MuiSelect-select": {
                  textAlign: "right",
                },
                borderRadius: 2,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  boxShadow: "0 2px 8px rgba(255, 145, 77, 0.1)",
                },
                "&.Mui-focused": {
                  boxShadow: "0 4px 12px rgba(255, 145, 77, 0.2)",
                },
              }}
            >
              {isLoadingAccounts ? (
                <MenuItem disabled>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      width: "100%",
                    }}
                  >
                    <CircularProgress size={16} />
                    <Typography variant="body2">טוען סניפים...</Typography>
                  </Box>
                </MenuItem>
              ) : (
                accounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    <Box sx={{ textAlign: "right", width: "100%" }}>
                      {account.branchName}
                    </Box>
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          {/* Group Selector */}
          <FormControl fullWidth size="small">
            <InputLabel id="group-select-label">קבוצה</InputLabel>
            <Select
              labelId="group-select-label"
              value={selectedGroup?.id || ""}
              label="קבוצה"
              onChange={(e) => handleGroupChange(e.target.value)}
              disabled={isLoadingGroups || isLoading || !selectedAccount}
              sx={{
                "& .MuiSelect-select": {
                  textAlign: "right",
                },
                borderRadius: 2,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  boxShadow: "0 2px 8px rgba(255, 145, 77, 0.1)",
                },
                "&.Mui-focused": {
                  boxShadow: "0 4px 12px rgba(255, 145, 77, 0.2)",
                },
              }}
            >
              {isLoadingGroups ? (
                <MenuItem disabled>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      width: "100%",
                    }}
                  >
                    <CircularProgress size={16} />
                    <Typography variant="body2">טוען קבוצות...</Typography>
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
                    <Box sx={{ textAlign: "right", width: "100%" }}>
                      {group.name}
                    </Box>
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          {/* Error Message */}
          {error && (
            <Typography
              variant="caption"
              color="error"
              sx={{ textAlign: "center" }}
            >
              {error}
            </Typography>
          )}
        </Box>
      </Paper>
    );
  }

  // Desktop layout - horizontal
  return (
    <Paper
      sx={{
        p: { xs: 3, sm: 3.5 },
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
        backgroundColor: "#fff",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
          borderColor: "primary.light",
        },
      }}
    >
      <Box
        sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}
      >
        {/* Account Selector */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="account-select-label">סניף</InputLabel>
          <Select
            labelId="account-select-label"
            value={selectedAccount?.id || ""}
            label="סניף"
            onChange={(e) => handleAccountChange(e.target.value)}
            disabled={isLoadingAccounts || isLoading}
            sx={{
              "& .MuiSelect-select": {
                textAlign: "right",
              },
              borderRadius: 2,
              "&:hover": {
                boxShadow: "0 2px 8px rgba(255, 145, 77, 0.1)",
              },
            }}
          >
            {isLoadingAccounts ? (
              <MenuItem disabled>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="body2">טוען סניפים...</Typography>
                </Box>
              </MenuItem>
            ) : (
              accounts.map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  <Box sx={{ textAlign: "right", width: "100%" }}>
                    {account.branchName}
                  </Box>
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        {/* Group Selector */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="group-select-label">קבוצה</InputLabel>
          <Select
            labelId="group-select-label"
            value={selectedGroup?.id || ""}
            label="קבוצה"
            onChange={(e) => handleGroupChange(e.target.value)}
            disabled={isLoadingGroups || isLoading || !selectedAccount}
            sx={{
              "& .MuiSelect-select": {
                textAlign: "right",
              },
              borderRadius: 2,
              "&:hover": {
                boxShadow: "0 2px 8px rgba(255, 145, 77, 0.1)",
              },
            }}
          >
            {isLoadingGroups ? (
              <MenuItem disabled>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="body2">טוען קבוצות...</Typography>
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
                  <Box sx={{ textAlign: "right", width: "100%" }}>
                    {group.name}
                  </Box>
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        {/* Error Message */}
        {error && (
          <Typography variant="caption" color="error">
            {error}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default AdminFeedFilters;
