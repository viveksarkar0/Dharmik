const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

// Utility: clear auth storage
const clearAuth = (): void => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('user');
};

interface RequestOptions extends RequestInit {
  token?: string | null;
  isFormData?: boolean;
}

export const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<{ data?: T; error?: string }> => {
  const { token, isFormData, ...fetchOptions } = options;
  
  // Set up headers
  const headers: HeadersInit = {};
  
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  // Add auth token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...fetchOptions,
      headers: {
        ...headers,
        ...fetchOptions.headers,
      },
    });

    // Handle unauthorized responses
    if (response.status === 401) {
      clearAuth();
      window.location.href = '/login';
      return { error: 'Session expired. Please log in again.' };
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        error: data.message || `Request failed with status ${response.status}`,
      };
    }

    return { data };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      error: error instanceof Error ? error.message : 'Network request failed',
    };
  }
};

// Helper methods for common HTTP methods
export const api = {
  get: <T = any>(endpoint: string, token?: string) =>
    apiRequest<T>(endpoint, { method: 'GET', token }),

  post: <T = any>(endpoint: string, body: any, token?: string, isFormData = false) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
      token,
      isFormData,
    }),

  put: <T = any>(endpoint: string, body: any, token?: string) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      token,
    }),

  patch: <T = any>(endpoint: string, body: any, token?: string) =>
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
      token,
    }),

  delete: <T = any>(endpoint: string, token?: string) =>
    apiRequest<T>(endpoint, { method: 'DELETE', token }),
};
