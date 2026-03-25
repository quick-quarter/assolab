import { NextResponse } from 'next/server'
import { getAuthUserAsync } from '@/lib/auth'

export async function GET() {
  const user = await getAuthUserAsync()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }
  return NextResponse.json({ user })
}
