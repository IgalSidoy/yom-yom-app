import axios, {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { logger } from "../utils/logger";

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
const getNewAccessToken = async () => {
  try {
    logger.info("Getting new access token using refresh token");

    // Get refresh token from cookies
    const cookies = document.cookie.split(";");
    const refreshTokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("refreshToken=")
    );
    const refreshToken = refreshTokenCookie
      ? refreshTokenCookie.split("=")[1]
      : null;

    if (!refreshToken) {
      throw new Error("No refresh token found");
    }

    const response = await refreshApi.post(
      "/api/v1/auth/refresh",
      {},
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );

    const { token } = response.data;
    updateAccessToken(token);
    return token;
  } catch (error) {
    logger.error("Failed to get new access token", error);
    throw error;
  }
};

// Add request interceptor to the api instance
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig & { url?: string }) => {
    // Skip for refresh token requests
    if (config.url?.includes("/auth/refresh")) {
      return config;
    }

    // Try to get token from context first
    const token = await getAccessTokenFromContext();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    }

    // If no token in context, try to get new one
    try {
      const newToken = await getNewAccessToken();
      if (newToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${newToken}`;
      }
    } catch (error) {
      logger.error("Failed to get access token in request interceptor", error);
    }

    return config;
  },
  (error: AxiosError) => {
    logger.error("Request interceptor error", error);
    return Promise.reject(error);
  }
);

// Add response interceptor to the api instance
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      url?: string;
    };

    // Skip if not a 401 error or if it's a refresh token request
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/refresh")
    ) {
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

      updateAccessToken(null);
      processQueue(refreshError, null);

      // Clear any existing error messages
      console.clear();

      // Redirect to login page
      window.location.href = "/login";

      // Reject the promise to stop any further processing
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
}

export interface UserResponse {
  user: User;
}

export const userApi = {
  getUser: async () => {
    const response = await api.get("/api/v1/user", {
      headers: {
        Accept: "application/json",
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

export default api;
