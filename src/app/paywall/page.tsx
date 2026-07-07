'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const sf = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif`
const BLUE = '#0A84FF'
const ACCENT = '#90D5FF'
const RED = '#FF453A'

function calculateScore(p: any) {
  let sleep=0,stress=0,exercise=0,nutrition=0,water=0,outdoor=0,sugar=0
  // Sleep /20
  if(p.sleepHours==='7-8') sleep=14; else if(p.sleepHours==='8+') sleep=11; else if(p.sleepHours==='5-6') sleep=5
  if(p.bedtime==='before10') sleep+=6; else if(p.bedtime==='10-11') sleep+=4; else if(p.bedtime==='11-12') sleep+=2
  // Stress /18
  if(p.stressLevel==='low') stress=12; else if(p.stressLevel==='moderate') stress=8; else if(p.stressLevel==='high') stress=3
  if(p.relaxation==='regular') stress+=6; else if(p.relaxation==='sometimes') stress+=3
  // Exercise /16
  if(p.exercise==='3-4') exercise=12; else if(p.exercise==='5+') exercise=16; else if(p.exercise==='1-2') exercise=6
  if(p.outdoor==='60+') exercise=Math.min(exercise+4,16); else if(p.outdoor==='30-60') exercise=Math.min(exercise+3,16); else if(p.outdoor==='15-30') exercise=Math.min(exercise+1,16)
  // Nutrition /16
  if(p.diet==='good') nutrition=10; else if(p.diet==='average') nutrition=5
  if(p.sugar==='low') nutrition+=6; else if(p.sugar==='moderate') nutrition+=3
  // Water /10
  if(p.water==='8+') water=10; else if(p.water==='6-8') water=7; else if(p.water==='4-6') water=4
  // Outdoor /10
  if(p.outdoor==='60+') outdoor=10; else if(p.outdoor==='30-60') outdoor=7; else if(p.outdoor==='15-30') outdoor=4; else outdoor=1
  // Caffeine penalty
  let caffeinePenalty=0
  if(p.caffeine==='heavy') caffeinePenalty=6; else if(p.caffeine==='moderate') caffeinePenalty=2

  const total = Math.max(0, sleep+stress+exercise+nutrition+water+outdoor-caffeinePenalty)
  const categories = { sleep:Math.min(sleep,20), stress:Math.min(stress,18), exercise:Math.min(exercise,16), nutrition:Math.min(nutrition,16), water, outdoor }
  const maxes:Record<string,number> = { sleep:20, stress:18, exercise:16, nutrition:16, water:10, outdoor:10 }
  let weakest='sleep', wr=1
  for(const[k,v] of Object.entries(categories)){const r=v/maxes[k]; if(r<wr){wr=r;weakest=k}}
  return { total:Math.min(total,100), categories, weakest }
}

function getPercentileAbove(s:number):number{ return Math.max(15, Math.round(100-(s*0.88+(s/100)*12))) }

const ANALYSIS_STEPS = [
  { text:'Scanning facial cortisol signs...', icon:'🔬', duration:600 },
  { text:'Measuring stress markers...', icon:'😰', duration:550 },
  { text:'Analyzing sleep impact...', icon:'🌙', duration:500 },
  { text:'Evaluating diet & hydration...', icon:'🥗', duration:550 },
  { text:'Calculating cortisol level...', icon:'⚡', duration:800 },
]

export default function PaywallPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [score, setScore] = useState(0)
  const [weakest, setWeakest] = useState('sleep')
  const [phase, setPhase] = useState<'analyzing'|'reveal'>('analyzing')
  const [analysisStep, setAnalysisStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [displayed, setDisplayed] = useState(0)
  const [showPlans, setShowPlans] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'weekly'|'monthly'|'yearly'>('weekly')

  useEffect(() => {
    const p = localStorage.getItem('glowup_profile')
    if(!p){router.push('/onboarding');return}
    const parsed = JSON.parse(p); setProfile(parsed)
    const result = calculateScore(parsed); setScore(result.total); setWeakest(result.weakest)
    localStorage.setItem('glowup_live_score', JSON.stringify({score:result.total,lastDate:new Date().toDateString()}))
    localStorage.setItem('glowup_score', JSON.stringify({total:result.total}))
    localStorage.setItem('glowup_weakest', result.weakest)

    let stepIdx=0, prog=0
    const progInterval = setInterval(()=>{prog+=1.8;setProgress(Math.min(prog,100))},100)
    const runStep=()=>{
      if(stepIdx>=ANALYSIS_STEPS.length){clearInterval(progInterval);setProgress(100);setTimeout(()=>setPhase('reveal'),500);return}
      setAnalysisStep(stepIdx)
      setTimeout(()=>{stepIdx++;runStep()},ANALYSIS_STEPS[stepIdx].duration)
    }
    runStep()
    return()=>clearInterval(progInterval)
  },[])

  useEffect(()=>{
    if(phase!=='reveal')return
    let cur=0
    const go=()=>{cur+=Math.ceil((score-cur)/8);setDisplayed(Math.min(cur,score));if(cur<score)requestAnimationFrame(go);else setTimeout(()=>setShowPlans(true),600)}
    setTimeout(()=>requestAnimationFrame(go),400)
  },[phase,score])

  if(!profile) return <div style={{height:'100svh',background:'#FFFFFF',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{width:24,height:24,border:'2px solid rgba(0,0,0,0.08)',borderTopColor:RED,borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>

  // ANALYZING PHASE
  if(phase==='analyzing'){
    const step=ANALYSIS_STEPS[analysisStep]||ANALYSIS_STEPS[0]
    return(
      <main style={{height:'100svh',background:'#FFFFFF',fontFamily:sf,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'0 32px'}}>
        <div style={{width:120,height:120,borderRadius:'50%',border:'3px solid rgba(255,69,58,0.15)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:32,animation:'pulse 2s ease-in-out infinite'}}>
          <div style={{width:90,height:90,borderRadius:'50%',border:'3px solid rgba(255,69,58,0.3)',display:'flex',alignItems:'center',justifyContent:'center',animation:'pulse 2s ease-in-out infinite 0.3s'}}>
            <span style={{fontSize:36,animation:'pulse 2s ease-in-out infinite 0.6s'}}>{step.icon}</span>
          </div>
        </div>
        <p style={{fontSize:16,fontWeight:600,color:'#1A1A1A',letterSpacing:-0.3,marginBottom:8,textAlign:'center'}}>{step.text}</p>
        <p style={{fontSize:12,color:'rgba(0,0,0,0.35)',marginBottom:24}}>Processing {profile.prenom}'s data...</p>
        <div style={{width:'100%',maxWidth:260,height:4,background:'rgba(0,0,0,0.06)',borderRadius:2,overflow:'hidden'}}>
          <div style={{height:'100%',width:`${progress}%`,background:RED,borderRadius:2,transition:'width 0.1s linear'}}/>
        </div>
        <p style={{fontSize:11,color:'rgba(0,0,0,0.25)',marginTop:8}}>{Math.round(progress)}%</p>
        <div style={{marginTop:32,display:'flex',flexDirection:'column',gap:6,width:'100%',maxWidth:260}}>
          {ANALYSIS_STEPS.slice(0,analysisStep).map((s,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:8,animation:'fadeIn 0.3s ease'}}>
              <span style={{color:'#30D158',fontSize:12}}>✓</span>
              <span style={{fontSize:12,color:'rgba(0,0,0,0.35)'}}>{s.text.replace('...','')}</span>
            </div>
          ))}
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.05);opacity:0.7}} @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}} *{box-sizing:border-box;margin:0;padding:0;}`}</style>
      </main>
    )
  }

  // REVEAL + PAYWALL
  const pctAbove = getPercentileAbove(score)
  const scoreColor = score>=70?'#30D158':score>=45?'#FF9F0A':'#FF453A'
  const scoreLabel = score>=70?'Low cortisol 😌':score>=45?'Elevated ⚠️':score>=25?'Danger zone 🔴':'Cortisol overload 🚨'
  const r=54,c=2*Math.PI*r,offset=c-(displayed/100)*c

  const w=300,h=100,bellPts:string[]=[]
  for(let i=0;i<=w;i++){const x=(i/w)*6-3;const y=Math.exp(-0.5*x*x)/Math.sqrt(2*Math.PI);bellPts.push(`${i},${h-y*h*2.2}`)}
  const markerPos=Math.min(Math.max(score,5),95),markerX=(markerPos/100)*w,mx=(markerPos/100)*6-3
  const markerY=h-(Math.exp(-0.5*mx*mx)/Math.sqrt(2*Math.PI))*h*2.2

  const weakLabels:Record<string,string>={sleep:'sleep',stress:'stress levels',exercise:'lack of movement',nutrition:'diet',water:'dehydration',outdoor:'lack of nature exposure'}
  const plans={
    weekly:{price:'$3.99',per:'/week',total:'$3.99 billed weekly',savings:''},
    monthly:{price:'$9.99',per:'/month',total:'$9.99 billed monthly',savings:'Save 38%'},
    yearly:{price:'$39.99',per:'/year',total:'$39.99 billed yearly',savings:'Save 81%'},
  }

  return(
    <main style={{minHeight:'100svh',background:'#FFFFFF',fontFamily:sf,display:'flex',flexDirection:'column',alignItems:'center',padding:'60px 24px 40px',overflow:'auto'}}>
      <p style={{fontSize:13,color:'rgba(0,0,0,0.45)',letterSpacing:-0.2,marginBottom:8,animation:'fadeIn 0.5s ease'}}>
        {profile.prenom}, your Cortisol Score is
      </p>

      <div style={{position:'relative',marginBottom:4,animation:'fadeIn 0.8s ease'}}>
        <svg width={160} height={160} viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="7"/>
          <circle cx="60" cy="60" r={r} fill="none" stroke={scoreColor} strokeWidth="7" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} transform="rotate(-90 60 60)" style={{transition:'stroke-dashoffset 0.03s'}}/>
          <text x="60" y="57" textAnchor="middle" dominantBaseline="middle" style={{fontFamily:sf,fontWeight:700,fontSize:28,fill:'#1A1A1A',letterSpacing:-1}}>{displayed}</text>
          <text x="60" y="72" textAnchor="middle" dominantBaseline="middle" style={{fontFamily:sf,fontSize:8,fill:'rgba(0,0,0,0.3)',letterSpacing:0.5}}>/ 100</text>
        </svg>
      </div>

      <span style={{fontSize:20,fontWeight:800,color:scoreColor,letterSpacing:-0.5,marginBottom:4,animation:'fadeIn 1s ease'}}>{scoreLabel}</span>

      <div style={{width:'100%',maxWidth:300,marginBottom:8,animation:'fadeIn 1.2s ease'}}>
        <svg viewBox={`0 0 ${w} ${h+30}`} style={{width:'100%',height:'auto'}}>
          <defs><linearGradient id="payGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={scoreColor} stopOpacity="0.3"/><stop offset="100%" stopColor={scoreColor} stopOpacity="0.03"/></linearGradient></defs>
          <polygon points={`0,${h} ${bellPts.join(' ')} ${w},${h}`} fill="url(#payGrad)"/>
          <polyline points={bellPts.join(' ')} fill="none" stroke={scoreColor} strokeWidth="2" strokeLinecap="round"/>
          <line x1={markerX} y1={markerY} x2={markerX} y2={h} stroke="#1A1A1A" strokeWidth="1.5" strokeDasharray="3,3"/>
          <polygon points={`${markerX-6},${h+4} ${markerX+6},${h+4} ${markerX},${h-2}`} fill="#1A1A1A"/>
          <text x={markerX} y={h+20} textAnchor="middle" style={{fontSize:10,fontWeight:600,fill:'#1A1A1A',fontFamily:sf}}>You're here</text>
        </svg>
      </div>

      <p style={{fontSize:13,color:RED,fontWeight:600,letterSpacing:-0.2,marginBottom:4}}>
        {pctAbove}% of women your age have lower cortisol than you.
      </p>
      <p style={{fontSize:12,color:'rgba(0,0,0,0.45)',marginBottom:4,textAlign:'center',lineHeight:1.5,maxWidth:280}}>
        Your main cortisol driver is <span style={{fontWeight:700,color:'#1A1A1A'}}>{weakLabels[weakest]}</span>. Left unchecked, elevated cortisol causes face puffiness, weight gain, breakouts, and premature aging.
      </p>
      <p style={{fontSize:13,color:'#1A1A1A',fontWeight:700,marginBottom:16,textAlign:'center',maxWidth:280,lineHeight:1.4}}>
        Your personalized 30-day plan can reduce your cortisol by up to 95% and visibly slim your face.
      </p>

      {/* BLURRED BREAKDOWN */}
      <div style={{width:'100%',maxWidth:340,marginBottom:16,position:'relative'}}>
        <div style={{filter:'blur(6px)',pointerEvents:'none',userSelect:'none',opacity:0.6}}>
          {[
            {icon:'😴',label:'Sleep',val:'4',max:'20',color:RED},
            {icon:'😰',label:'Stress',val:'6',max:'18',color:'#FF9F0A'},
            {icon:'🥗',label:'Nutrition',val:'7',max:'16',color:'#30D158'},
          ].map(c=>(
            <div key={c.label} style={{background:'rgba(0,0,0,0.04)',borderRadius:12,padding:'12px 14px',marginBottom:6,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}><span style={{fontSize:16}}>{c.icon}</span><span style={{fontSize:13,fontWeight:600,color:'#1A1A1A'}}>{c.label}</span></div>
              <span style={{fontSize:16,fontWeight:700,color:c.color}}>{c.val}<span style={{fontSize:10,color:'rgba(0,0,0,0.3)'}}>/{c.max}</span></span>
            </div>
          ))}
        </div>
        <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'rgba(255,255,255,0.9)',borderRadius:12,padding:'8px 16px',display:'flex',alignItems:'center',gap:6}}>
            <span style={{fontSize:14}}>🔒</span>
            <span style={{fontSize:12,fontWeight:600,color:'#1A1A1A'}}>Subscribe to reveal full report</span>
          </div>
        </div>
        <button onClick={()=>document.querySelector('#pricing')?.scrollIntoView({behavior:'smooth'})} style={{width:'100%',padding:'12px',background:ACCENT,border:'none',borderRadius:12,color:'#FFFFFF',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:sf,letterSpacing:-0.2,marginTop:8}}>
          Improve my cortisol score →
        </button>
      </div>

      {/* SOCIAL PROOF */}
      {showPlans && (
        <div id="pricing" style={{width:'100%',maxWidth:340,animation:'fadeIn 0.5s ease'}}>
          <div style={{background:'rgba(48,209,88,0.06)',border:'0.5px solid rgba(48,209,88,0.15)',borderRadius:12,padding:'12px 16px',marginBottom:16}}>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:14}}>📉</span>
                <p style={{fontSize:12,color:'rgba(0,0,0,0.55)',lineHeight:1.4}}><span style={{fontWeight:700,color:'#1A1A1A'}}>4,258 women</span> reduced their cortisol this month</p>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:14}}>✨</span>
                <p style={{fontSize:12,color:'rgba(0,0,0,0.55)',lineHeight:1.4}}>Average result: <span style={{fontWeight:700,color:'#30D158'}}>face visibly slimmer in 21 days</span></p>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:14}}>💬</span>
                <p style={{fontSize:12,color:'rgba(0,0,0,0.55)',lineHeight:1.4,fontStyle:'italic'}}>"I tried everything — diets, face yoga, lymphatic massage. Nothing worked until I understood it was my cortisol. My jawline came back in 3 weeks. I look like a different person." — <span style={{fontWeight:600}}>Jessica, 28</span></p>
              </div>
            </div>
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:16}}>
            {(['weekly','monthly','yearly'] as const).map(plan=>(
              <button key={plan} onClick={()=>setSelectedPlan(plan)} style={{
                width:'100%',padding:'14px 16px',background:selectedPlan===plan?'rgba(255,69,58,0.08)':'rgba(0,0,0,0.04)',
                border:`1.5px solid ${selectedPlan===plan?ACCENT:'rgba(0,0,0,0.08)'}`,borderRadius:14,cursor:'pointer',fontFamily:sf,
                display:'flex',alignItems:'center',justifyContent:'space-between',transition:'all 0.15s',
              }}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:20,height:20,borderRadius:'50%',border:`2px solid ${selectedPlan===plan?RED:'rgba(0,0,0,0.15)'}`,background:selectedPlan===plan?ACCENT:'transparent',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    {selectedPlan===plan&&<div style={{width:6,height:6,borderRadius:'50%',background:'#fff'}}/>}
                  </div>
                  <div style={{textAlign:'left'}}>
                    <p style={{fontSize:15,fontWeight:600,color:'#1A1A1A',letterSpacing:-0.3,textTransform:'capitalize'}}>{plan}</p>
                    <p style={{fontSize:11,color:'rgba(0,0,0,0.35)'}}>{plans[plan].total}</p>
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <p style={{fontSize:17,fontWeight:700,color:selectedPlan===plan?ACCENT:'#1A1A1A',letterSpacing:-0.5}}>{plans[plan].price}</p>
                  {plans[plan].savings&&<p style={{fontSize:10,fontWeight:600,color:'#30D158'}}>{plans[plan].savings}</p>}
                </div>
              </button>
            ))}
          </div>

          <button style={{width:'100%',padding:'16px',background:ACCENT,border:'none',borderRadius:14,color:'#FFFFFF',fontSize:16,fontWeight:600,cursor:'pointer',fontFamily:sf,letterSpacing:-0.3,marginBottom:6}}>
            Start my 30-day cortisol reset
          </button>
          <p style={{fontSize:11,color:'rgba(0,0,0,0.3)',textAlign:'center',lineHeight:1.4}}>
            then {plans[selectedPlan].price}{plans[selectedPlan].per} · Cancel anytime
          </p>
          <p style={{fontSize:10,color:'rgba(0,0,0,0.15)',textAlign:'center',marginTop:8}}>
            Recurring billing until canceled. Results vary.
          </p>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}} @keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.05);opacity:0.7}} ::-webkit-scrollbar{display:none} *{box-sizing:border-box;margin:0;padding:0;}`}</style>
    </main>
  )
}
