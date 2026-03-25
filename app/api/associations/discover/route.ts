/**
 * GET /api/associations/discover?city=&name=
 *
 * Returns two buckets via SearXNG JSON API:
 *   localMedia  — 1–2 local press/news sites for the city
 *   assoSites   — 2–3 first web results for the association
 */
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserAsync } from '@/lib/auth'

export interface DiscoveredSite {
  name:    string
  url:     string
  favicon: string
}

export interface DiscoverResult {
  localMedia: DiscoveredSite[]
  assoSites:  DiscoveredSite[]
}

const SEARXNG_BASE = process.env.SEARXNG_BASE_URL ?? 'http://localhost:8080'

const SKIP_DOMAINS = [
  'facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com',
  'youtube.com', 'tiktok.com', 'wikipedia.org', 'google.com',
  'duckduckgo.com', 'bing.com', 'yahoo.com',
]

// Pages we never want in source suggestions
const SKIP_KEYWORDS = ['décès', 'nécrologie', 'avis de décès', 'pompes funèbres', 'obituary']

interface SearXNGResult { title: string; url: string; content?: string }
interface SearXNGResponse { results: SearXNGResult[] }

function hasNonLatinScript(text: string): boolean {
  return /[\u0400-\u04ff\u3000-\u9fff\uac00-\ud7af\u3040-\u30ff\u0600-\u06ff]/.test(text)
}

/** HEAD liveness — true if URL responds within 5 s */
async function isAlive(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AssoLab/1.0)' },
      redirect: 'follow',
    })
    return res.ok || res.status === 405 || res.status === 403
  } catch {
    return false
  }
}

async function searxSearch(
  query:       string,
  limit:       number,
  seenDomains: Set<string>,
): Promise<DiscoveredSite[]> {
  const url = `${SEARXNG_BASE}/search?q=${encodeURIComponent(query)}&format=json&language=fr-FR&region=fr-FR&categories=general`

  let raw: SearXNGResult[] = []
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(12000),
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
    if (!res.ok) { console.warn(`[discover] searxng ${res.status}`); return [] }
    raw = ((await res.json()) as SearXNGResponse).results ?? []
  } catch (err) {
    console.warn('[discover] search error:', err); return []
  }

  // ── Pass 1: cheap local filters ───────────────────────────────────────────
  const candidates: SearXNGResult[] = []
  const seenHostnames = new Set<string>()

  for (const r of raw) {
    if (candidates.length >= limit * 4) break   // fetch extra so liveness can prune
    if (!r.url) continue

    let hostname = ''
    try { hostname = new URL(r.url).hostname } catch { continue }

    if (SKIP_DOMAINS.some(d => hostname.includes(d))) continue
    if (seenDomains.has(hostname) || seenHostnames.has(hostname)) continue
    if (hasNonLatinScript(r.title + hostname)) continue

    // Drop death-notice / funeral pages
    const text = `${r.title} ${r.content ?? ''}`.toLowerCase()
    if (SKIP_KEYWORDS.some(k => text.includes(k))) continue

    seenHostnames.add(hostname)
    candidates.push(r)
  }

  // ── Pass 2: parallel HEAD liveness checks ─────────────────────────────────
  const liveness = await Promise.all(candidates.map(c => isAlive(c.url)))

  const results: DiscoveredSite[] = []
  for (let i = 0; i < candidates.length; i++) {
    if (results.length >= limit) break
    if (!liveness[i]) { console.log(`[discover] dead: ${candidates[i].url}`); continue }

    const hostname = new URL(candidates[i].url).hostname
    seenDomains.add(hostname)
    results.push({
      name:    candidates[i].title.slice(0, 60),
      url:     candidates[i].url,
      favicon: `https://www.google.com/s2/favicons?sz=64&domain=${hostname}`,
    })
  }

  return results
}

export async function GET(req: NextRequest) {
  const user = await getAuthUserAsync()
  if (!user) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })

  const city = req.nextUrl.searchParams.get('city') || ''
  const name = req.nextUrl.searchParams.get('name') || ''

  if (!city) return NextResponse.json({ localMedia: [], assoSites: [] })

  const seen = new Set<string>()

  const [localMedia, assoSites] = await Promise.all([
    searxSearch(`${city} journal actualités presse locale`, 2, seen),
    searxSearch(`${name} ${city} association`, 3, seen),
  ])

  return NextResponse.json({ localMedia, assoSites } satisfies DiscoverResult)
}
