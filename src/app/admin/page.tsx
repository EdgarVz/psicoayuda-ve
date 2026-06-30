import type { Metadata } from 'next'
import { getPendingPsychologists } from '@/features/admin/actions'
import { PendingVerification } from '@/features/admin/components/pending-verification'

export const metadata: Metadata = {
  title: 'Verificaciones pendientes',
}

export default async function AdminPage() {
  const pending = await getPendingPsychologists()

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Verificaciones pendientes</h1>
      <PendingVerification psychologists={pending} />
    </div>
  )
}
