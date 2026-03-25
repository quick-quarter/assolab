import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyPassword, signToken, createAuthCookieHeader } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis.' }, { status: 400 })
    }

    const db = getDb()
    const user = db.prepare(
      'SELECT id, email, name, password_hash FROM users WHERE email = ?'
    ).get(email) as { id: string; email: string; name: string; password_hash: string } | undefined

    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ error: 'Identifiants incorrects.' }, { status: 401 })
    }

    const token = signToken({ userId: user.id, email: user.email, name: user.name })
    const cookieHeader = createAuthCookieHeader(token)

    return NextResponse.json(
      { success: true, user: { id: user.id, email: user.email, name: user.name } },
      { headers: { 'Set-Cookie': cookieHeader } }
    )
  } catch (error) {
    console.error('[login]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
