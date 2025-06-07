import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { User } from "../services/api";

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  userId: string | null;
  setUserId: (id: string | null) => void;
  accountId: string | null;
  setAccountId: (id: string | null) => void;
  organizationId: string | null;
  setOrganizationId: (id: string | null) => void;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  clearIds: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Listen for access token updates
  useEffect(() => {
    const handleAccessTokenUpdate = (event: CustomEvent) => {
      setAccessToken(event.detail);
    };

    const handleGetAccessToken = () => {
      // Dispatch an event with the current access token
      const event = new CustomEvent("accessTokenResponse", {
        detail: accessToken,
      });
      window.dispatchEvent(event);
    };

    window.addEventListener(
      "updateAccessToken",
      handleAccessTokenUpdate as EventListener
    );

    window.addEventListener(
      "getAccessToken",
      handleGetAccessToken as EventListener
    );

    return () => {
      window.removeEventListener(
        "updateAccessToken",
        handleAccessTokenUpdate as EventListener
      );
      window.removeEventListener(
        "getAccessToken",
        handleGetAccessToken as EventListener
      );
    };
  }, [accessToken]);

  const clearIds = () => {
    setUserId(null);
    setAccountId(null);
    setOrganizationId(null);
    setAccessToken(null);
  };

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
        accessToken,
        setAccessToken,
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
