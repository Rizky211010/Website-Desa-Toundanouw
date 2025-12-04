"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  type UserRole, 
  type Permission,
  hasPermission, 
  canAccessRoute,
  getRoleDisplayName,
} from "./roles";

// Re-export for convenience
export type { Permission } from "./roles";

// ============================================
// Types
// ============================================

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
}

interface AdminAuthContextType {
  isAdminLoggedIn: boolean;
  isLoading: boolean;
  user: AdminUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  // Role helpers
  isSuperAdmin: boolean;
  isAdmin: boolean;
  // Permission helpers
  hasPermission: (permission: Permission) => boolean;
  canAccess: (path: string) => boolean;
  // Role info
  roleDisplayName: string;
}

// ============================================
// Context
// ============================================

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

// ============================================
// Provider
// ============================================

interface AdminAuthProviderProps {
  children: ReactNode;
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AdminUser | null>(null);
  const router = useRouter();

  // Computed role helpers using useMemo to ensure reactivity
  const isSuperAdmin = useMemo(() => user?.role === 'super_admin', [user]);
  const isAdmin = useMemo(() => user?.role === 'admin', [user]);

  // Get role display name
  const roleDisplayName = useMemo(() => {
    if (!user) return '';
    return getRoleDisplayName(user.role);
  }, [user]);

  // Check if user has a specific permission
  const checkPermission = useCallback((permission: Permission): boolean => {
    if (!user) return false;
    return hasPermission(user.role, permission);
  }, [user]);

  // Check if user can access a path
  const canAccess = useCallback((path: string): boolean => {
    if (!user) return false;
    return canAccessRoute(user.role, path);
  }, [user]);

  // Check auth status via API
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/me', { credentials: 'include' });
      
      if (response.ok) {
        const data = await response.json();
        setIsAdminLoggedIn(true);
        setUser(data.user);
      } else {
        setIsAdminLoggedIn(false);
        setUser(null);
      }
    } catch {
      setIsAdminLoggedIn(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login function
  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setIsAdminLoggedIn(true);
          setUser(data.user);
          router.push("/admin/dashboard");
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [router]
  );

  // Logout function
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignore errors
    }
    setIsAdminLoggedIn(false);
    setUser(null);
    router.push("/admin/login");
  }, [router]);

  return (
    <AdminAuthContext.Provider
      value={{ 
        isAdminLoggedIn, 
        isLoading, 
        user, 
        login, 
        logout, 
        checkAuth, 
        isSuperAdmin,
        isAdmin, 
        hasPermission: checkPermission,
        canAccess,
        roleDisplayName,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

// ============================================
// Hook
// ============================================

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}

// ============================================
// Auth Guard Component
// ============================================

interface AdminAuthGuardProps {
  children: ReactNode;
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { isAdminLoggedIn, isLoading, canAccess, user, logout } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [hasAccess, setHasAccess] = useState(true);

  useEffect(() => {
    // Skip redirect if still loading or on login page
    if (isLoading || pathname === "/admin/login") {
      return;
    }

    // Redirect to login if not authenticated
    if (!isAdminLoggedIn) {
      router.push("/admin/login");
      return;
    }

    // Check role-based access
    if (user && !canAccess(pathname)) {
      setHasAccess(false);
      
      // Only redirect if NOT already on dashboard to avoid infinite loop
      if (pathname !== "/admin/dashboard") {
        // Optional: still try to redirect to dashboard, but if that fails (dashboard also denied), 
        // the next render will catch it in the "pathname === '/admin/dashboard'" check above (next time)
        // or simply let the user see the access denied page with options.
        // For better UX, let's try to push to dashboard, but the guard will run again.
        router.push("/admin/dashboard");
      }
    } else {
      setHasAccess(true);
    }
  }, [isAdminLoggedIn, isLoading, pathname, router, canAccess, user]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500 text-sm">Memuat...</p>
        </div>
      </div>
    );
  }

  // If on login page, always show children
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // If not logged in and not on login page, don't render (redirect will happen)
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500 text-sm">Mengalihkan ke login...</p>
        </div>
      </div>
    );
  }

  // If no access to this page, show redirect message
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="mb-4 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Akses Ditolak</h3>
          <p className="mt-2 text-gray-500 text-sm">
            Anda tidak memiliki izin untuk mengakses halaman ini.
            {user && <span className="block mt-1 text-xs text-gray-400">Role: {user.role}</span>}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            {pathname !== "/admin/dashboard" && (
              <button
                onClick={() => router.push("/admin/dashboard")}
                className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors text-sm"
              >
                Ke Dashboard
              </button>
            )}
            <button
              onClick={() => logout()}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// ============================================
// Permission Guard Component (for inline usage)
// ============================================

interface PermissionGuardProps {
  children: ReactNode;
  permission: Permission;
  fallback?: ReactNode;
}

export function PermissionGuard({ children, permission, fallback = null }: PermissionGuardProps) {
  const { hasPermission } = useAdminAuth();
  
  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

// ============================================
// Role Guard Component (for inline usage)
// ============================================

interface RoleGuardProps {
  children: ReactNode;
  roles: UserRole[];
  fallback?: ReactNode;
}

export function RoleGuard({ children, roles, fallback = null }: RoleGuardProps) {
  const { user } = useAdminAuth();
  
  if (!user || !roles.includes(user.role)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}
