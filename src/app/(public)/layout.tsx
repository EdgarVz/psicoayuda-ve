import { headers } from 'next/headers'
import { Navbar } from '@/features/layout/components/navbar'
import { Footer } from '@/features/layout/components/footer'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const isLoggedIn = headersList.get('x-user-authenticated') === 'true'

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      <Footer />
    </>
  )
}
