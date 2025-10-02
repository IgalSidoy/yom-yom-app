import React from "react";
import { TextField, TextFieldProps } from "@mui/material";

export interface InputProps extends Omit<TextFieldProps, "variant"> {
  variant?: "outlined" | "filled" | "standard";
  size?: "small" | "medium";
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

const Input: React.FC<InputProps> = ({
  variant = "outlined",
  size = "medium",
  error = false,
  helperText,
  required = false,
  disabled = false,
  loading = false,
  sx,
  ...props
}) => {
  return (
    <TextField
      variant={variant}
      size={size}
      error={error}
      helperText={helperText}
      required={required}
      disabled={disabled || loading}
      sx={{
        "& .MuiInputBase-input": {
          fontSize: { xs: "16px", sm: "14px" }, // Prevent zoom on mobile
        },
        "& .MuiInputLabel-root": {
          fontSize: "0.95rem",
        },
        "& .MuiOutlinedInput-root": {
          borderRadius: 2,
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "primary.main",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "primary.main",
            borderWidth: 2,
          },
        },
        ...sx,
      }}
      {...props}
    />
  );
};

export default Input;
