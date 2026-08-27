const BASE_URL = (import.meta as any).env?.VITE_API_URL || '';

export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, any>;
}

export class ApiClientError extends Error {
  public statusCode: number;
  public details?: any;

  constructor(message: string, statusCode: number, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('savvyscholar_token');
  }

  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${BASE_URL}${cleanEndpoint}`;

    if (!params) return url;

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `${url}?${queryString}` : url;
  }

  async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const { params, headers = {}, ...customOptions } = options;
    const url = this.buildUrl(endpoint, params);

    const token = this.getToken();
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...customOptions,
      headers: {
        ...defaultHeaders,
        ...(headers as Record<string, string>),
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          if (token) {
            localStorage.removeItem('savvyscholar_token');
            localStorage.removeItem('savvyscholar_user');
            window.location.href = '/login?expired=true';
          }
        }
        throw new ApiClientError(
          data.message || `Request failed with status ${response.status}`,
          response.status,
          data.details
        );
      }

      return data.data !== undefined ? data.data : data;
    } catch (error: any) {
      if (error instanceof ApiClientError) {
        throw error;
      }
      throw new ApiClientError(
        error.message || 'Network error occurred. Please check your connection.',
        0
      );
    }
  }

  get<T>(endpoint: string, params?: Record<string, any>, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET', params });
  }

  post<T>(endpoint: string, body?: any, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(endpoint: string, body?: any, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(endpoint: string, body?: any, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient();
