import React, { useState, useEffect } from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import Sidebar from "./Sidebar";

export interface DesktopLayoutProps {
  children: React.ReactNode;
}

const DesktopLayout: React.FC<DesktopLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // Don't render on mobile - MobileLayout will handle that
  if (isMobile) {
    return <>{children}</>;
  }

  const handleSidebarToggle = (isExpanded: boolean) => {
    setSidebarExpanded(isExpanded);
  };

  const sidebarWidth = sidebarExpanded ? 240 : 72;

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "background.default",
      }}
    >
      {/* Sidebar */}
      <Sidebar onToggle={handleSidebarToggle} />

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          marginLeft: `${sidebarWidth}px`,
          transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          minHeight: "100vh",
          backgroundColor: "background.default",
        }}
      >
        {/* Top Spacer for potential header */}
        <Box sx={{ height: 0 }} />

        {/* Main Content */}
        <Box
          sx={{
            p: { md: 3, lg: 4 },
            minHeight: "100vh",
            backgroundColor: "background.default",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default DesktopLayout;
