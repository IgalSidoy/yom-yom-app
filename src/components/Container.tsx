import React from "react";
import { Box, Container as MUIContainer } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Navbar from "./Navbar";

interface Props {
  children: React.ReactNode;
}

const Container: React.FC<Props> = ({ children }) => {
  const theme = useTheme();

  return (
    <Box
      dir="rtl"
      sx={{ minHeight: "100vh", background: theme.palette.background.default }}
    >
      <Navbar />
      <MUIContainer
        maxWidth="xs"
        sx={{
          mt: 2,
          mb: { xs: 10, sm: 8 },
          pb: { xs: 2, sm: 0 },
          minHeight: "calc(100vh - 64px)",
          position: "relative",
        }}
      >
        {children}
      </MUIContainer>
    </Box>
  );
};

export default Container;
