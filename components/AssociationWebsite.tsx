import { GeneratedContent } from '@/lib/llama'

const TYPE_CONFIG = {
  sport: {
    label: 'Association Sportive',
    emoji: '⚽',
    gradient: 'from-green-600 to-emerald-500',
    accent: 'bg-green-600',
    accentHex: '#16a34a',
    accentLight: 'bg-green-50',
    accentText: 'text-green-700',
    accentBorder: 'border-green-200',
    badge: 'bg-green-100 text-green-800',
  },
  culture: {
    label: 'Association Culturelle',
    emoji: '🎭',
    gradient: 'from-purple-600 to-violet-500',
    accent: 'bg-purple-600',
    accentHex: '#7c3aed',
    accentLight: 'bg-purple-50',
    accentText: 'text-purple-700',
    accentBorder: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-800',
  },
  solidarity: {
    label: 'Association de Solidarité',
    emoji: '🤝',
    gradient: 'from-rose-600 to-red-500',
    accent: 'bg-rose-600',
    accentHex: '#e11d48',
    accentLight: 'bg-rose-50',
    accentText: 'text-rose-700',
    accentBorder: 'border-rose-200',
    badge: 'bg-rose-100 text-rose-800',
  },
  education: {
    label: 'Association Éducative',
    emoji: '📚',
    gradient: 'from-blue-600 to-indigo-500',
    accent: 'bg-blue-600',
    accentHex: '#2563eb',
    accentLight: 'bg-blue-50',
    accentText: 'text-blue-700',
    accentBorder: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-800',
  },
}

interface Props {
  name: string
  city: string
  type: keyof typeof TYPE_CONFIG
  content: GeneratedContent
}

export default function AssociationWebsite({ name, city, type, content }: Props) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.culture
  const heroImage = content.heroImage || null
  const webSources = content.webSources || []

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Site Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{cfg.emoji}</span>
            <span className="font-extrabold text-lg text-gray-900">{name}</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            {['À propos', 'Activités', 'Actualités', 'Événements', 'Contact'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace('à ', '').replace('é', 'e')}`}
                className="hover:text-gray-900 transition-colors"
              >
                {item}
              </a>
            ))}
            <a
              href="#contact"
              className={`px-4 py-2 rounded-lg text-white font-semibold ${cfg.accent} hover:opacity-90 transition-opacity`}
            >
              Nous rejoindre
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section
        className={`relative text-white overflow-hidden`}
        style={heroImage ? {
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : {}}
      >
        {/* Gradient overlay (always present, stronger when no image) */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${cfg.gradient}`}
          style={{ opacity: heroImage ? 0.82 : 1 }}
        />

        {/* Decorative circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white transform translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 text-center">
          {content.enrichedFromWeb && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              Contenu enrichi avec des données réelles du web
            </div>
          )}

          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-6 bg-white/20 backdrop-blur">
            {cfg.label} · {city}
          </span>
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 leading-tight drop-shadow-sm">
            {name}
          </h1>
          <p className="text-2xl sm:text-3xl font-light opacity-90 mb-10 max-w-2xl mx-auto drop-shadow-sm">
            {content.tagline}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#propos"
              className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-white text-gray-900 font-bold text-lg hover:shadow-lg transition-shadow"
            >
              Découvrir l&apos;association
            </a>
            <a
              href="#evenements"
              className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-white/20 text-white font-bold text-lg backdrop-blur hover:bg-white/30 transition-colors border border-white/30"
            >
              Voir les événements
            </a>
          </div>

          {heroImage && (
            <p className="mt-8 text-xs text-white/50">
              Photo: Unsplash / Web
            </p>
          )}
        </div>
      </section>

      {/* About */}
      <section id="propos" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className={`inline-block text-xs font-bold uppercase tracking-widest ${cfg.accentText} mb-3`}>
              À propos
            </span>
            <h2 className="text-4xl font-extrabold text-gray-900">Qui sommes-nous ?</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-lg text-gray-600 leading-relaxed">{content.description}</p>
            </div>
            <div className={`${cfg.accentLight} ${cfg.accentBorder} border-2 rounded-3xl p-8`}>
              <h3 className={`font-bold text-xl ${cfg.accentText} mb-4`}>Notre mission</h3>
              <p className="text-gray-700 leading-relaxed">{content.mission}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Activities */}
      <section id="activites" className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className={`inline-block text-xs font-bold uppercase tracking-widest ${cfg.accentText} mb-3`}>
              Ce que nous faisons
            </span>
            <h2 className="text-4xl font-extrabold text-gray-900">Nos activités</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.activities.map((activity, i) => {
              const colonIdx = activity.indexOf(':')
              const title = colonIdx > 0 ? activity.slice(0, colonIdx).trim() : activity
              const desc  = colonIdx > 0 ? activity.slice(colonIdx + 1).trim() : ''
              return (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold mb-4"
                    style={{ backgroundColor: cfg.accentHex }}
                  >
                    {i + 1}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                  {desc && <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* News */}
      <section id="actualites" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className={`inline-block text-xs font-bold uppercase tracking-widest ${cfg.accentText} mb-3`}>
              Restez informé
            </span>
            <h2 className="text-4xl font-extrabold text-gray-900">Actualités</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {content.news.map((item, i) => (
              <article key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="h-2 w-full" style={{ backgroundColor: cfg.accentHex }} />
                <div className="p-6">
                  <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${cfg.badge} mb-3`}>
                    {item.date}
                  </span>
                  <h3 className="font-bold text-gray-900 text-lg mb-3 leading-snug">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.excerpt}</p>
                  <button className={`mt-4 text-sm font-semibold ${cfg.accentText} hover:underline`}>
                    Lire la suite →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Events */}
      <section id="evenements" className={`py-20 px-4 ${cfg.accentLight}`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className={`inline-block text-xs font-bold uppercase tracking-widest ${cfg.accentText} mb-3`}>
              Ne manquez rien
            </span>
            <h2 className="text-4xl font-extrabold text-gray-900">Prochains événements</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {content.events.map((event, i) => (
              <div
                key={i}
                className={`bg-white rounded-2xl p-6 border-2 ${cfg.accentBorder} shadow-sm hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center text-white flex-shrink-0"
                    style={{ backgroundColor: cfg.accentHex }}
                  >
                    <span className="text-xs font-medium opacity-80">{event.date.split(' ')[1]}</span>
                    <span className="text-2xl font-extrabold leading-none">{event.date.split(' ')[0]}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{event.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">📍 {event.location}</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{event.description}</p>
                <button className={`mt-4 inline-flex items-center gap-1 text-sm font-semibold ${cfg.accentText} hover:underline`}>
                  En savoir plus →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className={`inline-block text-xs font-bold uppercase tracking-widest ${cfg.accentText} mb-3`}>
            Rejoignez-nous
          </span>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-6">
            Contactez {name}
          </h2>
          <p className="text-gray-500 text-lg mb-10">
            Vous souhaitez rejoindre notre association ou en savoir plus sur nos activités à {city} ? N&apos;hésitez pas à nous contacter !
          </p>
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            {[
              { icon: '📧', label: 'Email', value: `contact@${name.toLowerCase().replace(/\s+/g, '')}.fr` },
              { icon: '📞', label: 'Téléphone', value: '01 23 45 67 89' },
              { icon: '📍', label: 'Ville', value: city },
            ].map((item) => (
              <div key={item.label} className={`${cfg.accentLight} ${cfg.accentBorder} border rounded-2xl p-5`}>
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                <p className={`font-semibold ${cfg.accentText} text-sm`}>{item.value}</p>
              </div>
            ))}
          </div>
          <a
            href={`mailto:contact@${name.toLowerCase().replace(/\s+/g, '')}.fr`}
            className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-white font-bold text-lg hover:opacity-90 transition-opacity shadow-lg"
            style={{ backgroundColor: cfg.accentHex }}
          >
            Nous contacter
          </a>
        </div>
      </section>

      {/* Web sources (shown if real data was used) */}
      {webSources.length > 0 && (
        <section className="py-8 px-4 bg-gray-50 border-t border-gray-100">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Sources consultées par l&apos;IA
            </p>
            <div className="flex flex-wrap gap-2">
              {webSources.map((src, i) => (
                <a
                  key={i}
                  href={src}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-xs text-primary-600 hover:underline bg-primary-50 px-3 py-1.5 rounded-full border border-primary-100"
                >
                  🔗 {new URL(src).hostname}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">{cfg.emoji}</span>
            <span className="font-bold text-white">{name}</span>
            <span className="text-gray-500">· {city}</span>
          </div>
          <p className="text-sm">
            Site généré par{' '}
            <a href="/" className="text-white font-semibold hover:underline">
              AssoLab
            </a>
            {' '}· IA locale (Llama) · {content.enrichedFromWeb ? '🌐 enrichi depuis le web' : '🤖 contenu généré'}
          </p>
        </div>
      </footer>
    </div>
  )
}
