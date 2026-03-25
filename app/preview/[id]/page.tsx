import { notFound } from 'next/navigation'
import { getDb } from '@/lib/db'
import { GeneratedContent } from '@/lib/openai'
import AssociationWebsite from '@/components/AssociationWebsite'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PreviewPage({ params }: PageProps) {
  const { id } = await params
  const db = getDb()
  const row = db.prepare('SELECT * FROM associations WHERE id = ?').get(id) as {
    id: string; name: string; city: string; type: string; generated_content: string | null
  } | undefined

  if (!row || !row.generated_content) notFound()

  const content: GeneratedContent = JSON.parse(row.generated_content)

  return (
    <AssociationWebsite
      name={row.name}
      city={row.city}
      type={row.type as 'sport' | 'culture' | 'solidarity' | 'education'}
      content={content}
    />
  )
}
