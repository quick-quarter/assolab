/**
 * lib/search.ts
 *
 * Web research pipeline — real search + page scraping.
 *
 * Strategy:
 *   1. Query DuckDuckGo HTML: "{city} "{name}" association {type}"
 *   2. Extract top 5–10 result snippets + URLs
 *   3. Scrape each URL (up to 5) to extract all visible text (not just <p>)
 *   4. Wikipedia only for city context
 */

export interface WebContext {
  associationSnippet: string
  citySnippet:        string
  domainSnippet:      string   // kept for compat — always empty now
  heroImage:          string
  sources:            string[]
  enrichedFromWeb:    boolean
}

export type SearchPhase = 'searching' | 'scraping'

const FALLBACK_IMAGES: Record<string, string> = {
  sport:      'https://source.unsplash.com/featured/1920x600/?sport,stadium,team',
  culture:    'https://source.unsplash.com/featured/1920x600/?theater,art,culture',
  solidarity: 'https://source.unsplash.com/featured/1920x600/?community,volunteers',
  education:  'https://source.unsplash.com/featured/1920x600/?school,books,learning',
}

const SEARXNG_BASE = process.env.SEARXNG_BASE_URL ?? 'http://localhost:8080'

const SKIP_DOMAINS = [
  'facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com',
  'youtube.com', 'tiktok.com', 'reddit.com', 'google.com',
]

function hasNonLatinScript(text: string): boolean {
  return /[\u0400-\u04ff\u3000-\u9fff\uac00-\ud7af\u3040-\u30ff\u0600-\u06ff]/.test(text)
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────

async function timedFetch(url: string, ms = 5000, extra: Record<string, string> = {}): Promise<Response> {
  return fetch(url, {
    signal: AbortSignal.timeout(ms),
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.5',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      ...extra,
    },
    cache: 'no-store',
  })
}

function cleanText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ').trim()
}

function truncate(text: string, max = 400): string {
  if (text.length <= max) return text
  return text.slice(0, max).replace(/\s+\S*$/, '') + '…'
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. SearXNG JSON search (self-hosted, no DDG HTML scraping)
// ─────────────────────────────────────────────────────────────────────────────

interface SearchResult {
  title:   string
  snippet: string
  url:     string
}

interface SearXNGResponse {
  results: Array<{ title: string; url: string; content?: string }>
}

async function searchWeb(query: string, maxResults = 10): Promise<SearchResult[]> {
  const url = `${SEARXNG_BASE}/search?q=${encodeURIComponent(query)}&format=json&language=fr-FR&region=fr-FR&categories=general`
  try {
    const res = await timedFetch(url, 10000, { Accept: 'application/json' })
    if (!res.ok) {
      console.warn(`[searxng] ${res.status} for query: ${query}`)
      return []
    }
    const data = (await res.json()) as SearXNGResponse
    return data.results
      .filter(r => r.url && r.content)
      .filter(r => {
        try {
          const hostname = new URL(r.url).hostname
          if (SKIP_DOMAINS.some(d => hostname.includes(d))) return false
          if (hasNonLatinScript(r.title + hostname)) return false
          return true
        } catch { return false }
      })
      .slice(0, maxResults)
      .map(r => ({ title: r.title, snippet: cleanText(r.content ?? ''), url: r.url }))
  } catch (err) {
    console.warn('[searxng] search failed:', err)
    return []
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Page scraper — extracts all visible text (not just <p>)
// ─────────────────────────────────────────────────────────────────────────────

async function scrapeUrl(url: string): Promise<string> {
  try {
    const res = await timedFetch(url, 8000)
    if (!res.ok) return ''
    const ct = res.headers.get('content-type') || ''
    if (!ct.includes('text/html')) return ''

    let html = await res.text()

    // Strip chrome: nav, header, footer, sidebar, scripts, styles
    html = html
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      .replace(/<aside[\s\S]*?<\/aside>/gi, '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')

    // Headings give structure context
    const headings = [...html.matchAll(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/gi)]
      .map(m => cleanText(m[1]))
      .filter(t => t.length > 3 && t.length < 200)
      .slice(0, 8)

    // Inline / block elements that carry actual text (no div nesting problem)
    const blocks: string[] = []
    let total = 0
    for (const rx of [
      /<p[^>]*>([\s\S]*?)<\/p>/gi,
      /<li[^>]*>([\s\S]*?)<\/li>/gi,
      /<td[^>]*>([\s\S]*?)<\/td>/gi,
      /<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi,
    ]) {
      for (const m of html.matchAll(rx)) {
        const t = cleanText(m[1])
        if (t.length < 25 || t.length > 600) continue
        blocks.push(t)
        total += t.length
        if (total > 2500) break
      }
      if (total > 2500) break
    }

    // Fallback: dump all remaining body text if we got almost nothing
    if (total < 80) {
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
      if (bodyMatch) return truncate(cleanText(bodyMatch[1]), 1500)
    }

    return truncate([...headings, ...blocks].join(' '), 1500)
  } catch {
    return ''
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Wikipedia — city context only
// ─────────────────────────────────────────────────────────────────────────────

interface WikiSummary {
  extract?: string
  thumbnail?: { source?: string }
  content_urls?: { desktop?: { page?: string } }
}

async function fetchWikiSummary(title: string): Promise<{ text: string; url: string; image: string }> {
  const encoded = encodeURIComponent(title.replace(/ /g, '_'))
  const url = `https://fr.wikipedia.org/api/rest_v1/page/summary/${encoded}`
  try {
    const res = await timedFetch(url, 6000, { Accept: 'application/json' })
    if (!res.ok) return { text: '', url: '', image: '' }
    const data = (await res.json()) as WikiSummary
    return {
      text:  truncate(cleanText(data.extract || ''), 400),
      url:   data.content_urls?.desktop?.page || '',
      image: data.thumbnail?.source || '',
    }
  } catch {
    return { text: '', url: '', image: '' }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

export interface ExtraSources {
  social: string[]   // platform ids: 'facebook', 'instagram', …
  media:  string[]   // user-selected local media URLs to scrape
}

/** For social platforms: search DDG for the association on that platform */
async function searchSocialSnippet(name: string, city: string, platform: string): Promise<string> {
  const results = await searchWeb(`"${name}" ${city} ${platform}`, 3)
  return results.map(r => r.snippet).filter(Boolean).join(' ')
}

export async function buildWebContext(
  name: string,
  city: string,
  type: string,
  extra: ExtraSources = { social: [], media: [] },
  onPhase?: (phase: SearchPhase, meta?: { found?: number }) => void,
): Promise<WebContext> {
  const fallbackImage = FALLBACK_IMAGES[type] ?? FALLBACK_IMAGES.culture
  const query = `${city} "${name}" association ${type}`

  onPhase?.('searching')

  const [searchSettled, citySettled] = await Promise.allSettled([
    searchWeb(query, 10),
    fetchWikiSummary(city),
  ])

  const results  = searchSettled.status  === 'fulfilled' ? searchSettled.value  : []
  const cityInfo = citySettled.status === 'fulfilled' ? citySettled.value : { text: '', url: '', image: '' }

  const totalFound = results.length + extra.social.length + extra.media.length
  console.log(`[search] ddg=${results.length} social=${extra.social.length} media=${extra.media.length}`)
  onPhase?.('scraping', { found: totalFound })

  // ── Main DDG snippets ──────────────────────────────────────────────────────
  const ddgSnippets = results.map(r => r.snippet).filter(Boolean)

  // ── Scrape top 5 DDG result pages ─────────────────────────────────────────
  const urlsToScrape = results.slice(0, 3).map(r => r.url).filter(Boolean)

  // ── Social media: targeted DDG snippet per platform ────────────────────────
  const socialSnippetPromises = extra.social.map(p => searchSocialSnippet(name, city, p))

  // ── User-selected local media: scrape directly ────────────────────────────
  const mediaScrapedPromises = extra.media.map(u => scrapeUrl(u))

  const [scraped, socialSnippets, mediaTexts] = await Promise.all([
    Promise.allSettled(urlsToScrape.map(u => scrapeUrl(u))),
    Promise.allSettled(socialSnippetPromises),
    Promise.allSettled(mediaScrapedPromises),
  ])

  const scrapedTexts     = scraped.filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled').map(r => r.value).filter(Boolean)
  const socialTexts      = socialSnippets.filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled').map(r => r.value).filter(Boolean)
  const mediaScrapedText = mediaTexts.filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled').map(r => r.value).filter(Boolean)

  // Add social media context header when platforms were selected
  const socialHeader = extra.social.length > 0
    ? `L'association est présente sur : ${extra.social.join(', ')}. Extraits trouvés : ${socialTexts.join(' ')}`
    : ''

  const associationSnippet = truncate(
    [socialHeader, ...ddgSnippets, ...scrapedTexts, ...mediaScrapedText].filter(Boolean).join('\n').trim(),
    3000,
  )

  const sources = [...new Set([
    ...results.map(r => r.url).filter(Boolean),
    ...extra.media,
    cityInfo.url,
  ].filter(Boolean))]

  return {
    associationSnippet,
    citySnippet:     cityInfo.text,
    domainSnippet:   '',
    heroImage:       cityInfo.image || fallbackImage,
    sources,
    enrichedFromWeb: Boolean(associationSnippet || cityInfo.text),
  }
}

/** Formats the context into a block injected into the Llama prompt */
export function formatContextForPrompt(ctx: WebContext, name: string, city: string): string {
  const lines: string[] = []

  if (ctx.associationSnippet) {
    lines.push(`Informations trouvées sur "${name}" à ${city}:\n${ctx.associationSnippet}`)
  }
  if (ctx.citySnippet) {
    lines.push(`Contexte sur la ville de ${city}:\n${ctx.citySnippet}`)
  }

  if (lines.length === 0) return ''
  return `=== DONNÉES WEB RÉELLES ===\n${lines.join('\n\n')}\n=== FIN DES DONNÉES WEB ===`
}
