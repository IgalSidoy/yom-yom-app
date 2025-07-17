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
import AuthWrapper from "./components/AuthWrapper";

const App: React.FC = () => {
  return (
    <Router>
      <AppProvider>
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
                <AuthWrapper>
                  <AttendanceProvider>
                    <DailyReportProvider>
                      <FeedProvider>
                        <AppRoutes />
                      </FeedProvider>
                    </DailyReportProvider>
                  </AttendanceProvider>
                </AuthWrapper>
              </AuthProvider>
            </LanguageProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </AppProvider>
    </Router>
  );
};

export default App;
