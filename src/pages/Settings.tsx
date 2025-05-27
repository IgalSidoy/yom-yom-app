import React from "react";
import {
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useLanguage } from "../contexts/LanguageContext";

const Settings: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <Box sx={{ mt: 4, textAlign: "center" }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Settings Page
      </Typography>
      <FormControl fullWidth sx={{ maxWidth: 300, mx: "auto" }}>
        <InputLabel id="language-select-label">Language</InputLabel>
        <Select
          labelId="language-select-label"
          id="language-select"
          value={language}
          label="Language"
          onChange={(e) => setLanguage(e.target.value as "heb" | "rus" | "eng")}
        >
          <MenuItem value="heb">Hebrew</MenuItem>
          <MenuItem value="rus">Russian</MenuItem>
          <MenuItem value="eng">English</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default Settings;
