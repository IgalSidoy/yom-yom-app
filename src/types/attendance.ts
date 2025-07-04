// API Status Values (what the backend returns)
export enum ApiAttendanceStatus {
  ARRIVED = "Arrived",
  MISSING = "Missing",
  SICK = "Sick",
  LATE = "Late",
  VACATION = "Vacation",
  UNREPORTED = "Unreported",
  AWAKE = "Awake",
}

// Component Status Values (what the frontend uses internally)
export enum ComponentAttendanceStatus {
  ARRIVED = "arrived",
  MISSING = "missing",
  SICK = "sick",
  LATE = "late",
  VACATION = "vacation",
  UNREPORTED = "unreported",
  AWAKE = "awake",
}

// Type aliases for easier usage
export type ApiStatus = ApiAttendanceStatus;
export type ComponentStatus = ComponentAttendanceStatus;

// Status mapping functions
export const mapApiStatusToComponentStatus = (
  apiStatus: string
): ComponentStatus => {
  const statusMap: Record<string, ComponentStatus> = {
    [ApiAttendanceStatus.ARRIVED]: ComponentAttendanceStatus.ARRIVED,
    [ApiAttendanceStatus.MISSING]: ComponentAttendanceStatus.MISSING,
    [ApiAttendanceStatus.SICK]: ComponentAttendanceStatus.SICK,
    [ApiAttendanceStatus.LATE]: ComponentAttendanceStatus.LATE,
    [ApiAttendanceStatus.VACATION]: ComponentAttendanceStatus.VACATION,
    [ApiAttendanceStatus.AWAKE]: ComponentAttendanceStatus.AWAKE,
  };
  return statusMap[apiStatus] || ComponentAttendanceStatus.UNREPORTED;
};

export const mapComponentStatusToApiStatus = (
  componentStatus: ComponentStatus
): ApiStatus => {
  const statusMap: Record<ComponentStatus, ApiStatus> = {
    [ComponentAttendanceStatus.ARRIVED]: ApiAttendanceStatus.ARRIVED,
    [ComponentAttendanceStatus.MISSING]: ApiAttendanceStatus.MISSING,
    [ComponentAttendanceStatus.SICK]: ApiAttendanceStatus.SICK,
    [ComponentAttendanceStatus.LATE]: ApiAttendanceStatus.LATE,
    [ComponentAttendanceStatus.VACATION]: ApiAttendanceStatus.VACATION,
    [ComponentAttendanceStatus.UNREPORTED]: ApiAttendanceStatus.UNREPORTED,
    [ComponentAttendanceStatus.AWAKE]: ApiAttendanceStatus.AWAKE,
  };
  return statusMap[componentStatus];
};

// Status display options for UI
export interface AttendanceStatusOption {
  value: ComponentStatus;
  label: string;
  color: string;
  textColor: string;
}

export const ATTENDANCE_STATUS_OPTIONS: AttendanceStatusOption[] = [
  {
    value: ComponentAttendanceStatus.ARRIVED,
    label: "נוכח/ת",
    color: "#FF9F43",
    textColor: "#fff",
  },
  {
    value: ComponentAttendanceStatus.MISSING,
    label: "נעדר",
    color: "#FFE3E3",
    textColor: "#B85C5C",
  },
  {
    value: ComponentAttendanceStatus.SICK,
    label: "חולה",
    color: "#FFE6A7",
    textColor: "#B88B2A",
  },
  {
    value: ComponentAttendanceStatus.LATE,
    label: "מאחר",
    color: "#E3F0FF",
    textColor: "#3A6EA5",
  },
  {
    value: ComponentAttendanceStatus.VACATION,
    label: "חופשה",
    color: "#FFF7ED",
    textColor: "#B88B2A",
  },
  {
    value: ComponentAttendanceStatus.UNREPORTED,
    label: "לא דווח",
    color: "#F5F5F5",
    textColor: "#888",
  },
  {
    value: ComponentAttendanceStatus.AWAKE,
    label: "ער",
    color: "#E8F5E8",
    textColor: "#2E7D32",
  },
];

// Status colors for UI components
export interface StatusColors {
  bg: string;
  text: string;
  border: string;
}

export const STATUS_COLORS: Record<ComponentStatus, StatusColors> = {
  [ComponentAttendanceStatus.ARRIVED]: {
    bg: "#FF9F43",
    text: "#fff",
    border: "#FF9F43",
  },
  [ComponentAttendanceStatus.MISSING]: {
    bg: "#FFE3E3",
    text: "#B85C5C",
    border: "#F5B5B5",
  },
  [ComponentAttendanceStatus.SICK]: {
    bg: "#FFF7C2",
    text: "#B88B2A",
    border: "#FFE6A7",
  },
  [ComponentAttendanceStatus.LATE]: {
    bg: "#E3F0FF",
    text: "#3A6EA5",
    border: "#B3D4F7",
  },
  [ComponentAttendanceStatus.VACATION]: {
    bg: "#E3FFE3",
    text: "#3A9A5A",
    border: "#B3E6B3",
  },
  [ComponentAttendanceStatus.UNREPORTED]: {
    bg: "#F5F5F5",
    text: "#888",
    border: "#E0E0E0",
  },
  [ComponentAttendanceStatus.AWAKE]: {
    bg: "#E8F5E8",
    text: "#2E7D32",
    border: "#C8E6C9",
  },
};

// Helper function to get status option by value
export const getStatusOption = (
  value: ComponentStatus
): AttendanceStatusOption | undefined => {
  return ATTENDANCE_STATUS_OPTIONS.find((option) => option.value === value);
};

// Helper function to check if a status is considered "present" for attendance calculations
export const isPresentStatus = (status: ComponentStatus): boolean => {
  return (
    status === ComponentAttendanceStatus.ARRIVED ||
    status === ComponentAttendanceStatus.LATE ||
    status === ComponentAttendanceStatus.AWAKE
  );
};

// Helper function to check if a status is considered "absent" for attendance calculations
export const isAbsentStatus = (status: ComponentStatus): boolean => {
  return (
    status === ComponentAttendanceStatus.MISSING ||
    status === ComponentAttendanceStatus.SICK ||
    status === ComponentAttendanceStatus.VACATION
  );
};
