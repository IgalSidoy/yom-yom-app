import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
} from "@mui/material";
import { useApp } from "../contexts/AppContext";
import { childApi, ChildWithParents } from "../services/api";

const DailyAttendance: React.FC = () => {
  const { user } = useApp();
  const [children, setChildren] = useState<ChildWithParents[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchChildren = async () => {
      if (!user?.accountId || !user?.groupId) return;
      setIsLoading(true);
      try {
        const response = await childApi.getChildrenByAccountWithGroupFilter(
          user.accountId,
          user.groupId
        );
        setChildren(response.children || []);
      } catch (error) {
        console.error("Error fetching children:", error);
        setChildren([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChildren();
  }, [user]);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        רשימת ילדים לנוכחות יומית
      </Typography>
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
          <CircularProgress />
        </Box>
      ) : children.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: "center", p: 2 }}>
          לא נמצאו ילדים לקבוצה זו
        </Typography>
      ) : (
        <List>
          {children.map((child) => (
            <ListItem key={child.id} sx={{ borderBottom: "1px solid #eee" }}>
              <ListItemText
                primary={`${child.firstName} ${child.lastName}`}
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      קבוצה: {child.groupName}
                    </Typography>
                    {child.parents && child.parents.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          הורים:
                        </Typography>
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {child.parents.map((parent) => (
                            <Chip
                              key={parent.id}
                              label={`${parent.firstName} ${parent.lastName}`}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default DailyAttendance;
