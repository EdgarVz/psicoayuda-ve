'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { markAsRead, markAllAsRead, refreshNotifications } from '@/features/notifications/actions'
import { NotificationItem } from './notification-item'
import type { NotificationRow } from '@/features/notifications/types'

interface NotificationDropdownProps {
  initialCount: number
  initialNotifications: NotificationRow[]
}

export function NotificationDropdown({ initialCount, initialNotifications }: NotificationDropdownProps) {
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [notifications, setNotifications] = useState(initialNotifications)

  const refresh = useCallback(async () => {
    const result = await refreshNotifications()
    setCount(result.count)
    setNotifications(result.notifications)
  }, [])

  async function handleMarkAsRead(id: string) {
    await markAsRead(id)
    await refresh()
  }

  async function handleMarkAllAsRead() {
    await markAllAsRead()
    await refresh()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Notificaciones"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-danger text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-medium">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-border rounded-radius-card shadow-lg z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <p className="text-sm font-semibold">Notificaciones</p>
              {count > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-primary hover:underline"
                >
                  Marcar todas como leídas
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No hay notificaciones</p>
              ) : (
                notifications.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onMarkAsRead={handleMarkAsRead}
                  />
                ))
              )}
            </div>
            <Link
              href="/dashboard/notificaciones"
              onClick={() => setOpen(false)}
              className="block text-center text-sm text-primary hover:bg-background-alt py-3 border-t border-border transition-colors"
            >
              Ver todas las notificaciones
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
