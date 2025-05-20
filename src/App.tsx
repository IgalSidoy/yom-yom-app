import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import theme from "./theme";
import Container from "./components/Container";
import Login from "./pages/Login";
import logo from "../logo.svg";
import Register from "./pages/Register";
import Feed from "./pages/Feed";
import Settings from "./pages/Settings";
import BottomNav from "./components/BottomNav";

const Dashboard: React.FC = () => (
  <div style={{ textAlign: "center", marginTop: 40 }}>
    <h2>Dashboard (placeholder)</h2>
    <p>Welcome to the kindergarten app!</p>
  </div>
);

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Container>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/register" element={<Register />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          <BottomNav />
        </Container>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
