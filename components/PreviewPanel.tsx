'use client'

import { GeneratedContent } from '@/lib/llama'

interface Association {
  name: string
  city: string
  type: string
}

interface Props {
  association: Association
  content: GeneratedContent | null
  editMode: boolean
  onContentChange: (c: GeneratedContent) => void
}

function EditableText({
  value,
  onChange,
  editMode,
  multiline = false,
  className = '',
}: {
  value: string
  onChange: (v: string) => void
  editMode: boolean
  multiline?: boolean
  className?: string
}) {
  if (!editMode) return <span className={className}>{value}</span>

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className={`w-full bg-yellow-50 border border-yellow-300 rounded-lg p-2 text-sm resize-y ${className}`}
      />
    )
  }
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full bg-yellow-50 border border-yellow-300 rounded-lg p-2 text-sm ${className}`}
    />
  )
}

export default function PreviewPanel({ association, content, editMode, onContentChange }: Props) {
  if (!content) {
    return (
      <div className="card p-12 text-center text-gray-400">
        <p className="text-4xl mb-4">🤖</p>
        <p className="font-medium">Aucun contenu généré.</p>
      </div>
    )
  }

  function update(key: keyof GeneratedContent, value: unknown) {
    onContentChange({ ...content!, [key]: value })
  }

  return (
    <div className="space-y-6">
      {editMode && (
        <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm text-center font-medium">
          ✍️ Mode édition — modifiez le texte directement dans les champs
        </div>
      )}

      {/* Web enrichment banner */}
      {content.enrichedFromWeb ? (
        <div className="p-3 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
          <span className="text-green-600 text-lg">🌐</span>
          <div className="flex-1 min-w-0">
            <p className="text-green-800 text-sm font-semibold">Contenu enrichi avec des données réelles du web</p>
            {content.webSources && content.webSources.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {content.webSources.map((src, i) => {
                  try {
                    return (
                      <a key={i} href={src} target="_blank" rel="noreferrer"
                        className="text-xs text-green-600 hover:underline">
                        {new URL(src).hostname}
                      </a>
                    )
                  } catch { return null }
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-3">
          <span className="text-gray-400 text-lg">🤖</span>
          <p className="text-gray-500 text-sm">Contenu généré par l&apos;IA sans données web spécifiques trouvées</p>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Association', value: association.name },
          { label: 'Ville', value: association.city },
          { label: 'Type', value: association.type },
        ].map((item) => (
          <div key={item.label} className="card p-4 text-center">
            <p className="text-xs text-gray-400 mb-1">{item.label}</p>
            <p className="font-semibold text-gray-900 text-sm capitalize">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Tagline */}
      <div className="card p-6">
        <p className="section-label mb-2">Slogan</p>
        <EditableText
          value={content.tagline}
          onChange={(v) => update('tagline', v)}
          editMode={editMode}
          className="text-2xl font-bold text-gray-900"
        />
      </div>

      {/* Description */}
      <div className="card p-6">
        <p className="section-label mb-3">Description</p>
        <EditableText
          value={content.description}
          onChange={(v) => update('description', v)}
          editMode={editMode}
          multiline
          className="text-gray-700 leading-relaxed"
        />
      </div>

      {/* Mission */}
      <div className="card p-6">
        <p className="section-label mb-3">Mission</p>
        <EditableText
          value={content.mission}
          onChange={(v) => update('mission', v)}
          editMode={editMode}
          multiline
          className="text-gray-700 leading-relaxed"
        />
      </div>

      {/* Activities */}
      <div className="card p-6">
        <p className="section-label mb-4">Activités</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {content.activities.map((activity, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                {i + 1}
              </div>
              <EditableText
                value={activity}
                onChange={(v) => {
                  const acts = [...content.activities]
                  acts[i] = v
                  update('activities', acts)
                }}
                editMode={editMode}
                className="text-gray-700 text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* News */}
      <div className="card p-6">
        <p className="section-label mb-4">Actualités</p>
        <div className="space-y-4">
          {content.news.map((item, i) => (
            <div key={i} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
              <div className="flex items-center gap-2 mb-1">
                <EditableText
                  value={item.title}
                  onChange={(v) => {
                    const news = [...content.news]
                    news[i] = { ...news[i], title: v }
                    update('news', news)
                  }}
                  editMode={editMode}
                  className="font-semibold text-gray-900"
                />
                <span className="text-xs text-gray-400 ml-auto flex-shrink-0">{item.date}</span>
              </div>
              <EditableText
                value={item.excerpt}
                onChange={(v) => {
                  const news = [...content.news]
                  news[i] = { ...news[i], excerpt: v }
                  update('news', news)
                }}
                editMode={editMode}
                multiline
                className="text-gray-500 text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Events */}
      <div className="card p-6">
        <p className="section-label mb-4">Événements à venir</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {content.events.map((event, i) => (
            <div key={i} className="p-4 rounded-xl bg-primary-50 border border-primary-100">
              <EditableText
                value={event.title}
                onChange={(v) => {
                  const events = [...content.events]
                  events[i] = { ...events[i], title: v }
                  update('events', events)
                }}
                editMode={editMode}
                className="font-bold text-gray-900 text-sm"
              />
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                <span>📅 {event.date}</span>
                <span>📍 {event.location}</span>
              </div>
              <EditableText
                value={event.description}
                onChange={(v) => {
                  const events = [...content.events]
                  events[i] = { ...events[i], description: v }
                  update('events', events)
                }}
                editMode={editMode}
                multiline
                className="text-gray-600 text-xs mt-2"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
