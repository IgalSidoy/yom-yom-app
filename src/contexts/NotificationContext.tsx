import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";

interface Notification {
  id: string;
  message: string;
  severity: "success" | "error" | "info" | "warning";
  open: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (
    message: string,
    severity?: "success" | "error" | "info" | "warning"
  ) => void;
  hideNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback(
    (
      message: string,
      severity: "success" | "error" | "info" | "warning" = "success"
    ) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newNotification: Notification = {
        id,
        message,
        severity,
        open: true,
      };

      setNotifications((prev) => [...prev, newNotification]);

      // Auto-hide notification after 4 seconds
      setTimeout(() => {
        hideNotification(id);
      }, 4000);
    },
    []
  );

  const hideNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, open: false } : notification
      )
    );

    // Remove notification from array after fade out animation
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 300);
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    notifications,
    showNotification,
    hideNotification,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};
