import React from "react";
import { Typography, Card, CardContent, Chip, Box } from "@mui/material";

const AdditionalInfoSlide: React.FC = () => {
  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          mb: 2,
          color: "text.primary",
          fontSize: { xs: "1.25rem", sm: "1.5rem" },
          flexShrink: 0,
        }}
      >
        מידע נוסף
      </Typography>

      {/* Scrollable Container */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          pr: 1,
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(0,0,0,0.2)",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "rgba(0,0,0,0.3)",
          },
        }}
      >
        <Card
          sx={{
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            transition: "all 0.3s ease",
            mb: 2,
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            },
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              הוראות שימוש
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              החלק ימינה או שמאלה כדי לנווט בין הסעיפים השונים
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              <Chip label="פעולות מהירות" size="small" color="primary" />
              <Chip label="סטטיסטיקות" size="small" color="secondary" />
              <Chip label="מידע נוסף" size="small" color="default" />
            </Box>
          </CardContent>
        </Card>

        <Card
          sx={{
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            transition: "all 0.3s ease",
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              תמיכה טכנית
            </Typography>
            <Typography variant="body2" color="text.secondary">
              אם אתה נתקל בבעיות, אנא פנה למנהל המערכת
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default AdditionalInfoSlide;
