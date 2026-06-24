'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const SCORES = [42, 67, 89, 73, 55, 91, 38, 76]

export default function LandingPage() {
  const [displayScore, setDisplayScore] = useState(0)
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    let frame: number
    let current = 0
    const target = SCORES[idx]
    const step = () => {
      current += Math.ceil((target - current) / 8)
      setDisplayScore(current)
      if (current < target) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [idx])

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % SCORES.length), 2200)
    return () => clearInterval(t)
  }, [])

  const circumference = 2 * Math.PI * 52
  const offset = circumference - (displayScore / 100) * circumference

  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* NAV */}
      <nav className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <span className="font-display text-xl font-black tracking-wide" style={{ color: 'var(--acid)' }}>GLOWUP</span>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Se connecter</Link>
          <Link href="/onboarding" className="font-display font-bold text-sm uppercase tracking-wider px-5 py-2 rounded-xl transition-all"
            style={{ background: 'var(--acid)', color: '#000' }}>
            Commencer →
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-16 pb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono mb-8 border"
          style={{ borderColor: 'var(--acid-border)', background: 'var(--acid-dim)', color: 'var(--acid)' }}>
          ✦ GLOW UP SCORE — IA personnalisée
        </div>

        <h1 className="font-display font-black uppercase leading-none mb-6" style={{ fontSize: 'clamp(48px, 10vw, 96px)' }}>
          Ta transformation<br />
          <span style={{ color: 'var(--acid)' }}>commence ici.</span>
        </h1>

        <p className="max-w-md text-base mb-12" style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
          5 questions. 2 minutes. Un score holistique généré par IA qui mesure ton corps, ta peau et ton mindset — et un plan pour l'améliorer.
        </p>

        {/* SCORE RING DEMO */}
        <div className="relative mb-12">
          <svg width="160" height="160" viewBox="0 0 120 120" className="ring-pulse">
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--surface2)" strokeWidth="8" />
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--acid)" strokeWidth="8"
              strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
              transform="rotate(-90 60 60)" style={{ transition: 'stroke-dashoffset 0.05s' }} />
            <text x="60" y="55" textAnchor="middle" dominantBaseline="middle"
              className="font-display" style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontSize: 28, fill: 'var(--acid)' }}>
              {displayScore}
            </text>
            <text x="60" y="72" textAnchor="middle" dominantBaseline="middle"
              style={{ fontFamily: 'JetBrains Mono', fontSize: 9, fill: 'var(--muted)' }}>
              / 100
            </text>
          </svg>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-mono"
            style={{ color: 'var(--muted)' }}>score en temps réel</div>
        </div>

        <Link href="/onboarding"
          className="font-display font-black uppercase text-lg tracking-wider px-10 py-4 rounded-xl transition-all hover:scale-105 active:scale-95"
          style={{ background: 'var(--acid)', color: '#000' }}>
          Calculer mon score — gratuit
        </Link>
        <p className="mt-3 text-xs" style={{ color: 'var(--muted)' }}>Aucune CB requise · 2 min chrono</p>
      </section>

      {/* FEATURES */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 pb-12 max-w-4xl mx-auto w-full">
        {[
          { icon: '⚡', title: 'Score en 2 min', desc: '5 questions, IA analyse ton profil complet et génère ton score personnalisé.' },
          { icon: '📊', title: '6 dimensions', desc: 'Training, nutrition, hydratation, sommeil, skincare, steps. Rien ne t\'échappe.' },
          { icon: '🔥', title: 'Plan semaine 1', desc: 'Actions concrètes pour bouger ton score dès demain. Pas de blabla.' },
        ].map((f) => (
          <div key={f.title} className="rounded-xl p-5 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="text-2xl mb-3">{f.icon}</div>
            <h3 className="font-display font-bold uppercase text-sm tracking-wide mb-2">{f.title}</h3>
            <p className="text-sm" style={{ color: 'var(--muted)', lineHeight: 1.6 }}>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* FOOTER */}
      <footer className="text-center pb-8 text-xs" style={{ color: 'var(--muted)' }}>
        © 2025 GlowUp · <Link href="/privacy" className="hover:text-white transition-colors">Confidentialité</Link>
      </footer>
    </main>
  )
}
