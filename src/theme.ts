import { createTheme } from "@mui/material/styles";
import { heIL } from "@mui/material/locale";

const theme = createTheme(
  {
    direction: "rtl",
    palette: {
      primary: {
        main: "#FF914D", // Orange
      },
      secondary: {
        main: "#F9EEDB", // Beige
      },
      background: {
        default: "#FFF9F3", // Light background
        paper: "#FFF9F3",
      },
      text: {
        primary: "#4E342E", // Brown
        secondary: "#FF914D",
      },
    },
    typography: {
      fontFamily: "Heebo, Arial, sans-serif",
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
      button: { borderRadius: 16, fontWeight: 700 },
    },
    shape: {
      borderRadius: 16,
    },
  },
  heIL
);

export default theme;
