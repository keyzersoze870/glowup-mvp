'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

const sf = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif`

const CATEGORIES = [
  { key: 'training',    label: 'Sport',      icon: '🏋️', color: '#FF9F0A' },
  { key: 'nutrition',   label: 'Nutrition',  icon: '🥗',  color: '#30D158' },
  { key: 'hydratation', label: 'Eau',        icon: '💧',  color: '#0A84FF' },
  { key: 'sommeil',     label: 'Sommeil',    icon: '🌙',  color: '#BF5AF2' },
  { key: 'skincare',    label: 'Skincare',   icon: '✨',  color: '#64D2FF' },
  { key: 'steps',       label: 'Stress',     icon: '🧘',  color: '#FF453A' },
]

function getScoreLabel(s: number) {
  if (s >= 80) return 'Elite 🔥'
  if (s >= 65) return 'Excellent ⚡'
  if (s >= 50) return 'Bien 👍'
  if (s >= 35) return 'Moyen 📈'
  return 'À améliorer 💪'
}

function getScoreColor(s: number) {
  if (s >= 70) return '#30D158'
  if (s >= 45) return '#FF9F0A'
  return '#FF453A'
}

function getRankPhrase(s: number) {
  if (s >= 80) return 'Top 5% des utilisateurs 🏆'
  if (s >= 65) return 'Top 20% des utilisateurs 🎯'
  if (s >= 50) return 'Top 45% des utilisateurs 📊'
  return '85% ont un meilleur score ⚠️'
}

export default function SharePage() {
  const router = useRouter()
  const cardRef = useRef<HTMLDivElement>(null)
  const [score, setScore] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const s = localStorage.getItem('glowup_score')
    const p = localStorage.getItem('glowup_profile')
    if (!s || !p) { router.push('/onboarding'); return }
    setScore(JSON.parse(s))
    setProfile(JSON.parse(p))
  }, [])

  const handleShare = async () => {
    if (!cardRef.current) return
    try {
      // Screenshot via html2canvas si dispo, sinon message
      if (navigator.share) {
        await navigator.share({
          title: 'Mon Glow Up Score',
          text: `J'ai obtenu ${score?.total}/100 sur GlowApp 🔥 Calcule le tien !`,
          url: 'https://glowup-mvp.vercel.app',
        })
      } else {
        await navigator.clipboard.writeText(`J'ai obtenu ${score?.total}/100 sur GlowApp 🔥 Calcule le tien sur glowup-mvp.vercel.app`)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (e) {}
  }

  if (!score || !profile) return null

  const scoreColor = getScoreColor(score.total)
  const circumference = 2 * Math.PI * 45

  return (
    <main style={{ minHeight:'100svh', background:'#000', fontFamily:sf, display:'flex', flexDirection:'column', alignItems:'center', padding:'20px 20px 40px' }}>

      {/* NAV */}
      <div style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <button onClick={() => router.push('/dashboard')}
          style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', fontSize:14, cursor:'pointer', fontFamily:sf }}>
          ← Retour
        </button>
        <span style={{ fontSize:16, fontWeight:700, color:'#fff', letterSpacing:-0.5 }}>Partager</span>
        <div style={{ width:60 }} />
      </div>

      {/* CARTE 9:16 */}
      <div ref={cardRef} style={{
        width:'100%', maxWidth:360,
        aspectRatio:'9/16',
        borderRadius:24,
        overflow:'hidden',
        position:'relative',
        background:'linear-gradient(135deg, #0A0A0F 0%, #0D0D1A 40%, #0A0A0F 100%)',
        border:'0.5px solid rgba(255,255,255,0.08)',
        boxShadow:'0 0 60px rgba(10,132,255,0.15)',
      }}>
        {/* Fond gradient décoratif */}
        <div style={{ position:'absolute', top:-100, left:-100, width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(10,132,255,0.15) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-80, right:-80, width:250, height:250, borderRadius:'50%', background:'radial-gradient(circle, rgba(191,90,242,0.1) 0%, transparent 70%)', pointerEvents:'none' }} />

        <div style={{ position:'relative', zIndex:1, height:'100%', display:'flex', flexDirection:'column', padding:'28px 24px 24px' }}>

          {/* HEADER */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
            <div>
              <p style={{ fontSize:11, color:'rgba(255,255,255,0.35)', letterSpacing:1, textTransform:'uppercase', marginBottom:4 }}>MON GLOW UP SCORE</p>
              <p style={{ fontSize:20, fontWeight:700, color:'#fff', letterSpacing:-0.5 }}>{profile.prenom}</p>
            </div>
            <div style={{ background:'rgba(10,132,255,0.15)', border:'0.5px solid rgba(10,132,255,0.3)', borderRadius:20, padding:'4px 12px' }}>
              <span style={{ fontSize:11, color:'#0A84FF', fontWeight:600, letterSpacing:0.3 }}>GlowApp</span>
            </div>
          </div>

          {/* SCORE RING CENTRAL */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:28 }}>
            <svg width={160} height={160} viewBox="0 0 100 100">
              {/* Glow effect */}
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6"/>
              <circle cx="50" cy="50" r="45" fill="none" stroke={scoreColor} strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (score.total / 100) * circumference}
                transform="rotate(-90 50 50)"
                filter="url(#glow)"/>
              <text x="50" y="44" textAnchor="middle" dominantBaseline="middle"
                style={{ fontFamily:sf, fontWeight:700, fontSize:26, fill:'#fff', letterSpacing:-1 }}>{score.total}</text>
              <text x="50" y="60" textAnchor="middle" dominantBaseline="middle"
                style={{ fontFamily:sf, fontSize:9, fill:'rgba(255,255,255,0.35)', letterSpacing:0.5 }}>/ 100</text>
            </svg>

            <div style={{ textAlign:'center', marginTop:8 }}>
              <p style={{ fontSize:18, fontWeight:700, color:scoreColor, letterSpacing:-0.5, marginBottom:4 }}>
                {getScoreLabel(score.total)}
              </p>
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)', letterSpacing:-0.1 }}>
                {getRankPhrase(score.total)}
              </p>
            </div>
          </div>

          {/* CATÉGORIES en grille */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:20, flex:1 }}>
            {CATEGORIES.map(cat => {
              const val = score[cat.key] as number
              return (
                <div key={cat.key} style={{ background:'rgba(255,255,255,0.04)', border:`0.5px solid rgba(255,255,255,0.07)`, borderRadius:14, padding:'10px 12px' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ fontSize:14 }}>{cat.icon}</span>
                    <span style={{ fontSize:14, fontWeight:700, color:cat.color, letterSpacing:-0.3 }}>{val}<span style={{ fontSize:9, opacity:0.5, fontWeight:400 }}>/10</span></span>
                  </div>
                  <p style={{ fontSize:10, color:'rgba(255,255,255,0.4)', marginBottom:5, letterSpacing:-0.1 }}>{cat.label}</p>
                  <div style={{ height:2.5, background:'rgba(255,255,255,0.06)', borderRadius:2, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${(val/10)*100}%`, background:cat.color, borderRadius:2 }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* FOOTER */}
          <div style={{ borderTop:'0.5px solid rgba(255,255,255,0.07)', paddingTop:14 }}>
            <p style={{ fontSize:11, color:'rgba(255,255,255,0.25)', textAlign:'center', letterSpacing:-0.1, marginBottom:4 }}>
              Calcule ton score sur
            </p>
            <p style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.5)', textAlign:'center', letterSpacing:-0.3 }}>
              glowup-mvp.vercel.app
            </p>
          </div>
        </div>
      </div>

      {/* INSTRUCTIONS */}
      <div style={{ width:'100%', maxWidth:360, marginTop:16, padding:'14px', background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.08)', borderRadius:16, textAlign:'center' }}>
        <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)', lineHeight:1.5 }}>
          📸 Fais un screenshot de ta carte et poste-la sur TikTok avec <span style={{ color:'#0A84FF' }}>#GlowApp</span>
        </p>
      </div>

      {/* BOUTONS */}
      <div style={{ width:'100%', maxWidth:360, marginTop:12, display:'flex', flexDirection:'column', gap:8 }}>
        <button onClick={handleShare} style={{ width:'100%', padding:'15px', background:'#0A84FF', border:'none', borderRadius:14, color:'#fff', fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:sf, letterSpacing:-0.3 }}>
          {copied ? '✓ Lien copié !' : '⬆ Partager mon score'}
        </button>
        <button onClick={() => router.push('/dashboard')} style={{ width:'100%', padding:'14px', background:'rgba(255,255,255,0.06)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:14, color:'rgba(255,255,255,0.6)', fontSize:15, fontWeight:500, cursor:'pointer', fontFamily:sf }}>
          Retour au dashboard
        </button>
      </div>

    </main>
  )
}
