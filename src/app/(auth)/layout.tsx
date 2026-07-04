import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { Navbar } from '@/features/layout/components/navbar'
import { Footer } from '@/features/layout/components/footer'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const isLoggedIn = headersList.get('x-user-authenticated') === 'true'

  if (!isLoggedIn) {
    redirect('/login')
  }

  return (
    <>
      <Navbar isLoggedIn />
      <main>{children}</main>
      <Footer />
    </>
  )
}
