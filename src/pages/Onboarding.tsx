import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Fade,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import CheckIcon from "@mui/icons-material/Check";

const steps = [1, 2, 3];

const CustomStepIcon = ({
  active,
  completed,
}: {
  active?: boolean;
  completed?: boolean;
}) => {
  return (
    <Box
      sx={{
        width: 16,
        height: 16,
        borderRadius: "50%",
        backgroundColor: completed ? "#4CAF50" : active ? "#FF9F43" : "#E0E0E0",
        transition: "background-color 0.3s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: "12px",
      }}
    >
      {completed && <CheckIcon sx={{ fontSize: "14px" }} />}
    </Box>
  );
};

const Onboarding: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState({
    email: "",
    businessId: "",
    mobile: "",
    businessName: "",
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const baseUrl = process.env.REACT_APP_API_BASE_URL;
      const response = await fetch(`${baseUrl}/api/v1/onboarding/start`, {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          businessId: form.businessId,
          mobile: form.mobile,
          businessName: form.businessName,
        }),
      });
      if (!response.ok) throw new Error("Registration failed");
      const data = await response.json();
      navigate("/dashboard");
    } catch (err) {
      alert("Registration failed");
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Fade in={true} timeout={500}>
            <Box>
              <TextField
                name="businessId"
                label='ח"פ/ת"ז'
                value={form.businessId}
                onChange={handleChange}
                required
                sx={{
                  bgcolor: "white",
                  borderRadius: 2,
                  width: "100%",
                  maxWidth: 350,
                }}
              />
              <TextField
                name="businessName"
                label="שם העסק"
                value={form.businessName}
                onChange={handleChange}
                required
                sx={{
                  bgcolor: "white",
                  borderRadius: 2,
                  width: "100%",
                  maxWidth: 350,
                  mt: 2,
                }}
              />
            </Box>
          </Fade>
        );
      case 1:
        return (
          <Fade in={true} timeout={500}>
            <Box>
              <TextField
                name="email"
                label="אימייל"
                value={form.email}
                onChange={handleChange}
                required
                sx={{
                  bgcolor: "white",
                  borderRadius: 2,
                  width: "100%",
                  maxWidth: 350,
                }}
              />
              <TextField
                name="mobile"
                label="מספר סלפון"
                value={form.mobile}
                onChange={handleChange}
                required
                sx={{
                  bgcolor: "white",
                  borderRadius: 2,
                  width: "100%",
                  maxWidth: 350,
                  mt: 2,
                }}
              />
            </Box>
          </Fade>
        );
      case 2:
        return (
          <Fade in={true} timeout={500}>
            <Box sx={{ textAlign: "center", width: "100%", maxWidth: 350 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                אישור פרטים
              </Typography>
              <Typography>ח"פ/ת"ז: {form.businessId}</Typography>
              <Typography>שם העסק: {form.businessName}</Typography>
              <Typography>אימייל: {form.email}</Typography>
              <Typography>טלפון: {form.mobile}</Typography>
            </Box>
          </Fade>
        );
      default:
        return "Unknown step";
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        alignItems: "center",
        bgcolor: "#FFF6EB",
        minHeight: "100vh",
        justifyContent: "center",
        direction: "rtl",
        px: 2,
      }}
    >
      <Typography
        variant="h4"
        align="center"
        sx={{ fontWeight: 700, color: "#6B3F1D", mb: 2 }}
      >
        הגדרת חשבון
      </Typography>

      <Stepper
        activeStep={activeStep}
        sx={{
          width: "100%",
          maxWidth: "75%",
          margin: "0 auto",
          mb: 1,
          marginBottom: "10px",
          "& .MuiStepLabel-label": {
            display: "none",
          },
          "& .MuiStepIcon-root": {
            display: "none",
          },
          "& .MuiStepConnector-line": {
            display: "none",
          },
          "& .MuiStepConnector-root": {
            display: "none",
          },
          "& .MuiStep-root": {
            padding: 1,
            flex: 1,
            "&:first-of-type": {
              paddingLeft: 0,
            },
            "&:last-child": {
              paddingRight: 0,
            },
          },
        }}
      >
        {steps.map((step) => (
          <Step key={step}>
            <StepLabel StepIconComponent={CustomStepIcon} />
          </Step>
        ))}
      </Stepper>

      {getStepContent(activeStep)}

      <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
        {activeStep > 0 && (
          <Button
            onClick={handleBack}
            type="button"
            variant="outlined"
            sx={{
              color: "#FF9F43",
              borderColor: "#FF9F43",
              fontWeight: 700,
              borderRadius: 3,
              width: 150,
              py: 1.5,
            }}
          >
            חזור
          </Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button
            onClick={handleNext}
            type="button"
            variant="contained"
            sx={{
              bgcolor: "#FF9F43",
              color: "white",
              fontWeight: 700,
              fontSize: 20,
              borderRadius: 3,
              width: 150,
              py: 1.5,
              boxShadow: "none",
              "&:hover": { bgcolor: "#FF8C1A" },
            }}
          >
            המשך
          </Button>
        ) : (
          <Button
            type="submit"
            variant="contained"
            sx={{
              bgcolor: "#FF9F43",
              color: "white",
              fontWeight: 700,
              fontSize: 20,
              borderRadius: 3,
              width: 150,
              py: 1.5,
              boxShadow: "none",
              "&:hover": { bgcolor: "#FF8C1A" },
            }}
          >
            סיום
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default Onboarding;
