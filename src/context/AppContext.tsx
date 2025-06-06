import React, { createContext, useContext, useState, ReactNode } from "react";

interface AppContextType {
  userId: string | null;
  accountId: string | null;
  organizationId: string | null;
  setUserId: (id: string | null) => void;
  setAccountId: (id: string | null) => void;
  setOrganizationId: (id: string | null) => void;
  clearIds: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  const clearIds = () => {
    setUserId(null);
    setAccountId(null);
    setOrganizationId(null);
  };

  return (
    <AppContext.Provider
      value={{
        userId,
        accountId,
        organizationId,
        setUserId,
        setAccountId,
        setOrganizationId,
        clearIds,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
