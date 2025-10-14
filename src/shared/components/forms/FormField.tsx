import React from "react";
import { Box, Typography } from "@mui/material";
import { Input, InputProps } from "../ui/Input";

export interface FormFieldProps extends InputProps {
  name: string;
  label: string;
  type?: "text" | "email" | "password" | "tel" | "number" | "date";
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    message?: string;
  };
  helperText?: string;
  error?: boolean;
  errorMessage?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  type = "text",
  validation,
  helperText,
  error = false,
  errorMessage,
  sx,
  ...props
}) => {
  const isRequired = validation?.required || false;
  const displayError = error && errorMessage;
  const displayHelperText = displayError ? errorMessage : helperText;

  return (
    <Box sx={{ mb: 2, ...sx }}>
      <Input
        name={name}
        label={label}
        type={type}
        required={isRequired}
        error={error}
        helperText={displayHelperText}
        fullWidth
        sx={{
          "& .MuiInputLabel-root": {
            fontSize: "0.95rem",
          },
          "& .MuiInputBase-input": {
            fontSize: { xs: "16px", sm: "14px" },
          },
        }}
        {...props}
      />
    </Box>
  );
};

export default FormField;
