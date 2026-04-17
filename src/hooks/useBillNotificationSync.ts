import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';
import { NotificationService } from '@/services/NotificationService';

/**
 * Syncs bill reminders with the OS notification scheduler.
 * Mount this hook ONCE in Dashboard.tsx.
 * Re-schedules all bill notifications when user session is ready
 * and notification permission has been granted.
 */
export function useBillNotificationSync(): void {
  const { session } = useAuth();
  const { hasPermission } = useNotification();
  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId || !hasPermission) return;
    NotificationService.scheduleBillReminders(userId);
  }, [userId, hasPermission]);
}
