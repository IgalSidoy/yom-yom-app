import axios, {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { areObjectsDifferent } from "../utils/hash";

const baseURL = process.env.REACT_APP_API_BASE_URL;

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      url?: string;
    };

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // The refresh token is automatically sent as a cookie
        const response = await axios.post(
          `${baseURL}/api/v1/auth/refresh`,
          {},
          {
            withCredentials: true,
          }
        );

        const { token } = response.data;
        localStorage.setItem("accessToken", token);

        // Retry the original request with the new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh token fails, redirect to login
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // Handle 404 for user endpoint
    if (
      error.response?.status === 404 &&
      originalRequest.url?.includes("/api/v1/user")
    ) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    return Promise.reject(error);
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
    const response = await api.get("/api/v1/user");
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
    const hasChanges =
      currentAccount.branchName !== account.branchName ||
      currentAccount.branchCode !== account.branchCode;

    // Only update if there are actual changes
    if (hasChanges) {
      const response = await api.put(`/api/v1/account/${account.id}`, {
        branchName: account.branchName,
        branchCode: account.branchCode,
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
}

export const groupApi = {
  getGroups: async (accountId: string) => {
    const response = await api.get(`/api/v1/group?accountId=${accountId}`);
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
