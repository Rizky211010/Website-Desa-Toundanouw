/**
 * Activity Log Helper
 * Helper functions untuk mencatat aktivitas user
 */

export type ActivityAction = 
  | 'login'
  | 'logout'
  | 'create'
  | 'update'
  | 'delete'
  | 'publish'
  | 'unpublish'
  | 'approve'
  | 'reject'
  | 'view';

export type EntityType = 
  | 'berita'
  | 'galeri'
  | 'surat'
  | 'organisasi'
  | 'potensi'
  | 'profil'
  | 'user'
  | 'setting'
  | 'message';

interface LogActivityParams {
  action: ActivityAction;
  entityType?: EntityType;
  entityId?: string;
  entityTitle?: string;
  details?: Record<string, any>;
}

/**
 * Log an activity to the activity_log table
 */
export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    await fetch('/api/activity-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        action: params.action,
        entity_type: params.entityType,
        entity_id: params.entityId,
        entity_title: params.entityTitle,
        details: params.details,
      }),
    });
  } catch (error) {
    // Log errors silently - don't break the main flow
    console.error('Failed to log activity:', error);
  }
}

/**
 * Get activity action display info
 */
export function getActivityActionInfo(action: ActivityAction): {
  label: string;
  color: string;
  icon: string;
} {
  switch (action) {
    case 'login':
      return { label: 'Login', color: 'blue', icon: '🔑' };
    case 'logout':
      return { label: 'Logout', color: 'gray', icon: '🚪' };
    case 'create':
      return { label: 'Buat', color: 'green', icon: '➕' };
    case 'update':
      return { label: 'Update', color: 'yellow', icon: '✏️' };
    case 'delete':
      return { label: 'Hapus', color: 'red', icon: '🗑️' };
    case 'publish':
      return { label: 'Publish', color: 'green', icon: '📢' };
    case 'unpublish':
      return { label: 'Unpublish', color: 'orange', icon: '📝' };
    case 'approve':
      return { label: 'Setuju', color: 'green', icon: '✅' };
    case 'reject':
      return { label: 'Tolak', color: 'red', icon: '❌' };
    case 'view':
      return { label: 'Lihat', color: 'gray', icon: '👁️' };
    default:
      return { label: action, color: 'gray', icon: '📋' };
  }
}

/**
 * Get entity type display info
 */
export function getEntityTypeInfo(entityType: EntityType): {
  label: string;
  color: string;
} {
  switch (entityType) {
    case 'berita':
      return { label: 'Berita', color: 'orange' };
    case 'galeri':
      return { label: 'Galeri', color: 'purple' };
    case 'surat':
      return { label: 'Surat', color: 'blue' };
    case 'organisasi':
      return { label: 'Organisasi', color: 'green' };
    case 'potensi':
      return { label: 'Potensi', color: 'yellow' };
    case 'profil':
      return { label: 'Profil', color: 'indigo' };
    case 'user':
      return { label: 'User', color: 'red' };
    case 'setting':
      return { label: 'Pengaturan', color: 'gray' };
    case 'message':
      return { label: 'Pesan', color: 'cyan' };
    default:
      return { label: entityType, color: 'gray' };
  }
}
