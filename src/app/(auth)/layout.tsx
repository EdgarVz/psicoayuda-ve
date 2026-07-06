import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { Navbar } from '@/features/layout/components/navbar'
import { Footer } from '@/features/layout/components/footer'
import { getUnreadCount, getRecentNotifications } from '@/features/notifications/queries'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const isLoggedIn = headersList.get('x-user-authenticated') === 'true'

  if (!isLoggedIn) {
    redirect('/login')
  }

  const [unreadCount, recentNotifications] = await Promise.all([
    getUnreadCount(),
    getRecentNotifications(),
  ])

  return (
    <>
      <Navbar isLoggedIn unreadCount={unreadCount} recentNotifications={recentNotifications} />
      <main>{children}</main>
      <Footer />
    </>
  )
}
