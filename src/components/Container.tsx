import React from "react";
import {
  Box,
  Container as MUIContainer,
  AppBar,
  Toolbar,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import logo from "../logo.svg";

interface Props {
  children: React.ReactNode;
}

const Container: React.FC<Props> = ({ children }) => {
  const theme = useTheme();
  return (
    <Box
      dir="rtl"
      sx={{ minHeight: "100vh", background: theme.palette.background.default }}
    >
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        sx={{ background: "none", boxShadow: "none", p: 2 }}
      >
        <Toolbar sx={{ justifyContent: "center" }}>
          <img src={logo} alt="logo" style={{ height: 48, marginLeft: 16 }} />
          <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
            גננת
          </Typography>
        </Toolbar>
      </AppBar>
      <MUIContainer maxWidth="xs" sx={{ mt: 8 }}>
        {children}
      </MUIContainer>
    </Box>
  );
};

export default Container;
