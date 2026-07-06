'use client'

import { useState, useEffect } from 'react'
import { markAsRead, getAllNotificationsAction } from '@/features/notifications/actions'
import { NotificationItem } from './notification-item'
import type { NotificationRow } from '@/features/notifications/types'

export function NotificationList() {
  const [page, setPage] = useState(1)
  const [notifications, setNotifications] = useState<NotificationRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const pageSize = 20

  function goToPage(nextPage: number) {
    setLoading(true)
    setPage(nextPage)
  }

  useEffect(() => {
    let cancelled = false
    getAllNotificationsAction(page, pageSize).then((result) => {
      if (cancelled) return
      setNotifications(result.notifications)
      setTotal(result.total)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [page, pageSize])

  async function handleMarkAsRead(id: string) {
    await markAsRead(id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    )
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1">Notificaciones</h2>
      <p className="text-muted-foreground text-sm mb-6">Historial de notificaciones</p>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 bg-white border border-border rounded-radius-card">
          <p className="text-lg font-medium text-foreground mb-2">No hay notificaciones</p>
          <p className="text-sm text-muted-foreground">
            Aquí aparecerán las notificaciones sobre tus solicitudes y perfil.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white border border-border rounded-radius-card overflow-hidden">
            {notifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onMarkAsRead={handleMarkAsRead}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => goToPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm border border-border rounded-radius-button disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="px-4 py-2 text-sm text-muted-foreground">
                {page} de {totalPages}
              </span>
              <button
                onClick={() => goToPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm border border-border rounded-radius-button disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
