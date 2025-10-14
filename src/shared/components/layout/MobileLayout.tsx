import React from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import BottomNav from "./BottomNav";

export interface MobileLayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  showBottomNav = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // On desktop, just render children without any mobile-specific layout
  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div
      style={{
        height: "100vh",
        width: "100%", // Use 100% instead of 100vw to avoid horizontal scrollbar
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: showBottomNav
          ? "calc(72px + env(safe-area-inset-bottom) + 32px)"
          : "env(safe-area-inset-bottom)",
        overflow: "hidden",
      }}
    >
      {/* Main scrollable content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
          minHeight: 0,
        }}
      >
        {children}
      </div>

      {/* Fixed bottom navigation */}
      {showBottomNav && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
          }}
        >
          <BottomNav />
        </div>
      )}
    </div>
  );
};

export default MobileLayout;
