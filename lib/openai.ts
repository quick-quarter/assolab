/**
 * lib/openai.ts — DEPRECATED
 *
 * This file now re-exports everything from lib/llama.ts.
 * It exists only to avoid breaking lib/types.ts which imports
 * `import('./openai').GeneratedContent`.
 *
 * Do not add new code here. Use lib/llama.ts directly.
 */
export {
  generateAssociationContent,
  type AssociationInput,
  type GeneratedContent,
  type NewsItem,
  type EventItem,
} from './llama'

// The openai client is no longer used.
export const openai = null
