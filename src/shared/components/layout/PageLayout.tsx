import React from "react";
import { Box, Container, Typography, AppBar, Toolbar } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";

export interface PageLayoutProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
  showHeader?: boolean;
  stickyHeader?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  subtitle,
  children,
  maxWidth = "lg",
  showHeader = true,
  stickyHeader = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {showHeader && (title || subtitle) && (
        <AppBar
          position={stickyHeader ? "sticky" : "static"}
          elevation={0}
          sx={{
            bgcolor: "background.default",
            borderBottom: 1,
            borderColor: "divider",
            zIndex: stickyHeader ? 5 : 1,
          }}
        >
          <Toolbar>
            <Box sx={{ flexGrow: 1 }}>
              {title && (
                <Typography
                  variant={isMobile ? "h6" : "h5"}
                  component="h1"
                  sx={{
                    fontWeight: 600,
                    color: "text.primary",
                  }}
                >
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    mt: 0.5,
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Toolbar>
        </AppBar>
      )}

      <Container maxWidth={maxWidth} sx={{ py: 3 }}>
        {children}
      </Container>
    </Box>
  );
};

export default PageLayout;
