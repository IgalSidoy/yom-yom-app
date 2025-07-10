import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { User, userApi } from "../services/api";

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
  users: User[];
  setUsers: (users: User[]) => void;
  isLoadingUser: boolean;
  userChangeTimestamp: number;
  notifyUserChange: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(false);
  const [userChangeTimestamp, setUserChangeTimestamp] = useState<number>(0);

  // Fetch user data when access token is available
  useEffect(() => {
    const fetchUserData = async () => {
      if (accessToken && !user) {
        try {
          setIsLoadingUser(true);
          const response = await userApi.getUser();
          const userData = response.data;
          setUser(userData);

          // Sync accountId and organizationId from user data
          if (userData.accountId) {
            setAccountId(userData.accountId);
          }
          if (userData.organizationId) {
            setOrganizationId(userData.organizationId);
          }
        } catch (error) {
          // Don't clear the token here, let the auth context handle auth errors
        } finally {
          setIsLoadingUser(false);
        }
      }
    };

    fetchUserData();
  }, [accessToken]);

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

  const notifyUserChange = () => {
    setUserChangeTimestamp(Date.now());
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
        users,
        setUsers,
        isLoadingUser,
        userChangeTimestamp,
        notifyUserChange,
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
