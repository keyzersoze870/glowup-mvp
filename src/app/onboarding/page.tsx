'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { OnboardingData } from '@/lib/types'

const STEPS = 5

const objectifs = [
  { key: 'perdre_gras', label: 'Perdre du gras', icon: '🔥' },
  { key: 'prendre_muscle', label: 'Prendre du muscle', icon: '💪' },
  { key: 'recomposition', label: 'Recomposition', icon: '⚡' },
  { key: 'glow_global', label: 'Glow Up global', icon: '✨' },
]
const niveaux = [
  { key: 'debutant', label: 'Débutant', desc: 'Je démarre ou reprends' },
  { key: 'intermediaire', label: 'Intermédiaire', desc: '1–3 ans de pratique' },
  { key: 'avance', label: 'Avancé', desc: '3+ ans, je connais' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<Partial<OnboardingData>>({
    skincare: false,
    sport_semaine: 3,
    heures_sommeil: 7,
    eau_litres: 1.5,
    steps_quotidien: 6000,
  })

  const update = (key: keyof OnboardingData, val: any) => setData(d => ({ ...d, [key]: val }))

  const next = () => {
    if (step < STEPS - 1) setStep(s => s + 1)
  }
  const back = () => setStep(s => s - 1)

  const submit = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/generate-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (json.success) {
        localStorage.setItem('glowup_profile', JSON.stringify(data))
        localStorage.setItem('glowup_score', JSON.stringify(json.score))
        router.push('/dashboard')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const progress = ((step + 1) / STEPS) * 100

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <span className="font-display font-black text-lg" style={{ color: 'var(--acid)' }}>GLOWUP</span>
          <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>{step + 1} / {STEPS}</span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--surface2)' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: 'var(--acid)' }} />
        </div>
      </div>

      {/* Steps */}
      <div className="flex-1 flex flex-col justify-center px-6 max-w-lg mx-auto w-full fade-up">

        {/* STEP 0 — Prénom + Objectif */}
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-black uppercase text-3xl mb-1">On commence.</h2>
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>Ton prénom pour personnaliser l'expérience.</p>
            </div>
            <input
              type="text" placeholder="Prénom" autoFocus
              value={data.prenom || ''}
              onChange={e => update('prenom', e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-base outline-none border transition-colors"
              style={{ background: 'var(--surface)', borderColor: data.prenom ? 'var(--acid)' : 'var(--border)', color: 'var(--text)' }}
            />
            <div>
              <p className="text-sm font-medium mb-3">Ton objectif principal ?</p>
              <div className="grid grid-cols-2 gap-3">
                {objectifs.map(o => (
                  <button key={o.key} onClick={() => update('objectif', o.key)}
                    className="p-4 rounded-xl border text-left transition-all"
                    style={{
                      background: data.objectif === o.key ? 'var(--acid-dim)' : 'var(--surface)',
                      borderColor: data.objectif === o.key ? 'var(--acid)' : 'var(--border)',
                    }}>
                    <div className="text-2xl mb-2">{o.icon}</div>
                    <div className="text-sm font-medium">{o.label}</div>
                  </button>
                ))}
              </div>
            </div>
            <button onClick={next} disabled={!data.prenom || !data.objectif}
              className="w-full py-4 rounded-xl font-display font-black uppercase tracking-wider text-base transition-all disabled:opacity-30"
              style={{ background: 'var(--acid)', color: '#000' }}>
              Continuer →
            </button>
          </div>
        )}

        {/* STEP 1 — Corps */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-black uppercase text-3xl mb-1">Ton corps.</h2>
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>Pour calculer ton IMC et personnaliser le plan.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono mb-2 block" style={{ color: 'var(--muted)' }}>POIDS (kg)</label>
                <input type="number" placeholder="75"
                  value={data.poids || ''}
                  onChange={e => update('poids', Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl text-base outline-none border"
                  style={{ background: 'var(--surface)', borderColor: data.poids ? 'var(--acid)' : 'var(--border)', color: 'var(--text)' }}
                />
              </div>
              <div>
                <label className="text-xs font-mono mb-2 block" style={{ color: 'var(--muted)' }}>TAILLE (cm)</label>
                <input type="number" placeholder="175"
                  value={data.taille || ''}
                  onChange={e => update('taille', Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl text-base outline-none border"
                  style={{ background: 'var(--surface)', borderColor: data.taille ? 'var(--acid)' : 'var(--border)', color: 'var(--text)' }}
                />
              </div>
            </div>
            {data.poids && data.taille && (
              <div className="p-4 rounded-xl" style={{ background: 'var(--surface2)' }}>
                <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>IMC </span>
                <span className="font-mono font-semibold text-lg">{(data.poids / ((data.taille / 100) ** 2)).toFixed(1)}</span>
              </div>
            )}
            <div>
              <p className="text-sm font-medium mb-3">Niveau sportif actuel</p>
              <div className="space-y-2">
                {niveaux.map(n => (
                  <button key={n.key} onClick={() => update('niveau', n.key)}
                    className="w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all"
                    style={{
                      background: data.niveau === n.key ? 'var(--acid-dim)' : 'var(--surface)',
                      borderColor: data.niveau === n.key ? 'var(--acid)' : 'var(--border)',
                    }}>
                    <span className="font-medium text-sm">{n.label}</span>
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>{n.desc}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={back} className="flex-1 py-4 rounded-xl border font-display font-bold uppercase text-sm tracking-wider transition-all"
                style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>← Retour</button>
              <button onClick={next} disabled={!data.poids || !data.taille || !data.niveau}
                className="flex-1 py-4 rounded-xl font-display font-black uppercase tracking-wider text-sm transition-all disabled:opacity-30"
                style={{ background: 'var(--acid)', color: '#000' }}>
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — Sport */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-black uppercase text-3xl mb-1">Ton sport.</h2>
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>Actuellement, combien tu t'entraînes ?</p>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-mono" style={{ color: 'var(--muted)' }}>SÉANCES / SEMAINE</label>
                <span className="font-mono font-semibold" style={{ color: 'var(--acid)' }}>{data.sport_semaine}x</span>
              </div>
              <input type="range" min={0} max={7} step={1} value={data.sport_semaine}
                onChange={e => update('sport_semaine', Number(e.target.value))}
                className="w-full accent-[#C8FF00]" />
              <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--muted)' }}>
                <span>0</span><span>7</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-mono" style={{ color: 'var(--muted)' }}>PAS / JOUR (estimé)</label>
                <span className="font-mono font-semibold" style={{ color: 'var(--acid)' }}>{data.steps_quotidien?.toLocaleString()}</span>
              </div>
              <input type="range" min={1000} max={20000} step={500} value={data.steps_quotidien}
                onChange={e => update('steps_quotidien', Number(e.target.value))}
                className="w-full accent-[#C8FF00]" />
              <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--muted)' }}>
                <span>sédentaire</span><span>très actif</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={back} className="flex-1 py-4 rounded-xl border font-display font-bold uppercase text-sm tracking-wider"
                style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>← Retour</button>
              <button onClick={next} className="flex-1 py-4 rounded-xl font-display font-black uppercase tracking-wider text-sm"
                style={{ background: 'var(--acid)', color: '#000' }}>
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Hygiène de vie */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-black uppercase text-3xl mb-1">Ton lifestyle.</h2>
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>Sommeil, hydratation, skincare.</p>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-mono" style={{ color: 'var(--muted)' }}>HEURES SOMMEIL / NUIT</label>
                <span className="font-mono font-semibold" style={{ color: 'var(--acid)' }}>{data.heures_sommeil}h</span>
              </div>
              <input type="range" min={4} max={10} step={0.5} value={data.heures_sommeil}
                onChange={e => update('heures_sommeil', Number(e.target.value))}
                className="w-full accent-[#C8FF00]" />
              <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--muted)' }}>
                <span>4h</span><span>10h</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-mono" style={{ color: 'var(--muted)' }}>EAU / JOUR (litres)</label>
                <span className="font-mono font-semibold" style={{ color: 'var(--acid)' }}>{data.eau_litres}L</span>
              </div>
              <input type="range" min={0.5} max={4} step={0.25} value={data.eau_litres}
                onChange={e => update('eau_litres', Number(e.target.value))}
                className="w-full accent-[#C8FF00]" />
              <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--muted)' }}>
                <span>0.5L</span><span>4L</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-3">Tu as une routine skincare ?</p>
              <div className="grid grid-cols-2 gap-3">
                {[{ v: true, l: 'Oui', icon: '✨' }, { v: false, l: 'Pas vraiment', icon: '🤷' }].map(o => (
                  <button key={String(o.v)} onClick={() => update('skincare', o.v)}
                    className="p-4 rounded-xl border text-center transition-all"
                    style={{
                      background: data.skincare === o.v ? 'var(--acid-dim)' : 'var(--surface)',
                      borderColor: data.skincare === o.v ? 'var(--acid)' : 'var(--border)',
                    }}>
                    <div className="text-2xl mb-1">{o.icon}</div>
                    <div className="text-sm font-medium">{o.l}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={back} className="flex-1 py-4 rounded-xl border font-display font-bold uppercase text-sm tracking-wider"
                style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>← Retour</button>
              <button onClick={next} className="flex-1 py-4 rounded-xl font-display font-black uppercase tracking-wider text-sm"
                style={{ background: 'var(--acid)', color: '#000' }}>
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 — Recap + Submit */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-black uppercase text-3xl mb-1">
                Prêt{data.prenom ? `, ${data.prenom}` : ''}.
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>L'IA analyse ton profil et génère ton score.</p>
            </div>
            <div className="rounded-xl p-5 space-y-3 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              {[
                { label: 'Objectif', val: objectifs.find(o => o.key === data.objectif)?.label },
                { label: 'Poids / Taille', val: `${data.poids}kg — ${data.taille}cm` },
                { label: 'Niveau', val: data.niveau },
                { label: 'Sport', val: `${data.sport_semaine}x / semaine` },
                { label: 'Sommeil', val: `${data.heures_sommeil}h / nuit` },
                { label: 'Eau', val: `${data.eau_litres}L / jour` },
                { label: 'Skincare', val: data.skincare ? 'Oui ✓' : 'À améliorer' },
              ].map(r => (
                <div key={r.label} className="flex justify-between text-sm">
                  <span style={{ color: 'var(--muted)' }}>{r.label}</span>
                  <span className="font-medium capitalize">{r.val}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={back} className="flex-1 py-4 rounded-xl border font-display font-bold uppercase text-sm tracking-wider"
                style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>← Retour</button>
              <button onClick={submit} disabled={loading}
                className="flex-2 py-4 px-6 rounded-xl font-display font-black uppercase tracking-wider text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: 'var(--acid)', color: '#000', flex: 2 }}>
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Analyse en cours...</>
                ) : '⚡ Calculer mon score'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
