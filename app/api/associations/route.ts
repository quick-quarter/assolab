import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getDb } from '@/lib/db'
import { getAuthUserAsync } from '@/lib/auth'
import { generateAssociationContent, GenerationStep } from '@/lib/llama'

// Llama generation can take up to 3 minutes on CPU
export const maxDuration = 300

// GET — list user's associations
export async function GET() {
  const user = await getAuthUserAsync()
  if (!user) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })

  const db = getDb()
  const associations = db.prepare(
    'SELECT * FROM associations WHERE user_id = ? ORDER BY updated_at DESC'
  ).all(user.userId)

  return NextResponse.json({ associations })
}

// POST — create + generate content for a new association (SSE streaming)
export async function POST(req: NextRequest) {
  const user = await getAuthUserAsync()
  if (!user) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { name, city, type, selectedSocial, selectedMedia } = body

  if (!name || !city || !type) {
    return NextResponse.json({ error: 'Nom, ville et type sont requis.' }, { status: 400 })
  }
  const validTypes = ['sport', 'culture', 'solidarity', 'education']
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: 'Type invalide.' }, { status: 400 })
  }

  const encoder   = new TextEncoder()
  const transform = new TransformStream()
  const writer    = transform.writable.getWriter()

  const send = (data: Record<string, unknown>) =>
    writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))

  // Keepalive ping every 10 s — prevents proxy/browser from dropping the SSE
  // connection during the silent Ollama generation phase (can take 60-120 s)
  const heartbeat = setInterval(() => {
    writer.write(encoder.encode(': ping\n\n')).catch(() => clearInterval(heartbeat))
  }, 10_000)

  // Run generation in background — stream stays open until writer.close()
  ;(async () => {
    try {
      const onProgress = (step: GenerationStep, meta?: { found?: number }) => {
        send({ step, ...meta })
      }

      const content = await generateAssociationContent(
        { name, city, type, selectedSocial, selectedMedia },
        onProgress,
      )

      const id = uuidv4()
      const db = getDb()
      db.prepare(
        `INSERT INTO associations (id, user_id, name, city, type, generated_content)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(id, user.userId, name, city, type, JSON.stringify(content))

      const association = db.prepare('SELECT * FROM associations WHERE id = ?').get(id)
      send({ step: 'done', association, content })
    } catch (error) {
      console.error('[associations POST]', error)
      send({ step: 'error', message: error instanceof Error ? error.message : 'Erreur lors de la génération.' })
    } finally {
      clearInterval(heartbeat)
      writer.close()
    }
  })()

  return new Response(transform.readable, {
    status: 200,
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
    },
  })
}
