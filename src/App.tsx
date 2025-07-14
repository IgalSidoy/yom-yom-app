import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/he";
import theme from "./theme";
import { AuthProvider } from "./contexts/AuthContext";
import { AppProvider } from "./contexts/AppContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AttendanceProvider } from "./contexts/AttendanceContext";
import { DailyReportProvider } from "./contexts/DailyReportContext";
import { FeedProvider } from "./contexts/FeedContext";
import AppRoutes from "./routes";

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="he"
            localeText={{
              previousMonth: "החודש הקודם",
              nextMonth: "החודש הבא",
            }}
          >
            <LanguageProvider>
              <AuthProvider>
                <AttendanceProvider>
                  <DailyReportProvider>
                    <FeedProvider>
                      <AppRoutes />
                    </FeedProvider>
                  </DailyReportProvider>
                </AttendanceProvider>
              </AuthProvider>
            </LanguageProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </Router>
    </AppProvider>
  );
};

export default App;
