declare module "axios" {
  export interface AxiosRequestConfig {
    headers?: any;
    withCredentials?: boolean;
    baseURL?: string;
  }

  export interface AxiosResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: any;
    config: AxiosRequestConfig;
  }

  export interface AxiosError<T = any> extends Error {
    config: AxiosRequestConfig;
    code?: string;
    request?: any;
    response?: AxiosResponse<T>;
    isAxiosError: boolean;
  }

  export interface InternalAxiosRequestConfig extends AxiosRequestConfig {
    headers: any;
  }

  export interface AxiosInstance {
    (config: AxiosRequestConfig): Promise<AxiosResponse>;
    (url: string, config?: AxiosRequestConfig): Promise<AxiosResponse>;
    defaults: AxiosRequestConfig;
    interceptors: {
      request: {
        use: (fulfilled: any, rejected: any) => number;
        eject: (id: number) => void;
      };
      response: {
        use: (fulfilled: any, rejected: any) => number;
        eject: (id: number) => void;
      };
    };
    create: (config?: AxiosRequestConfig) => AxiosInstance;
    get: (url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse>;
    post: (
      url: string,
      data?: any,
      config?: AxiosRequestConfig
    ) => Promise<AxiosResponse>;
    put: (
      url: string,
      data?: any,
      config?: AxiosRequestConfig
    ) => Promise<AxiosResponse>;
    delete: (
      url: string,
      config?: AxiosRequestConfig
    ) => Promise<AxiosResponse>;
    patch: (
      url: string,
      data?: any,
      config?: AxiosRequestConfig
    ) => Promise<AxiosResponse>;
  }

  const axios: AxiosInstance;
  export default axios;
}
