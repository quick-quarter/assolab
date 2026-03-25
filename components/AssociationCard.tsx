'use client'

const TYPE_CONFIG: Record<string, { emoji: string; color: string }> = {
  sport:      { emoji: '⚽', color: 'bg-green-100 text-green-700' },
  culture:    { emoji: '🎭', color: 'bg-purple-100 text-purple-700' },
  solidarity: { emoji: '🤝', color: 'bg-red-100 text-red-700' },
  education:  { emoji: '📚', color: 'bg-blue-100 text-blue-700' },
}

interface Props {
  association: { id: string; name: string; city: string; type: string }
  isSelected: boolean
  onClick: () => void
  onDelete: () => void
}

export default function AssociationCard({ association, isSelected, onClick, onDelete }: Props) {
  const cfg = TYPE_CONFIG[association.type] || { emoji: '🏢', color: 'bg-gray-100 text-gray-700' }

  return (
    <div
      onClick={onClick}
      className={`relative group p-3 rounded-xl cursor-pointer transition-all ${
        isSelected
          ? 'bg-primary-50 border border-primary-200'
          : 'hover:bg-gray-50 border border-transparent'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-lg ${cfg.color} flex-shrink-0`}>
          {cfg.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 text-sm truncate">{association.name}</p>
          <p className="text-xs text-gray-400 truncate">{association.city}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-red-500 transition-all"
          title="Supprimer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}
