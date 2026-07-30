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

export const loginUser = async (email: string, password: string, role?: string): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
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
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
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
  const response = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
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
  const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
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
