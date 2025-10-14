import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  IconButton,
  Box,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";

const KINDERGARTEN_NAME = "ניהול גנים יום יום";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const theme = useTheme();

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        background: theme.palette.background.default,
        boxShadow: "none",
        p: 1,
      }}
    >
      <Toolbar sx={{ px: { xs: 2, sm: 4 } }}>
        {/* User Avatar */}
        <IconButton onClick={() => navigate("/login")} sx={{ p: 0, ml: 2 }}>
          <Avatar
            alt="User"
            src="https://randomuser.me/api/portraits/men/32.jpg"
            sx={{ width: 40, height: 40, bgcolor: "secondary.main" }}
          />
        </IconButton>
        {/* Kindergarten Name */}
        <Typography
          variant="h6"
          color="primary"
          sx={{
            fontWeight: 700,
            flexGrow: 1,
            textAlign: "left",
            pl: 2,
          }}
        >
          {KINDERGARTEN_NAME}
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
