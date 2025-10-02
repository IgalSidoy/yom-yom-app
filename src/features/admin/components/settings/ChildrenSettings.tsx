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
  TextField,
  InputAdornment,
} from "@mui/material";
import { Button, Card } from "../../../../shared/components";
import { AdminSettingsLayout } from "../../../../shared/components/layout";
import { useApp } from "../../../../contexts/AppContext";
import { childApi, ChildWithParents } from "../../../../services/api";
import Notification from "../../../../shared/components/ui/Notification";
import SearchIcon from "@mui/icons-material/Search";

const ChildrenSettings: React.FC = () => {
  const { user } = useApp();
  const [children, setChildren] = useState<ChildWithParents[]>([]);
  const [filteredChildren, setFilteredChildren] = useState<ChildWithParents[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

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

  const calculateAge = (birthDate: string) => {
    if (!birthDate || birthDate === "0001-01-01T00:00:00") {
      return "לא זמין";
    }
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return `${age} שנים`;
  };

  const getParentName = (child: ChildWithParents) => {
    if (child.parents && child.parents.length > 0) {
      const parent = child.parents[0];
      return `${parent.firstName} ${parent.lastName}`;
    }
    return "לא זמין";
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

  const fetchChildren = async () => {
    if (!user?.accountId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await childApi.getChildrenByAccount(user.accountId);
      setChildren(response.children);
      setFilteredChildren(response.children);
    } catch (err) {
      setError("שגיאה בטעינת רשימת הילדים");
      showNotification("שגיאה בטעינת רשימת הילדים", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.accountId) {
      fetchChildren();
    }
  }, [user?.accountId]);

  useEffect(() => {
    const filtered = children.filter(
      (child) =>
        child.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        child.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getParentName(child).toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredChildren(filtered);
  }, [searchTerm, children]);

  const handleCreateChild = () => {
    // TODO: Implement create child functionality
    console.log("Create child clicked");
  };

  const handleEditChild = (child: ChildWithParents) => {
    // TODO: Implement edit child functionality
    console.log("Edit child clicked", child);
  };

  const handleDeleteChild = async (childId: string) => {
    try {
      setLoading(true);
      await childApi.deleteChild(childId);
      await fetchChildren(); // Refresh the list
      showNotification("הילד נמחק בהצלחה", "success");
    } catch (err) {
      setError("שגיאה במחיקת הילד");
      showNotification("שגיאה במחיקת הילד", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading && children.length === 0) {
    return (
      <AdminSettingsLayout title="ניהול ילדים" subtitle="טוען רשימת ילדים...">
        <Card>
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography>טוען...</Typography>
          </Box>
        </Card>
      </AdminSettingsLayout>
    );
  }

  return (
    <AdminSettingsLayout
      title="ניהול ילדים"
      subtitle={`${filteredChildren.length} ילדים זמינים`}
    >
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
      <Card
        actions={
          <Button variant="primary" onClick={handleCreateChild}>
            הוספת ילד חדש
          </Button>
        }
      >
        <Box sx={{ p: 3 }}>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          {/* Search Bar */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="חיפוש ילדים לפי שם או הורה..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          </Box>

          {filteredChildren.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                {searchTerm
                  ? "לא נמצאו ילדים התואמים לחיפוש"
                  : "אין ילדים זמינים"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {searchTerm
                  ? "נסה לשנות את מונח החיפוש"
                  : "התחל על ידי הוספת ילד ראשון"}
              </Typography>
              {!searchTerm && (
                <Button variant="primary" onClick={handleCreateChild}>
                  הוספת ילד ראשון
                </Button>
              )}
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
                    <TableCell>ילד</TableCell>
                    <TableCell>הורה</TableCell>
                    <TableCell>גיל</TableCell>
                    <TableCell>קבוצה</TableCell>
                    <TableCell>נוצר בתאריך</TableCell>
                    <TableCell>פעולות</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredChildren.map((child) => (
                    <TableRow key={child.id} hover>
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
                            {child.firstName.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              {child.firstName} {child.lastName}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {getParentName(child)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {calculateAge(child.dateOfBirth)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={child.groupName || "ללא קבוצה"}
                          color="secondary"
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(child.created || "")}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Button
                            variant="outline"
                            size="small"
                            onClick={() => handleEditChild(child)}
                          >
                            עריכה
                          </Button>
                          <Button
                            variant="text"
                            size="small"
                            onClick={() => handleDeleteChild(child.id || "")}
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
    </AdminSettingsLayout>
  );
};

export default ChildrenSettings;
