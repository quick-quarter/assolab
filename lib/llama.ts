/**
 * lib/llama.ts
 *
 * Ollama-based content generation.
 * Replaces lib/openai.ts entirely.
 *
 * Works in two modes:
 *  • Local dev  → OLLAMA_BASE_URL=http://localhost:11434  (ollama running natively)
 *  • Docker     → OLLAMA_BASE_URL=http://ollama:11434     (set in docker-compose.yml)
 */

import { buildWebContext, formatContextForPrompt, ExtraSources, SearchPhase, WebContext } from './search'

export type GenerationStep = SearchPhase | 'generating'
export type ProgressCallback = (step: GenerationStep, meta?: { found?: number }) => void

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'
const OLLAMA_MODEL    = process.env.OLLAMA_MODEL    ?? 'llama3.2:3b'

// ─────────────────────────────────────────────────────────────────────────────
// Shared types (kept identical to the original lib/openai.ts exports so
// lib/types.ts and all existing imports continue to work)
// ─────────────────────────────────────────────────────────────────────────────
export interface AssociationInput {
  name:           string
  city:           string
  type:           'sport' | 'culture' | 'solidarity' | 'education'
  selectedSocial?: string[]
  selectedMedia?:  string[]
}

export interface NewsItem {
  title: string
  date: string
  excerpt: string
}

export interface EventItem {
  title: string
  date: string
  location: string
  description: string
}

export interface GeneratedContent {
  tagline: string
  description: string
  mission: string
  activities: string[]
  news: NewsItem[]
  events: EventItem[]
  // Enrichment fields (added vs OpenAI version)
  heroImage?: string
  webSources?: string[]
  enrichedFromWeb?: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const TYPE_LABELS: Record<string, string> = {
  sport:      'sportive',
  culture:    'culturelle',
  solidarity: 'de solidarité',
  education:  'éducative',
}

/** Extract a JSON object from raw Llama output (handles markdown fences, preamble…) */
function extractJson(raw: string): string {
  // Remove markdown code fences ```json ... ``` or ``` ... ```
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) return fenceMatch[1].trim()

  // Find the outermost { … } block
  const start = raw.indexOf('{')
  const end   = raw.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) return raw.slice(start, end + 1)

  return raw.trim()
}

/** Validate and fill in any missing required fields so we never return broken data */
function sanitize(obj: Partial<GeneratedContent>, input: AssociationInput): GeneratedContent {
  const fallbackDate = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return {
    tagline:     obj.tagline     || `Bienvenue à l'association ${input.name}`,
    description: obj.description || `${input.name} est une association ${TYPE_LABELS[input.type]} basée à ${input.city}.`,
    mission:     obj.mission     || `Notre mission est de servir la communauté de ${input.city}.`,
    activities:  Array.isArray(obj.activities) && obj.activities.length > 0
      ? obj.activities
      : [`Activité principale de l'association ${TYPE_LABELS[input.type]}`],
    news: Array.isArray(obj.news) && obj.news.length > 0
      ? obj.news
      : [{ title: 'Actualité à venir', date: fallbackDate, excerpt: 'Restez connectés pour nos prochaines actualités.' }],
    events: Array.isArray(obj.events) && obj.events.length > 0
      ? obj.events
      : [{ title: 'Prochain événement', date: 'À confirmer', location: input.city, description: 'Détails à venir.' }],
    heroImage:        obj.heroImage,
    webSources:       obj.webSources,
    enrichedFromWeb:  obj.enrichedFromWeb ?? false,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Ollama API call
// ─────────────────────────────────────────────────────────────────────────────
async function callOllama(prompt: string): Promise<string> {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    cache:   'no-store',
    signal:  AbortSignal.timeout(300_000), // 5-minute hard limit
    body: JSON.stringify({
      model:  OLLAMA_MODEL,
      prompt,
      stream: false,
      format: 'json',          // instructs Ollama to enforce JSON output
      options: {
        temperature: 0.75,
        top_p:       0.9,
        num_predict: 2000,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText)
    throw new Error(`Ollama API error ${res.status}: ${err}`)
  }

  const data = (await res.json()) as { response: string }
  return data.response
}

// ─────────────────────────────────────────────────────────────────────────────
// Prompt builder
// ─────────────────────────────────────────────────────────────────────────────
function buildPrompt(input: AssociationInput, webCtxBlock: string): string {
  const typeLabel = TYPE_LABELS[input.type]
  const today = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  const consigne = webCtxBlock
    ? `CONSIGNE IMPÉRATIVE: Les données ci-dessus ont été extraites directement du site web et des résultats de recherche de cette association.
Tu DOIS utiliser ces informations réelles pour remplir chaque champ JSON.
Ne fabrique, n'invente et n'extrapole AUCUNE information absente des données web.
Si une information spécifique (date, lieu, activité) est présente dans les données, utilise-la exactement.
Si une information n'est pas disponible, utilise une formulation neutre et générique.`
    : `CONSIGNE: Génère un contenu professionnel, chaleureux et inspirant pour cette association.`

  return `Tu es un expert en communication associative française.
Tu dois générer du contenu professionnel, chaleureux et inspirant pour le site web d'une association.

ASSOCIATION:
- Nom: ${input.name}
- Ville: ${input.city}
- Type: Association ${typeLabel}
- Date actuelle: ${today}

${consigne}

${webCtxBlock ? webCtxBlock + '\n' : ''}

Génère UNIQUEMENT un objet JSON valide avec exactement cette structure:

{
  "tagline": "Slogan court et percutant (max 12 mots)",
  "description": "Paragraphe de présentation (3-4 phrases, ton chaleureux et professionnel, spécifique à la ville et au type)",
  "mission": "Description de la mission principale (2-3 phrases concrètes)",
  "activities": [
    "Nom de l'activité 1: description courte et engageante",
    "Nom de l'activité 2: description courte et engageante",
    "Nom de l'activité 3: description courte et engageante",
    "Nom de l'activité 4: description courte et engageante"
  ],
  "news": [
    {
      "title": "Titre accrocheur de l'actualité 1",
      "date": "${today}",
      "excerpt": "Résumé informatif en 2-3 phrases"
    },
    {
      "title": "Titre accrocheur de l'actualité 2",
      "date": "Février 2026",
      "excerpt": "Résumé informatif en 2-3 phrases"
    },
    {
      "title": "Titre accrocheur de l'actualité 3",
      "date": "Janvier 2026",
      "excerpt": "Résumé informatif en 2-3 phrases"
    }
  ],
  "events": [
    {
      "title": "Nom de l'événement 1",
      "date": "15 Avril 2026",
      "location": "${input.city}",
      "description": "Description concise et engageante (1-2 phrases)"
    },
    {
      "title": "Nom de l'événement 2",
      "date": "22 Mai 2026",
      "location": "${input.city}",
      "description": "Description concise et engageante (1-2 phrases)"
    }
  ]
}

Réponds UNIQUEMENT avec le JSON. Pas d'explication, pas de texte avant ou après.`
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export — identical signature to the original lib/openai.ts function
// ─────────────────────────────────────────────────────────────────────────────
export async function generateAssociationContent(
  input: AssociationInput,
  onProgress?: ProgressCallback,
): Promise<GeneratedContent> {
  // 1. Web research — with real-time phase callbacks
  let webCtx: WebContext = {
    associationSnippet: '',
    citySnippet:        '',
    domainSnippet:      '',
    heroImage:          '',
    sources:            [],
    enrichedFromWeb:    false,
  }

  try {
    const extra: ExtraSources = {
      social: input.selectedSocial ?? [],
      media:  input.selectedMedia  ?? [],
    }
    webCtx = await buildWebContext(input.name, input.city, input.type, extra, onProgress)
    console.log(
      `[search] enriched=${webCtx.enrichedFromWeb} sources=${webCtx.sources.length} image=${!!webCtx.heroImage}`,
    )
  } catch (err) {
    console.warn('[search] web context fetch failed, proceeding without it:', err)
  }

  const webCtxBlock = formatContextForPrompt(webCtx, input.name, input.city)
  const prompt = buildPrompt(input, webCtxBlock)

  // 2. Llama generation
  onProgress?.('generating')
  const raw = await callOllama(prompt)

  // 3. Parse + sanitize
  let parsed: Partial<GeneratedContent> = {}
  try {
    parsed = JSON.parse(extractJson(raw))
  } catch (err) {
    console.warn('[llama] JSON parse failed, using sanitized fallback. Raw:', raw.slice(0, 200), err)
  }

  return sanitize(
    {
      ...parsed,
      heroImage:       webCtx.heroImage || undefined,
      webSources:      webCtx.sources.length ? webCtx.sources : undefined,
      enrichedFromWeb: webCtx.enrichedFromWeb,
    },
    input,
  )
}
