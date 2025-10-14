import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  useParams,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { AdminSettingsLayout } from "../../../../shared/components/layout";
import { useApp } from "../../../../contexts/AppContext";
import {
  childApi,
  ChildWithParents,
  accountApi,
  Account,
  groupApi,
  Group,
  userApi,
  User,
} from "../../../../services/api";
import Notification from "../../../../shared/components/ui/Notification";
import { THEME_COLORS } from "../../../../config/colors";

interface ChildFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  accountId: string;
  groupId: string;
  parent1Id: string;
  parent2Id: string;
}

const ChildEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useApp();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const isEditMode = id && id !== "new";
  const accountIdFromUrl = searchParams.get("accountId");

  // Get child data from navigation state (for edit mode) or initialize empty (for create mode)
  const childFromState = location.state?.child as ChildWithParents | undefined;

  const [childData, setChildData] = useState<ChildFormData>({
    firstName: childFromState?.firstName || "",
    lastName: childFromState?.lastName || "",
    dateOfBirth: childFromState?.dateOfBirth || "",
    accountId: childFromState?.accountId || accountIdFromUrl || "",
    groupId: (() => {
      // Validate groupId - if it's actually a parent ID, reset it
      const groupId = childFromState?.groupId || "";
      const parentIds = childFromState?.parents?.map((p) => p.id) || [];
      return parentIds.includes(groupId) ? "" : groupId;
    })(),
    parent1Id: childFromState?.parents?.[0]?.id || "",
    parent2Id: childFromState?.parents?.[1]?.id || "",
  });

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [parents, setParents] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  const [parent1SearchInput, setParent1SearchInput] = useState("");
  const [parent2SearchInput, setParent2SearchInput] = useState("");

  const showNotification = useCallback(
    (
      message: string,
      severity: "success" | "error" | "info" | "warning" = "success"
    ) => {
      setNotification({
        open: true,
        message,
        severity,
      });
    },
    []
  );

  const handleCloseNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, open: false }));
  }, []);

  const fetchAccounts = useCallback(async () => {
    try {
      const response = await accountApi.getAccounts();
      setAccounts(response.data.accounts);
    } catch (err) {
      setError("שגיאה בטעינת רשימת הסניפים");
      showNotification("שגיאה בטעינת רשימת הסניפים", "error");
    }
  }, [showNotification]);

  const fetchGroups = useCallback(
    async (accountId: string) => {
      if (!accountId) return;

      try {
        const response = await groupApi.getGroups(accountId);
        setGroups(response.data.groups);
      } catch (err) {
        setError("שגיאה בטעינת רשימת הקבוצות");
        showNotification("שגיאה בטעינת רשימת הקבוצות", "error");
      }
    },
    [showNotification]
  );

  const fetchParents = useCallback(async () => {
    try {
      const response = await userApi.getUsers();
      // Filter for parent users only
      const parentUsers = response.data.users.filter(
        (user) => user.role.toLowerCase() === "parent"
      );
      setParents(parentUsers);
    } catch (err) {
      setError("שגיאה בטעינת רשימת ההורים");
      showNotification("שגיאה בטעינת רשימת ההורים", "error");
    }
  }, [showNotification]);

  useEffect(() => {
    fetchAccounts();
    fetchParents();
  }, [fetchAccounts, fetchParents]);

  useEffect(() => {
    if (childData.accountId) {
      fetchGroups(childData.accountId);
    }
  }, [childData.accountId, fetchGroups]);

  const handleInputChange = useCallback(
    (field: keyof ChildFormData, value: any) => {
      setChildData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);

      const childPayload = {
        firstName: childData.firstName,
        lastName: childData.lastName,
        dateOfBirth: childData.dateOfBirth,
        accountId: childData.accountId,
        groupId: childData.groupId || undefined,
        parents: [childData.parent1Id, childData.parent2Id].filter(
          (id) => id !== ""
        ),
      };

      if (isEditMode && id) {
        await childApi.updateChild(id, childPayload);
        showNotification("הילד עודכן בהצלחה", "success");
      } else {
        await childApi.createChild(childPayload);
        showNotification("הילד נוצר בהצלחה", "success");
      }

      // Navigate back to children settings
      const backUrl = childData.accountId
        ? `/admin/settings/children?accountId=${childData.accountId}`
        : "/admin/settings/children";
      navigate(backUrl);
    } catch (err) {
      setError("שגיאה בשמירת הילד");
      showNotification("שגיאה בשמירת הילד", "error");
    } finally {
      setSaving(false);
    }
  }, [childData, isEditMode, id, showNotification, navigate]);

  const handleCancel = useCallback(() => {
    const backUrl = childData.accountId
      ? `/admin/settings/children?accountId=${childData.accountId}`
      : "/admin/settings/children";
    navigate(backUrl);
  }, [navigate, childData.accountId]);

  // Update parent IDs when parents are loaded (for edit mode)
  useEffect(() => {
    if (isEditMode && childFromState?.parents && parents.length > 0) {
      const parent1Id = childFromState.parents[0]?.id || "";
      const parent2Id = childFromState.parents[1]?.id || "";

      if (
        parent1Id !== childData.parent1Id ||
        parent2Id !== childData.parent2Id
      ) {
        setChildData((prev) => ({
          ...prev,
          parent1Id,
          parent2Id,
        }));
      }
    }
  }, [isEditMode, childFromState?.parents, parents.length]);

  const selectedParent1 = parents.find(
    (parent) => parent.id === childData.parent1Id
  );
  const selectedParent2 = parents.find(
    (parent) => parent.id === childData.parent2Id
  );

  // Filter parents to exclude the already selected parent from the other input
  const availableParentsForParent1 = parents.filter(
    (parent) => parent.id !== childData.parent2Id
  );
  const availableParentsForParent2 = parents.filter(
    (parent) => parent.id !== childData.parent1Id
  );

  const selectedAccount = accounts.find(
    (acc) => acc.id === childData.accountId
  );
  const selectedGroup = groups.find((group) => group.id === childData.groupId);

  const pageTitle = isEditMode ? "עריכת ילד" : "הוספת ילד חדש";
  const pageSubtitle = isEditMode
    ? "עדכון פרטי הילד הקיים"
    : "הזן את פרטי הילד החדש";

  // Determine the correct back path
  const backPath = childData.accountId
    ? `/admin/settings/children?accountId=${childData.accountId}`
    : "/admin/settings/children";

  return (
    <AdminSettingsLayout
      title={pageTitle}
      subtitle={pageSubtitle}
      backPath={backPath}
    >
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />

      <Paper
        sx={{
          p: 4,
          pb: { xs: 6, sm: 8, md: 10 }, // Responsive bottom padding: 24px mobile, 32px tablet, 40px desktop
          borderRadius: 3,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
        }}
      >
        {error && (
          <Typography color="error" sx={{ mb: 3 }}>
            {error}
          </Typography>
        )}

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
          {/* Account Selection */}
          <FormControl fullWidth>
            <InputLabel>סניף</InputLabel>
            <Select
              value={childData.accountId}
              onChange={(e) => handleInputChange("accountId", e.target.value)}
              label="סניף"
              required
            >
              {accounts.map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  {account.branchName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Group Selection */}
          <FormControl fullWidth>
            <InputLabel>קבוצה</InputLabel>
            <Select
              value={childData.groupId || ""}
              onChange={(e) => handleInputChange("groupId", e.target.value)}
              label="קבוצה"
              disabled={!childData.accountId || groups.length === 0}
            >
              <MenuItem value="">
                <em>בחר קבוצה</em>
              </MenuItem>
              {groups.map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  {group.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Parent 1 Selection */}
          <Autocomplete
            inputValue={parent1SearchInput}
            onInputChange={(event, newInputValue) => {
              setParent1SearchInput(newInputValue);
            }}
            options={availableParentsForParent1}
            getOptionLabel={(option) =>
              option.firstName && option.lastName
                ? `${option.firstName} ${option.lastName}`
                : option.email
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={selectedParent1 || null}
            onChange={(event, newValue) => {
              handleInputChange("parent1Id", newValue?.id || "");
            }}
            filterOptions={(options, { inputValue }) => {
              const filtered = options.filter((option) => {
                const fullName = `${option.firstName || ""} ${
                  option.lastName || ""
                }`.toLowerCase();
                const email = (option.email || "").toLowerCase();
                const searchLower = inputValue.toLowerCase();
                return (
                  fullName.includes(searchLower) || email.includes(searchLower)
                );
              });
              return filtered;
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="הורה ראשון"
                placeholder={
                  parents.length === 0 ? "טוען הורים..." : "חיפוש הורה ראשון..."
                }
                helperText={parents.length === 0 ? "טוען רשימת הורים..." : ""}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      {(parent1SearchInput || selectedParent1) && (
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInputChange("parent1Id", "");
                            setParent1SearchInput("");
                          }}
                          edge="end"
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      )}
                    </InputAdornment>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                {option.firstName && option.lastName
                  ? `${option.firstName} ${option.lastName}`
                  : option.email}
              </li>
            )}
            noOptionsText="לא נמצאו הורים התואמים לחיפוש"
            loadingText="טוען הורים..."
          />

          {/* Parent 2 Selection */}
          <Autocomplete
            inputValue={parent2SearchInput}
            onInputChange={(event, newInputValue) => {
              setParent2SearchInput(newInputValue);
            }}
            options={availableParentsForParent2}
            getOptionLabel={(option) =>
              option.firstName && option.lastName
                ? `${option.firstName} ${option.lastName}`
                : option.email
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={selectedParent2 || null}
            onChange={(event, newValue) => {
              handleInputChange("parent2Id", newValue?.id || "");
            }}
            filterOptions={(options, { inputValue }) => {
              const filtered = options.filter((option) => {
                const fullName = `${option.firstName || ""} ${
                  option.lastName || ""
                }`.toLowerCase();
                const email = (option.email || "").toLowerCase();
                const searchLower = inputValue.toLowerCase();
                return (
                  fullName.includes(searchLower) || email.includes(searchLower)
                );
              });
              return filtered;
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="הורה שני (אופציונלי)"
                placeholder={
                  parents.length === 0 ? "טוען הורים..." : "חיפוש הורה שני..."
                }
                helperText={parents.length === 0 ? "טוען רשימת הורים..." : ""}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      {(parent2SearchInput || selectedParent2) && (
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInputChange("parent2Id", "");
                            setParent2SearchInput("");
                          }}
                          edge="end"
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      )}
                    </InputAdornment>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                {option.firstName && option.lastName
                  ? `${option.firstName} ${option.lastName}`
                  : option.email}
              </li>
            )}
            noOptionsText="לא נמצאו הורים התואמים לחיפוש"
            loadingText="טוען הורים..."
          />

          {/* Validation Message for Duplicate Parents */}
          {childData.parent1Id &&
            childData.parent2Id &&
            childData.parent1Id === childData.parent2Id && (
              <Typography color="error" variant="body2" sx={{ mt: -1, mb: 1 }}>
                לא ניתן לבחור את אותו הורה פעמיים
              </Typography>
            )}

          {/* First Name */}
          <TextField
            fullWidth
            label="שם פרטי"
            value={childData.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            placeholder="הזן את השם הפרטי"
            required
          />

          {/* Last Name */}
          <TextField
            fullWidth
            label="שם משפחה"
            value={childData.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            placeholder="הזן את שם המשפחה"
            required
          />

          {/* Date of Birth */}
          <DatePicker
            label="תאריך לידה"
            value={childData.dateOfBirth ? dayjs(childData.dateOfBirth) : null}
            onChange={(newValue) => {
              handleInputChange(
                "dateOfBirth",
                newValue?.format("YYYY-MM-DD") || ""
              );
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                required: true,
                sx: {
                  "& .MuiInputLabel-root": {
                    fontSize: "0.95rem",
                  },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "primary.main",
                    },
                  },
                },
              },
            }}
          />

          {/* Additional Info for Edit Mode */}
          {isEditMode && childFromState && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: "background.default",
                borderRadius: 1,
              }}
            ></Box>
          )}
        </Box>

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mt: 0,
            justifyContent: "flex-end",
          }}
        >
          <Button
            onClick={handleCancel}
            variant="outlined"
            disabled={saving}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              py: 1.2,
            }}
          >
            ביטול
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={
              saving ||
              !Boolean(childData.firstName) ||
              !Boolean(childData.lastName) ||
              !Boolean(childData.dateOfBirth) ||
              !Boolean(childData.accountId) ||
              (!!childData.parent1Id &&
                !!childData.parent2Id &&
                childData.parent1Id === childData.parent2Id)
            }
            startIcon={saving ? <CircularProgress size={20} /> : null}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              py: 1.2,
              boxShadow: "0 2px 8px rgba(255, 145, 77, 0.3)",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(255, 145, 77, 0.4)",
                transform: "translateY(-1px)",
              },
            }}
          >
            {saving ? "שומר..." : "שמירה"}
          </Button>
        </Box>
      </Paper>
    </AdminSettingsLayout>
  );
};

export default ChildEditPage;
