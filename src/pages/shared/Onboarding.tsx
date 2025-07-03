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
  CircularProgress,
  Paper,
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import CheckIcon from "@mui/icons-material/Check";
import { useAuth } from "../../contexts/AuthContext";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: "",
    businessId: "",
    mobile: "",
    businessName: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    mobile: "",
  });
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const formatMobileNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "");

    // Format as Israeli mobile number (050-1234567)
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(
        6,
        10
      )}`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "mobile") {
      setForm({ ...form, [name]: formatMobileNumber(value) });
      // Clear mobile error when user types
      setErrors((prev) => ({ ...prev, mobile: "" }));
    } else if (name === "email") {
      setForm({ ...form, [name]: value });
      // Clear email error when user types
      setErrors((prev) => ({ ...prev, email: "" }));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();

    // Validate current step
    if (activeStep === 1) {
      const newErrors = { ...errors };
      let hasError = false;

      // Validate email
      if (!form.email) {
        newErrors.email = "שדה חובה";
        hasError = true;
      } else if (!validateEmail(form.email)) {
        newErrors.email = "כתובת אימייל לא תקינה";
        hasError = true;
      }

      // Validate mobile
      const mobileDigits = form.mobile.replace(/\D/g, "");
      if (!form.mobile) {
        newErrors.mobile = "שדה חובה";
        hasError = true;
      } else if (mobileDigits.length !== 10) {
        newErrors.mobile = "מספר טלפון לא תקין";
        hasError = true;
      }

      setErrors(newErrors);
      if (hasError) return;
    }

    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/v1/onboarding/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      const data = await response.json();
      login({
        token: data.token,
        userId: data.userId,
        accountId: data.accountId,
        organizationId: data.organizationId,
      });
      navigate("/dashboard");
    } catch (error) {
      setErrors({
        email: "שגיאה בשליחת הטופס. אנא נסה שוב.",
        mobile: "שגיאה בשליחת הטופס. אנא נסה שוב.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Fade in={true} timeout={500}>
            <Box sx={{ width: "100%" }}>
              <TextField
                name="businessId"
                label='ח"פ/ת"ז'
                value={form.businessId}
                onChange={handleChange}
                required
                fullWidth
                sx={{
                  bgcolor: "white",
                  borderRadius: 2,
                }}
              />
              <TextField
                name="businessName"
                label="שם העסק"
                value={form.businessName}
                onChange={handleChange}
                required
                fullWidth
                sx={{
                  bgcolor: "white",
                  borderRadius: 2,
                  mt: 2,
                }}
              />
            </Box>
          </Fade>
        );
      case 1:
        return (
          <Fade in={true} timeout={500}>
            <Box sx={{ width: "100%" }}>
              <TextField
                name="email"
                label="אימייל"
                value={form.email}
                onChange={handleChange}
                required
                type="email"
                placeholder="example@email.com"
                error={!!errors.email}
                helperText={errors.email}
                fullWidth
                sx={{
                  bgcolor: "white",
                  borderRadius: 2,
                }}
                inputProps={{
                  style: {
                    textAlign: "left",
                    direction: "ltr",
                  },
                }}
              />
              <TextField
                name="mobile"
                label="מספר סלפון"
                value={form.mobile}
                onChange={handleChange}
                required
                placeholder="050-1234567"
                error={!!errors.mobile}
                helperText={errors.mobile}
                fullWidth
                sx={{
                  bgcolor: "white",
                  borderRadius: 2,
                  mt: 2,
                }}
                inputProps={{
                  style: {
                    textAlign: "left",
                    direction: "ltr",
                  },
                  maxLength: 12,
                }}
              />
            </Box>
          </Fade>
        );
      case 2:
        return (
          <Fade in={true} timeout={500}>
            <Box sx={{ width: "100%", textAlign: "right" }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                אישור פרטים
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  bgcolor: "background.paper",
                }}
              >
                <Box sx={{ display: "grid", gap: 2 }}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 0.5 }}
                    >
                      ח"פ/ת"ז
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {form.businessId}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 0.5 }}
                    >
                      שם העסק
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {form.businessName}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 0.5 }}
                    >
                      אימייל
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {form.email}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 0.5 }}
                    >
                      טלפון
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {form.mobile}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3, textAlign: "center" }}
              >
                אנא וודא שכל הפרטים נכונים לפני סיום ההרשמה
              </Typography>
            </Box>
          </Fade>
        );
      default:
        return "Unknown step";
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#FFF6EB",
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: "500px",
          p: 4,
          borderRadius: 3,
          bgcolor: "#FFF9F0",
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
          }}
        >
          {isSubmitting ? (
            <CircularProgress
              size={60}
              sx={{
                color: "#FF9F43",
              }}
            />
          ) : (
            <>
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
                  paddingLeft: "50px",
                  width: "80%",
                  margin: "auto",
                  marginLeft: "auto",
                  marginRight: "auto",
                  mb: 2,
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

              <Box sx={{ display: "flex", gap: 2, mt: 2, width: "100%" }}>
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
                      flex: 1,
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
                      flex: 1,
                      py: 1.5,
                      boxShadow: "none",
                      "&:hover": { bgcolor: "#FF8C1A" },
                    }}
                  >
                    סיום
                  </Button>
                )}
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
                      flex: 1,
                      py: 1.5,
                      "&:hover": {
                        borderColor: "#FF8C1A",
                        bgcolor: "rgba(255, 159, 67, 0.04)",
                      },
                    }}
                  >
                    חזור
                  </Button>
                )}
              </Box>
              <Typography
                variant="body2"
                sx={{
                  mt: 2,
                  color: "#666",
                  textAlign: "center",
                  "& a": {
                    color: "#FF9F43",
                    textDecoration: "none",
                    fontWeight: 500,
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  },
                }}
              >
                כבר יש לך חשבון?{" "}
                <Link to="/login" style={{ color: "#FF9F43" }}>
                  התחבר כאן
                </Link>
              </Typography>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Onboarding;
