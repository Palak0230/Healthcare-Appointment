const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('hc_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('hc_token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('hc_token');
}

export async function apiRequest<T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  const resData = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(resData.error || resData.message || 'API request failed');
  }

  return resData as T;
}
