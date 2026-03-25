import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getDb } from '@/lib/db'
import { hashPassword, signToken, createAuthCookieHeader } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Tous les champs sont requis.' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 8 caractères.' }, { status: 400 })
    }

    const db = getDb()
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
    if (existing) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé.' }, { status: 409 })
    }

    const id = uuidv4()
    const passwordHash = hashPassword(password)

    db.prepare(
      'INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)'
    ).run(id, email, passwordHash, name)

    const token = signToken({ userId: id, email, name })
    const cookieHeader = createAuthCookieHeader(token)

    return NextResponse.json(
      { success: true, user: { id, email, name } },
      { status: 201, headers: { 'Set-Cookie': cookieHeader } }
    )
  } catch (error) {
    console.error('[signup]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
