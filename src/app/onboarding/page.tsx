'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const sf = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif`
const ACCENT = '#4A9FE5'
const RED = '#FF453A'
const TOTAL_STEPS = 6

function OptionCard({ label, icon, selected, onClick, sub }: { label: string, icon: string, selected: boolean, onClick: () => void, sub?: string }) {
  return (
    <button onClick={onClick} style={{
      width:'100%', padding:'14px 16px', background: selected ? ACCENT : 'rgba(0,0,0,0.04)',
      border:`0.5px solid ${selected ? ACCENT : 'rgba(0,0,0,0.08)'}`,
      borderRadius:12, cursor:'pointer', display:'flex', alignItems:'center', gap:12,
      transition:'all 0.15s ease', fontFamily:sf, textAlign:'left',
    }}>
      <span style={{ fontSize:20, flexShrink:0 }}>{icon}</span>
      <div style={{ flex:1 }}>
        <span style={{ fontSize:15, fontWeight:500, color: selected ? '#fff' : '#1A1A1A', letterSpacing:-0.2 }}>{label}</span>
        {sub && <p style={{ fontSize:11, color: selected ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.3)', marginTop:1 }}>{sub}</p>}
      </div>
      {selected && <span style={{ color:'#fff', fontSize:16 }}>✓</span>}
    </button>
  )
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  const [photo, setPhoto] = useState<string | null>(null)
  const [prenom, setPrenom] = useState('')
  const [age, setAge] = useState('')
  const [sleepHours, setSleepHours] = useState('')
  const [bedtime, setBedtime] = useState('')
  const [stressLevel, setStressLevel] = useState('')
  const [relaxation, setRelaxation] = useState('')
  const [exercise, setExercise] = useState('')
  const [outdoor, setOutdoor] = useState('')
  const [diet, setDiet] = useState('')
  const [water, setWater] = useState('')
  const [sugar, setSugar] = useState('')
  const [caffeine, setCaffeine] = useState('')

  const next = () => {
    if (step === TOTAL_STEPS - 1) {
      // Last step — save profile and go to paywall
      const data = { prenom, age: Number(age), sleepHours, bedtime, stressLevel, relaxation, exercise, outdoor, diet, water, sugar, caffeine }
      localStorage.setItem('glowup_profile', JSON.stringify(data))
      // Save to Supabase in background
      fetch('/api/save-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).catch(() => {})
      router.push('/paywall')
      return
    }
    setStep(s => s + 1)
  }
  const back = () => setStep(s => s - 1)

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => { setPhoto(reader.result as string); setTimeout(() => setStep(1), 400) }
    reader.readAsDataURL(file)
  }

  const Btn = ({ label, onClick, disabled }: { label: string, onClick: () => void, disabled?: boolean }) => (
    <button onClick={onClick} disabled={disabled} style={{
      width:'100%', padding:'16px', background: disabled ? 'rgba(0,0,0,0.07)' : ACCENT,
      border:'none', borderRadius:14, color: disabled ? 'rgba(0,0,0,0.3)' : '#fff',
      fontSize:16, fontWeight:600, cursor: disabled ? 'default' : 'pointer',
      fontFamily:sf, letterSpacing:-0.3, transition:'all 0.2s ease',
    }}>{label}</button>
  )

  const StepHeader = ({ num, title, sub }: { num: number, title: string, sub?: string }) => (
    <div style={{ marginBottom:20 }}>
      <div style={{ fontSize:13, color:ACCENT, fontWeight:500, marginBottom:8, letterSpacing:-0.2 }}>Step {num} / {TOTAL_STEPS}</div>
      <h1 style={{ fontSize:26, fontWeight:700, color:'#1A1A1A', letterSpacing:-0.8, lineHeight:1.15, marginBottom: sub ? 8 : 0 }}>{title}</h1>
      {sub && <p style={{ fontSize:13, color:'rgba(0,0,0,0.45)', letterSpacing:-0.2, lineHeight:1.5 }}>{sub}</p>}
    </div>
  )

  return (
    <main style={{ height:'100svh', background:'#FFFFFF', fontFamily:sf, overflow:'hidden', display:'flex', flexDirection:'column' }}>

      <nav style={{ flexShrink:0, padding:'calc(env(safe-area-inset-top) + 12px) 20px 12px', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:10, background:'#FFFFFF' }}>
        <span style={{ fontSize:20, color:'#1A1A1A' }}><span style={{fontWeight:800,letterSpacing:-0.5}}>Corti</span><span style={{fontWeight:300,fontStyle:'italic',fontFamily:'Georgia,serif',letterSpacing:-0.3}}>low</span></span>
        {step > 0 && <button onClick={back} style={{ background:'none', border:'none', color:'rgba(0,0,0,0.55)', fontSize:14, cursor:'pointer', fontFamily:sf }}>← Back</button>}
      </nav>

      <div style={{ flexShrink:0, padding:'0 20px 16px', display:'flex', gap:5 }}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i <= step ? ACCENT : 'rgba(0,0,0,0.1)', transition:'background 0.3s ease' }} />
        ))}
      </div>

      <div style={{ flex:1, padding:'0 24px', paddingBottom:'40px', overflowY:'auto', display:'flex', flexDirection:'column' }}>

        {/* STEP 0 — Selfie */}
        {step === 0 && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', paddingTop:20, gap:16 }}>
            <StepHeader num={1} title="Let's take your photo" sub="This helps you track how you look over time — it's just for your own before/after comparison." />
            <input ref={fileRef} type="file" accept="image/*" capture="user" onChange={handlePhoto} style={{ display:'none' }} />
            <input ref={galleryRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display:'none' }} />
            <div style={{
              width:'100%', height:200, background: photo ? 'transparent' : 'rgba(0,0,0,0.03)',
              border:`0.5px dashed ${photo ? ACCENT : 'rgba(0,0,0,0.12)'}`, borderRadius:20, overflow:'hidden', position:'relative',
            }}>
              {photo ? (
                <button onClick={() => fileRef.current?.click()} style={{ width:'100%', height:'100%', padding:0, border:'none', cursor:'pointer', position:'relative' }}>
                  <img src={photo} alt="selfie" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top' }} />
                  <div style={{ position:'absolute', inset:0, background:'rgba(74,159,229,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <div style={{ background:'rgba(255,255,255,0.9)', borderRadius:12, padding:'8px 16px', fontSize:13, color:'#1A1A1A', fontWeight:500 }}>✓ Photo captured</div>
                  </div>
                </button>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:10 }}>
                  <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(74,159,229,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ fontSize:24 }}>🔬</span>
                  </div>
                  <button onClick={() => fileRef.current?.click()} style={{ background:'none', border:'none', padding:0, cursor:'pointer' }}>
                    <p style={{ fontSize:15, fontWeight:600, color:'#1A1A1A', letterSpacing:-0.3 }}>Take my photo</p>
                  </button>
                  <button onClick={() => galleryRef.current?.click()} style={{ background:'none', border:'none', padding:0, cursor:'pointer' }}>
                    <p style={{ fontSize:12, color:'rgba(0,0,0,0.3)', textDecoration:'underline' }}>or import from gallery</p>
                  </button>
                </div>
              )}
            </div>
            <Btn label="Continue" onClick={() => setStep(1)} disabled={!photo} />
            <p style={{ fontSize:11, color:'rgba(0,0,0,0.2)', textAlign:'center' }}>Photo stays on your device only · Never uploaded</p>
          </div>
        )}

        {/* STEP 1 — Name + Age */}
        {step === 1 && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', paddingTop:20, gap:16 }}>
            <StepHeader num={2} title="About you" sub="Stress impacts differ by age. This helps us calibrate your score." />
            <input type="text" placeholder="Your first name" value={prenom} onChange={e => setPrenom(e.target.value)} autoFocus
              style={{ width:'100%', padding:'16px', background:'rgba(0,0,0,0.05)', border:`0.5px solid ${prenom ? ACCENT : 'rgba(0,0,0,0.1)'}`, borderRadius:14, color:'#1A1A1A', fontSize:18, fontWeight:500, fontFamily:sf, outline:'none', letterSpacing:-0.3 }} />
            <input type="number" placeholder="Age" value={age} onChange={e => setAge(e.target.value)}
              style={{ width:'100%', padding:'16px', background:'rgba(0,0,0,0.05)', border:`0.5px solid ${age ? ACCENT : 'rgba(0,0,0,0.1)'}`, borderRadius:14, color:'#1A1A1A', fontSize:18, fontWeight:500, fontFamily:sf, outline:'none', letterSpacing:-0.3 }} />
            <Btn label="Continue" onClick={next} disabled={!prenom.trim() || !age} />
          </div>
        )}

        {/* STEP 2 — Sleep */}
        {step === 2 && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', paddingTop:20, gap:10 }}>
            <StepHeader num={3} title="Your sleep" sub="Your body recovers while you sleep. Poor sleep affects your recovery." />
            <p style={{ fontSize:11, color:'rgba(0,0,0,0.4)', fontWeight:500, letterSpacing:0.5, textTransform:'uppercase', marginBottom:4 }}>Hours per night</p>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {[
                { val:'<5', label:'Less than 5 hours', icon:'😵', sub:'Recovery stays very low' },
                { val:'5-6', label:'5 to 6 hours', icon:'😴', sub:'Not quite enough for full recovery' },
                { val:'7-8', label:'7 to 8 hours', icon:'😊', sub:'Optimal recovery window' },
                { val:'8+', label:'More than 8 hours', icon:'😇', sub:'Good, if sleep quality is high' },
              ].map(o => <OptionCard key={o.val} label={o.label} icon={o.icon} sub={o.sub} selected={sleepHours === o.val} onClick={() => setSleepHours(o.val)} />)}
            </div>
            <p style={{ fontSize:11, color:'rgba(0,0,0,0.4)', fontWeight:500, letterSpacing:0.5, textTransform:'uppercase', marginTop:8, marginBottom:4 }}>Usual bedtime</p>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {[
                { val:'before10', label:'Before 10pm', icon:'🌙' },
                { val:'10-11', label:'10pm — 11pm', icon:'🕙' },
                { val:'11-12', label:'11pm — midnight', icon:'🕚' },
                { val:'after12', label:'After midnight', icon:'⚠️', sub:'High stress zone' },
              ].map(o => <OptionCard key={o.val} label={o.label} icon={o.icon} sub={o.sub} selected={bedtime === o.val} onClick={() => setBedtime(o.val)} />)}
            </div>
            <Btn label="Continue" onClick={next} disabled={!sleepHours || !bedtime} />
          </div>
        )}

        {/* STEP 3 — Stress + Relaxation */}
        {step === 3 && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', paddingTop:20, gap:10 }}>
            <StepHeader num={4} title="Stress & relaxation" sub="Chronic stress is one of the biggest factors in how you feel day to day." />
            <p style={{ fontSize:11, color:'rgba(0,0,0,0.4)', fontWeight:500, letterSpacing:0.5, textTransform:'uppercase', marginBottom:4 }}>Daily stress level</p>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {[
                { val:'low', label:'Low — I feel calm most days', icon:'😌' },
                { val:'moderate', label:'Moderate — some tension', icon:'😐' },
                { val:'high', label:'High — often anxious or overwhelmed', icon:'😰' },
                { val:'extreme', label:'Extreme — constant burnout', icon:'🔥', sub:'Stress levels are likely very high' },
              ].map(o => <OptionCard key={o.val} label={o.label} icon={o.icon} sub={o.sub} selected={stressLevel === o.val} onClick={() => setStressLevel(o.val)} />)}
            </div>
            <p style={{ fontSize:11, color:'rgba(0,0,0,0.4)', fontWeight:500, letterSpacing:0.5, textTransform:'uppercase', marginTop:8, marginBottom:4 }}>Do you practice any relaxation?</p>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {[
                { val:'none', label:'Nothing', icon:'🚫', sub:'No active stress relief' },
                { val:'sometimes', label:'Sometimes — walks, music', icon:'🎵' },
                { val:'regular', label:'Regular — meditation, yoga, journaling', icon:'🧘', sub:'Linked to lower stress levels' },
              ].map(o => <OptionCard key={o.val} label={o.label} icon={o.icon} sub={o.sub} selected={relaxation === o.val} onClick={() => setRelaxation(o.val)} />)}
            </div>
            <Btn label="Continue" onClick={next} disabled={!stressLevel || !relaxation} />
          </div>
        )}

        {/* STEP 4 — Exercise + Outdoor */}
        {step === 4 && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', paddingTop:20, gap:10 }}>
            <StepHeader num={5} title="Movement & nature" sub="Regular moderate exercise supports lower baseline stress. Nature helps even more." />
            <p style={{ fontSize:11, color:'rgba(0,0,0,0.4)', fontWeight:500, letterSpacing:0.5, textTransform:'uppercase', marginBottom:4 }}>Exercise per week</p>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {[
                { val:'0', label:'Never', icon:'🛋️', sub:'No physical outlet for stress' },
                { val:'1-2', label:'1 to 2 times', icon:'🚶' },
                { val:'3-4', label:'3 to 4 times', icon:'🏃', sub:'Great for stress regulation' },
                { val:'5+', label:'5+ times', icon:'🏋️', sub:'Great — if not overtraining' },
              ].map(o => <OptionCard key={o.val} label={o.label} icon={o.icon} sub={o.sub} selected={exercise === o.val} onClick={() => setExercise(o.val)} />)}
            </div>
            <p style={{ fontSize:11, color:'rgba(0,0,0,0.4)', fontWeight:500, letterSpacing:0.5, textTransform:'uppercase', marginTop:8, marginBottom:4 }}>Time spent outside daily</p>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {[
                { val:'<15', label:'Less than 15 minutes', icon:'🏠', sub:'Almost no nature exposure' },
                { val:'15-30', label:'15 to 30 minutes', icon:'🌤️' },
                { val:'30-60', label:'30 to 60 minutes', icon:'🌿', sub:'Linked to lower stress' },
                { val:'60+', label:'More than 1 hour', icon:'☀️' },
              ].map(o => <OptionCard key={o.val} label={o.label} icon={o.icon} sub={o.sub} selected={outdoor === o.val} onClick={() => setOutdoor(o.val)} />)}
            </div>
            <Btn label="Continue" onClick={next} disabled={!exercise || !outdoor} />
          </div>
        )}

        {/* STEP 5 — Nutrition + Water + Sugar + Caffeine (LAST STEP) */}
        {step === 5 && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', paddingTop:20, gap:10 }}>
            <StepHeader num={6} title="What you consume" sub="Sugar and caffeine can spike stress. Water and clean food help balance it." />
            <p style={{ fontSize:11, color:'rgba(0,0,0,0.4)', fontWeight:500, letterSpacing:0.5, textTransform:'uppercase', marginBottom:4 }}>Your diet</p>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {[
                { val:'poor', label:'Mostly fast food & processed', icon:'🍔', sub:'Common stress trigger' },
                { val:'average', label:'Mixed — some healthy, some not', icon:'🍕' },
                { val:'good', label:'Mostly balanced & clean', icon:'🥗' },
              ].map(o => <OptionCard key={o.val} label={o.label} icon={o.icon} sub={o.sub} selected={diet === o.val} onClick={() => setDiet(o.val)} />)}
            </div>
            <p style={{ fontSize:11, color:'rgba(0,0,0,0.4)', fontWeight:500, letterSpacing:0.5, textTransform:'uppercase', marginTop:8, marginBottom:4 }}>Water per day</p>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {[
                { val:'<4', label:'Less than 4 cups', icon:'🏜️' },
                { val:'4-6', label:'4 to 6 cups', icon:'💧' },
                { val:'6-8', label:'6 to 8 cups', icon:'💧💧' },
                { val:'8+', label:'8+ cups', icon:'🌊' },
              ].map(o => <OptionCard key={o.val} label={o.label} icon={o.icon} selected={water === o.val} onClick={() => setWater(o.val)} />)}
            </div>
            <p style={{ fontSize:11, color:'rgba(0,0,0,0.4)', fontWeight:500, letterSpacing:0.5, textTransform:'uppercase', marginTop:8, marginBottom:4 }}>Daily sugar intake</p>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {[
                { val:'high', label:'A lot — sodas, candy, pastries', icon:'🍭', sub:'Major stress trigger' },
                { val:'moderate', label:'Some — occasional treats', icon:'🍫' },
                { val:'low', label:'Very little — mostly natural', icon:'🍎' },
              ].map(o => <OptionCard key={o.val} label={o.label} icon={o.icon} sub={o.sub} selected={sugar === o.val} onClick={() => setSugar(o.val)} />)}
            </div>
            <p style={{ fontSize:11, color:'rgba(0,0,0,0.4)', fontWeight:500, letterSpacing:0.5, textTransform:'uppercase', marginTop:8, marginBottom:4 }}>Caffeine</p>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {[
                { val:'heavy', label:'3+ cups of coffee daily', icon:'☕', sub:'Can keep you wired for hours' },
                { val:'moderate', label:'1-2 cups', icon:'☕' },
                { val:'low', label:'Rarely or none', icon:'🍵' },
              ].map(o => <OptionCard key={o.val} label={o.label} icon={o.icon} sub={o.sub} selected={caffeine === o.val} onClick={() => setCaffeine(o.val)} />)}
            </div>
            <Btn label="Reveal my Recovery Score 🔬" onClick={next} disabled={!diet || !water || !sugar || !caffeine} />
          </div>
        )}

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none }
        * { box-sizing:border-box; margin:0; padding:0; }
        input::placeholder { color: rgba(0,0,0,0.2); }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </main>
  )
}
