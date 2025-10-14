import React from "react";
import { Box, Typography, Avatar, Chip } from "@mui/material";
import { Bedtime } from "@mui/icons-material";
import dayjs from "dayjs";
import { FeedPost as FeedPostType } from "../../../../types/posts";
import {
  UI_COLORS,
  POST_TYPE_COLORS,
  getChildColor,
  getContrastTextColor,
} from "../../../../config/colors";
import SleepTimer from "../../../../shared/components/ui/SleepTimer";

const getStatusText = (status: string) => {
  switch (status) {
    case "Sleeping":
    case "Asleep":
      return "ישן";
    case "Awake":
      return "ער";
    default:
      return "לא ידוע";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Sleeping":
    case "Asleep":
      return "secondary";
    case "Awake":
      return "info";
    default:
      return "default";
  }
};

interface SleepPostProps {
  post: FeedPostType;
  isClosed?: boolean;
}

const SleepPost: React.FC<SleepPostProps> = ({ post, isClosed = false }) => {
  const sleepData = post.metadata.sleepMetadata;
  if (!sleepData) return null;

  const sleepingCount = sleepData.childrenSleepData.filter(
    (child) => child.status === "Sleeping" || child.status === "Asleep"
  ).length;
  const awakeCount = sleepData.childrenSleepData.filter(
    (child) => child.status === "Awake"
  ).length;
  const totalCount = sleepData.childrenSleepData.length;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 2,
          p: 2,
          background: POST_TYPE_COLORS.SLEEP_POST.gradient,
          color: UI_COLORS.TEXT_WHITE,
          borderRadius: 2,
        }}
      >
        <Avatar
          sx={{
            bgcolor: UI_COLORS.AVATAR_OVERLAY,
            color: UI_COLORS.TEXT_WHITE,
          }}
        >
          <Bedtime />
        </Avatar>
        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: UI_COLORS.TEXT_WHITE }}
          >
            דיווח שינה - {post.groupName}
          </Typography>
          <Typography variant="caption" sx={{ color: UI_COLORS.TEXT_WHITE_90 }}>
            {dayjs(post.activityDate).format("DD/MM/YYYY")}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr", // Full width on mobile
            sm: "repeat(auto-fit, minmax(280px, 1fr))", // Responsive grid on larger screens
            md: "repeat(auto-fit, minmax(300px, 1fr))", // Better desktop spacing
          },
          gap: { xs: 1, sm: 1.5, md: 2 },
        }}
      >
        {sleepData.childrenSleepData.map((child) => {
          const childName =
            `${child.childFirstName} ${child.childLastName}`.trim();
          const childColor = getChildColor(child.childId);
          const textColor = getContrastTextColor(childColor);
          const isSleeping =
            child.status === "Sleeping" || child.status === "Asleep";

          return (
            <Box
              key={child.childId}
              sx={{
                mb: 1,
                border: `1px solid ${childColor}`,
                borderRadius: 1,
                backgroundColor: `${childColor}10`,
                p: { xs: 1, sm: 1.5 },
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: childColor,
                      color: textColor,
                      fontSize: "0.875rem",
                      fontWeight: "bold",
                    }}
                  >
                    {childName.charAt(0)}
                  </Avatar>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: "text.primary",
                      maxWidth: { xs: "100%", sm: 120 },
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {childName}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip
                    label={getStatusText(child.status)}
                    size="small"
                    color={getStatusColor(child.status) as any}
                    variant="outlined"
                    sx={{ fontSize: "0.75rem" }}
                  />
                </Box>
              </Box>
              <Box sx={{ mt: 1 }}>
                <SleepTimer
                  startTime={child.startTimestamp}
                  endTime={child.endTimestamp}
                  isSleeping={isSleeping}
                  activityDate={post.activityDate}
                  size="small"
                  animationIntensity="subtle"
                  showPulse={!isClosed && isSleeping}
                />
              </Box>
              {child.comment && child.comment.trim() && (
                <Typography
                  variant="caption"
                  sx={{
                    mt: 1,
                    display: "block",
                    color: "text.secondary",
                    fontStyle: "italic",
                    lineHeight: 1.4,
                  }}
                >
                  {child.comment}
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Summary Statistics */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(auto-fit, minmax(120px, 1fr))",
            sm: "repeat(3, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: { xs: 1.5, sm: 2, md: 2.5 },
          mt: 3,
        }}
      >
        <Box
          sx={{
            bgcolor: "success.light",
            color: "success.contrastText",
            borderRadius: 2,
            p: { xs: 2, sm: 2.5 },
            textAlign: "center",
            border: "1px solid",
            borderColor: "success.main",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
            },
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "1.75rem", sm: "2rem" },
              lineHeight: 1,
              mb: 0.5,
            }}
          >
            {sleepingCount}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              fontSize: "0.8rem",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            ישנים
          </Typography>
        </Box>

        <Box
          sx={{
            bgcolor: "warning.light",
            color: "warning.contrastText",
            borderRadius: 2,
            p: { xs: 2, sm: 2.5 },
            textAlign: "center",
            border: "1px solid",
            borderColor: "warning.main",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 4px 12px rgba(255, 152, 0, 0.3)",
            },
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "1.75rem", sm: "2rem" },
              lineHeight: 1,
              mb: 0.5,
            }}
          >
            {awakeCount}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              fontSize: "0.8rem",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            ערים
          </Typography>
        </Box>

        <Box
          sx={{
            bgcolor: "info.light",
            color: "info.contrastText",
            borderRadius: 2,
            p: { xs: 2, sm: 2.5 },
            textAlign: "center",
            border: "1px solid",
            borderColor: "info.main",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 4px 12px rgba(33, 150, 243, 0.3)",
            },
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "1.75rem", sm: "2rem" },
              lineHeight: 1,
              mb: 0.5,
            }}
          >
            {totalCount}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              fontSize: "0.8rem",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            סה"כ
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SleepPost;
