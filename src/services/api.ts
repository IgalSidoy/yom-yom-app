import axios, {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

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
    return response;
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
    return response;
  },
  updateOrganization: async (organization: Organization) => {
    const response = await api.put(`/api/v1/organization/${organization.id}`, {
      businessId: organization.businessId,
      name: organization.name,
      email: organization.email,
      phone: organization.phone,
    });
    return response;
  },
};

// Account API functions
export interface Account {
  id: string;
  branchName: string;
  branchCode: number;
  organizationId: string;
  created: string;
  updated: string;
}

export interface AccountResponse {
  account: Account;
}

export const accountApi = {
  getAccount: async (accountId: string) => {
    const response = await api.get(`/api/v1/account/${accountId}`);
    return response;
  },
  updateAccount: async (account: Account) => {
    const response = await api.put(`/api/v1/account/${account.id}`, {
      branchName: account.branchName,
      branchCode: account.branchCode,
    });
    return response;
  },
};

export default api;
