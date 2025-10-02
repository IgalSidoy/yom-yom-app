import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { Button, Card } from "../../../../shared/components";
import { useApp } from "../../../../contexts/AppContext";
import { userApi, User } from "../../../../services/api";

const UsersSettings: React.FC = () => {
  const { user } = useApp();
  const [users, setUsers] = useState<User[]>([]);
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

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "error";
      case "staff":
        return "primary";
      case "parent":
        return "success";
      default:
        return "default";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "מנהל";
      case "staff":
        return "צוות";
      case "parent":
        return "הורה";
      default:
        return role;
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userApi.getUsers();
      setUsers(response.data.users);
    } catch (err) {
      setError("שגיאה בטעינת רשימת המשתמשים");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = () => {
    // TODO: Implement create user functionality
    console.log("Create user clicked");
  };

  const handleEditUser = (user: User) => {
    // TODO: Implement edit user functionality
    console.log("Edit user clicked", user);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setLoading(true);
      await userApi.deleteUser(userId);
      await fetchUsers(); // Refresh the list
    } catch (err) {
      setError("שגיאה במחיקת המשתמש");
    } finally {
      setLoading(false);
    }
  };

  if (loading && users.length === 0) {
    return (
      <Card title="ניהול משתמשים" subtitle="טוען רשימת משתמשים...">
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography>טוען...</Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card
      title="ניהול משתמשים"
      subtitle={`${users.length} משתמשים זמינים`}
      actions={
        <Button variant="primary" onClick={handleCreateUser}>
          הוספת משתמש חדש
        </Button>
      }
    >
      <Box sx={{ p: 3 }}>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {users.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              אין משתמשים זמינים
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              התחל על ידי הוספת משתמש ראשון
            </Typography>
            <Button variant="primary" onClick={handleCreateUser}>
              הוספת משתמש ראשון
            </Button>
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>משתמש</TableCell>
                  <TableCell>תפקיד</TableCell>
                  <TableCell>אימייל</TableCell>
                  <TableCell>נייד</TableCell>
                  <TableCell>נוצר בתאריך</TableCell>
                  <TableCell>פעולות</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: "primary.main",
                            width: 40,
                            height: 40,
                            fontSize: "1rem",
                            fontWeight: 600,
                          }}
                        >
                          {user.firstName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {user.firstName} {user.lastName}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getRoleLabel(user.role)}
                        color={getRoleColor(user.role) as any}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{user.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {user.mobile || "לא זמין"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(user.created)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => handleEditUser(user)}
                        >
                          עריכה
                        </Button>
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => handleDeleteUser(user.id)}
                          sx={{ color: "error.main" }}
                        >
                          מחיקה
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Card>
  );
};

export default UsersSettings;
