/**
 * useAuth hook
 * For client components yang perlu access user data & logout
 */

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthUser } from './auth';

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' });

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        setError('Failed to fetch user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      setUser(null);
      router.push('/admin/login');
    } catch (err) {
      setError('Failed to logout');
    }
  }, [router]);

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    logout,
  };
}
