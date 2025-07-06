import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { DailyReport, dailyReportsApi } from "../services/api";

interface DailyReportContextType {
  dailyReport: DailyReport | null;
  isLoading: boolean;
  error: string | null;
  fetchDailyReport: (groupId: string, date?: string) => Promise<void>;
  clearDailyReport: () => void;
  setDailyReport: (report: DailyReport | null) => void;
}

const DailyReportContext = createContext<DailyReportContextType | undefined>(
  undefined
);

interface DailyReportProviderProps {
  children: ReactNode;
}

export const DailyReportProvider: React.FC<DailyReportProviderProps> = ({
  children,
}) => {
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDailyReport = useCallback(
    async (groupId: string, date?: string) => {
      if (!groupId) {
        setError("Group ID is required");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const targetDate = date || new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

        const report = await dailyReportsApi.getDailyReport(
          groupId,
          targetDate
        );

        setDailyReport(report);
      } catch (error) {
        console.error("Failed to fetch daily report:", error);
        setError("Failed to fetch daily report. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearDailyReport = useCallback(() => {
    setDailyReport(null);
    setError(null);
  }, []);

  const value: DailyReportContextType = {
    dailyReport,
    isLoading,
    error,
    fetchDailyReport,
    clearDailyReport,
    setDailyReport,
  };

  return (
    <DailyReportContext.Provider value={value}>
      {children}
    </DailyReportContext.Provider>
  );
};

export const useDailyReport = (): DailyReportContextType => {
  const context = useContext(DailyReportContext);
  if (context === undefined) {
    throw new Error("useDailyReport must be used within a DailyReportProvider");
  }
  return context;
};
