/**
 * Role-Based Access Control (RBAC) Helper
 * Definisi role dan permission untuk Website Desa
 */

// ============================================
// Role Types
// ============================================

export type UserRole = 'super_admin' | 'admin';

export type BeritaStatus = 'draft' | 'published';

// ============================================
// Permission Types
// ============================================

export type Permission =
  // Berita permissions
  | 'berita.create'
  | 'berita.read'
  | 'berita.read_all'       // Bisa baca semua berita (termasuk draft/pending orang lain)
  | 'berita.update'
  | 'berita.update_all'     // Bisa update semua berita
  | 'berita.delete'
  | 'berita.delete_all'     // Bisa delete semua berita
  | 'berita.publish'        // Bisa publish/unpublish berita
  // Galeri permissions
  | 'galeri.create'
  | 'galeri.read'
  | 'galeri.update'
  | 'galeri.update_all'
  | 'galeri.delete'
  | 'galeri.delete_all'
  // Surat permissions
  | 'surat.create'
  | 'surat.read'
  | 'surat.update'
  | 'surat.delete'
  // Organisasi permissions
  | 'organisasi.create'
  | 'organisasi.read'
  | 'organisasi.update'
  | 'organisasi.delete'
  // Potensi permissions
  | 'potensi.create'
  | 'potensi.read'
  | 'potensi.update'
  | 'potensi.delete'
  // Struktur Pemerintahan permissions
  | 'struktur.create'
  | 'struktur.read'
  | 'struktur.update'
  | 'struktur.delete'
  // Profil Desa permissions
  | 'profil.read'
  | 'profil.update'
  // Pesan/Kontak permissions
  | 'pesan.read'
  | 'pesan.reply'
  | 'pesan.delete'
  // Notifikasi permissions
  | 'notifikasi.create'
  | 'notifikasi.read'
  | 'notifikasi.update'
  | 'notifikasi.delete'
  // Pengaturan Website permissions
  | 'pengaturan.read'
  | 'pengaturan.update'
  // Admin Management permissions
  | 'admin.create'
  | 'admin.read'
  | 'admin.update'
  | 'admin.delete'
  | 'admin.activate'
  | 'admin.reset_password'
  // Statistik/Log permissions
  | 'statistik.read'
  | 'log.read'
  // Dashboard permissions
  | 'dashboard.read'
  | 'dashboard.full';

// ============================================
// Role Permission Map
// ============================================

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // Super Admin: Full access semua fitur
  super_admin: [
    // Berita - full access
    'berita.create', 'berita.read', 'berita.read_all', 'berita.update', 'berita.update_all',
    'berita.delete', 'berita.delete_all', 'berita.publish',
    // Galeri - full access
    'galeri.create', 'galeri.read', 'galeri.update', 'galeri.update_all', 'galeri.delete', 'galeri.delete_all',
    // Surat - full access
    'surat.create', 'surat.read', 'surat.update', 'surat.delete',
    // Organisasi - full access
    'organisasi.create', 'organisasi.read', 'organisasi.update', 'organisasi.delete',
    // Potensi - full access
    'potensi.create', 'potensi.read', 'potensi.update', 'potensi.delete',
    // Struktur - full access
    'struktur.create', 'struktur.read', 'struktur.update', 'struktur.delete',
    // Profil - full access
    'profil.read', 'profil.update',
    // Pesan - full access
    'pesan.read', 'pesan.reply', 'pesan.delete',
    // Notifikasi - full access
    'notifikasi.create', 'notifikasi.read', 'notifikasi.update', 'notifikasi.delete',
    // Pengaturan - full access
    'pengaturan.read', 'pengaturan.update',
    // Admin Management - full access
    'admin.create', 'admin.read', 'admin.update', 'admin.delete', 'admin.activate', 'admin.reset_password',
    // Statistik/Log - full access
    'statistik.read', 'log.read',
    // Dashboard
    'dashboard.read', 'dashboard.full',
  ],
  
  // Admin (Perangkat Desa): Kelola semua konten, tidak bisa manage admin
  admin: [
    // Berita - full access untuk konten
    'berita.create', 'berita.read', 'berita.read_all', 'berita.update', 'berita.update_all',
    'berita.delete', 'berita.delete_all', 'berita.publish',
    // Galeri - full access
    'galeri.create', 'galeri.read', 'galeri.update', 'galeri.update_all', 'galeri.delete', 'galeri.delete_all',
    // Surat - full access
    'surat.create', 'surat.read', 'surat.update', 'surat.delete',
    // Organisasi - full access
    'organisasi.create', 'organisasi.read', 'organisasi.update', 'organisasi.delete',
    // Potensi - full access
    'potensi.create', 'potensi.read', 'potensi.update', 'potensi.delete',
    // Struktur - full access
    'struktur.create', 'struktur.read', 'struktur.update', 'struktur.delete',
    // Profil - full access
    'profil.read', 'profil.update',
    // Pesan - full access
    'pesan.read', 'pesan.reply', 'pesan.delete',
    // Notifikasi - full access
    'notifikasi.create', 'notifikasi.read', 'notifikasi.update', 'notifikasi.delete',
    // Pengaturan - read only (level desa)
    'pengaturan.read', 'pengaturan.update',
    // Statistik - read only
    'statistik.read',
    // Dashboard
    'dashboard.read', 'dashboard.full',
  ],
  
};

// ============================================
// Route Access Control
// ============================================

// Routes yang bisa diakses per role
export const ROLE_ROUTES: Record<UserRole, string[]> = {
  super_admin: [
    '/admin/dashboard',
    '/admin/konten',
    '/admin/konten/profil',
    '/admin/konten/berita',
    '/admin/konten/galeri',
    '/admin/konten/potensi',
    '/admin/konten/jelajahi',
    '/admin/konten/jelajahi/organisasi',
    '/admin/konten/jelajahi/wilayah',
    '/admin/konten/jelajahi/penduduk',
    '/admin/layanan',
    '/admin/layanan/surat',
    '/admin/pesan',
    '/admin/pengaturan',
    '/admin/pengaturan/admin',
    '/admin/pengaturan/kontak',
    '/admin/pengaturan/hero',
    '/admin/pengaturan/notifikasi',
    '/admin/statistik',
    '/admin/log',
    '/admin/activity-log',
    // Legacy routes
    '/admin/berita',
    '/admin/surat',
  ],
  
  admin: [
    '/admin/dashboard',
    '/admin/konten',
    '/admin/konten/profil',
    '/admin/konten/berita',
    '/admin/konten/galeri',
    '/admin/konten/potensi',
    '/admin/konten/jelajahi',
    '/admin/konten/jelajahi/organisasi',
    '/admin/konten/jelajahi/wilayah',
    '/admin/konten/jelajahi/penduduk',
    '/admin/layanan',
    '/admin/layanan/surat',
    '/admin/pesan',
    '/admin/pengaturan',
    '/admin/pengaturan/kontak',
    '/admin/pengaturan/hero',
    '/admin/pengaturan/notifikasi',
    '/admin/statistik',
    // Legacy routes
    '/admin/berita',
    '/admin/surat',
  ],
  
};

// ============================================
// Helper Functions
// ============================================

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check if a role can access a specific route
 */
export function canAccessRoute(role: UserRole, pathname: string): boolean {
  const allowedRoutes = ROLE_ROUTES[role] || [];
  return allowedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
}

/**
 * Get display name for a role
 */
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case 'super_admin':
      return 'Super Admin';
    case 'admin':
      return 'Admin';
    default:
      return role;
  }
}

/**
 * Get description for a role
 */
export function getRoleDescription(role: UserRole): string {
  switch (role) {
    case 'super_admin':
      return 'Akses penuh ke semua fitur website termasuk manajemen admin';
    case 'admin':
      return 'Pengelola website desa, dapat mengelola semua konten';
    default:
      return '';
  }
}

/**
 * Get color for a role (for badges/UI)
 */
export function getRoleColor(role: UserRole): string {
  switch (role) {
    case 'super_admin':
      return 'red';
    case 'admin':
      return 'blue';
    default:
      return 'gray';
  }
}

/**
 * Check if a user can manage another user based on roles
 */
export function canManageUser(managerRole: UserRole, targetRole: UserRole): boolean {
  // Super admin can manage anyone
  if (managerRole === 'super_admin') return true;
  
  // Admin cannot manage other admins or super_admins
  return false;
}

/**
 * Get available roles that a user can assign to others
 */
export function getAssignableRoles(role: UserRole): UserRole[] {
  switch (role) {
    case 'super_admin':
      return ['super_admin', 'admin'];
    default:
      return [];
  }
}

/**
 * Get berita status display info
 */
export function getBeritaStatusInfo(status: BeritaStatus): { 
  label: string; 
  color: string; 
  description: string 
} {
  switch (status) {
    case 'draft':
      return {
        label: 'Draft',
        color: 'gray',
        description: 'Berita masih dalam tahap penulisan'
      };
    case 'published':
      return {
        label: 'Dipublikasikan',
        color: 'green',
        description: 'Berita sudah dipublikasikan dan dapat dilihat publik'
      };
    default:
      return {
        label: status,
        color: 'gray',
        description: ''
      };
  }
}

/**
 * Check if user can edit a specific berita
 */
export function canEditBerita(
  userRole: UserRole, 
  userId: string, 
  beritaAuthorId: string | null
): boolean {
  // Super admin and admin can edit all berita
  if (userRole === 'super_admin' || userRole === 'admin') return true;
  
  return false;
}

/**
 * Check if user can delete a specific berita
 */
export function canDeleteBerita(
  userRole: UserRole, 
  userId: string, 
  beritaAuthorId: string | null
): boolean {
  // Super admin and admin can delete all berita
  if (userRole === 'super_admin' || userRole === 'admin') return true;
  
  return false;
}

/**
 * Check if user can change berita status
 */
export function canChangeBeritaStatus(
  userRole: UserRole, 
  currentStatus: BeritaStatus, 
  newStatus: BeritaStatus,
  userId: string,
  beritaAuthorId: string | null
): boolean {
  // Super admin dan admin bisa mengubah ke status apapun
  if (userRole === 'super_admin' || userRole === 'admin') return true;
  
  return false;
}

/**
 * Check if user can edit a specific galeri
 */
export function canEditGaleri(
  userRole: UserRole, 
  userId: string, 
  galeriAuthorId: string | null
): boolean {
  // Super admin and admin can edit all galeri
  if (userRole === 'super_admin' || userRole === 'admin') return true;
  
  return false;
}

/**
 * Check if user can delete a specific galeri
 */
export function canDeleteGaleri(
  userRole: UserRole, 
  userId: string, 
  galeriAuthorId: string | null
): boolean {
  // Super admin and admin can delete all galeri
  if (userRole === 'super_admin' || userRole === 'admin') return true;
  
  return false;
}
