/**
 * Authentication utilities
 * Helper functions untuk auth di frontend
 */

import { Tables } from './supabase';

export type AuthUser = {
  id: string;
  email: string;
  full_name: string;
  role: 'super_admin' | 'admin';
};

/**
 * Login function (client-side)
 */
export async function loginUser(email: string, password: string): Promise<AuthUser> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include', // Include cookies
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login gagal');
  }

  const data = await response.json();
  return data.user;
}

/**
 * Register function (client-side)
 */
export async function registerUser(
  email: string,
  password: string,
  full_name: string
): Promise<AuthUser> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, full_name }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Register gagal');
  }

  const data = await response.json();
  return data.user;
}

/**
 * Logout function (client-side)
 */
export async function logoutUser(): Promise<void> {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include', // Include cookies
  });

  if (!response.ok) {
    throw new Error('Logout gagal');
  }
}

/**
 * Get current user from server (for server components)
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/me`, {
      cache: 'no-store',
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.user;
  } catch (error) {
    return null;
  }
}
