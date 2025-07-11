import axios, {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  AxiosRequestConfig,
} from "axios";
import { logger } from "../utils/logger";
import { SleepStatus, EntityStatus } from "../types/enums";
import { ApiAttendanceStatus } from "../types/attendance";
import { FeedPost } from "../types/posts";

const baseURL = process.env.REACT_APP_API_BASE_URL;

// Create axios instance
const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Create a separate axios instance for refresh token requests
const refreshApi = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
// Store pending requests
let failedQueue: any[] = [];

// Store the current access token in memory
let currentAccessToken: string | null = null;

// Function to set authorization header
const setAuthorizationHeader = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    refreshApi.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
    delete refreshApi.defaults.headers.common.Authorization;
  }
};

// Function to get access token from AppContext
const getAccessTokenFromContext = (): Promise<string | null> => {
  return new Promise((resolve) => {
    const handleResponse = (event: CustomEvent) => {
      window.removeEventListener(
        "accessTokenResponse",
        handleResponse as EventListener
      );
      resolve(event.detail as string | null);
    };

    window.addEventListener(
      "accessTokenResponse",
      handleResponse as EventListener
    );

    const event = new CustomEvent("getAccessToken");
    window.dispatchEvent(event);
  });
};

// Function to update the current access token
export const updateAccessToken = (token: string | null) => {
  currentAccessToken = token;
  setAuthorizationHeader(token);

  // Update AppContext's accessToken state
  const event = new CustomEvent("updateAccessToken", { detail: token });
  window.dispatchEvent(event);
};

// Function to process the queue of failed requests
const processQueue = (error: any, token: string | null = null) => {
  logger.info("Processing queue", {
    error,
    token,
    queueLength: failedQueue.length,
  });
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Function to get a new access token using refresh token
export const getNewAccessToken = async () => {
  try {
    logger.info("Getting new access token using refresh token");

    const response = await refreshApi.post(
      "/api/v1/auth/refresh",
      {},
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    const { token } = response.data;

    return token;
  } catch (error) {
    logger.error("Failed to get new access token", error);
    throw error;
  }
};

// Add request interceptor to attach token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig & { url?: string }) => {
    // Skip for refresh token requests
    if (config.url?.includes("/auth/refresh")) {
      return config;
    }

    // Get token from context
    const token = await new Promise<string | null>((resolve) => {
      const handleResponse = (event: CustomEvent) => {
        window.removeEventListener(
          "accessTokenResponse",
          handleResponse as EventListener
        );
        resolve(event.detail as string | null);
      };

      window.addEventListener(
        "accessTokenResponse",
        handleResponse as EventListener
      );

      const event = new CustomEvent("getAccessToken");
      window.dispatchEvent(event);
    });

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    logger.error("Request interceptor error", error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401s and refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    logger.info("Response interceptor - success", {
      url:
        (response.config as InternalAxiosRequestConfig & { url?: string })
          .url || "unknown",
      status: response.status,
    });
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      url?: string;
    };

    logger.info("Response interceptor - error", {
      url: originalRequest.url || "unknown",
      status: error.response?.status,
      isRefreshRequest: originalRequest.url?.includes("/auth/refresh"),
    });

    // Skip if not a 401 error or if it's a refresh token request
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/refresh")
    ) {
      logger.info("Response interceptor - skipping refresh", {
        reason: originalRequest.url?.includes("/auth/refresh")
          ? "refresh request"
          : "not 401 or already retried",
      });
      return Promise.reject(error);
    }

    logger.info("Response interceptor - 401 detected", {
      url: originalRequest.url || "unknown",
      isRefreshing,
    });

    // If already refreshing, add request to queue
    if (isRefreshing) {
      logger.info("Already refreshing, adding to queue", {
        url: originalRequest.url || "unknown",
      });
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          logger.info("Retrying queued request", {
            url: originalRequest.url || "unknown",
          });
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        })
        .catch((err) => {
          logger.error("Queued request failed", err);
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const token = await getNewAccessToken();

      // Update token in context
      const event = new CustomEvent("updateAccessToken", { detail: token });
      window.dispatchEvent(event);

      // Process queued requests
      processQueue(null, token);

      logger.info("Retrying original request", {
        url: originalRequest.url || "unknown",
      });
      // Retry the original request
      return api(originalRequest);
    } catch (refreshError) {
      logger.error("Token refresh failed", {
        error: refreshError,
        status: (refreshError as AxiosError).response?.status,
        headers: (refreshError as AxiosError).response?.headers,
      });

      // Clear token from context
      const event = new CustomEvent("updateAccessToken", { detail: null });
      window.dispatchEvent(event);

      processQueue(refreshError, null);

      // Instead of forcing a page reload, just reject the promise
      return Promise.reject(new Error("Session expired. Please login again."));
    } finally {
      isRefreshing = false;
    }
  }
);

// User API functions
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  mobile: string;
  accountId: string;
  organizationId: string;
  role: string;
  groupId?: string;
  created: string;
  updated: string;
}

export interface UserResponse {
  user: User;
}

export interface UsersResponse {
  users: User[];
  total: number;
}

export const userApi = {
  getUser: async () => {
    const response = await api.get("/api/v1/user");
    return response as { data: User };
  },
  getUserChildren: async () => {
    const response = await api.get("/api/v1/user/children");
    return response as { data: UserChildrenResponse };
  },
  getUsers: async () => {
    const response = await api.get("/api/v1/user/all", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return response as { data: UsersResponse };
  },
  createUser: async (user: Omit<User, "id">) => {
    const response = await api.post(
      "/api/v1/user",
      {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        mobile: user.mobile,
        accountId: user.accountId,
        groupId: user.groupId === "" ? null : user.groupId,
        role: user.role,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    return response as { data: UserResponse };
  },
  updateUser: async (user: User) => {
    const response = await api.put(
      `/api/v1/user/${user.id}`,
      {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        mobile: user.mobile,
        accountId: user.accountId,
        groupId: user.groupId === "" ? null : user.groupId,
        role: user.role,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    return response as { data: UserResponse };
  },
  deleteUser: async (userId: string) => {
    const response = await api.delete(`/api/v1/User/${userId}`, {
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return response as { data: UserResponse };
  },
};

// Organization API functions
export interface Organization {
  id: string;
  businessId: string;
  name: string;
  email: string;
  phone: string;
  created: string;
  updated: string;
}

export interface OrganizationResponse {
  organization: Organization;
}

export const organizationApi = {
  getOrganization: async (organizationId: string) => {
    const response = await api.get(`/api/v1/organization/${organizationId}`);
    return response as { data: OrganizationResponse };
  },
  updateOrganization: async (
    organization: Organization,
    currentOrganization: Organization
  ) => {
    // Compare the fields that can be modified by the user
    const hasChanges =
      currentOrganization.businessId !== organization.businessId ||
      currentOrganization.name !== organization.name ||
      currentOrganization.email !== organization.email ||
      currentOrganization.phone !== organization.phone;

    // Only update if there are actual changes
    if (hasChanges) {
      const response = await api.put(
        `/api/v1/organization/${organization.id}`,
        {
          businessId: organization.businessId,
          name: organization.name,
          email: organization.email,
          phone: organization.phone,
        }
      );
      return response as { data: OrganizationResponse };
    }

    // If no changes, return the current organization state
    return { data: { organization: currentOrganization } };
  },
};

// Account API functions
export interface Account {
  id: string;
  branchName: string;
  branchCode: number;
  organizationId: string;
  isPrimary: boolean;
  created: string;
  updated: string;
}

export interface AccountResponse {
  account: Account;
}

export interface AccountsResponse {
  accounts: Account[];
  total: number;
}

export const accountApi = {
  getAccounts: async () => {
    const response = await api.get("/api/v1/account/all");
    return response as { data: AccountsResponse };
  },

  getAccount: async (accountId: string) => {
    const response = await api.get(`/api/v1/account/${accountId}`);
    return response as { data: AccountResponse };
  },

  createAccount: async (
    account: Omit<Account, "id" | "created" | "updated">
  ) => {
    const response = await api.post("/api/v1/account", {
      branchName: account.branchName,
      branchCode: account.branchCode,
      organizationId: account.organizationId,
      isPrimary: account.isPrimary,
    });
    return response as { data: AccountResponse };
  },

  updateAccount: async (account: Account, currentAccount: Account) => {
    // Compare the fields that can be modified by the user
    const hasChanges = currentAccount.branchName !== account.branchName;

    // Only update if there are actual changes
    if (hasChanges) {
      const response = await api.put(`/api/v1/account/${account.id}`, {
        branchName: account.branchName,
      });
      return response as { data: AccountResponse };
    }

    // If no changes, return the current account state
    return { data: { account: currentAccount } };
  },

  deleteAccount: async (accountId: string) => {
    const response = await api.delete(`/api/v1/account/${accountId}`);
    return response;
  },
};

export interface Group {
  id: string;
  name: string;
  description: string;
  accountId: string;
  created: string;
  updated: string;
}

export interface GroupResponse {
  group: Group;
}

export interface GroupsResponse {
  groups: Group[];
  total: number;
}

export const groupApi = {
  getGroups: async (accountId: string) => {
    const response = await api.get(`/api/v1/group/${accountId}/all`);
    return response as { data: GroupsResponse };
  },

  getGroupById: async (groupId: string) => {
    const response = await api.get(`/api/v1/group/${groupId}`);
    return response as { data: GroupResponse };
  },

  createGroup: async (group: Omit<Group, "id" | "created" | "updated">) => {
    const response = await api.post("/api/v1/group", group);
    return response as { data: GroupResponse };
  },

  updateGroup: async (group: Group) => {
    const response = await api.put(`/api/v1/group/${group.id}`, group);
    return response as { data: GroupResponse };
  },

  deleteGroup: async (groupId: string) => {
    const response = await api.delete(`/api/v1/group/${groupId}`);
    return response;
  },
};

export interface Parent {
  id: string;
  firstName: string;
  lastName: string;
  mobile: string;
}

export interface Child {
  id?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  accountId: string;
  groupId?: string;
  groupName?: string;
  parents: string[]; // Array of parent IDs (strings)
  created?: string;
  updated?: string;
}

export interface ChildWithParents {
  id?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  accountId: string;
  groupId?: string;
  groupName?: string;
  parents: Parent[]; // Array of full parent objects
  created?: string;
  updated?: string;
}

export interface ChildResponse {
  children: ChildWithParents[];
  total: number;
}

// Child API functions
export const childApi = {
  createChild: async (child: Omit<Child, "id" | "created" | "updated">) => {
    const response = await api.post("/api/v1/child", child, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return response.data;
  },

  updateChild: async (childId: string, child: Partial<Child>) => {
    const response = await api.put(`/api/v1/child/${childId}`, child, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return response.data;
  },

  patchChild: async (childId: string, child: Partial<Child>) => {
    const response = await api.patch(`/api/v1/child/${childId}`, child, {
      headers: {
        Accept: "text/plain",
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return response.data;
  },

  deleteChild: async (childId: string) => {
    const response = await api.delete(`/api/v1/child/${childId}`, {
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return response.data;
  },

  getChildrenByAccount: async (accountId: string) => {
    const response = await api.get(`/api/v1/account/${accountId}/children`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return response.data as ChildResponse;
  },

  getChildrenByAccountWithGroupFilter: async (
    accountId: string,
    groupFilter: string
  ) => {
    const response = await api.get(
      `/api/v1/account/${accountId}/children?groupFilter=${groupFilter}`,
      {
        headers: {
          Accept: "text/plain",
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    return response.data as ChildResponse;
  },
};

export interface UserChild {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  accountId: string;
  accountName?: string;
  groupId?: string;
  groupName?: string;
  created?: string;
  updated?: string;
}

export interface UserChildrenResponse {
  children: UserChild[];
}

// Attendance API interfaces
// Daily Report interfaces
export interface DailyReportChild {
  childId: string;
  firstName: string;
  lastName: string;
  status: SleepStatus;
  startTimestamp: string;
  endTimestamp: string;
  updatedByUserId: string;
  updatedByUserName: string;
  comment?: string;
}

export interface SleepData {
  title: string;
  status: EntityStatus;
  children: DailyReportChild[];
}

// Map API string status to SleepStatus enum
export const mapApiStatusToSleepStatus = (apiStatus: string): SleepStatus => {
  switch (apiStatus.toLowerCase()) {
    case "sleeping":
      return SleepStatus.Sleeping;
    case "awake":
      return SleepStatus.Awake;
    default:
      console.warn(
        `Unknown sleep status from API: ${apiStatus}, defaulting to Awake`
      );
      return SleepStatus.Awake;
  }
};

// Map API string status to EntityStatus enum
export const mapApiStatusToEntityStatus = (apiStatus: string): EntityStatus => {
  switch (apiStatus) {
    case "Created":
      return EntityStatus.Created;
    case "Updated":
      return EntityStatus.Updated;
    case "Deleted":
      return EntityStatus.Deleted;
    case "Closed":
      return EntityStatus.Closed;
    default:
      console.warn(
        `Unknown entity status from API: ${apiStatus}, defaulting to Created`
      );
      return EntityStatus.Created;
  }
};

export interface DailyReport {
  id: string;
  organizationId: string;
  accountId: string;
  groupId: string;
  groupName: string;
  createdById: string;
  date: string;
  sleepData: SleepData;
  isPublished: boolean;
  created: string;
  updated: string;
}

export interface AttendanceChild {
  childId: string;
  firstName: string;
  lastName: string;
  status: ApiAttendanceStatus;
  timestamp: string;
  updatedByUserId: string;
  dateOfBirth?: string;
}

export interface GroupAttendance {
  id: string;
  groupId: string;
  groupName: string;
  accountId: string;
  accountName: string;
  date: string;
  children: AttendanceChild[];
  isClosed: boolean;
  created: string;
  updated: string;
}

// Daily Reports API functions
export const dailyReportsApi = {
  getDailyReport: async (groupId: string, date: string) => {
    console.log("🌐 [API] getDailyReport called:", { groupId, date });
    console.log(
      "🌐 [API] Request URL:",
      `/api/v1/daily-reports?groupId=${groupId}&date=${date}`
    );

    try {
      const response = await api.get(
        `/api/v1/daily-reports?groupId=${groupId}&date=${date}`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      console.log("✅ [API] getDailyReport response received:", {
        status: response.status,
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
        hasSleepData: !!response.data?.sleepData,
        sleepDataStatus: response.data?.sleepData?.status,
        childrenCount: response.data?.sleepData?.children?.length || 0,
      });

      // Map the API response to use proper enums
      const mappedData = {
        ...response.data,
        sleepData: response.data.sleepData
          ? {
              ...response.data.sleepData,
              status: mapApiStatusToEntityStatus(
                response.data.sleepData.status
              ),
              children:
                response.data.sleepData.children?.map((child: any) => ({
                  ...child,
                  status: mapApiStatusToSleepStatus(child.status),
                })) || [],
            }
          : null,
      };

      console.log("🔄 [API] getDailyReport data mapped:", {
        reportId: mappedData?.id,
        hasSleepData: !!mappedData?.sleepData,
        sleepDataStatus: mappedData?.sleepData?.status,
        childrenCount: mappedData?.sleepData?.children?.length || 0,
      });

      return mappedData;
    } catch (error: any) {
      console.error("💥 [API] getDailyReport error:", {
        error: error,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
      throw error;
    }
  },

  // Get daily reports for all groups on a specific date (for admin users)
  getDailyReportsByDate: async (date: string) => {
    const response = await api.get(`/api/v1/daily-reports?date=${date}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return response.data;
  },

  // Get daily reports for user's children's groups (for parent users)
  getDailyReportsForUser: async (date: string) => {
    const response = await api.get(`/api/v1/daily-reports/user?date=${date}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return response.data;
  },
};

// Attendance API functions
export const attendanceApi = {
  getAttendanceByDate: async (date: string) => {
    const response = await api.get(`/api/v1/attendance/date/${date}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return response.data as GroupAttendance[];
  },

  getGroupAttendance: async (groupId: string, date: string) => {
    const response = await api.get(
      `/api/v1/attendance/group/${groupId}/date/${date}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    return response.data as GroupAttendance;
  },

  updateChildAttendance: async (
    groupId: string,
    date: string,
    childId: string,
    status: string
  ) => {
    const response = await api.put(
      `/api/v1/attendance/group/${groupId}/date/${date}`,
      {
        children: [
          {
            childId: childId,
            status: status,
          },
        ],
        isClosed: false,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    return response.data;
  },

  updateGroupAttendance: async (
    groupId: string,
    date: string,
    attendanceData: GroupAttendance
  ) => {
    const response = await api.put(
      `/api/v1/attendance/group/${groupId}/date/${date}`,
      {
        children: attendanceData.children.map((child) => ({
          childId: child.childId,
          status: child.status,
        })),
        isClosed: attendanceData.isClosed,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    return response.data;
  },
};

// Sleep Post API functions
export interface CreateSleepPostRequest {
  title: string;
  groupId: string;
  groupName: string;
  sleepDate: string;
  children: {
    childId: string;
    firstName: string;
    lastName: string;
    sleepStartTime?: string;
    sleepEndTime?: string;
    sleepDuration?: number;
    notes?: string;
  }[];
}

export interface SleepPostResponse {
  id: string;
  title: string;
  groupId: string;
  groupName: string;
  sleepDate: string;
  children: {
    childId: string;
    firstName: string;
    lastName: string;
    sleepStartTime: string;
    sleepEndTime: string;
    sleepDuration: number;
    notes: string;
  }[];
  totalChildren: number;
  sleepingChildren: number;
  averageSleepDuration: number;
  status: "active" | "completed";
  created: string;
  updated: string;
}

// Update daily report with sleep data
export interface UpdateDailyReportSleepData {
  childrenSleepData: {
    title: string;
    children: {
      childId: string;
      status: SleepStatus;
      comment?: string;
    }[];
  };
}

export const updateDailyReportSleepData = async (
  dailyReportId: string,
  sleepData: UpdateDailyReportSleepData
): Promise<DailyReport> => {
  try {
    logger.info("Updating daily report sleep data", { dailyReportId });

    const response = await api.patch(
      `/api/v1/daily-reports/${dailyReportId}`,
      sleepData
    );

    logger.info("Daily report sleep data updated successfully", {
      dailyReportId,
    });

    return response.data;
  } catch (error) {
    logger.error("Failed to update daily report sleep data", error);
    throw error;
  }
};

export const createSleepPost = async (
  data: CreateSleepPostRequest
): Promise<SleepPostResponse> => {
  try {
    logger.info("Creating sleep post", { groupId: data.groupId });

    const response = await api.post("/api/v1/sleep-posts", data);

    logger.info("Sleep post created successfully", {
      id: response.data.id,
      groupId: data.groupId,
    });

    return response.data;
  } catch (error) {
    logger.error("Failed to create sleep post", error);
    throw error;
  }
};

// Feed API functions
export const feedApi = {
  getFeedByGroup: async (
    groupId: string,
    date: string
  ): Promise<FeedPost[]> => {
    try {
      logger.info("Fetching feed for group", { groupId, date });

      const response = await api.get(`/api/v1/feed/${groupId}?date=${date}`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      logger.info("Feed fetched successfully", {
        groupId,
        date,
        postCount: response.data.length,
      });

      return response.data;
    } catch (error) {
      logger.error("Failed to fetch feed", error);
      throw error;
    }
  },

  getFeedForUser: async (date: string): Promise<FeedPost[]> => {
    try {
      logger.info("Fetching feed for user", { date });

      const response = await api.get(`/api/v1/feed/user?date=${date}`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      logger.info("User feed fetched successfully", {
        date,
        postCount: response.data.length,
      });

      return response.data;
    } catch (error) {
      logger.error("Failed to fetch user feed", error);
      throw error;
    }
  },
};

export default api;
