import React from "react";
import { Box, Typography } from "@mui/material";
import MobileLayout from "../../shared/components/layout/MobileLayout";

const AdminSettings: React.FC = () => {
  return (
    <MobileLayout showBottomNav={true}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          הגדרות מנהל - Test
        </Typography>

        {/* Simple test content */}
        {Array.from({ length: 50 }, (_, i) => (
          <Box
            key={i}
            sx={{
              p: 2,
              mb: 2,
              bgcolor: "background.paper",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="h6">Test Content {i + 1}</Typography>
            <Typography variant="body2" color="text.secondary">
              This is test content number {i + 1}. If you can see this and
              scroll through all 50 items, then scrolling is working!
            </Typography>
          </Box>
        ))}
      </Box>
    </MobileLayout>
  );
};

export default AdminSettings;
