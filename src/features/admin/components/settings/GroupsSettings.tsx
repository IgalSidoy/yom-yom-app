import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Chip, Avatar } from "@mui/material";
import { Button, Card } from "../../../../shared/components";
import { AdminSettingsLayout } from "../../../../shared/components/layout";
import { useApp } from "../../../../contexts/AppContext";
import { groupApi, Group } from "../../../../services/api";
import Notification from "../../../../shared/components/ui/Notification";

const GroupsSettings: React.FC = () => {
  const { user } = useApp();
  const [groups, setGroups] = useState<Group[]>([]);
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

  const fetchGroups = async () => {
    if (!user?.accountId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await groupApi.getGroups(user.accountId);
      setGroups(response.data.groups);
    } catch (err) {
      setError("שגיאה בטעינת רשימת הקבוצות");
      showNotification("שגיאה בטעינת רשימת הקבוצות", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.accountId) {
      fetchGroups();
    }
  }, [user?.accountId]);

  const handleCreateGroup = () => {
    // TODO: Implement create group functionality
    console.log("Create group clicked");
  };

  const handleEditGroup = (group: Group) => {
    // TODO: Implement edit group functionality
    console.log("Edit group clicked", group);
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      setLoading(true);
      await groupApi.deleteGroup(groupId);
      await fetchGroups(); // Refresh the list
      showNotification("הקבוצה נמחקה בהצלחה", "success");
    } catch (err) {
      setError("שגיאה במחיקת הקבוצה");
      showNotification("שגיאה במחיקת הקבוצה", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading && groups.length === 0) {
    return (
      <AdminSettingsLayout title="ניהול קבוצות" subtitle="טוען רשימת קבוצות...">
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
      title="ניהול קבוצות"
      subtitle={`${groups.length} קבוצות זמינות`}
    >
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
      <Card
        actions={
          <Button variant="primary" onClick={handleCreateGroup}>
            הוספת קבוצה חדשה
          </Button>
        }
      >
        <Box sx={{ p: 3 }}>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          {groups.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                אין קבוצות זמינות
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                התחל על ידי הוספת קבוצה ראשונה
              </Typography>
              <Button variant="primary" onClick={handleCreateGroup}>
                הוספת קבוצה ראשונה
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {groups.map((group) => (
                <Paper
                  key={group.id}
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
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: "primary.main",
                          width: 48,
                          height: 48,
                          fontSize: "1.2rem",
                          fontWeight: 600,
                        }}
                      >
                        {group.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 600, mb: 0.5 }}
                        >
                          {group.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {group.description || "ללא תיאור"}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <Chip
                        label="קבוצה"
                        color="secondary"
                        size="small"
                        variant="outlined"
                      />
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() => handleEditGroup(group)}
                      >
                        עריכה
                      </Button>
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => handleDeleteGroup(group.id)}
                        sx={{ color: "error.main" }}
                      >
                        מחיקה
                      </Button>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      gap: 2,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mb: 0.5 }}
                      >
                        נוצר בתאריך
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formatDate(group.created)}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mb: 0.5 }}
                      >
                        עודכן בתאריך
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formatDate(group.updated)}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </Box>
      </Card>
    </AdminSettingsLayout>
  );
};

export default GroupsSettings;
