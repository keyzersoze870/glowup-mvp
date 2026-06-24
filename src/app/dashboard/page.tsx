'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GlowUpScore, OnboardingData, DailyChecklist } from '@/lib/types'

const CATEGORIES = [
  { key: 'training', label: 'Training', icon: '🏋️' },
  { key: 'nutrition', label: 'Nutrition', icon: '🥗' },
  { key: 'hydratation', label: 'Eau', icon: '💧' },
  { key: 'sommeil', label: 'Sommeil', icon: '🌙' },
  { key: 'skincare', label: 'Skin', icon: '✨' },
  { key: 'steps', label: 'Steps', icon: '👟' },
]

const CHECK_ITEMS = [
  { key: 'training', label: 'Entraînement fait', icon: '🏋️' },
  { key: 'steps', label: '8 000 pas', icon: '👟' },
  { key: 'proteines', label: 'Protéines OK', icon: '🥩' },
  { key: 'eau', label: '2L d\'eau', icon: '💧' },
  { key: 'sommeil', label: 'Coucher avant 23h', icon: '🌙' },
]

function ScoreRing({ score, size = 160 }: { score: number; size?: number }) {
  const [displayed, setDisplayed] = useState(0)
  const r = 52; const c = 2 * Math.PI * r
  const offset = c - (displayed / 100) * c
  const color = displayed >= 70 ? '#C8FF00' : displayed >= 45 ? '#FF6B35' : '#ff4444'

  useEffect(() => {
    let frame: number; let cur = 0
    const animate = () => {
      cur += Math.ceil((score - cur) / 10)
      setDisplayed(Math.min(cur, score))
      if (cur < score) frame = requestAnimationFrame(animate)
    }
    const t = setTimeout(() => { frame = requestAnimationFrame(animate) }, 300)
    return () => { clearTimeout(t); cancelAnimationFrame(frame) }
  }, [score])

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className="ring-pulse">
      <circle cx="60" cy="60" r={r} fill="none" stroke="var(--surface2)" strokeWidth="8" />
      <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
        transform="rotate(-90 60 60)" style={{ transition: 'stroke-dashoffset 0.03s' }} />
      <text x="60" y="53" textAnchor="middle" dominantBaseline="middle"
        style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontSize: 30, fill: color }}>
        {displayed}
      </text>
      <text x="60" y="70" textAnchor="middle" dominantBaseline="middle"
        style={{ fontFamily: 'JetBrains Mono', fontSize: 9, fill: 'var(--muted)' }}>
        GLOW UP SCORE
      </text>
    </svg>
  )
}

export default function Dashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<Partial<OnboardingData> | null>(null)
  const [score, setScore] = useState<GlowUpScore | null>(null)
  const [checklist, setChecklist] = useState<DailyChecklist>({ training: false, steps: false, proteines: false, eau: false, sommeil: false })
  const [checkinLoading, setCheckinLoading] = useState(false)
  const [todayMessage, setTodayMessage] = useState<string | null>(null)
  const [streak, setStreak] = useState(0)
  const [activeTab, setActiveTab] = useState<'today' | 'score' | 'plan'>('today')

  useEffect(() => {
    const p = localStorage.getItem('glowup_profile')
    const s = localStorage.getItem('glowup_score')
    const st = localStorage.getItem('glowup_streak')
    if (!p || !s) { router.push('/onboarding'); return }
    setProfile(JSON.parse(p))
    setScore(JSON.parse(s))
    setStreak(st ? Number(st) : 0)
  }, [])

  const toggleCheck = (key: keyof DailyChecklist) => {
    setChecklist(c => ({ ...c, [key]: !c[key] }))
  }

  const submitCheckin = async () => {
    if (!score) return
    setCheckinLoading(true)
    try {
      const res = await fetch('/api/daily-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklist, prenom: profile?.prenom, previousScore: score.total }),
      })
      const json = await res.json()
      if (json.success) {
        const newScore = { ...score, total: json.nouveauScore }
        setScore(newScore)
        localStorage.setItem('glowup_score', JSON.stringify(newScore))
        const newStreak = streak + 1
        setStreak(newStreak)
        localStorage.setItem('glowup_streak', String(newStreak))
        setTodayMessage(`${json.emoji} ${json.message}`)
      }
    } finally {
      setCheckinLoading(false)
    }
  }

  if (!score || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--acid)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  const doneCount = Object.values(checklist).filter(Boolean).length

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* NAV */}
      <nav className="flex items-center justify-between px-4 py-3 border-b sticky top-0 z-10" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
        <span className="font-display font-black text-lg" style={{ color: 'var(--acid)' }}>GLOWUP</span>
        <div className="flex items-center gap-3">
          {streak > 0 && (
            <span className="font-mono text-xs flex items-center gap-1" style={{ color: 'var(--orange)' }}>
              🔥 {streak} jour{streak > 1 ? 's' : ''}
            </span>
          )}
          <button onClick={() => { localStorage.clear(); router.push('/') }}
            className="text-xs px-3 py-1.5 rounded-lg border transition-all"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
            Reset
          </button>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* GREETING + SCORE */}
        <div className="flex items-center gap-5 p-5 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <ScoreRing score={score.total} />
          <div>
            <p className="text-xs font-mono mb-1" style={{ color: 'var(--muted)' }}>BONJOUR</p>
            <h1 className="font-display font-black uppercase text-2xl leading-none mb-2">{profile.prenom}</h1>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{score.analyse}</p>
          </div>
        </div>

        {/* TODAY MESSAGE */}
        {todayMessage && (
          <div className="p-4 rounded-xl border text-sm" style={{ background: 'var(--acid-dim)', borderColor: 'var(--acid-border)', color: 'var(--acid)' }}>
            {todayMessage}
          </div>
        )}

        {/* TABS */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--surface)' }}>
          {[['today', "Aujourd'hui"], ['score', 'Mon Score'], ['plan', 'Semaine 1']].map(([k, l]) => (
            <button key={k} onClick={() => setActiveTab(k as any)}
              className="flex-1 py-2 text-xs font-display font-bold uppercase tracking-wide rounded-lg transition-all"
              style={{
                background: activeTab === k ? 'var(--acid)' : 'transparent',
                color: activeTab === k ? '#000' : 'var(--muted)',
              }}>
              {l}
            </button>
          ))}
        </div>

        {/* TAB: TODAY */}
        {activeTab === 'today' && (
          <div className="space-y-3 fade-up">
            <div className="flex justify-between items-center">
              <h2 className="font-display font-bold uppercase text-sm tracking-wide" style={{ color: 'var(--muted)' }}>
                Checklist du jour
              </h2>
              <span className="font-mono text-xs" style={{ color: doneCount === 5 ? 'var(--acid)' : 'var(--muted)' }}>
                {doneCount} / 5
              </span>
            </div>
            {CHECK_ITEMS.map(item => {
              const done = checklist[item.key as keyof DailyChecklist]
              return (
                <button key={item.key} onClick={() => toggleCheck(item.key as keyof DailyChecklist)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all"
                  style={{
                    background: done ? 'var(--acid-dim)' : 'var(--surface)',
                    borderColor: done ? 'var(--acid-border)' : 'var(--border)',
                    borderLeftWidth: done ? '3px' : '1px',
                    borderLeftColor: done ? 'var(--acid)' : 'var(--border)',
                  }}>
                  <span className="text-xl">{item.icon}</span>
                  <span className="flex-1 text-sm font-medium" style={{ color: done ? 'var(--acid)' : 'var(--text)', textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.7 : 1 }}>
                    {item.label}
                  </span>
                  <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                    style={{ borderColor: done ? 'var(--acid)' : 'var(--border)', background: done ? 'var(--acid)' : 'transparent' }}>
                    {done && <span style={{ fontSize: 10, color: '#000', fontWeight: 700 }}>✓</span>}
                  </div>
                </button>
              )
            })}

            <button onClick={submitCheckin} disabled={checkinLoading || doneCount === 0}
              className="w-full py-4 rounded-xl font-display font-black uppercase tracking-wider text-sm transition-all disabled:opacity-30 flex items-center justify-center gap-2 mt-2"
              style={{ background: 'var(--acid)', color: '#000' }}>
              {checkinLoading
                ? <><span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />Mise à jour...</>
                : `⚡ Valider ma journée (${doneCount}/5)`}
            </button>
          </div>
        )}

        {/* TAB: SCORE */}
        {activeTab === 'score' && (
          <div className="space-y-3 fade-up">
            <h2 className="font-display font-bold uppercase text-sm tracking-wide" style={{ color: 'var(--muted)' }}>
              Détail du score
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map(cat => {
                const val = score[cat.key as keyof GlowUpScore] as number
                const color = val >= 7 ? 'var(--acid)' : val >= 5 ? 'var(--orange)' : '#ff4444'
                return (
                  <div key={cat.key} className="p-4 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                    <div className="text-xl mb-2">{cat.icon}</div>
                    <div className="text-xs font-mono mb-1" style={{ color: 'var(--muted)' }}>{cat.label.toUpperCase()}</div>
                    <div className="font-display font-black text-2xl" style={{ color }}>{val}<span className="text-sm font-mono" style={{ color: 'var(--muted)' }}>/10</span></div>
                    <div className="mt-2 h-1 rounded-full" style={{ background: 'var(--surface2)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${val * 10}%`, background: color }} />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Paywall teaser */}
            <div className="mt-4 p-5 rounded-xl border relative overflow-hidden" style={{ borderColor: 'var(--acid-border)', background: 'var(--acid-dim)' }}>
              <div className="text-xs font-mono mb-1" style={{ color: 'var(--acid)' }}>🔒 PREMIUM</div>
              <p className="text-sm font-medium mb-3">Débloque l'historique complet de ton score + le plan d'entraînement personnalisé semaine par semaine.</p>
              <button className="px-5 py-2.5 rounded-xl font-display font-bold uppercase text-xs tracking-wider transition-all"
                style={{ background: 'var(--acid)', color: '#000' }}>
                Passer Premium — 9,99€/mois
              </button>
            </div>
          </div>
        )}

        {/* TAB: PLAN */}
        {activeTab === 'plan' && (
          <div className="space-y-3 fade-up">
            <h2 className="font-display font-bold uppercase text-sm tracking-wide" style={{ color: 'var(--muted)' }}>
              Ton plan semaine 1
            </h2>
            {score.plan_semaine1?.map((action, i) => (
              <div key={i} className="flex gap-3 p-4 rounded-xl border items-start" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <span className="font-mono text-xs mt-0.5 font-semibold" style={{ color: 'var(--acid)', minWidth: 16 }}>0{i + 1}</span>
                <p className="text-sm leading-relaxed">{action}</p>
              </div>
            ))}

            <div className="mt-2">
              <p className="text-xs font-mono mb-2" style={{ color: 'var(--muted)' }}>QUICK WINS — VISIBLES EN 7 JOURS</p>
              {score.quick_wins?.map((win, i) => (
                <div key={i} className="flex gap-2 items-start mb-2">
                  <span style={{ color: 'var(--acid)' }}>✦</span>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>{win}</p>
                </div>
              ))}
            </div>

            {/* Paywall */}
            <div className="p-5 rounded-xl border mt-4" style={{ borderColor: 'var(--acid-border)', background: 'var(--acid-dim)' }}>
              <div className="text-xs font-mono mb-1" style={{ color: 'var(--acid)' }}>🔒 SEMAINES 2 → 8</div>
              <p className="text-sm mb-3">Accède au programme complet 8 semaines avec adaptation automatique chaque semaine selon ton score.</p>
              <button className="px-5 py-2.5 rounded-xl font-display font-bold uppercase text-xs tracking-wider"
                style={{ background: 'var(--acid)', color: '#000' }}>
                Débloquer — 9,99€/mois
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
