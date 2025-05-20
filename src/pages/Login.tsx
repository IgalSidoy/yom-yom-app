import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [lang, setLang] = useState("he");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleLang = (_: any, newLang: string) => {
    if (newLang) setLang(newLang);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add login logic
    navigate("/dashboard");
  };

  return (
    <Box
      component="form"
      onSubmit={handleLogin}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
      }}
    >
      <ToggleButtonGroup
        value={lang}
        exclusive
        onChange={handleLang}
        sx={{ mb: 2 }}
      >
        <ToggleButton value="he">עברית</ToggleButton>
        <ToggleButton value="ru">Русский</ToggleButton>
        <ToggleButton value="en">English</ToggleButton>
      </ToggleButtonGroup>
      <TextField
        label="אימייל"
        variant="outlined"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        sx={{ background: "#fff", borderRadius: 2 }}
        inputProps={{ style: { textAlign: "right" } }}
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        size="large"
        fullWidth
        sx={{ borderRadius: 3, fontWeight: 700, fontSize: 20, py: 1.5 }}
      >
        כניסה
      </Button>
      <Button
        variant="outlined"
        color="primary"
        fullWidth
        sx={{ borderRadius: 3, fontWeight: 700, fontSize: 16 }}
        onClick={() => navigate("/register")}
      >
        הרשמה
      </Button>
    </Box>
  );
};

export default Login;
