import React from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LockIcon from "@mui/icons-material/Lock";

interface ClosedStatusPageProps {
  postType: "sleep" | "food";
  groupName: string;
  onGoBack: () => void;
  onGoToFeed: () => void;
}

const ClosedStatusPage: React.FC<ClosedStatusPageProps> = ({
  postType,
  groupName,
  onGoBack,
  onGoToFeed,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const isSleep = postType === "sleep";
  const primaryColor = isSleep ? "#9C27B0" : "#FF914D";
  const gradientColor = isSleep
    ? "linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)"
    : "linear-gradient(135deg, #FF914D 0%, #F7931E 100%)";
  const statusText = isSleep ? "דיווח שינה נסגר" : "דיווח מזון נסגר";
  const titleText = isSleep ? "דיווח השינה הושלם" : "דיווח המזון הושלם";
  const descriptionText = isSleep
    ? `דיווח השינה עבור ${groupName} הושלם ואין אפשרות לערוך אותו. הנתונים נשמרו וניתן לצפות בהם בפיד החדשות.`
    : `דיווח המזון עבור ${groupName} הושלם ואין אפשרות לערוך אותו. הנתונים נשמרו וניתן לצפות בהם בפיד החדשות.`;

  return (
    <Box
      sx={{
        // Mobile: full screen
        ...(isMobile && {
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          height: "100dvh",
          overflow: "hidden",
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
        }),
        // Desktop: apply width constraints like FeedContainer
        ...(!isMobile && {
          width: "100%",
          maxWidth: {
            sm: "600px",
            md: "700px",
            lg: "800px",
            xl: "900px",
          },
          minHeight: "calc(100vh - 150px)",
          mx: "auto",
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow: "0 6px 24px rgba(0, 0, 0, 0.12)",
          },
        }),
        bgcolor: "background.default",
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "auto",
        p: isMobile ? 2 : 4,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 3,
          pb: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Button
          variant="outlined"
          onClick={onGoBack}
          startIcon={<ArrowBackIcon />}
          sx={{
            borderColor: primaryColor,
            color: primaryColor,
            "&:hover": {
              borderColor: primaryColor,
              bgcolor: `${primaryColor}10`,
            },
          }}
        >
          חזור
        </Button>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            flex: 1,
          }}
        >
          {isSleep ? `דיווח שינה - ${groupName}` : `דיווח מזון - ${groupName}`}
        </Typography>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          maxWidth: 600,
          mx: "auto",
          width: "100%",
        }}
      >
        {/* Status Icon */}
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: gradientColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 3,
            boxShadow: `0 8px 32px ${primaryColor}30`,
          }}
        >
          <LockIcon
            sx={{
              fontSize: 60,
              color: "white",
            }}
          />
        </Box>

        {/* Status Badge */}
        <Chip
          label={statusText}
          color="warning"
          icon={<CheckCircleIcon />}
          sx={{
            mb: 3,
            fontSize: "1rem",
            fontWeight: 600,
            py: 1,
            px: 2,
            "& .MuiChip-icon": {
              fontSize: "1.2rem",
            },
          }}
        />

        {/* Title */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            mb: 2,
            fontSize: { xs: "1.75rem", sm: "2.125rem" },
          }}
        >
          {titleText}
        </Typography>

        {/* Description */}
        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            mb: 4,
            fontSize: "1.1rem",
            lineHeight: 1.6,
            maxWidth: 500,
          }}
        >
          {descriptionText}
        </Typography>

        {/* Info Card */}
        <Card
          sx={{
            width: "100%",
            maxWidth: 500,
            mb: 4,
            bgcolor: "warning.light",
            border: "1px solid",
            borderColor: "warning.main",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "warning.dark",
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <CheckCircleIcon sx={{ fontSize: "1.2rem" }} />
              מה קורה עכשיו?
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Typography
                variant="body2"
                sx={{
                  color: "warning.dark",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: "warning.dark",
                    mt: 0.7,
                    flexShrink: 0,
                  }}
                />
                {isSleep
                  ? "דיווח השינה נשמר במערכת"
                  : "דיווח המזון נשמר במערכת"}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "warning.dark",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: "warning.dark",
                    mt: 0.7,
                    flexShrink: 0,
                  }}
                />
                הורים יכולים לצפות בדיווח בפיד החדשות
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "warning.dark",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: "warning.dark",
                    mt: 0.7,
                    flexShrink: 0,
                  }}
                />
                לא ניתן לערוך או להוסיף נתונים נוספים
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            width: "100%",
            maxWidth: 400,
          }}
        >
          <Button
            variant="outlined"
            onClick={onGoBack}
            sx={{
              flex: 1,
              borderColor: primaryColor,
              color: primaryColor,
              py: 1.5,
              "&:hover": {
                borderColor: primaryColor,
                bgcolor: `${primaryColor}10`,
              },
            }}
          >
            חזור לדשבורד
          </Button>
          <Button
            variant="contained"
            onClick={onGoToFeed}
            sx={{
              flex: 1,
              bgcolor: primaryColor,
              py: 1.5,
              "&:hover": {
                bgcolor: primaryColor,
                filter: "brightness(0.9)",
              },
            }}
          >
            צפה בפיד החדשות
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ClosedStatusPage;
