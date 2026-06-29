import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const isLoggedIn = headersList.get('x-user-authenticated') === 'true'

  if (!isLoggedIn) {
    redirect('/login')
  }

  return <>{children}</>
}
