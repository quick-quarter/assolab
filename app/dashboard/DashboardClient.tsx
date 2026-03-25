'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Spinner from '@/components/Spinner'
import AssociationCard from '@/components/AssociationCard'
import GenerateForm from '@/components/GenerateForm'
import SourcePicker from '@/components/SourcePicker'
import PreviewPanel from '@/components/PreviewPanel'
import { GeneratedContent } from '@/lib/openai'

interface AssociationData {
  id: string
  name: string
  city: string
  type: string
  content: GeneratedContent | null
  created_at: string
  updated_at: string
}

interface Props {
  user: { userId: string; email: string; name: string }
  initialAssociations: AssociationData[]
}

export default function DashboardClient({ user, initialAssociations }: Props) {
  const router = useRouter()
  const [associations, setAssociations] = useState<AssociationData[]>(initialAssociations)
  const [selected, setSelected] = useState<AssociationData | null>(
    initialAssociations[0] || null
  )
  const [generating, setGenerating]         = useState(false)
  const [generationStep, setGenerationStep] = useState<string>('searching')
  const [foundCount, setFoundCount]         = useState<number | undefined>(undefined)
  // Source-picker step: holds the form data while user picks sources
  const [pendingForm, setPendingForm]       = useState<{ name: string; city: string; type: string } | null>(null)
  const [regenerating, setRegenerating] = useState(false)
  const [showForm, setShowForm] = useState(initialAssociations.length === 0)
  const [editMode, setEditMode] = useState(false)
  const [editContent, setEditContent] = useState<GeneratedContent | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Step 1: form submit → show source picker
  function handleFormSubmit(data: { name: string; city: string; type: string }) {
    setError('')
    setPendingForm(data)
  }

  // Step 2: source picker confirmed → run generation
  async function handleGenerate(
    data: { name: string; city: string; type: string },
    selectedSocial: string[],
    selectedMedia: string[],
  ) {
    setError('')
    setGenerating(true)
    setGenerationStep('searching')
    setFoundCount(undefined)

    try {
      const res = await fetch('/api/associations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, selectedSocial, selectedMedia }),
      })

      if (!res.body) throw new Error('Pas de réponse du serveur.')

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer    = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          let event: Record<string, unknown>
          try { event = JSON.parse(line.slice(6)) } catch { continue }

          if (event.step === 'done') {
            const newAssoc: AssociationData = {
              ...(event.association as AssociationData),
              content: event.content as AssociationData['content'],
            }
            setAssociations((prev) => [newAssoc, ...prev])
            setSelected(newAssoc)
            setShowForm(false)
            setPendingForm(null)
            setEditMode(false)
            return
          } else if (event.step === 'error') {
            throw new Error((event.message as string) || 'Erreur de génération.')
          } else {
            setGenerationStep(event.step as string)
            if (typeof event.found === 'number') setFoundCount(event.found)
          }
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur de génération.')
    } finally {
      setGenerating(false)
    }
  }

  async function handleRegenerate() {
    if (!selected) return
    setError('')
    setRegenerating(true)
    try {
      const res = await fetch(`/api/associations/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regenerate: true }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)

      const updated = { ...selected, content: json.content }
      setSelected(updated)
      setAssociations((prev) => prev.map((a) => (a.id === selected.id ? updated : a)))
      setEditMode(false)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur de régénération.')
    } finally {
      setRegenerating(false)
    }
  }

  async function handleSaveEdit() {
    if (!selected || !editContent) return
    setSaving(true)
    try {
      const res = await fetch(`/api/associations/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)

      const updated = { ...selected, content: json.content }
      setSelected(updated)
      setAssociations((prev) => prev.map((a) => (a.id === selected.id ? updated : a)))
      setEditMode(false)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur de sauvegarde.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette association ?')) return
    await fetch(`/api/associations/${id}`, { method: 'DELETE' })
    const updated = associations.filter((a) => a.id !== id)
    setAssociations(updated)
    setSelected(updated[0] || null)
    if (updated.length === 0) setShowForm(true)
  }

  function startEdit() {
    setEditContent(selected?.content ?? null)
    setEditMode(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <div className="pt-16 flex h-screen">
        {/* Sidebar */}
        <aside className="w-72 bg-white border-r border-gray-100 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 text-lg">Mes associations</h2>
            <p className="text-xs text-gray-400 mt-0.5">{associations.length} générée{associations.length > 1 ? 's' : ''}</p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {associations.map((a) => (
              <AssociationCard
                key={a.id}
                association={a}
                isSelected={selected?.id === a.id}
                onClick={() => { setSelected(a); setEditMode(false); setShowForm(false) }}
                onDelete={() => handleDelete(a.id)}
              />
            ))}
          </div>

          <div className="p-4 border-t border-gray-100">
            <button
              onClick={() => { setShowForm(true); setSelected(null); setEditMode(false) }}
              className="btn-primary w-full"
            >
              + Nouvelle association
            </button>
          </div>
        </aside>

        {/* Main panel */}
        <main className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
              {error}
              <button onClick={() => setError('')} className="ml-3 font-bold">×</button>
            </div>
          )}

          {showForm || !selected ? (
            <div className="max-w-xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900">
                  Générer un site d&apos;association
                </h1>
                <p className="text-gray-500 mt-2">
                  Renseignez les informations de votre association — l&apos;IA génère tout le contenu.
                </p>
              </div>

              {pendingForm ? (
                <SourcePicker
                  city={pendingForm.city}
                  name={pendingForm.name}
                  loading={generating}
                  onBack={() => setPendingForm(null)}
                  onConfirm={(social, media) => handleGenerate(pendingForm, social, media)}
                />
              ) : (
                <GenerateForm
                  onSubmit={handleFormSubmit}
                  loading={generating}
                  generationStep={generationStep}
                  foundCount={foundCount}
                />
              )}

              {generating && pendingForm && (() => {
                const steps: Record<string, { icon: string; label: (n?: number) => string; pct: number }> = {
                  searching:  { icon: '🔍', label: ()  => 'Recherche sur le web…',                                      pct: 20 },
                  scraping:   { icon: '📖', label: (n) => `Lecture des pages${n != null ? ` (${n} sources)` : ''}…`,    pct: 50 },
                  generating: { icon: '🤖', label: ()  => 'Llama génère le contenu…',                                   pct: 80 },
                }
                const s = steps[generationStep] ?? steps.searching
                return (
                  <div className="mt-4 p-4 rounded-xl bg-primary-50 border border-primary-100">
                    <div className="flex items-center gap-3 text-primary-700">
                      <span className="text-xl animate-bounce">{s.icon}</span>
                      <span className="text-sm font-medium">{s.label(foundCount)}</span>
                    </div>
                    <div className="mt-3 h-1.5 bg-primary-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full transition-all duration-500"
                           style={{ width: `${s.pct}%` }} />
                    </div>
                    <p className="text-xs text-primary-400 mt-2 text-center">
                      La recherche web + la génération Llama peuvent prendre 30–120 secondes
                    </p>
                  </div>
                )
              })()}
            </div>
          ) : (
            <div className="max-w-5xl mx-auto">
              {/* Action bar */}
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                  <h1 className="text-2xl font-extrabold text-gray-900">{selected.name}</h1>
                  <p className="text-gray-400 text-sm">{selected.city} · {selected.type}</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                  {editMode ? (
                    <>
                      <button onClick={() => setEditMode(false)} className="btn-secondary">
                        Annuler
                      </button>
                      <button onClick={handleSaveEdit} disabled={saving} className="btn-primary">
                        {saving ? <><Spinner size="sm" /> Sauvegarde...</> : '💾 Sauvegarder'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={startEdit} className="btn-secondary">
                        ✍️ Éditer
                      </button>
                      <button onClick={handleRegenerate} disabled={regenerating} className="btn-secondary">
                        {regenerating ? <><Spinner size="sm" /> Régénération...</> : '🔄 Régénérer'}
                      </button>
                      <a
                        href={`/preview/${selected.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-primary"
                      >
                        👁 Prévisualiser
                      </a>
                    </>
                  )}
                </div>
              </div>

              <PreviewPanel
                association={selected}
                content={editMode ? editContent : selected.content}
                editMode={editMode}
                onContentChange={setEditContent}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
