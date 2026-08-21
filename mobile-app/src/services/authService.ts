import { API_BASE_URL } from '@/constants/apiConfig';

export interface User {
  id: string;
  alias: string;
  email: string;
  role: string;
  isVerified?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user?: User;
  requiresOtp?: boolean;
  email?: string;
  alias?: string;
}

const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs = 30000): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error(`Connection timed out (${timeoutMs/1000}s). Please check your internet connection and try again.`);
    }
    throw new Error(`Unable to reach backend server. Please verify your internet connection and try again.`);
  } finally {
    clearTimeout(timer);
  }
};

export const loginUser = async (email: string, password: string, role?: string): Promise<AuthResponse> => {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, role }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Login failed. Please check your credentials.');
  }

  return data;
};

export const registerUser = async (
  alias: string,
  email: string,
  password: string,
  role: string
): Promise<AuthResponse> => {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ alias, email, password, role }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Registration failed. Please try again.');
  }

  return data;
};

export const sendOtp = async (email: string): Promise<{ message: string }> => {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/auth/send-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to send verification code.');
  }

  return data;
};

export const verifyOtp = async (email: string, code: string): Promise<AuthResponse> => {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/auth/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, code }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Verification failed. Please check the code.');
  }

  return data;
};

export const resetPasswordApi = async (email: string, code: string, newPassword: string): Promise<{ message: string }> => {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, code, newPassword }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to reset password.');
  }

  return data;
};
