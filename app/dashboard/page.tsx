import { redirect } from 'next/navigation'
import { getAuthUserAsync } from '@/lib/auth'
import { getDb } from '@/lib/db'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const user = await getAuthUserAsync()
  if (!user) redirect('/auth/login')

  const db = getDb()
  const associations = db.prepare(
    'SELECT * FROM associations WHERE user_id = ? ORDER BY updated_at DESC'
  ).all(user.userId) as Array<{
    id: string; name: string; city: string; type: string;
    generated_content: string | null; created_at: string; updated_at: string;
  }>

  return (
    <DashboardClient
      user={user}
      initialAssociations={associations.map((a) => ({
        ...a,
        content: a.generated_content ? JSON.parse(a.generated_content) : null,
      }))}
    />
  )
}
