import { headers } from 'next/headers'
import { Navbar } from '@/features/layout/components/navbar'
import { Footer } from '@/features/layout/components/footer'
import { getUnreadCount, getRecentNotifications } from '@/features/notifications/queries'
import type { NotificationRow } from '@/features/notifications/types'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const isLoggedIn = headersList.get('x-user-authenticated') === 'true'

  let unreadCount = 0
  let recentNotifications: NotificationRow[] = []
  if (isLoggedIn) {
    [unreadCount, recentNotifications] = await Promise.all([
      getUnreadCount(),
      getRecentNotifications(),
    ])
  }

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} unreadCount={unreadCount} recentNotifications={recentNotifications} />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      <Footer />
    </>
  )
}
