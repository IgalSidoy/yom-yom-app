import React from "react";
import {
  Box,
  Container as MUIContainer,
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import logo from "../logo.svg";
import { useLanguage } from "../contexts/LanguageContext";
// import MenuIcon from "@mui/icons-material/Menu"; // Optional

interface Props {
  children: React.ReactNode;
}

const KINDERGARTEN_NAME = "ניהול גנים יום יום";

const Container: React.FC<Props> = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { language } = useLanguage();

  return (
    <Box
      dir="rtl"
      sx={{ minHeight: "100vh", background: theme.palette.background.default }}
    >
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        sx={{ background: "none", boxShadow: "none", p: 1 }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* User Avatar */}
          <IconButton onClick={() => navigate("/login")} sx={{ p: 0 }}>
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
            sx={{ fontWeight: 700, flexGrow: 1, textAlign: "center" }}
          >
            {KINDERGARTEN_NAME}
          </Typography>
          {/* Optionally, add a menu or notification icon here */}
          <Box sx={{ width: 40, height: 40 }} /> {/* Spacer for symmetry */}
        </Toolbar>
      </AppBar>
      <MUIContainer maxWidth="xs" sx={{ mt: 8, mb: 8 }}>
        {children}
      </MUIContainer>
    </Box>
  );
};

export default Container;
