import React from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={{ textAlign: "center", marginTop: 40 }}>
      <h2>Dashboard (placeholder)</h2>
      <p>Welcome to the kindergarten app!</p>
    </div>
  );
};

export default Dashboard;
