import React, { createContext, useContext, useState, ReactNode } from "react";
import { User } from "../services/api";

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  setUserId: (id: string) => void;
  setAccountId: (id: string) => void;
  setOrganizationId: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [accountId, setAccountId] = useState<string>("");
  const [organizationId, setOrganizationId] = useState<string>("");

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        setUserId,
        setAccountId,
        setOrganizationId,
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
