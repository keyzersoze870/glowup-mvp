'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

const sf = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif`
const BLUE = '#0A84FF'
const TOTAL_STEPS = 6

function OptionCard({ label, icon, selected, onClick }: { label: string, icon: string, selected: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      width:'100%', padding:'14px 16px', background: selected ? 'rgba(10,132,255,0.12)' : 'rgba(255,255,255,0.05)',
      border:`0.5px solid ${selected ? BLUE : 'rgba(255,255,255,0.1)'}`,
      borderRadius:12, cursor:'pointer', display:'flex', alignItems:'center', gap:12,
      transition:'all 0.15s ease', fontFamily:sf,
    }}>
      <span style={{ fontSize:20 }}>{icon}</span>
      <span style={{ fontSize:15, fontWeight:500, color: selected ? '#fff' : 'rgba(255,255,255,0.7)', letterSpacing:-0.2 }}>{label}</span>
      {selected && <span style={{ marginLeft:'auto', color:BLUE, fontSize:16 }}>✓</span>}
    </button>
  )
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [photo, setPhoto] = useState<string | null>(null)
  const [prenom, setPrenom] = useState('')
  const [poids, setPoids] = useState('')
  const [taille, setTaille] = useState('')
  const [age, setAge] = useState('')
  const [sport, setSport] = useState('')
  const [eau, setEau] = useState('')
  const [skincare, setSkincare] = useState('')
  const [stress, setStress] = useState('')

  const imc = poids && taille ? (Number(poids) / ((Number(taille) / 100) ** 2)).toFixed(1) : null

  const next = () => setStep(s => s + 1)
  const back = () => setStep(s => s - 1)

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => { setPhoto(reader.result as string); setTimeout(() => next(), 400) }
    reader.readAsDataURL(file)
  }

  const submit = async () => {
    setLoading(true)
    try {
      const data = { prenom, poids: Number(poids), taille: Number(taille), age: Number(age), sport, eau, skincare, stress }
      const res = await fetch('/api/generate-score', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (json.success) {
        localStorage.setItem('glowup_profile', JSON.stringify(data))
        localStorage.setItem('glowup_score', JSON.stringify(json.score))
        router.push('/dashboard')
      }
    } finally { setLoading(false) }
  }

  const Btn = ({ label, onClick, disabled }: { label: string, onClick: () => void, disabled?: boolean }) => (
    <button onClick={onClick} disabled={disabled} style={{
      width:'100%', padding:'16px', background: disabled ? 'rgba(255,255,255,0.08)' : BLUE,
      border:'none', borderRadius:14, color: disabled ? 'rgba(255,255,255,0.3)' : '#fff',
      fontSize:16, fontWeight:600, cursor: disabled ? 'default' : 'pointer',
      fontFamily:sf, letterSpacing:-0.3, transition:'all 0.2s ease',
    }}>{label}</button>
  )

  const StepHeader = ({ num, title, sub }: { num: number, title: string, sub?: string }) => (
    <div style={{ marginBottom:24 }}>
      <div style={{ fontSize:13, color:BLUE, fontWeight:500, marginBottom:8, letterSpacing:-0.2 }}>Étape {num} / {TOTAL_STEPS}</div>
      <h1 style={{ fontSize:28, fontWeight:700, color:'#fff', letterSpacing:-0.8, lineHeight:1.15, marginBottom: sub ? 8 : 0 }}>{title}</h1>
      {sub && <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', letterSpacing:-0.2, lineHeight:1.5 }}>{sub}</p>}
    </div>
  )

  return (
    <main style={{ height:'100dvh', background:'#000', fontFamily:sf, overflow:'hidden', display:'flex', flexDirection:'column' }} onFocus={() => window.scrollTo(0,0)}>

      <nav style={{ flexShrink:0, padding:'12px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:10, background:'#000' }}>
        <span style={{ fontSize:20, fontWeight:700, color:'#fff', letterSpacing:-0.5 }}>GlowApp</span>
        {step > 0 && (
          <button onClick={back} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', fontSize:14, cursor:'pointer', fontFamily:sf }}>
            ← Retour
          </button>
        )}
      </nav>

      <div style={{ flexShrink:0, padding:'0 20px 16px', display:'flex', gap:5 }}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i <= step ? BLUE : 'rgba(255,255,255,0.12)', transition:'background 0.3s ease' }} />
        ))}
      </div>

      <div style={{ flex:1, padding:'0 24px', paddingBottom:'40px', overflowY:'auto', display:'flex', flexDirection:'column' }}>

        {/* STEP 0 — Selfie EN PREMIER */}
        {step === 0 && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', gap:20 }}>
            <StepHeader num={1} title="Commence par ton selfie" sub="L'IA scanne ton visage pour analyser ta peau, ton stress et ton hydratation." />

            <input ref={fileRef} type="file" accept="image/*" capture="user" onChange={handlePhoto} style={{ display:'none' }} />

            <button onClick={() => fileRef.current?.click()} style={{
              width:'100%', height:220, background: photo ? 'transparent' : 'rgba(255,255,255,0.04)',
              border:`0.5px dashed ${photo ? BLUE : 'rgba(255,255,255,0.15)'}`,
              borderRadius:20, cursor:'pointer', overflow:'hidden', padding:0, position:'relative',
            }}>
              {photo ? (
                <>
                  <img src={photo} alt="selfie" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top' }} />
                  <div style={{ position:'absolute', inset:0, background:'rgba(10,132,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <div style={{ background:'rgba(0,0,0,0.7)', borderRadius:12, padding:'8px 16px', fontSize:13, color:'#fff', fontWeight:500 }}>✓ Photo sélectionnée</div>
                  </div>
                </>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:12 }}>
                  <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(10,132,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ fontSize:28 }}>📷</span>
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <p style={{ fontSize:15, fontWeight:600, color:'#fff', letterSpacing:-0.3, marginBottom:4 }}>Prendre un selfie</p>
                    <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>ou importer depuis la galerie</p>
                  </div>
                </div>
              )}
            </button>

            {photo && (
              <button onClick={() => fileRef.current?.click()} style={{ background:'none', border:'none', color:BLUE, fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:sf }}>
                Changer la photo
              </button>
            )}

            <Btn label="Continuer" onClick={next} disabled={!photo} />
            <p style={{ fontSize:11, color:'rgba(255,255,255,0.2)', textAlign:'center' }}>Photo non stockée · Analyse locale uniquement</p>
          </div>
        )}

        {/* STEP 1 — Prénom */}
        {step === 1 && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', gap:24 }}>
            <StepHeader num={2} title="Comment tu t'appelles ?" sub="Pour personnaliser ton score." />
            <input type="text" placeholder="Ton prénom" value={prenom} onChange={e => setPrenom(e.target.value)} autoFocus
              style={{ width:'100%', padding:'16px', background:'rgba(255,255,255,0.06)', border:`0.5px solid ${prenom ? BLUE : 'rgba(255,255,255,0.12)'}`, borderRadius:14, color:'#fff', fontSize:18, fontWeight:500, fontFamily:sf, outline:'none', letterSpacing:-0.3 }}
            />
            <Btn label="Continuer" onClick={next} disabled={!prenom.trim()} />
          </div>
        )}

        {/* STEP 2 — Mensurations */}
        {step === 2 && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', gap:16 }}>
            <StepHeader num={3} title="Tes mensurations" sub="Pour calculer ton IMC." />
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[
                { label:'Âge', placeholder:'25', value:age, set:setAge, unit:'ans' },
                { label:'Poids', placeholder:'70', value:poids, set:setPoids, unit:'kg' },
                { label:'Taille', placeholder:'175', value:taille, set:setTaille, unit:'cm' },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ fontSize:11, color:'rgba(255,255,255,0.4)', fontWeight:500, letterSpacing:0.5, textTransform:'uppercase', display:'block', marginBottom:5 }}>{f.label}</label>
                  <div style={{ position:'relative' }}>
                    <input type="number" placeholder={f.placeholder} value={f.value} onChange={e => f.set(e.target.value)}
                      style={{ width:'100%', padding:'14px 44px 14px 16px', background:'rgba(255,255,255,0.06)', border:`0.5px solid ${f.value ? BLUE : 'rgba(255,255,255,0.12)'}`, borderRadius:12, color:'#fff', fontSize:16, fontWeight:500, fontFamily:sf, outline:'none', letterSpacing:-0.2 }}
                    />
                    <span style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', fontSize:13, color:'rgba(255,255,255,0.3)' }}>{f.unit}</span>
                  </div>
                </div>
              ))}
              {imc && (
                <div style={{ padding:'12px 16px', background:'rgba(10,132,255,0.1)', border:'0.5px solid rgba(10,132,255,0.2)', borderRadius:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:13, color:'rgba(255,255,255,0.5)' }}>IMC calculé</span>
                  <span style={{ fontSize:18, fontWeight:700, color:BLUE, letterSpacing:-0.5 }}>{imc}</span>
                </div>
              )}
            </div>
            <Btn label="Continuer" onClick={next} disabled={!poids || !taille || !age} />
          </div>
        )}

        {/* STEP 3 — Sport */}
        {step === 3 && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', gap:12 }}>
            <StepHeader num={4} title="Ton activité sportive" sub="Combien de fois par semaine ?" />
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[
                { val:'0', label:'Jamais', icon:'🛋️' },
                { val:'1-2', label:'1 à 2 fois', icon:'🚶' },
                { val:'3-4', label:'3 à 4 fois', icon:'🏃' },
                { val:'5+', label:'5 fois ou plus', icon:'🏋️' },
              ].map(o => <OptionCard key={o.val} label={o.label} icon={o.icon} selected={sport === o.val} onClick={() => setSport(o.val)} />)}
            </div>
            <Btn label="Continuer" onClick={next} disabled={!sport} />
          </div>
        )}

        {/* STEP 4 — Eau + Skincare */}
        {step === 4 && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', gap:16 }}>
            <StepHeader num={5} title="Eau & Skincare" />
            <div>
              <label style={{ fontSize:11, color:'rgba(255,255,255,0.4)', fontWeight:500, letterSpacing:0.5, textTransform:'uppercase', display:'block', marginBottom:8 }}>Eau par jour</label>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {[
                  { val:'<1', label:'Moins d\'1 litre', icon:'🏜️' },
                  { val:'1-1.5', label:'1 à 1,5 litre', icon:'💧' },
                  { val:'1.5-2', label:'1,5 à 2 litres', icon:'💧💧' },
                  { val:'2+', label:'Plus de 2 litres', icon:'🌊' },
                ].map(o => <OptionCard key={o.val} label={o.label} icon={o.icon} selected={eau === o.val} onClick={() => setEau(o.val)} />)}
              </div>
            </div>
            <div>
              <label style={{ fontSize:11, color:'rgba(255,255,255,0.4)', fontWeight:500, letterSpacing:0.5, textTransform:'uppercase', display:'block', marginBottom:8 }}>Routine skincare</label>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {[
                  { val:'aucune', label:'Aucune', icon:'🤷' },
                  { val:'basique', label:'Basique', icon:'🧴' },
                  { val:'complete', label:'Complète', icon:'✨' },
                ].map(o => <OptionCard key={o.val} label={o.label} icon={o.icon} selected={skincare === o.val} onClick={() => setSkincare(o.val)} />)}
              </div>
            </div>
            <Btn label="Continuer" onClick={next} disabled={!eau || !skincare} />
          </div>
        )}

        {/* STEP 5 — Stress */}
        {step === 5 && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', gap:12 }}>
            <StepHeader num={6} title="Ton niveau de stress" sub="Comment tu te sens au quotidien ?" />
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[
                { val:'faible', label:'Faible — je suis zen', icon:'😌' },
                { val:'modere', label:'Modéré — quelques tensions', icon:'😐' },
                { val:'eleve', label:'Élevé — souvent stressé(e)', icon:'😰' },
                { val:'extreme', label:'Extrême — épuisé(e)', icon:'🔥' },
              ].map(o => <OptionCard key={o.val} label={o.label} icon={o.icon} selected={stress === o.val} onClick={() => setStress(o.val)} />)}
            </div>
            <button onClick={submit} disabled={loading || !stress}
              style={{ width:'100%', padding:'16px', background:(!stress || loading) ? 'rgba(255,255,255,0.08)' : BLUE, border:'none', borderRadius:14, color:(!stress || loading) ? 'rgba(255,255,255,0.3)' : '#fff', fontSize:16, fontWeight:600, cursor:(!stress || loading) ? 'default' : 'pointer', fontFamily:sf, letterSpacing:-0.3, display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:4 }}>
              {loading
                ? <><span style={{ width:16,height:16,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block',animation:'spin 0.8s linear infinite' }} />Analyse en cours...</>
                : '⚡ Calculer mon Glow Up Score'}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none }
        * { box-sizing:border-box; margin:0; padding:0; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        ::-webkit-scrollbar { display: none; }
        html, body { height: 100%; overflow: hidden; position: fixed; width: 100%; }
      `}</style>
    </main>
  )
}
