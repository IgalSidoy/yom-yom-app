import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
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

  // Debug logging for state changes
  useEffect(() => {
    console.log("🔄 [DailyReportContext] State changed:", {
      hasDailyReport: !!dailyReport,
      reportId: dailyReport?.id,
      hasSleepData: !!dailyReport?.sleepData,
      sleepDataChildrenCount: dailyReport?.sleepData?.children?.length || 0,
      isLoading,
      error,
    });
  }, [dailyReport, isLoading, error]);

  const fetchDailyReport = useCallback(
    async (groupId: string, date?: string) => {
      console.log("🔄 [DailyReportContext] fetchDailyReport called:", {
        groupId,
        date,
      });

      if (!groupId) {
        console.error("❌ [DailyReportContext] No groupId provided");
        setError("Group ID is required");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const targetDate = date || new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
        console.log("📅 [DailyReportContext] Fetching daily report:", {
          groupId,
          targetDate,
        });

        const report = await dailyReportsApi.getDailyReport(
          groupId,
          targetDate
        );

        console.log(
          "✅ [DailyReportContext] Daily report fetched successfully:",
          {
            reportId: report?.id,
            hasSleepData: !!report?.sleepData,
            sleepDataStatus: report?.sleepData?.status,
            childrenCount: report?.sleepData?.children?.length || 0,
          }
        );

        console.log("📊 [DailyReportContext] Setting daily report state:", {
          reportId: report?.id,
          hasSleepData: !!report?.sleepData,
          sleepDataChildrenCount: report?.sleepData?.children?.length || 0,
        });

        setDailyReport(report);
      } catch (error) {
        console.error(
          "💥 [DailyReportContext] Failed to fetch daily report:",
          error
        );
        setError("Failed to fetch daily report. Please try again.");
      } finally {
        setIsLoading(false);
        console.log("🏁 [DailyReportContext] fetchDailyReport completed");
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
