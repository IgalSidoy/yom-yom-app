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
