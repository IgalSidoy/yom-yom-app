// Centralized Color Configuration
// This file manages all color schemes used throughout the application

// Theme Colors
export const THEME_COLORS = {
  PRIMARY: "#FF914D", // Orange
  SECONDARY: "#F9EEDB", // Beige
  BACKGROUND: "#FFF9F3", // Light background
  TEXT_PRIMARY: "#4E342E", // Brown
  TEXT_SECONDARY: "#FF914D",
} as const;

// Attendance Status Colors
export const ATTENDANCE_COLORS = {
  PRESENT: {
    bg: "#FF914D", // Strong orange (theme primary)
    text: "#fff",
    border: "#FF914D",
    chip: "#FF914D",
    chipText: "#fff",
  },
  LATE: {
    bg: "#2196F3", // Strong blue
    text: "#fff",
    border: "#2196F3",
    chip: "#2196F3",
    chipText: "#fff",
  },
  ABSENT: {
    bg: "#F44336", // Strong red
    text: "#fff",
    border: "#F44336",
    chip: "#F44336",
    chipText: "#fff",
  },
  SICK: {
    bg: "#FFB74D", // Strong yellow
    text: "#fff",
    border: "#FFB74D",
    chip: "#FFB74D",
    chipText: "#fff",
  },
  VACATION: {
    bg: "#4CAF50", // Strong green
    text: "#fff",
    border: "#4CAF50",
    chip: "#4CAF50",
    chipText: "#fff",
  },
  UNREPORTED: {
    bg: "#9E9E9E", // Strong gray
    text: "#fff",
    border: "#9E9E9E",
    chip: "#9E9E9E",
    chipText: "#fff",
  },
} as const;

// Sleep Status Colors
export const SLEEP_COLORS = {
  SLEEPING: {
    bg: "#9C27B0",
    text: "#fff",
    border: "#9C27B0",
    chip: "#9C27B0",
    chipText: "#fff",
  },
  ASLEEP: {
    bg: "#9C27B0",
    text: "#fff",
    border: "#9C27B0",
    chip: "#9C27B0",
    chipText: "#fff",
  },
  AWAKE: {
    bg: "#2196F3",
    text: "#fff",
    border: "#2196F3",
    chip: "#2196F3",
    chipText: "#fff",
  },
} as const;

// Post Type Colors
export const POST_TYPE_COLORS = {
  SLEEP_POST: {
    primary: "#9C27B0", // Purple
    secondary: "#E1BEE7",
    gradient: "linear-gradient(135deg, #9C27B0 0%, #E1BEE7 100%)",
  },
  ATTENDANCE_POST: {
    primary: "#4CAF50", // Green
    secondary: "#C8E6C9",
    gradient: "linear-gradient(135deg, #4CAF50 0%, #C8E6C9 100%)",
  },
  FOOD_POST: {
    primary: "#FF6B35", // Orange for food
    secondary: "#FFE0B2",
    gradient: "linear-gradient(135deg, #FF6B35 0%, #FFE0B2 100%)",
  },
  SNACK_POST: {
    primary: "#FF9800", // Orange
    secondary: "#FFE0B2",
  },
} as const;

// Meal Type Colors - Time-based progression from morning to evening
export const MEAL_TYPE_COLORS = {
  BREAKFAST: {
    primary: "#FF9800", // Golden orange (more distinct from food post)
    secondary: "#FFCC02", // Bright yellow
    gradient: "linear-gradient(135deg, #FF9800 0%, #FFCC02 100%)",
  },
  MORNING_SNACK: {
    primary: "#FFB74D", // Warm orange
    secondary: "#FFD54F", // Amber
    gradient: "linear-gradient(135deg, #FFB74D 0%, #FFD54F 100%)",
  },
  LUNCH: {
    primary: "#FF6B35", // Midday orange
    secondary: "#FF8A65", // Red-orange
    gradient: "linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%)",
  },
  AFTERNOON_SNACK: {
    primary: "#FF7043", // Cooler orange
    secondary: "#FFAB91", // Peach
    gradient: "linear-gradient(135deg, #FF7043 0%, #FFAB91 100%)",
  },
  DINNER: {
    primary: "#E64A19", // Deep red-orange
    secondary: "#FF7043", // Cool orange
    gradient: "linear-gradient(135deg, #E64A19 0%, #FF7043 100%)",
  },
} as const;

// UI Component Colors
export const UI_COLORS = {
  // Background colors
  BACKGROUND_LIGHT: "#grey.50",
  BACKGROUND_PAPER: "background.paper",
  BACKGROUND_DEFAULT: "background.default",

  // Border colors
  BORDER_DIVIDER: "divider",
  BORDER_LIGHT: "grey.300",

  // Text colors
  TEXT_PRIMARY: "text.primary",
  TEXT_SECONDARY: "text.secondary",
  TEXT_WHITE: "#ffffff",
  TEXT_WHITE_90: "rgba(255,255,255,0.9)",

  // Avatar colors
  AVATAR_OVERLAY: "rgba(255,255,255,0.2)",

  // Shadow colors
  SHADOW_LIGHT: "rgba(0,0,0,0.05)",
  SHADOW_MEDIUM: "rgba(0,0,0,0.1)",

  // Status colors
  SUCCESS: {
    light: "success.light",
    main: "success.main",
    contrastText: "success.contrastText",
  },
  WARNING: {
    light: "warning.light",
    main: "warning.main",
    contrastText: "warning.contrastText",
  },
  ERROR: {
    light: "error.light",
    main: "error.main",
    contrastText: "error.contrastText",
  },
  INFO: {
    light: "info.light",
    main: "info.main",
    contrastText: "info.contrastText",
  },
} as const;

// Status Color Mapping Functions
export const getAttendanceStatusColor = (
  status: string,
  isClosed: boolean = false
) => {
  if (isClosed) {
    return {
      bg: "#9E9E9E",
      text: "#fff",
      border: "#9E9E9E",
      chip: "#9E9E9E",
      chipText: "#fff",
    };
  }

  switch (status) {
    case "Present":
    case "Arrived":
      return ATTENDANCE_COLORS.PRESENT;
    case "Late":
      return ATTENDANCE_COLORS.LATE;
    case "Absent":
    case "Missing":
      return ATTENDANCE_COLORS.ABSENT;
    case "Sick":
      return ATTENDANCE_COLORS.SICK;
    case "Vacation":
      return ATTENDANCE_COLORS.VACATION;
    case "Unreported":
      return ATTENDANCE_COLORS.UNREPORTED;
    default:
      return ATTENDANCE_COLORS.UNREPORTED;
  }
};

export const getSleepStatusColor = (
  status: string,
  isClosed: boolean = false
) => {
  if (isClosed) {
    return {
      bg: "#9E9E9E",
      text: "#fff",
      border: "#9E9E9E",
      chip: "#9E9E9E",
      chipText: "#fff",
    };
  }

  switch (status) {
    case "Sleeping":
    case "Asleep":
      return SLEEP_COLORS.SLEEPING;
    case "Awake":
      return SLEEP_COLORS.AWAKE;
    default:
      return SLEEP_COLORS.AWAKE;
  }
};

// Child Color Assignment (for consistent per-child colors)
export const CHILD_COLORS = [
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Blue
  "#96CEB4", // Green
  "#FFEAA7", // Yellow
  "#DDA0DD", // Plum
  "#98D8C8", // Mint
  "#F7DC6F", // Gold
  "#BB8FCE", // Lavender
  "#85C1E9", // Sky Blue
  "#F8C471", // Orange
  "#82E0AA", // Light Green
  "#F1948A", // Salmon
  "#85C1E9", // Light Blue
  "#F7DC6F", // Light Yellow
] as const;

export const getChildColor = (childId: string): string => {
  // Simple hash function to consistently assign colors to children
  let hash = 0;
  for (let i = 0; i < childId.length; i++) {
    const char = childId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  const index = Math.abs(hash) % CHILD_COLORS.length;
  return CHILD_COLORS[index];
};

// Utility function to get contrasting text color for a background color
export const getContrastTextColor = (backgroundColor: string): string => {
  // Simple contrast calculation
  const hex = backgroundColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#000000" : "#ffffff";
};

// Meal Type Color Helper Function
export const getMealTypeColors = (type: string) => {
  switch (type) {
    case "Breakfast":
      return MEAL_TYPE_COLORS.BREAKFAST;
    case "MorningSnack":
      return MEAL_TYPE_COLORS.MORNING_SNACK;
    case "Lunch":
      return MEAL_TYPE_COLORS.LUNCH;
    case "AfternoonSnack":
      return MEAL_TYPE_COLORS.AFTERNOON_SNACK;
    case "Dinner":
      return MEAL_TYPE_COLORS.DINNER;
    default:
      return MEAL_TYPE_COLORS.LUNCH; // Default to lunch colors
  }
};
