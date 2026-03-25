import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { getAuthUserAsync } from '@/lib/auth'

const FEATURES = [
  {
    icon: '⚡',
    title: 'Génération instantanée',
    desc: 'En 30 secondes, votre site est prêt. Nom, ville, type — l\'IA fait le reste.',
  },
  {
    icon: '✍️',
    title: 'Contenu sur-mesure',
    desc: 'Description, mission, actualités et événements générés automatiquement et adaptés à votre association.',
  },
  {
    icon: '🔄',
    title: 'Régénération illimitée',
    desc: 'Pas satisfait ? Régénérez le contenu en un clic ou éditez-le manuellement.',
  },
  {
    icon: '🎨',
    title: 'Design moderne',
    desc: 'Chaque association type a sa propre identité visuelle. Professionnel dès le premier jour.',
  },
  {
    icon: '📅',
    title: 'Événements & actualités',
    desc: 'La plateforme génère vos prochains événements et 3 articles d\'actualité.',
  },
  {
    icon: '🔒',
    title: 'Sécurisé & privé',
    desc: 'Vos données vous appartiennent. Authentification sécurisée, accès privé à votre dashboard.',
  },
]

const STEPS = [
  { num: '01', title: 'Créez un compte', desc: 'Inscription gratuite en 30 secondes.' },
  { num: '02', title: 'Renseignez votre association', desc: 'Nom, ville et type d\'activité.' },
  { num: '03', title: 'L\'IA génère tout', desc: 'Description, mission, news, événements.' },
  { num: '04', title: 'Prévisualisez & partagez', desc: 'Votre site est prêt à être montré.' },
]

const TYPES = [
  { type: 'sport', label: 'Sport', emoji: '⚽', color: 'bg-green-100 text-green-700' },
  { type: 'culture', label: 'Culture', emoji: '🎭', color: 'bg-purple-100 text-purple-700' },
  { type: 'solidarity', label: 'Solidarité', emoji: '🤝', color: 'bg-red-100 text-red-700' },
  { type: 'education', label: 'Éducation', emoji: '📚', color: 'bg-blue-100 text-blue-700' },
]

export default async function HomePage() {
  const user = await getAuthUserAsync()

  return (
    <div className="min-h-screen">
      <Navbar user={user} />

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden bg-gradient-to-b from-primary-50 via-white to-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-100/60 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-600 text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
            </span>
            Propulsé par l&apos;IA · GPT-4
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-tight mb-6">
            Votre site d&apos;association
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-accent-500">
              généré en 30 secondes
            </span>
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            AssoLab utilise l&apos;IA pour créer automatiquement le site web de votre association.
            Description, mission, actualités, événements — tout est prêt en un clic.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={user ? '/dashboard' : '/auth/signup'} className="btn-primary text-base px-8 py-4 rounded-2xl">
              Générer mon site gratuitement →
            </Link>
            <Link href="#how" className="btn-secondary text-base px-8 py-4 rounded-2xl">
              Voir comment ça marche
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 mt-12 text-sm text-gray-400">
            {['Gratuit pour commencer', 'Aucune carte requise', '< 1 min pour démarrer'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Association types */}
      <section className="py-12 px-4 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-sm font-medium text-gray-400 mb-6 uppercase tracking-widest">
            Pour tous types d&apos;associations
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {TYPES.map(({ type, label, emoji, color }) => (
              <div key={type} className={`flex items-center gap-3 px-5 py-4 rounded-2xl ${color} font-semibold`}>
                <span className="text-2xl">{emoji}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="section-label mb-3">Fonctionnalités</p>
            <h2 className="text-4xl font-extrabold text-gray-900">Tout ce dont votre association a besoin</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-6 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="section-label mb-3">Comment ça marche</p>
            <h2 className="text-4xl font-extrabold text-gray-900">Quatre étapes, un site prêt</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((s) => (
              <div key={s.num} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-500 text-white text-xl font-extrabold mb-4">
                  {s.num}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-6">
            Prêt à lancer votre présence en ligne ?
          </h2>
          <p className="text-xl text-gray-500 mb-10">
            Rejoignez les associations qui ont déjà créé leur site avec AssoLab.
          </p>
          <Link href={user ? '/dashboard' : '/auth/signup'} className="btn-primary text-base px-10 py-4 rounded-2xl">
            Créer mon site maintenant →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-extrabold text-xl">
            <span className="text-primary-500">Asso</span>Lab
          </span>
          <p className="text-sm text-gray-400">© 2026 AssoLab. Prototype POC — propulsé par GPT-4.</p>
        </div>
      </footer>
    </div>
  )
}
