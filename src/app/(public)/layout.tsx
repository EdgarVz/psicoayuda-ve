import { Navbar } from '@/features/layout/components/navbar'
import { Footer } from '@/features/layout/components/footer'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      <Footer />
    </>
  )
}
