import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import theme from "./theme";
import Container from "./components/Container";
import Login from "./pages/Login";
import logo from "../logo.svg";
import Onboarding from "./pages/Onboarding";
import Feed from "./pages/Feed";
import Settings from "./pages/Settings";
import BottomNav from "./components/BottomNav";
import Dashboard from "./pages/Dashboard";

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Container>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <BottomNav />
        </Container>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
