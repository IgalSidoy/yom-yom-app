/**
 * Utility functions for sleep-related operations
 */

/**
 * Check if an end timestamp is valid (not the default empty timestamp)
 * @param endTime - The end timestamp to validate
 * @returns true if the end time is valid, false otherwise
 */
export const isValidEndTime = (endTime?: string): boolean => {
  return !!(endTime && endTime !== "0001-01-01T00:00:00" && endTime !== "");
};

/**
 * Check if a child is currently sleeping
 * @param sleepStartTime - The sleep start timestamp
 * @param sleepEndTime - The sleep end timestamp
 * @returns true if the child is sleeping, false otherwise
 */
export const isChildSleeping = (
  sleepStartTime?: string,
  sleepEndTime?: string
): boolean => {
  return !!(sleepStartTime && !isValidEndTime(sleepEndTime));
};

/**
 * Calculate sleep duration in seconds
 * @param startTime - The sleep start timestamp
 * @param endTime - The sleep end timestamp (optional, uses current time if not provided)
 * @returns Duration in seconds
 */
export const calculateSleepDuration = (
  startTime: string,
  endTime?: string
): number => {
  if (!startTime) return 0;

  const start = new Date(startTime);
  const end =
    endTime && isValidEndTime(endTime) ? new Date(endTime) : new Date();
  const diffMs = end.getTime() - start.getTime();

  return Math.max(0, Math.floor(diffMs / 1000));
};

/**
 * Format duration in seconds to HH:MM:SS format
 * @param totalSeconds - Total seconds to format
 * @returns Formatted string in HH:MM:SS format
 */
export const formatDuration = (totalSeconds: number): string => {
  if (totalSeconds === 0) return "00:00:00";

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};
