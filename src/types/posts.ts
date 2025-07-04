// Post types for the feed system
export interface BasePost {
  id: string;
  title: string;
  publishDate: string;
  isLiked?: boolean;
  likeCount?: number;
  teacherName: string;
  teacherAvatar?: string;
  groupName: string;
}

// Sleep post specific types
export interface SleepChild {
  childId: string;
  firstName: string;
  lastName: string;
  sleepStartTime: string;
  sleepEndTime?: string;
  sleepDuration?: number; // in minutes
  sleepQuality?: "excellent" | "good" | "fair" | "poor";
  notes?: string;
}

export interface SleepPost extends BasePost {
  type: "sleep";
  sleepDate: string;
  children: SleepChild[];
  totalChildren: number;
  sleepingChildren: number;
  averageSleepDuration?: number; // in minutes
  status: "active" | "completed";
}

// Sleep post creation form data
export interface CreateSleepPostData {
  title: string;
  groupId: string;
  groupName: string;
  sleepDate: string;
  children: SleepChild[];
}

// Sleep quality options
export const SLEEP_QUALITY_OPTIONS = [
  { value: "excellent", label: "מצוין", color: "#4CAF50" },
  { value: "good", label: "טוב", color: "#8BC34A" },
  { value: "fair", label: "סביר", color: "#FFC107" },
  { value: "poor", label: "גרוע", color: "#F44336" },
] as const;

export type SleepQuality = (typeof SLEEP_QUALITY_OPTIONS)[number]["value"];
