'use client'

import type { NotificationRow } from '@/features/notifications/types'

interface NotificationItemProps {
  notification: NotificationRow
  onMarkAsRead: (id: string) => void
}

const typeIcons: Record<string, string> = {
  request_received: '📋',
  request_accepted: '✅',
  request_rejected: '❌',
  profile_verified: '🎉',
  profile_rejected: 'ℹ️',
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const icon = typeIcons[notification.type] ?? '🔔'

  return (
    <div
      className={`px-4 py-3 text-sm border-b border-border last:border-b-0 transition-colors ${
        notification.read_at ? 'opacity-60' : 'bg-primary/5'
      }`}
    >
      <div className="flex items-start gap-2">
        <span className="text-base mt-0.5">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{notification.title}</p>
          <p className="text-muted-foreground text-xs mt-0.5 line-clamp-2">{notification.body}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(notification.created_at).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        {!notification.read_at && (
          <button
            onClick={() => onMarkAsRead(notification.id)}
            className="text-xs text-primary hover:underline shrink-0 mt-1"
          >
            Leído
          </button>
        )}
      </div>
    </div>
  )
}
