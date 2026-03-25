'use client'

import { useState } from 'react'

const TYPES = [
  { value: 'sport',      label: 'Sport',       emoji: '⚽' },
  { value: 'culture',    label: 'Culture',     emoji: '🎭' },
  { value: 'solidarity', label: 'Solidarité',  emoji: '🤝' },
  { value: 'education',  label: 'Éducation',   emoji: '📚' },
]

interface Props {
  onSubmit: (data: { name: string; city: string; type: string }) => void
  loading?: boolean
  generationStep?: string
  foundCount?: number
}

export default function GenerateForm({ onSubmit }: Props) {
  const [form, setForm] = useState({ name: '', city: '', type: '' })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.type) return
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="card p-8 space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Nom de l&apos;association <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="ex: Club Sportif de Montpellier"
          required
          className="input-field"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Ville <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="city"
          value={form.city}
          onChange={handleChange}
          placeholder="ex: Montpellier"
          required
          className="input-field"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Type d&apos;association <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setForm({ ...form, type: t.value })}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                form.type === t.value
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span className="text-2xl">{t.emoji}</span>
              <span className="font-semibold text-sm">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={!form.name || !form.city || !form.type}
        className="btn-primary w-full py-4 rounded-xl text-base"
      >
        Choisir les sources →
      </button>
    </form>
  )
}
