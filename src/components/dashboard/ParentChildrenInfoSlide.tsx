import React from "react";
import {
  Typography,
  Card,
  CardContent,
  Box,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Skeleton,
} from "@mui/material";
import {
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import {
  ApiAttendanceStatus,
  mapApiStatusToComponentStatus,
  ATTENDANCE_STATUS_OPTIONS,
  ComponentAttendanceStatus,
} from "../../types/attendance";

interface Child {
  childId: string;
  firstName: string;
  lastName: string;
  status: string;
  timestamp: string;
  updatedByUserId: string;
  groupName: string;
  accountName: string;
  avatar?: string;
}

interface ParentChildrenInfoSlideProps {
  children: Child[];
  currentTime: Date;
  loading?: boolean;
  onRefresh?: () => void;
  onUpdateAttendance?: (childId: string, status: string) => Promise<void>;
}

const ParentChildrenInfoSlide: React.FC<ParentChildrenInfoSlideProps> = ({
  children,
  currentTime,
  loading = false,
  onRefresh,
  onUpdateAttendance,
}) => {
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [selectedChild, setSelectedChild] = React.useState<Child | null>(null);
  const [selectedStatus, setSelectedStatus] = React.useState<string>("");
  const [updateLoading, setUpdateLoading] = React.useState(false);
  const [error, setError] = React.useState<string>("");
  const getStatusIcon = (status: string) => {
    switch (status) {
      case ApiAttendanceStatus.ARRIVED:
        return <CheckCircleIcon sx={{ color: "success.main", fontSize: 20 }} />;
      case ApiAttendanceStatus.LATE:
        return <ScheduleIcon sx={{ color: "warning.main", fontSize: 20 }} />;
      case ApiAttendanceStatus.MISSING:
      case ApiAttendanceStatus.SICK:
      case ApiAttendanceStatus.VACATION:
        return <NotificationsIcon sx={{ color: "error.main", fontSize: 20 }} />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case ApiAttendanceStatus.ARRIVED:
        return "נוכח";
      case ApiAttendanceStatus.LATE:
        return "מאחר";
      case ApiAttendanceStatus.MISSING:
        return "נעדר";
      case ApiAttendanceStatus.SICK:
        return "חולה";
      case ApiAttendanceStatus.VACATION:
        return "חופשה";
      case ApiAttendanceStatus.UNREPORTED:
        return "לא דווח";
      default:
        return "לא ידוע";
    }
  };

  // Use the same mild colors as staff attendance
  const getStatusColor = (status: string) => {
    switch (status) {
      case ApiAttendanceStatus.ARRIVED:
        return "#FF9F43"; // THEME_ORANGE
      case ApiAttendanceStatus.LATE:
        return "#E3F0FF"; // MILD_BLUE
      case ApiAttendanceStatus.SICK:
        return "#FFE6A7"; // MILD_YELLOW
      case ApiAttendanceStatus.VACATION:
        return "#FFF7ED"; // MILD_BEIGE
      case ApiAttendanceStatus.MISSING:
        return "#FFE3E3"; // MILD_PINK
      case ApiAttendanceStatus.UNREPORTED:
        return "#F5F5F5"; // MILD_GRAY
      default:
        return "#F5F5F5";
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case ApiAttendanceStatus.ARRIVED:
        return "#fff"; // White text on orange
      case ApiAttendanceStatus.LATE:
        return "#3A6EA5"; // Dark blue text
      case ApiAttendanceStatus.SICK:
        return "#B88B2A"; // Dark yellow text
      case ApiAttendanceStatus.VACATION:
        return "#B88B2A"; // Dark beige text
      case ApiAttendanceStatus.MISSING:
        return "#B85C5C"; // Dark pink text
      case ApiAttendanceStatus.UNREPORTED:
        return "#888"; // Gray text
      default:
        return "#888";
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("he-IL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleEditClick = (child: Child) => {
    setSelectedChild(child);
    setSelectedStatus(child.status);
    setError("");
    setEditDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditDialogOpen(false);
    setSelectedChild(null);
    setSelectedStatus("");
    setError("");
  };

  const handleUpdateAttendance = async () => {
    if (!selectedChild || !onUpdateAttendance) return;

    setUpdateLoading(true);
    setError("");

    try {
      await onUpdateAttendance(selectedChild.childId, selectedStatus);
      handleCloseDialog();
      // Refresh the data after successful update
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      setError("שגיאה בעדכון הנוכחות. אנא נסה שוב.");
    } finally {
      setUpdateLoading(false);
    }
  };

  // Skeleton component for child cards
  const ChildCardSkeleton: React.FC = () => (
    <Card
      sx={{
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        transition: "all 0.3s ease",
        mb: 2,
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 1.5,
          }}
        >
          <Skeleton variant="circular" width={48} height={48} sx={{ mr: 2 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={28} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="40%" height={20} />
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Skeleton variant="circular" width={20} height={20} />
            <Skeleton variant="rounded" width={60} height={24} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: "text.primary",
            fontSize: { xs: "1.25rem", sm: "1.5rem" },
          }}
        >
          מידע על ילדי
        </Typography>
        {onRefresh && (
          <IconButton
            onClick={onRefresh}
            disabled={loading}
            sx={{
              color: "primary.main",
              "&:hover": {
                backgroundColor: "primary.main",
                color: "white",
              },
            }}
          >
            <RefreshIcon />
          </IconButton>
        )}
      </Box>

      {/* Date Card */}
      <Card
        sx={{
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          transition: "all 0.3s ease",
          mb: 2,
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            סיכום יומי
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatDate(currentTime)}
          </Typography>
        </CardContent>
      </Card>

      {/* Children List */}
      {loading ? (
        <>
          <ChildCardSkeleton />
          <ChildCardSkeleton />
          <ChildCardSkeleton />
        </>
      ) : (
        children.map((child) => (
          <Card
            key={child.childId}
            sx={{
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              transition: "all 0.3s ease",
              mb: 2,
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 1.5,
                }}
              >
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    mr: 2,
                    bgcolor: "primary.main",
                  }}
                  src={child.avatar}
                >
                  <PersonIcon />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {`${child.firstName} ${child.lastName}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {child.accountName} | {child.groupName}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  {getStatusIcon(child.status)}
                  <Chip
                    label={getStatusText(child.status)}
                    size="small"
                    sx={{
                      fontWeight: 500,
                      backgroundColor: getStatusColor(child.status),
                      color: getStatusTextColor(child.status),
                      border: `1px solid ${getStatusColor(child.status)}`,
                      "&:hover": {
                        backgroundColor: getStatusColor(child.status),
                        opacity: 0.9,
                      },
                    }}
                  />
                  {onUpdateAttendance && (
                    <IconButton
                      onClick={() => handleEditClick(child)}
                      size="small"
                      sx={{
                        color: "primary.main",
                        "&:hover": {
                          backgroundColor: "primary.main",
                          color: "white",
                        },
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))
      )}

      {/* Summary */}
      {!loading && children.length > 0 && (
        <Card
          sx={{
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            transition: "all 0.3s ease",
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              סיכום
            </Typography>
            <Divider sx={{ my: 1.5 }} />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                סה"כ ילדים:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {children.length}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                נוכחים היום:
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, color: "success.main" }}
              >
                {
                  children.filter(
                    (c) => c.status === ApiAttendanceStatus.ARRIVED
                  ).length
                }
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Edit Attendance Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          עדכון נוכחות -{" "}
          {selectedChild
            ? `${selectedChild.firstName} ${selectedChild.lastName}`
            : ""}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>סטטוס נוכחות</InputLabel>
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                label="סטטוס נוכחות"
              >
                {ATTENDANCE_STATUS_OPTIONS.filter(
                  (option) =>
                    option.value !== ComponentAttendanceStatus.UNREPORTED &&
                    option.value !== ComponentAttendanceStatus.MISSING
                ).map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={updateLoading}>
            ביטול
          </Button>
          <Button
            onClick={handleUpdateAttendance}
            variant="contained"
            disabled={updateLoading || !selectedStatus}
          >
            {updateLoading ? "מעדכן..." : "עדכן"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ParentChildrenInfoSlide;
