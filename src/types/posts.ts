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

// Feed API response types
export interface FeedChildSleepData {
  childId: string;
  childFirstName: string;
  childLastName: string;
  status: "Awake" | "Sleeping" | "Asleep";
  startTimestamp: string;
  endTimestamp: string;
  updatedByUserId: string;
  comment?: string;
}

export interface FeedChildAttendanceData {
  childId: string;
  childFirstName: string;
  childLastName: string;
  status: "Present" | "Late" | "Sick" | "Absent" | "Unreported";
  checkInTime: string;
  updatedByUserId: string;
}

export interface SleepMetadata {
  childrenSleepData: FeedChildSleepData[];
}

export interface AttendanceMetadata {
  childrenAttendanceData: FeedChildAttendanceData[];
}

export interface FeedPost {
  id: string;
  state: string; // Add state field (e.g., "Closed", "Open")
  created: string;
  updated: string;
  organizationId: string;
  accountId: string;
  groupId: string;
  createdById: string;
  type: "SleepPost" | "AttendancePost";
  title: string;
  description: string;
  activityDate: string;
  isRead: boolean;
  priority: number;
  groupName: string;
  sourceEntityId: string;
  isClosed?: boolean; // Keep for backward compatibility
  metadata: {
    sleepMetadata?: SleepMetadata;
    attendanceMetadata?: AttendanceMetadata;
  };
}

// Sleep post specific types
export interface SleepChild {
  childId: string;
  firstName: string;
  lastName: string;
  sleepStartTime?: string; // Optional - backend will handle timing
  sleepEndTime?: string; // Optional - backend will handle timing
  sleepDuration?: number; // in minutes - calculated by backend
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
