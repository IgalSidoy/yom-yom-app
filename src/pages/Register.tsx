import React, { useState } from "react";
import { Box, Button, TextField, MenuItem, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const roles = [
  { value: "Admin", label: "Admin" },
  { value: "Staff", label: "Staff" },
  { value: "Parent", label: "Parent" },
];

const Register: React.FC = () => {
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    mobile: "",
    accountId: "",
    role: "Parent",
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const baseUrl = process.env.REACT_APP_API_BASE_URL;
      const response = await fetch(`${baseUrl}/api/v1/User`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error("Registration failed");
      navigate("/login");
    } catch (err) {
      alert("Registration failed");
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
    >
      <Typography variant="h5" align="center">
        הרשמה
      </Typography>
      <TextField
        name="email"
        label="אימייל"
        value={form.email}
        onChange={handleChange}
        required
      />
      <TextField
        name="firstName"
        label="שם פרטי"
        value={form.firstName}
        onChange={handleChange}
        required
      />
      <TextField
        name="lastName"
        label="שם משפחה"
        value={form.lastName}
        onChange={handleChange}
        required
      />
      <TextField
        name="mobile"
        label="נייד"
        value={form.mobile}
        onChange={handleChange}
        required
      />
      <TextField
        name="accountId"
        label="Account ID"
        value={form.accountId}
        onChange={handleChange}
        required
      />
      <TextField
        select
        name="role"
        label="תפקיד"
        value={form.role}
        onChange={handleChange}
        required
      >
        {roles.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
      <Button type="submit" variant="contained" color="primary">
        הרשם
      </Button>
    </Box>
  );
};

export default Register;
