import React from "react";
import { AppProviders } from "./app/providers";
import AppRoutes from "./routes";
import AuthWrapper from "./shared/components/ui/AuthWrapper";
import GlobalNotificationManager from "./shared/components/ui/GlobalNotificationManager";

const App: React.FC = () => {
  return (
    <AppProviders>
      <AuthWrapper>
        <AppRoutes />
        <GlobalNotificationManager />
      </AuthWrapper>
    </AppProviders>
  );
};

export default App;
