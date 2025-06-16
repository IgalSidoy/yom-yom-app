import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Fade,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { useApp } from "../contexts/AppContext";

const Login: React.FC = () => {
  const [mobile, setMobile] = useState("054-1111111");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { setUserId, setAccountId, setOrganizationId, setAccessToken } =
    useApp();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showOtp && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [showOtp, timer]);

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

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatMobileNumber(e.target.value);
    setMobile(formatted);
  };

  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate mobile number (should be 10 digits after removing non-digits)
    const digits = mobile.replace(/\D/g, "");
    if (digits.length !== 10) {
      setError("מספר טלפון לא תקין");
      return;
    }

    try {
      const baseUrl = process.env.REACT_APP_API_BASE_URL;
      const response = await fetch(`${baseUrl}/api/v1/auth/opt`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mobile }),
      });

      if (!response.ok) {
        throw new Error("Failed to send OTP");
      }

      const data = await response.json();

      // Set the OTP from the response
      if (data.otp) {
        const otpArray = data.otp.split("");
        setOtp(otpArray);
      }

      setShowOtp(true);
    } catch (err) {
      setError("שליחת הקוד נכשלה. אנא נסה שוב.");
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    // Convert to uppercase and only allow numbers and letters
    const sanitizedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "");

    if (sanitizedValue.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = sanitizedValue;
      setOtp(newOtp);

      // Auto-focus next input
      if (sanitizedValue && index < 5) {
        const nextInput = document.querySelector(
          `input[name=otp-${index + 1}]`
        ) as HTMLInputElement;
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const baseUrl = process.env.REACT_APP_API_BASE_URL;
      const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          mobile: mobile.replace(/\D/g, ""),
          otp: otp.join(""),
        }),
      });

      if (!response.ok) {
        throw new Error("Invalid OTP");
      }

      const data = await response.json();

      // Update AppContext with access token
      setAccessToken(data.token);

      // Call login to update auth context
      await login({
        token: data.token,
        userId: data.userId,
        accountId: data.accountId,
        organizationId: data.organizationId,
      });

      navigate("/dashboard");
    } catch (err) {
      setError("קוד לא תקין. אנא נסה שוב.");
    }
  };

  const handleResendCode = async () => {
    setError("");
    try {
      const baseUrl = process.env.REACT_APP_API_BASE_URL;
      const response = await fetch(`${baseUrl}/api/v1/auth/opt`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ mobile }),
      });

      if (!response.ok) {
        throw new Error("Failed to send OTP");
      }

      setTimer(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
    } catch (err) {
      setError("שליחת הקוד נכשלה. אנא נסה שוב.");
    }
  };

  return (
    <Container maxWidth="sm">
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
            maxWidth: "400px",
            p: 4,
            borderRadius: 3,
            bgcolor: "#FFF9F0",
          }}
        >
          <Box
            component="form"
            onSubmit={showOtp ? handleOtpSubmit : handleMobileSubmit}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
            }}
          >
            <Typography
              variant="h4"
              sx={{ mb: 2, color: "#6B3F1D", fontWeight: 700 }}
            >
              התחברות
            </Typography>

            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

            <Fade in={!showOtp} timeout={500}>
              <Box sx={{ width: "100%" }}>
                <TextField
                  label="מספר טלפון"
                  variant="outlined"
                  value={mobile}
                  onChange={handleMobileChange}
                  fullWidth
                  required
                  placeholder="050-1234567"
                  sx={{
                    borderRadius: 2,
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

            <Fade in={showOtp} timeout={500}>
              <Box sx={{ width: "100%" }}>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    justifyContent: "center",
                    width: "100%",
                  }}
                >
                  {otp.map((digit, index) => (
                    <TextField
                      key={index}
                      name={`otp-${index}`}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      inputProps={{
                        maxLength: 1,
                        style: {
                          textAlign: "center",
                          fontSize: "1.5rem",
                          padding: "8px",
                          textTransform: "uppercase",
                        },
                        pattern: "[A-Z0-9]*",
                        inputMode: "text",
                      }}
                      sx={{
                        width: "50px",
                        "& .MuiOutlinedInput-root": {
                          height: "50px",
                          borderRadius: 2,
                        },
                      }}
                    />
                  ))}
                </Box>
                <Box sx={{ mt: 2, textAlign: "center" }}>
                  {canResend ? (
                    <Button
                      onClick={handleResendCode}
                      sx={{
                        color: "#FF9F43",
                        textTransform: "none",
                        fontWeight: 500,
                        "&:hover": {
                          textDecoration: "underline",
                          background: "none",
                        },
                      }}
                    >
                      שלח קוד חדש
                    </Button>
                  ) : (
                    <Typography variant="body2" sx={{ color: "#666" }}>
                      שלח קוד חדש תוך {timer} שניות
                    </Typography>
                  )}
                </Box>
              </Box>
            </Fade>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              sx={{
                borderRadius: 3,
                fontWeight: 700,
                fontSize: 20,
                py: 1.5,
                bgcolor: "#FF9F43",
                "&:hover": { bgcolor: "#FF8C1A" },
              }}
            >
              {showOtp ? "אימות" : "שלח קוד"}
            </Button>

            {!showOtp && (
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                sx={{
                  borderRadius: 3,
                  fontWeight: 700,
                  fontSize: 16,
                  borderColor: "#FF9F43",
                  color: "#FF9F43",
                  "&:hover": {
                    borderColor: "#FF8C1A",
                    bgcolor: "rgba(255, 159, 67, 0.04)",
                  },
                }}
                onClick={() => navigate("/onboarding")}
              >
                הרשמה
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
