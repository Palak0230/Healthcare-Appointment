const API_BASE = '/api';
export function getAuthToken() {
    return localStorage.getItem('hc_token');
}
export function setAuthToken(token) {
    localStorage.setItem('hc_token', token);
}
export function removeAuthToken() {
    localStorage.removeItem('hc_token');
}
export async function apiRequest(endpoint, method = 'GET', data) {
    const token = getAuthToken();
    const headers = {
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
    return resData;
}
