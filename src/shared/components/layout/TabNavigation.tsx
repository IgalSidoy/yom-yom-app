import React from "react";
import { Box, Tab, Tabs, useTheme, useMediaQuery } from "@mui/material";

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactElement;
  disabled?: boolean;
}

export interface TabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  orientation?: "horizontal" | "vertical";
  variant?: "standard" | "scrollable" | "fullWidth";
  centered?: boolean;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  orientation = "horizontal",
  variant = "scrollable",
  centered = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    onTabChange(newValue);
  };

  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        position: "sticky",
        top: 0,
        zIndex: 4,
      }}
    >
      <Tabs
        value={activeTab}
        onChange={handleChange}
        orientation={orientation}
        variant={isMobile ? "scrollable" : variant}
        centered={centered && !isMobile}
        scrollButtons={isMobile ? "auto" : false}
        allowScrollButtonsMobile
        sx={{
          "& .MuiTab-root": {
            minHeight: 48,
            fontSize: "0.9rem",
            fontWeight: 500,
            textTransform: "none",
            minWidth: { xs: "auto", sm: 120 },
            px: { xs: 2, sm: 3 },
          },
          "& .MuiTabs-indicator": {
            height: 3,
            borderRadius: "3px 3px 0 0",
          },
        }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            value={tab.id}
            label={tab.label}
            icon={tab.icon}
            disabled={tab.disabled}
            iconPosition="start"
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default TabNavigation;
