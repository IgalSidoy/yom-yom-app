import React from "react";
import { Typography, Box, useTheme, useMediaQuery } from "@mui/material";

const Feed: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        height: { xs: "calc(100vh - 72px)", sm: "100vh" }, // Full height minus bottom nav on mobile
        bgcolor: "background.default",
        p: { xs: 1, sm: 2, md: 3 },
        dir: "rtl",
        overflow: "hidden", // Prevent body scroll on mobile
      }}
    >
      {/* Mobile Container */}
      {isMobile && (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            bgcolor: "background.paper",
            borderRadius: 0,
            boxShadow: "none",
            overflow: "hidden",
            border: "none",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Mobile Header */}
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                textAlign: "center",
                fontSize: "1.25rem",
              }}
            >
              הזנת חדשות
            </Typography>
          </Box>

          {/* Mobile Content */}
          <Box
            sx={{
              p: 2,
              flex: 1,
              bgcolor: "background.default",
              overflow: "auto",
            }}
          >
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                textAlign: "center",
                mt: 4,
              }}
            >
              תוכן הזנת חדשות למובייל
            </Typography>
          </Box>
        </Box>
      )}

      {/* Desktop/Tablet Container */}
      {!isMobile && (
        <Box
          sx={{
            maxWidth: { sm: "600px", md: "800px", lg: "1000px" },
            height: "calc(100vh - 150px)", // Full height minus bottom navbar
            mx: "auto",
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Desktop Header */}
          <Box
            sx={{
              p: { sm: 3, md: 4 },
              borderBottom: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                textAlign: "center",
                fontSize: { sm: "1.5rem", md: "1.75rem" },
              }}
            >
              הזנת חדשות
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                textAlign: "center",
                mt: 1,
                fontSize: { sm: "0.875rem", md: "1rem" },
              }}
            >
              צפה ועדכן חדשות ומידע חשוב
            </Typography>
          </Box>

          {/* Desktop Content */}
          <Box
            sx={{
              p: { sm: 3, md: 4 },
              flex: 1,
              bgcolor: "background.default",
              overflow: "auto",
            }}
          >
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                textAlign: "center",
                mt: 4,
                fontSize: { sm: "1rem", md: "1.125rem" },
              }}
            >
              תוכן הזנת חדשות למחשב וטאבלט
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Feed;
