import React, { createContext, useContext, useState } from "react";
import { User } from "../services/api";

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  userId: string;
  setUserId: (id: string) => void;
  accountId: string;
  setAccountId: (id: string) => void;
  organizationId: string;
  setOrganizationId: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
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
        userId,
        setUserId,
        accountId,
        setAccountId,
        organizationId,
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
