import React from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import Container from "../Container";

interface DashboardContainerProps {
  children: React.ReactNode;
  className?: string;
}

const DashboardContainer: React.FC<DashboardContainerProps> = ({
  children,
  className,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Container>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          p: { xs: 2, sm: 3, md: 4 },
          dir: "rtl",
          overflow: "hidden", // Prevent scroll during swipe
        }}
      >
        {/* Mobile Container */}
        {isMobile && (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {children}
          </Box>
        )}

        {/* Desktop/Tablet Container */}
        {!isMobile && (
          <Box
            sx={{
              width: "100%",
              maxWidth: {
                sm: "100vw",
                md: "100vw",
                lg: "100vw",
                xl: "100vw",
              },
              mx: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {children}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default DashboardContainer;
