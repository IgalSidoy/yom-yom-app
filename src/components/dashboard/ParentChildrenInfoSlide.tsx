import React, { useEffect } from "react";
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
  Button,
  ButtonGroup,
  Skeleton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import StatusButtonWithPopup from "../StatusButtonWithPopup";
import {
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
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
  const [expanded, setExpanded] = React.useState(true);
  const [updateLoading, setUpdateLoading] = React.useState(false);
  const [error, setError] = React.useState<string>("");
  const [optimisticUpdates, setOptimisticUpdates] = React.useState<
    Record<string, string>
  >({});

  // Clean up optimistic updates when the actual data matches
  useEffect(() => {
    if (Object.keys(optimisticUpdates).length > 0) {
      setOptimisticUpdates((prev) => {
        const newUpdates = { ...prev };
        let hasChanges = false;

        children.forEach((child) => {
          if (
            newUpdates[child.childId] &&
            newUpdates[child.childId] === child.status
          ) {
            delete newUpdates[child.childId];
            hasChanges = true;
          }
        });

        return hasChanges ? newUpdates : prev;
      });
    }
  }, [children, optimisticUpdates]);

  const getStatusIcon = (status: string) => {
    // Handle both API status values and component status values
    switch (status) {
      case ApiAttendanceStatus.ARRIVED:
      case "Arrived":
        return <CheckCircleIcon sx={{ color: "#FF9F43", fontSize: 20 }} />;
      case ApiAttendanceStatus.LATE:
      case "Late":
        return <ScheduleIcon sx={{ color: "#3A6EA5", fontSize: 20 }} />;
      case ApiAttendanceStatus.MISSING:
      case "Missing":
      case ApiAttendanceStatus.SICK:
      case "Sick":
      case ApiAttendanceStatus.VACATION:
      case "Vacation":
        return <NotificationsIcon sx={{ color: "#B85C5C", fontSize: 20 }} />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    // Handle both API status values and component status values
    switch (status) {
      case ApiAttendanceStatus.ARRIVED:
      case "Arrived":
        return "נוכח";
      case ApiAttendanceStatus.LATE:
      case "Late":
        return "מאחר";
      case ApiAttendanceStatus.MISSING:
      case "Missing":
        return "נעדר";
      case ApiAttendanceStatus.SICK:
      case "Sick":
        return "חולה";
      case ApiAttendanceStatus.VACATION:
      case "Vacation":
        return "חופשה";
      case ApiAttendanceStatus.UNREPORTED:
      case "Unreported":
        return "לא דווח";
      default:
        return "לא ידוע";
    }
  };

  // Use the same mild colors as staff attendance
  const getStatusColor = (status: string) => {
    // Handle both API status values and component status values
    switch (status) {
      case ApiAttendanceStatus.ARRIVED:
      case "Arrived":
        return "#FF9F43"; // THEME_ORANGE
      case ApiAttendanceStatus.LATE:
      case "Late":
        return "#E3F0FF"; // MILD_BLUE
      case ApiAttendanceStatus.SICK:
      case "Sick":
        return "#FFE6A7"; // MILD_YELLOW
      case ApiAttendanceStatus.VACATION:
      case "Vacation":
        return "#FFF7ED"; // MILD_BEIGE
      case ApiAttendanceStatus.MISSING:
      case "Missing":
        return "#FFE3E3"; // MILD_PINK
      case ApiAttendanceStatus.UNREPORTED:
      case "Unreported":
        return "#F5F5F5"; // MILD_GRAY
      default:
        return "#F5F5F5";
    }
  };

  const getStatusTextColor = (status: string) => {
    // Handle both API status values and component status values
    switch (status) {
      case ApiAttendanceStatus.ARRIVED:
      case "Arrived":
        return "#fff"; // White text on orange
      case ApiAttendanceStatus.LATE:
      case "Late":
        return "#3A6EA5"; // Dark blue text
      case ApiAttendanceStatus.SICK:
      case "Sick":
        return "#B88B2A"; // Dark yellow text
      case ApiAttendanceStatus.VACATION:
      case "Vacation":
        return "#B88B2A"; // Dark beige text
      case ApiAttendanceStatus.MISSING:
      case "Missing":
        return "#B85C5C"; // Dark pink text
      case ApiAttendanceStatus.UNREPORTED:
      case "Unreported":
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

  // Convert string status to ApiAttendanceStatus enum
  const convertStringToApiStatus = (status: string): ApiAttendanceStatus => {
    switch (status) {
      case "Arrived":
        return ApiAttendanceStatus.ARRIVED;
      case "Late":
        return ApiAttendanceStatus.LATE;
      case "Sick":
        return ApiAttendanceStatus.SICK;
      case "Vacation":
        return ApiAttendanceStatus.VACATION;
      case "Missing":
        return ApiAttendanceStatus.MISSING;
      case "Unreported":
        return ApiAttendanceStatus.UNREPORTED;
      default:
        return ApiAttendanceStatus.UNREPORTED;
    }
  };

  const handleStatusUpdate = async (childId: string, status: string) => {
    if (!onUpdateAttendance) return;

    // Convert enum status to API string format for optimistic update
    const apiStatusString = (() => {
      switch (status) {
        case ApiAttendanceStatus.ARRIVED:
          return "Arrived";
        case ApiAttendanceStatus.LATE:
          return "Late";
        case ApiAttendanceStatus.SICK:
          return "Sick";
        case ApiAttendanceStatus.VACATION:
          return "Vacation";
        case ApiAttendanceStatus.MISSING:
          return "Missing";
        case ApiAttendanceStatus.UNREPORTED:
          return "Unreported";
        default:
          return status; // If it's already a string, keep it as is
      }
    })();

    // Optimistic update - immediately show the new status
    setOptimisticUpdates((prev) => ({ ...prev, [childId]: apiStatusString }));
    setError("");

    try {
      await onUpdateAttendance(childId, status);
      // Keep optimistic update until the parent refreshes the data
      // The optimistic update will be automatically removed when the new data comes in
      // and matches the optimistic update
    } catch (err) {
      // Remove optimistic update on error and show error message
      setOptimisticUpdates((prev) => {
        const newUpdates = { ...prev };
        delete newUpdates[childId];
        return newUpdates;
      });
      setError("שגיאה בעדכון הנוכחות. אנא נסה שוב.");
      // Only refresh on error to get the correct state
      if (onRefresh) {
        onRefresh();
      }
    }
  };

  // Skeleton component for child cards
  const ChildCardSkeleton: React.FC = () => (
    <Box
      sx={{
        py: { xs: 1.5, sm: 2 },
        px: { xs: 0.5, sm: 0 },
        borderBottom: "1px solid",
        borderColor: "rgba(0, 0, 0, 0.04)",
      }}
    >
      {/* Mobile Layout: Stacked vertically */}
      <Box
        sx={{
          display: { xs: "flex", sm: "flex" },
          flexDirection: { xs: "column", sm: "row-reverse" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: { xs: "flex-start", sm: "space-between" },
          gap: { xs: 1.5, sm: 1.5 },
        }}
      >
        {/* Child Name and Info */}
        <Box
          sx={{
            display: { xs: "flex", sm: "block" },
            flexDirection: { xs: "row", sm: "column" },
            alignItems: { xs: "center", sm: "stretch" },
            justifyContent: { xs: "space-between", sm: "flex-start" },
            order: { xs: 1, sm: 2 },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              minWidth: 0,
              flexShrink: 1,
            }}
          >
            <Skeleton variant="text" width="60%" height={28} sx={{ mb: 0.5 }} />
            {/* Status icon skeleton for mobile view */}
            <Box sx={{ display: { xs: "flex", sm: "none" } }}>
              <Skeleton variant="circular" width={20} height={20} />
            </Box>
          </Box>
          <Skeleton variant="text" width="40%" height={20} />
        </Box>
        {/* Status Button skeleton */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexShrink: 0,
            order: { xs: 2, sm: 1 },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <Skeleton variant="rounded" width={80} height={40} />
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      <Accordion
        expanded={expanded}
        onChange={() => setExpanded(!expanded)}
        sx={{
          boxShadow: "none",
          //   border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          "&:before": {
            display: "none",
          },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            px: 2,
            py: 1,
            "& .MuiAccordionSummary-content": {
              margin: 0,
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
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
              נוכחות
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails
          sx={{
            px: { xs: 2, sm: 2 },
            pb: 0,
            maxHeight: "calc(100vh - 350px)", // Account for navbar, swipe circles, and other UI elements
            overflow: "auto",
          }}
        >
          {/* Date Info with Refresh Button */}
          <Box
            sx={{
              py: 1,
              px: 0,
              borderBottom: "1px solid",
              borderColor: "rgba(0, 0, 0, 0.04)",
              mb: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {formatDate(currentTime)}
            </Typography>
            {onRefresh && (
              <IconButton
                onClick={onRefresh}
                disabled={loading}
                size="small"
                sx={{
                  color: "primary.main",
                  "&:hover": {
                    backgroundColor: "primary.main",
                    color: "white",
                  },
                }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            )}
          </Box>

          {/* Children List */}
          {loading ? (
            <>
              <ChildCardSkeleton />
              <ChildCardSkeleton />
              <ChildCardSkeleton />
            </>
          ) : (
            children.map((child) => {
              // Use optimistic status if available, otherwise use the actual status
              const currentStatus =
                optimisticUpdates[child.childId] || child.status;
              const isOptimistic = !!optimisticUpdates[child.childId];

              return (
                <Box
                  key={child.childId}
                  sx={{
                    py: { xs: 1.5, sm: 2 },
                    px: { xs: 0.5, sm: 0 },
                    borderBottom: "1px solid",
                    borderColor: "rgba(0, 0, 0, 0.04)",
                    "&:last-child": {
                      borderBottom: "none",
                    },
                    // Add subtle animation for optimistic updates
                    ...(isOptimistic && {
                      transition: "all 0.3s ease-in-out",
                      transform: "scale(1.02)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }),
                  }}
                >
                  {/* Mobile Layout: Stacked vertically */}
                  <Box
                    sx={{
                      display: { xs: "flex", sm: "flex" },
                      flexDirection: { xs: "column", sm: "row-reverse" },
                      alignItems: { xs: "stretch", sm: "center" },
                      justifyContent: { xs: "flex-start", sm: "space-between" },
                      gap: { xs: 1.5, sm: 1.5 },
                    }}
                  >
                    {/* Child Name and Info - Mobile: same line, Desktop: separate */}
                    <Box
                      sx={{
                        display: { xs: "flex", sm: "block" },
                        flexDirection: { xs: "row", sm: "column" },
                        alignItems: { xs: "center", sm: "stretch" },
                        justifyContent: {
                          xs: "space-between",
                          sm: "flex-start",
                        },
                        order: { xs: 1, sm: 2 },
                        width: { xs: "100%", sm: "auto" },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          minWidth: 0,
                          flexShrink: 1,
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: "text.primary",
                            textAlign: { xs: "right", sm: "right" },
                            fontSize: { xs: "1.1rem", sm: "1.25rem" },
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          noWrap
                        >
                          {`${child.firstName} ${child.lastName}`}
                        </Typography>
                        {/* Status icon for mobile view */}
                        <Box sx={{ display: { xs: "flex", sm: "none" } }}>
                          {getStatusIcon(currentStatus)}
                        </Box>
                      </Box>

                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          textAlign: { xs: "left", sm: "right" },
                          fontSize: { xs: "0.85rem", sm: "1rem" },
                          order: { xs: -1, sm: 0 },
                        }}
                      >
                        {child.accountName} | {child.groupName}
                      </Typography>
                    </Box>

                    {/* Circular Status Buttons */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexShrink: 0,
                        order: { xs: 2, sm: 1 },
                        width: { xs: "100%", sm: "auto" },
                      }}
                    >
                      <StatusButtonWithPopup
                        currentStatus={convertStringToApiStatus(currentStatus)}
                        onStatusUpdate={(status) =>
                          handleStatusUpdate(child.childId, status)
                        }
                        updateLoading={updateLoading}
                        getStatusColor={getStatusColor}
                        getStatusTextColor={getStatusTextColor}
                        getStatusText={getStatusText}
                      />
                    </Box>
                  </Box>
                </Box>
              );
            })
          )}

          {/* Summary */}
          {!loading && children.length > 0 && (
            <Box
              sx={{
                py: 2,
                px: 0,
                borderTop: "1px solid",
                borderColor: "rgba(0, 0, 0, 0.04)",
                mt: 2,
              }}
            >
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
                    children.filter((c) => {
                      const currentStatus =
                        optimisticUpdates[c.childId] || c.status;
                      return (
                        currentStatus === ApiAttendanceStatus.ARRIVED ||
                        currentStatus === "Arrived"
                      );
                    }).length
                  }
                </Typography>
              </Box>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    </>
  );
};

export default ParentChildrenInfoSlide;
