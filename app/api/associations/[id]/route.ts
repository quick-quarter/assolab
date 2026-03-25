import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getAuthUserAsync } from '@/lib/auth'
import { generateAssociationContent } from '@/lib/llama'

export const maxDuration = 300

type Params = { params: Promise<{ id: string }> }

// GET — fetch a single association
export async function GET(_req: NextRequest, { params }: Params) {
  const user = await getAuthUserAsync()
  if (!user) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })

  const { id } = await params
  const db = getDb()
  const association = db.prepare(
    'SELECT * FROM associations WHERE id = ? AND user_id = ?'
  ).get(id, user.userId) as { generated_content: string | null } & Record<string, unknown> | undefined

  if (!association) return NextResponse.json({ error: 'Introuvable.' }, { status: 404 })

  const content = association.generated_content
    ? JSON.parse(association.generated_content as string)
    : null

  return NextResponse.json({ association, content })
}

// PATCH — update content (manual edit or AI regenerate)
export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await getAuthUserAsync()
  if (!user) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })

  const { id } = await params
  const db = getDb()
  const association = db.prepare(
    'SELECT * FROM associations WHERE id = ? AND user_id = ?'
  ).get(id, user.userId) as { name: string; city: string; type: string } | undefined

  if (!association) return NextResponse.json({ error: 'Introuvable.' }, { status: 404 })

  try {
    const body = await req.json()

    let content: unknown
    if (body.regenerate) {
      // Full AI regeneration with fresh web search
      content = await generateAssociationContent({
        name: association.name,
        city: association.city,
        type: association.type as 'sport' | 'culture' | 'solidarity' | 'education',
      })
    } else {
      // Manual edit
      content = body.content
    }

    db.prepare(
      `UPDATE associations SET generated_content = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(JSON.stringify(content), id)

    return NextResponse.json({ content })
  } catch (error) {
    console.error('[associations PATCH]', error)
    const message = error instanceof Error ? error.message : 'Erreur lors de la mise à jour.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE — remove association
export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await getAuthUserAsync()
  if (!user) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })

  const { id } = await params
  const db = getDb()
  const result = db.prepare(
    'DELETE FROM associations WHERE id = ? AND user_id = ?'
  ).run(id, user.userId)

  if (result.changes === 0) return NextResponse.json({ error: 'Introuvable.' }, { status: 404 })

  return NextResponse.json({ success: true })
}
