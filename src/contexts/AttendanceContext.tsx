import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { attendanceApi, GroupAttendance } from "../services/api";
import { useApp } from "./AppContext";

interface AttendanceContextType {
  attendanceData: GroupAttendance | null;
  isLoading: boolean;
  error: string | null;
  fetchAttendance: (groupId: string, date: string) => Promise<void>;
  updateAttendance: (
    groupId: string,
    date: string,
    attendanceData: GroupAttendance
  ) => Promise<void>;
  refreshAttendance: () => Promise<void>;
  clearAttendance: () => void;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(
  undefined
);

interface AttendanceProviderProps {
  children: ReactNode;
}

export const AttendanceProvider: React.FC<AttendanceProviderProps> = ({
  children,
}) => {
  const { user } = useApp();
  const [attendanceData, setAttendanceData] = useState<GroupAttendance | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<string | null>(null);
  const isInitialized = useRef(false);

  const fetchAttendance = useCallback(
    async (groupId: string, date: string) => {
      // Don't fetch if we already have the data for this group and date
      if (
        attendanceData &&
        currentGroupId === groupId &&
        currentDate === date
      ) {
        return;
      }

      // Don't fetch if already loading
      if (isLoading) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await attendanceApi.getGroupAttendance(groupId, date);
        setAttendanceData(data);
        setCurrentGroupId(groupId);
        setCurrentDate(date);
      } catch (error: any) {
        console.error("Failed to fetch attendance data:", error);
        // If we get 404, it means no attendance data exists yet, which is fine
        if (error.response?.status === 404) {
          setAttendanceData(null);
          setCurrentGroupId(groupId);
          setCurrentDate(date);
        } else {
          setError(error.message || "Failed to fetch attendance data");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [attendanceData, currentGroupId, currentDate, isLoading]
  );

  const updateAttendance = useCallback(
    async (
      groupId: string,
      date: string,
      newAttendanceData: GroupAttendance
    ) => {
      try {
        await attendanceApi.updateGroupAttendance(
          groupId,
          date,
          newAttendanceData
        );
        setAttendanceData(newAttendanceData);
        setCurrentGroupId(groupId);
        setCurrentDate(date);
        setError(null);
      } catch (error: any) {
        console.error("Failed to update attendance data:", error);
        setError(error.message || "Failed to update attendance data");
        throw error;
      }
    },
    []
  );

  const refreshAttendance = useCallback(async () => {
    if (currentGroupId && currentDate) {
      await fetchAttendance(currentGroupId, currentDate);
    }
  }, [currentGroupId, currentDate, fetchAttendance]);

  const clearAttendance = useCallback(() => {
    setAttendanceData(null);
    setCurrentGroupId(null);
    setCurrentDate(null);
    setError(null);
    isInitialized.current = false;
  }, []);

  // Auto-fetch attendance data only once when user changes or on component mount
  useEffect(() => {
    if (user?.groupId && !isInitialized.current) {
      const today = new Date().toISOString().split("T")[0];
      fetchAttendance(user.groupId, today);
      isInitialized.current = true;
    }
  }, [user?.groupId, fetchAttendance]);

  const value: AttendanceContextType = {
    attendanceData,
    isLoading,
    error,
    fetchAttendance,
    updateAttendance,
    refreshAttendance,
    clearAttendance,
  };

  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = (): AttendanceContextType => {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error("useAttendance must be used within an AttendanceProvider");
  }
  return context;
};
