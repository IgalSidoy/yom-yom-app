import axios, {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  AxiosRequestConfig,
} from "axios";
import { logger } from "../utils/logger";
import {
  SleepStatus,
  EntityStatus,
  FoodStatus,
  FoodEventType,
  FoodDataStatus,
} from "../types/enums";
import { ApiAttendanceStatus } from "../types/attendance";
import { FeedPost } from "../types/posts";
import { deleteRefreshToken } from "../utils/cookieUtils";

const baseURL = process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";

// Utility function to redirect to login
const redirectToLogin = () => {
  // Clear any stored tokens using the utility function
  deleteRefreshToken();

  // Dispatch event to clear access token from context
  const event = new CustomEvent("updateAccessToken", { detail: null });
  window.dispatchEvent(event);

  // Dispatch event to trigger logout in AuthContext
  const logoutEvent = new CustomEvent("forceLogout");
  window.dispatchEvent(logoutEvent);

  // Redirect to login page
  window.location.href = "/login";
};

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
// Flag to prevent refresh during logout
let isLoggingOut = false;

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

  // Log for debugging
  logger.info("Access token updated", {
    hasToken: !!token,
    tokenLength: token?.length || 0,
  });
};

// Function to set logout flag
export const setIsLoggingOut = (value: boolean) => {
  isLoggingOut = value;
  logger.info("Logout flag set", { isLoggingOut: value });
};

// Function to get logout flag
export const getIsLoggingOut = () => {
  return isLoggingOut;
};

// Function to call logout endpoint
export const logoutApi = async () => {
  try {
    logger.info("Calling logout endpoint");
    await api.post(
      "/api/v1/auth/logout",
      {},
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    logger.info("Logout endpoint called successfully");
  } catch (error) {
    // Don't throw error - logout should proceed even if endpoint fails
    logger.warn(
      "Logout endpoint failed, proceeding with client-side logout",
      error
    );
  }
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
    // Since the refresh token is httpOnly, we can't read it from JavaScript
    // But the browser will automatically send it with the request when withCredentials: true
    // The server should read the refresh token from the httpOnly cookie
    const response = await refreshApi.post(
      "/api/v1/auth/refresh",
      {},
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          // Don't manually add Authorization header - let the server read from httpOnly cookie
        },
        withCredentials: true,
      }
    );

    const { token } = response.data;

    return token;
  } catch (error) {
    console.error("Failed to get new access token:", error);
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
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      url?: string;
    };

    // Skip if not a 401 error or if it's a refresh token request or if logging out
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/refresh") ||
      isLoggingOut
    ) {
      return Promise.reject(error);
    }

    // If already refreshing, add request to queue
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
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

      // Update token in context and API headers
      updateAccessToken(token);

      // Also dispatch event to ensure AuthContext is updated
      const event = new CustomEvent("updateAccessToken", { detail: token });
      window.dispatchEvent(event);

      // Process queued requests
      processQueue(null, token);

      // Update the original request headers with the new token
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${token}`;
      }

      // Retry the original request
      return api(originalRequest);
    } catch (refreshError) {
      logger.error("Token refresh failed", refreshError);

      // Clear token from context
      const event = new CustomEvent("updateAccessToken", { detail: null });
      window.dispatchEvent(event);

      processQueue(refreshError, null);

      // Redirect to login page when refresh token is invalid
      redirectToLogin();

      // Return a rejected promise (this won't be reached due to redirect)
      return Promise.reject(
        new Error("Session expired. Redirecting to login...")
      );
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
  groupName?: string;
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
  getUserById: async (userId: string) => {
    const response = await api.get(`/api/v1/user/${userId}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return response as { data: UserResponse };
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

export interface FoodEventChild {
  childId: string;
  firstName: string;
  lastName: string;
  foodDetails: string;
  status: FoodStatus;
  updatedByUserId: string;
  updatedByUserName: string;
}

export interface FoodEvent {
  id: string;
  type: FoodEventType;
  timestamp: string;
  children: FoodEventChild[];
}

export interface FoodData {
  title: string;
  status: FoodDataStatus;
  events: FoodEvent[];
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

// Map API attendance status to feed status format
export const mapAttendanceStatusForFeed = (apiStatus: string): string => {
  const mappedStatus = (() => {
    switch (apiStatus.toLowerCase()) {
      case "arrived":
        return "Present";
      case "missing":
        return "Absent";
      case "sick":
        return "Sick";
      case "late":
        return "Late";
      case "vacation":
        return "Absent"; // Map vacation to absent for feed display
      case "unreported":
        return "Unreported"; // Keep unreported as unreported
      default:
        console.warn(
          `Unknown attendance status from API: ${apiStatus}, defaulting to Absent`
        );
        return "Absent";
    }
  })();

  return mappedStatus;
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
  foodData?: FoodData;
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

      return mappedData;
    } catch (error: any) {
      console.error("getDailyReport error:", error);
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
  title: string;
  children: {
    childId: string;
    status: SleepStatus;
    comment?: string;
  }[];
}

export const updateDailyReportSleepData = async (
  dailyReportId: string,
  sleepData: UpdateDailyReportSleepData
): Promise<DailyReport> => {
  try {
    logger.info("Updating daily report sleep data", { dailyReportId });

    const response = await api.patch(
      `/api/v1/daily-reports/${dailyReportId}/sleep`,
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

// Update daily report with food data
export interface UpdateDailyReportFoodData {
  title: string;
  events: {
    id: string;
    type: FoodEventType;
    timestamp: string;
    children: {
      childId: string;
      foodDetails: string;
      status: FoodStatus;
    }[];
  }[];
}

export const updateDailyReportFoodData = async (
  dailyReportId: string,
  foodData: UpdateDailyReportFoodData
): Promise<DailyReport> => {
  try {
    logger.info("Updating daily report food data", { dailyReportId });

    const response = await api.patch(
      `/api/v1/daily-reports/${dailyReportId}/food`,
      foodData
    );

    logger.info("Daily report food data updated successfully", {
      dailyReportId,
    });

    return response.data;
  } catch (error) {
    logger.error("Failed to update daily report food data", error);
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

      // Map the feed data to handle status mapping for attendance posts
      const mappedData = response.data.map((post: any) => {
        if (
          post.type === "AttendancePost" &&
          post.metadata?.attendanceMetadata
        ) {
          return {
            ...post,
            state: post.state || "Open", // Include state field
            isClosed: post.state === "Closed", // Set isClosed based on state
            metadata: {
              ...post.metadata,
              attendanceMetadata: {
                ...post.metadata.attendanceMetadata,
                childrenAttendanceData:
                  post.metadata.attendanceMetadata.childrenAttendanceData?.map(
                    (child: any) => ({
                      ...child,
                      status: mapAttendanceStatusForFeed(child.status),
                    })
                  ) || [],
              },
            },
          };
        }
        // Handle other post types (like SleepPost)
        return {
          ...post,
          state: post.state || "Open", // Include state field
          isClosed: post.state === "Closed", // Set isClosed based on state
        };
      });

      return mappedData;
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

      // Map the feed data to handle status mapping for attendance posts
      const mappedData = response.data.map((post: any) => {
        if (
          post.type === "AttendancePost" &&
          post.metadata?.attendanceMetadata
        ) {
          return {
            ...post,
            state: post.state || "Open", // Include state field
            isClosed: post.state === "Closed", // Set isClosed based on state
            metadata: {
              ...post.metadata,
              attendanceMetadata: {
                ...post.metadata.attendanceMetadata,
                childrenAttendanceData:
                  post.metadata.attendanceMetadata.childrenAttendanceData?.map(
                    (child: any) => ({
                      ...child,
                      status: mapAttendanceStatusForFeed(child.status),
                    })
                  ) || [],
              },
            },
          };
        }
        return post;
      });

      return mappedData;
    } catch (error) {
      logger.error("Failed to fetch user feed", error);
      throw error;
    }
  },
};

export default api;
