import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Chip } from "@mui/material";
import { Button, Card } from "../../../../shared/components";
import { useApp } from "../../../../contexts/AppContext";
import { accountApi, Account } from "../../../../services/api";

const AccountsSettings: React.FC = () => {
  const { user } = useApp();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await accountApi.getAccounts();
      setAccounts(response.data.accounts);
    } catch (err) {
      setError("שגיאה בטעינת רשימת הסניפים");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleCreateAccount = () => {
    // TODO: Implement create account functionality
    console.log("Create account clicked");
  };

  const handleEditAccount = (account: Account) => {
    // TODO: Implement edit account functionality
    console.log("Edit account clicked", account);
  };

  const handleDeleteAccount = async (accountId: string) => {
    try {
      setLoading(true);
      await accountApi.deleteAccount(accountId);
      await fetchAccounts(); // Refresh the list
    } catch (err) {
      setError("שגיאה במחיקת הסניף");
    } finally {
      setLoading(false);
    }
  };

  if (loading && accounts.length === 0) {
    return (
      <Card title="ניהול סניפים" subtitle="טוען רשימת סניפים...">
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography>טוען...</Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card 
      title="ניהול סניפים" 
      subtitle={`${accounts.length} סניפים זמינים`}
      actions={
        <Button variant="primary" onClick={handleCreateAccount}>
          הוספת סניף חדש
        </Button>
      }
    >
      <Box sx={{ p: 3 }}>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {accounts.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              אין סניפים זמינים
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              התחל על ידי הוספת סניף ראשון
            </Typography>
            <Button variant="primary" onClick={handleCreateAccount}>
              הוספת סניף ראשון
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {accounts.map((account) => (
              <Paper
                key={account.id}
                elevation={1}
                sx={{
                  p: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  "&:hover": {
                    boxShadow: 2,
                  },
                  transition: "box-shadow 0.2s ease-in-out",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {account.branchName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      קוד סניף: {account.branchCode}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    {account.isPrimary && (
                      <Chip 
                        label="סניף ראשי" 
                        color="primary" 
                        size="small" 
                        variant="outlined"
                      />
                    )}
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handleEditAccount(account)}
                    >
                      עריכה
                    </Button>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => handleDeleteAccount(account.id)}
                      sx={{ color: "error.main" }}
                    >
                      מחיקה
                    </Button>
                  </Box>
                </Box>
                
                <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                      נוצר בתאריך
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formatDate(account.created)}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                      עודכן בתאריך
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formatDate(account.updated)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Box>
    </Card>
  );
};

export default AccountsSettings;
