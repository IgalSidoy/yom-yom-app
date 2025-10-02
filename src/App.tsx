import React from "react";
import { AppProviders } from "./app/providers";
import AppRoutes from "./routes";
import AuthWrapper from "./shared/components/ui/AuthWrapper";

const App: React.FC = () => {
  return (
    <AppProviders>
      <AuthWrapper>
        <AppRoutes />
      </AuthWrapper>
    </AppProviders>
  );
};

export default App;
