import React from "react";
import { Box, Container, Typography, AppBar, Toolbar } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  AccountBalance as AccountIcon,
  Group as GroupIcon,
  People as PeopleIcon,
  ChildCare as ChildIcon,
  Security as SecurityIcon,
  Notifications as NotificationIcon,
  Settings as SettingsIcon,
  Description as DocumentIcon,
  Assessment as ReportIcon,
  Palette as ThemeIcon,
} from "@mui/icons-material";

import SettingsCard from "../components/settings/SettingsCard";
import SettingsSection from "../components/settings/SettingsSection";
import { ROUTES } from "../../../config/routes";

const AdminSettingsPageNew: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "background.default",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Toolbar>
          <Typography
            variant={isMobile ? "h6" : "h5"}
            sx={{ fontWeight: 600, color: "text.primary" }}
          >
            הגדרות מנהל
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              mb: 2,
              fontSize: { xs: "1.75rem", sm: "2rem" },
            }}
          >
            הגדרות מנהל
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              fontSize: "1.1rem",
              maxWidth: "600px",
            }}
          >
            ניהול הגדרות המערכת, משתמשים, סניפים וכל מה שצריך כדי להפעיל את הגן
            שלך
          </Typography>
        </Box>

        {/* SYSTEM Section */}
        <SettingsSection
          title="מערכת"
          description="הגדרות מערכת כלליות וניהול ארגון"
        >
          <SettingsCard
            title="פרופיל אישי"
            description="עדכון פרטי המשתמש והגדרות אישיות"
            icon={<PersonIcon />}
            to={ROUTES.ADMIN_PROFILE}
            color="primary"
          />
          <SettingsCard
            title="פרטי הגן"
            description="ניהול פרטי הארגון והגדרות הגן"
            icon={<BusinessIcon />}
            to={ROUTES.ADMIN_ORGANIZATION}
            color="info"
          />
          <SettingsCard
            title="ניהול סניפים"
            description="הוספה, עריכה ומחיקה של סניפי הגן"
            icon={<AccountIcon />}
            to={ROUTES.ADMIN_ACCOUNTS}
            color="secondary"
          />
          <SettingsCard
            title="אבטחה"
            description="הגדרות אבטחה, סיסמאות ואימות"
            icon={<SecurityIcon />}
            to="#"
            color="error"
          />
        </SettingsSection>

        {/* MANAGEMENT Section */}
        <SettingsSection
          title="ניהול"
          description="ניהול משתמשים, קבוצות וילדים"
        >
          <SettingsCard
            title="ניהול משתמשים"
            description="הוספה, עריכה ומחיקה של משתמשי המערכת"
            icon={<PeopleIcon />}
            to={ROUTES.ADMIN_USERS}
            color="success"
          />
          <SettingsCard
            title="ניהול קבוצות"
            description="יצירה וניהול של קבוצות ילדים"
            icon={<GroupIcon />}
            to={ROUTES.ADMIN_GROUPS}
            color="warning"
          />
          <SettingsCard
            title="ניהול ילדים"
            description="רישום וניהול פרטי הילדים"
            icon={<ChildIcon />}
            to={ROUTES.ADMIN_CHILDREN}
            color="info"
          />
          <SettingsCard
            title="התראות"
            description="הגדרות התראות ועדכונים"
            icon={<NotificationIcon />}
            to="#"
            color="primary"
          />
        </SettingsSection>

        {/* REPORTS Section */}
        <SettingsSection
          title="דוחות והגדרות נוספות"
          description="דוחות, מסמכים והגדרות מתקדמות"
        >
          <SettingsCard
            title="דוחות"
            description="יצירת דוחות וניתוח נתונים"
            icon={<ReportIcon />}
            to="#"
            color="secondary"
          />
          <SettingsCard
            title="מסמכים"
            description="ניהול מסמכים וקבצים"
            icon={<DocumentIcon />}
            to="#"
            color="info"
          />
          <SettingsCard
            title="עיצוב"
            description="התאמת עיצוב המערכת והנושא"
            icon={<ThemeIcon />}
            to="#"
            color="warning"
          />
          <SettingsCard
            title="הגדרות מתקדמות"
            description="הגדרות נוספות ומתקדמות של המערכת"
            icon={<SettingsIcon />}
            to="#"
            color="primary"
          />
        </SettingsSection>
      </Container>
    </Box>
  );
};

export default AdminSettingsPageNew;
