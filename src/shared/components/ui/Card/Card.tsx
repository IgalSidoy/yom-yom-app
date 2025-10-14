import React from "react";
import {
  Card as MuiCard,
  CardProps as MuiCardProps,
  CardContent,
  CardHeader,
  CardActions,
} from "@mui/material";

export interface CardProps extends MuiCardProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  loading?: boolean;
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  actions,
  children,
  loading = false,
  sx,
  ...props
}) => {
  return (
    <MuiCard
      sx={{
        borderRadius: 2,
        boxShadow: 1,
        "&:hover": {
          boxShadow: 3,
        },
        transition: "box-shadow 0.2s ease-in-out",
        ...sx,
      }}
      {...props}
    >
      {(title || subtitle) && (
        <CardHeader
          title={title}
          subheader={subtitle}
          sx={{
            "& .MuiCardHeader-title": {
              fontSize: "1.1rem",
              fontWeight: 600,
            },
            "& .MuiCardHeader-subheader": {
              fontSize: "0.9rem",
              color: "text.secondary",
            },
          }}
        />
      )}
      <CardContent sx={{ pt: title || subtitle ? 0 : 2 }}>
        {children}
      </CardContent>
      {actions && (
        <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>{actions}</CardActions>
      )}
    </MuiCard>
  );
};

export default Card;
