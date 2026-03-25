'use client'

import { useEffect, useState } from 'react'
import Spinner from './Spinner'
import type { DiscoveredSite } from '@/app/api/associations/discover/route'

// ─── Social media platforms ────────────────────────────────────────────────

const SOCIAL_PLATFORMS = [
  {
    id: 'facebook', label: 'Facebook',
    bg: '#1877F2', fg: '#fff',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M22 12c0-5.522-4.478-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.9V12h2.538V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
      </svg>
    ),
  },
  {
    id: 'instagram', label: 'Instagram',
    bg: 'radial-gradient(circle at 30% 110%, #f9ce34, #ee2a7b 40%, #6228d7 80%)', fg: '#fff',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162S8.597 18.163 12 18.163s6.162-2.759 6.162-6.162S15.403 5.838 12 5.838zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
  {
    id: 'linkedin', label: 'LinkedIn',
    bg: '#0A66C2', fg: '#fff',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    id: 'youtube', label: 'YouTube',
    bg: '#FF0000', fg: '#fff',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
  {
    id: 'twitter', label: 'Twitter / X',
    bg: '#000', fg: '#fff',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.904-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
]

// ─── Shared site button ────────────────────────────────────────────────────

function SiteButton({ site, selected, onToggle }: { site: DiscoveredSite; selected: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      title={site.url}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
        selected
          ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
          : 'border-gray-200 hover:border-gray-300 text-gray-700'
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={site.favicon}
        alt=""
        width={16}
        height={16}
        className="w-4 h-4 rounded-sm"
        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
      />
      <span className="max-w-[180px] truncate">{site.name}</span>
    </button>
  )
}

// ─── Component ─────────────────────────────────────────────────────────────

interface Props {
  city: string
  name: string
  loading: boolean
  onConfirm: (selectedSocial: string[], selectedMedia: string[]) => void
  onBack: () => void
}

export default function SourcePicker({ city, name, loading, onConfirm, onBack }: Props) {
  const [localMedia,  setLocalMedia]  = useState<DiscoveredSite[]>([])
  const [assoSites,   setAssoSites]   = useState<DiscoveredSite[]>([])
  const [loadingMedia, setLoadingMedia] = useState(true)
  const [selectedSocial, setSocial]   = useState<Set<string>>(new Set())
  const [selectedMedia,  setMedia]    = useState<Set<string>>(new Set())

  useEffect(() => {
    setLoadingMedia(true)
    fetch(`/api/associations/discover?city=${encodeURIComponent(city)}&name=${encodeURIComponent(name)}`)
      .then(r => r.json())
      .then(data => {
        setLocalMedia(data.localMedia ?? [])
        setAssoSites(data.assoSites ?? [])
      })
      .catch(() => {})
      .finally(() => setLoadingMedia(false))
  }, [city, name])

  function toggleSocial(id: string) {
    setSocial(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  }
  function toggleMedia(url: string) {
    setMedia(prev => { const s = new Set(prev); s.has(url) ? s.delete(url) : s.add(url); return s })
  }

  return (
    <div className="card p-8 space-y-7">
      <div>
        <h3 className="font-bold text-gray-900 text-lg">Où chercher les informations ?</h3>
        <p className="text-sm text-gray-500 mt-1">
          Sélectionnez les plateformes et médias à inclure dans la recherche pour <strong>{name}</strong>.
        </p>
      </div>

      {/* ── Social media ── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Réseaux sociaux</p>
        <div className="flex flex-wrap gap-3">
          {SOCIAL_PLATFORMS.map(p => {
            const on = selectedSocial.has(p.id)
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggleSocial(p.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all ${
                  on ? 'border-primary-500 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span
                  className="flex items-center justify-center w-7 h-7 rounded-lg"
                  style={{ background: p.bg, color: p.fg }}
                >
                  {p.icon}
                </span>
                <span className={on ? 'text-primary-700' : 'text-gray-700'}>{p.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Association websites ── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
          Sites trouvés pour &laquo;&nbsp;{name}&nbsp;&raquo;
          {loadingMedia && <Spinner size="sm" className="ml-2 inline-block" />}
        </p>
        <p className="text-xs text-gray-400 mb-3">Premiers résultats web pour cette association</p>

        {!loadingMedia && assoSites.length === 0 && (
          <p className="text-sm text-gray-400 italic">Aucun résultat trouvé.</p>
        )}
        <div className="flex flex-wrap gap-3">
          {assoSites.map(m => <SiteButton key={m.url} site={m} selected={selectedMedia.has(m.url)} onToggle={() => toggleMedia(m.url)} />)}
        </div>
      </div>

      {/* ── Local media ── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
          Médias locaux · {city}
          {loadingMedia && <Spinner size="sm" className="ml-2 inline-block" />}
        </p>
        <p className="text-xs text-gray-400 mb-3">Presse et actualités locales</p>

        {!loadingMedia && localMedia.length === 0 && (
          <p className="text-sm text-gray-400 italic">Aucun média local trouvé.</p>
        )}
        <div className="flex flex-wrap gap-3">
          {localMedia.map(m => <SiteButton key={m.url} site={m} selected={selectedMedia.has(m.url)} onToggle={() => toggleMedia(m.url)} />)}
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="btn-secondary flex-1"
        >
          ← Retour
        </button>
        <button
          type="button"
          onClick={() => onConfirm([...selectedSocial], [...selectedMedia])}
          disabled={loading || loadingMedia}
          className="btn-primary flex-1"
        >
          {loading ? (
            <><Spinner size="sm" /> Génération…</>
          ) : (() => {
            const n = selectedSocial.size + selectedMedia.size
            return `✨ Générer${n > 0 ? ` · ${n} source${n > 1 ? 's' : ''}` : ''}`
          })()}
        </button>
      </div>
    </div>
  )
}
