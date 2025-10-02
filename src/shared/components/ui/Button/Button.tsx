import React from "react";
import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
  CircularProgress,
} from "@mui/material";

export interface ButtonProps extends Omit<MuiButtonProps, "variant" | "size"> {
  variant?: "primary" | "secondary" | "outline" | "text";
  size?: "small" | "medium" | "large";
  loading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  children,
  sx,
  ...props
}) => {
  const getVariant = () => {
    switch (variant) {
      case "primary":
        return "contained";
      case "secondary":
        return "contained";
      case "outline":
        return "outlined";
      case "text":
        return "text";
      default:
        return "contained";
    }
  };

  const getColor = () => {
    switch (variant) {
      case "primary":
        return "primary";
      case "secondary":
        return "secondary";
      case "outline":
        return "primary";
      case "text":
        return "primary";
      default:
        return "primary";
    }
  };

  const getSize = () => {
    switch (size) {
      case "small":
        return "small";
      case "medium":
        return "medium";
      case "large":
        return "large";
      default:
        return "medium";
    }
  };

  return (
    <MuiButton
      variant={getVariant()}
      color={getColor()}
      size={getSize()}
      disabled={disabled || loading}
      startIcon={
        loading ? <CircularProgress size={16} color="inherit" /> : undefined
      }
      sx={{
        borderRadius: 2,
        textTransform: "none",
        fontWeight: 500,
        minHeight: {
          small: 32,
          medium: 40,
          large: 48,
        }[size],
        px: {
          small: 2,
          medium: 3,
          large: 4,
        }[size],
        ...sx,
      }}
      {...props}
    >
      {children}
    </MuiButton>
  );
};

export default Button;
