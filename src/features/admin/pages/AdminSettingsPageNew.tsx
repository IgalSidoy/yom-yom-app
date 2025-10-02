import React from "react";
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import MobileLayout from "../../../shared/components/layout/MobileLayout";
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
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/admin/dashboard");
  };

  return (
    <MobileLayout showBottomNav={true}>
      {/* Sticky Header */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "background.default",
          borderBottom: 1,
          borderColor: "divider",
          flexShrink: 0,
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2 } }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              minHeight: { xs: 56, sm: 64 },
              px: { xs: 1, sm: 0 },
            }}
          >
            {/* Left section - Empty */}
            <Box sx={{ flex: 1 }} />

            {/* Center section - Title */}
            <Box sx={{ flex: 1, textAlign: "center" }}>
              <Typography
                variant={isMobile ? "h5" : "h4"}
                sx={{
                  fontWeight: 600,
                  color: "text.primary",
                  fontSize: { xs: "1.5rem", sm: "1.75rem" },
                }}
              >
                הגדרות
              </Typography>
            </Box>

            {/* Right section - Back button */}
            <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
              <IconButton
                onClick={handleBack}
                sx={{
                  color: "text.primary",
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
                aria-label="חזור"
              >
                <ArrowBackIcon />
              </IconButton>
            </Box>
          </Box>
        </Container>
      </AppBar>

      {/* Content */}
      <Container
        maxWidth="lg"
        sx={{
          py: { xs: 2, sm: 4 },
          px: { xs: 1, sm: 2 },
          width: "100%",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <Box
          sx={{
            maxWidth: "100%",
            mx: "auto",
            width: "100%",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            "& > *": {
              width: "100%",
            },
          }}
        >
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
        </Box>
      </Container>
    </MobileLayout>
  );
};

export default AdminSettingsPageNew;
