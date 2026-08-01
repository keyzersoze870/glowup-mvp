'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const sf = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif`
const BLUE = '#0A84FF'
const ACCENT = '#4A9FE5'
const RED = '#FF453A'

function calculateScore(p:any){
  let sleep=0,stress=0,exercise=0,nutrition=0,water=0,outdoor=0
  if(p.sleepHours==='7-8') sleep=14; else if(p.sleepHours==='8+') sleep=11; else if(p.sleepHours==='5-6') sleep=5
  if(p.bedtime==='before10') sleep+=6; else if(p.bedtime==='10-11') sleep+=4; else if(p.bedtime==='11-12') sleep+=2
  if(p.stressLevel==='low') stress=12; else if(p.stressLevel==='moderate') stress=8; else if(p.stressLevel==='high') stress=3
  if(p.relaxation==='regular') stress+=6; else if(p.relaxation==='sometimes') stress+=3
  if(p.exercise==='3-4') exercise=12; else if(p.exercise==='5+') exercise=16; else if(p.exercise==='1-2') exercise=6
  if(p.outdoor==='60+') exercise=Math.min(exercise+4,16); else if(p.outdoor==='30-60') exercise=Math.min(exercise+3,16); else if(p.outdoor==='15-30') exercise=Math.min(exercise+1,16)
  if(p.diet==='good') nutrition=10; else if(p.diet==='average') nutrition=5
  if(p.sugar==='low') nutrition+=6; else if(p.sugar==='moderate') nutrition+=3
  if(p.water==='8+') water=10; else if(p.water==='6-8') water=7; else if(p.water==='4-6') water=4
  if(p.outdoor==='60+') outdoor=10; else if(p.outdoor==='30-60') outdoor=7; else if(p.outdoor==='15-30') outdoor=4; else outdoor=1
  let caffPen=0; if(p.caffeine==='heavy') caffPen=6; else if(p.caffeine==='moderate') caffPen=2
  const total=Math.max(0,Math.min(100,sleep+stress+exercise+nutrition+water+outdoor-caffPen))
  const cats={sleep:Math.min(sleep,20),stress:Math.min(stress,18),exercise:Math.min(exercise,16),nutrition:Math.min(nutrition,16),water,outdoor}
  const maxes:Record<string,number>={sleep:20,stress:18,exercise:16,nutrition:16,water:10,outdoor:10}
  let w='sleep',wr=1; for(const[k,v] of Object.entries(cats)){const r=v/maxes[k];if(r<wr){wr=r;w=k}}
  return{total,categories:cats,weakest:w}
}
function getPercentileAbove(s:number):number{return Math.max(15,Math.round(100-(s*0.88+(s/100)*12)))}
function getSegment(score:number,name:string,weakest:string,categories?:Record<string,number>){
  const pctAbove=getPercentileAbove(score)
  const maxes:Record<string,number>={sleep:20,stress:18,exercise:16,nutrition:16,water:10,outdoor:10}
  const weakLabels:Record<string,string>={sleep:'sleep',stress:'stress',exercise:'movement',nutrition:'diet',water:'hydration',outdoor:'nature exposure'}

  // Find ALL weak categories (below 40% of max)
  const weakAreas:string[]=[]
  if(categories){
    for(const[k,v]of Object.entries(categories)){
      if(v/maxes[k]<0.4) weakAreas.push(weakLabels[k]||k)
    }
  }
  if(weakAreas.length===0) weakAreas.push(weakLabels[weakest]||'habits')

  // Format weak areas as readable string
  const weakStr = weakAreas.length===1 ? weakAreas[0]
    : weakAreas.length===2 ? `${weakAreas[0]} and ${weakAreas[1]}`
    : weakAreas.slice(0,-1).join(', ')+', and '+weakAreas[weakAreas.length-1]

  if(score<25){return{label:'High tension 🚨',color:RED,hook:`Your habits suggest room to recover better.`,hookBold:'Your habits point to chronic stress mode.',message:`${name}, your ${weakStr} ${weakAreas.length>1?'are':'is'} keeping your stress levels high. Over time, unmanaged stress is commonly linked to a tired, puffy look and breakouts. Every day without a plan, small habits keep compounding.`}}
  if(score<45){return{label:'Danger zone 🔴',color:RED,hook:`Your habits suggest room to recover better.`,hookBold:'Your habits are quietly working against you.',message:`${name}, your ${weakStr} ${weakAreas.length>1?'are your biggest stress triggers':'is your biggest stress trigger'}. Many people in your range notice puffiness and stress-related breakouts within weeks. The good news: habits are reversible in 30 days.`}}
  if(score<70){return{label:'Elevated ⚠️',color:'#FF9F0A',hook:`Your habits suggest room to recover better.`,hookBold:'You\'re close to balanced — but not quite there.',message:weakAreas.length>1?`${name}, your ${weakStr} are the combination keeping your stress levels up. Work on these together and many people notice their skin clear up and energy stabilize within 2-3 weeks.`:`${name}, your ${weakStr} is the one factor keeping your stress elevated. Address it and you may notice visible changes in your energy within 2-3 weeks.`}}
  const ep=Math.max(pctAbove,15)

  // WELL RECOVERED — still push urgency, don't fully congratulate
  if(score>=90){return{label:'Well recovered 😌',color:'#30D158',hook:`${ep}% still scored lower than you.`,hookBold:'Don\'t get comfortable.',message:`${name}, your score looks good on paper. But stress levels can rise again quickly — a few nights of bad sleep and habits can slip. Staying consistent is what matters. The real challenge isn't getting here. It's staying.`}}

  return{label:'Well recovered 😌',color:'#30D158',hook:`${ep}% still scored lower than you.`,hookBold:'You\'re not out of the woods yet.',message:weakAreas.length>1?`${name}, your score is decent but your ${weakStr} are silent risks. Stress doesn't always warn you before it builds up — one stressful week and old habits can creep back in. Without a daily plan, this score won't last.`:`${name}, your score is decent but your ${weakStr} is a vulnerability. It only takes one bad week for old habits to undo months of progress. A structured plan is the only way to lock this in.`}
}

// ─── DETAILED PERSONALIZED MESSAGE (post-payment) ───
function getDetailedMessage(profile: any, score: number, weakest: string, categories: Record<string,number>) {
  const name = profile.prenom
  const maxes:Record<string,number> = {sleep:20,stress:18,exercise:16,nutrition:16,water:10,outdoor:10}
  
  // Find all problem areas (below 50% of max)
  const problems: string[] = []
  const okAreas: string[] = []
  for (const [k,v] of Object.entries(categories)) {
    if (v / maxes[k] < 0.5) problems.push(k)
    else okAreas.push(k)
  }

  // Build specific observations based on quiz answers
  const observations: string[] = []
  const actions: string[] = []

  // Sleep
  if (profile.sleepHours === '<5' || profile.sleepHours === '5-6') {
    observations.push(`You're sleeping ${profile.sleepHours === '<5' ? 'less than 5' : '5-6'} hours per night. Your body typically needs 7-8 hours to fully recover — right now, you may be waking up already feeling stressed.`)
    actions.push('Gradually move your bedtime 15 minutes earlier every 3 days until you reach 7+ hours')
  }
  if (profile.bedtime === 'after12' || profile.bedtime === '11-12') {
    observations.push(`Going to bed ${profile.bedtime === 'after12' ? 'after midnight' : 'between 11pm and midnight'} means you may be missing your body's prime recovery window (10pm–2am), when it typically does its deepest rest.`)
    actions.push('Set a phone alarm at 10pm as a "wind down" signal — no screens after that')
  }

  // Stress
  if (profile.stressLevel === 'extreme' || profile.stressLevel === 'high') {
    observations.push(`Your stress level is ${profile.stressLevel}. This kind of ongoing stress is commonly linked to a tired, puffy look and breakouts for many people.`)
    actions.push('Start with just 5 minutes of breathing exercises daily — many people find this genuinely helps them feel calmer')
  }
  if (profile.relaxation === 'none') {
    observations.push(`You currently have no relaxation practice. Without an active way to unwind, it's easy to stay in a wired, on-edge state all day.`)
    actions.push('Pick one: 5-min meditation, gratitude journaling, or a 10-min walk in nature — do it at the same time every day')
  }

  // Caffeine
  if (profile.caffeine === 'heavy') {
    observations.push(`3+ cups of coffee daily can keep you feeling wired for most of the day, especially later in the afternoon.`)
    actions.push('Reduce to 1-2 cups max, only before noon. Replace afternoon coffee with herbal tea or water')
  }

  // Sugar
  if (profile.sugar === 'high') {
    observations.push(`High sugar intake often creates an energy rollercoaster: every spike is followed by a crash, which can repeat multiple times a day and leave you feeling drained.`)
    actions.push('Replace sugary snacks with nuts, dark chocolate (70%+), or fruit. Cut sodas completely')
  }

  // Diet
  if (profile.diet === 'poor') {
    observations.push(`A diet heavy in processed food and fast food is one of the most common factors linked to low energy and skin concerns.`)
    actions.push('Cook at least one meal from scratch per day. Focus on protein + vegetables + healthy fats')
  }

  // Water
  if (profile.water === '<4') {
    observations.push(`Drinking less than 4 cups of water daily can leave your body mildly dehydrated, which is often linked to feeling more tired and stressed.`)
    actions.push('Keep a water bottle visible at all times. Drink a full glass first thing in the morning and before each meal')
  }

  // Exercise
  if (profile.exercise === '0') {
    observations.push(`Without regular physical activity, your body has less of a natural outlet to release built-up tension.`)
    actions.push('Start with a 15-minute walk daily — many people notice a real difference in how they feel')
  }

  // Outdoor
  if (profile.outdoor === '<15') {
    observations.push(`Less than 15 minutes outdoors means almost zero nature exposure. Time in natural environments is widely associated with feeling calmer — and it's free.`)
    actions.push('Eat one meal outside, or take a 10-minute walk in a park or green space daily')
  }

  // If somehow no observations (very healthy person)
  if (observations.length === 0) {
    observations.push(`Your habits are already solid — but staying well recovered takes consistency. Even small disruptions (a stressful week, a few bad nights of sleep) can set you back. Your plan focuses on locking in your current habits and building resilience.`)
  }
  if (actions.length === 0) {
    actions.push('Maintain your current routine and track your consistency — the calendar feature helps you stay accountable')
  }

  // Build the plan overview
  const planWeeks: string[] = []
  if (problems.includes('sleep')) planWeeks.push('Sleep optimization — build a real recovery routine')
  if (problems.includes('stress')) planWeeks.push('Stress management — build your daily "off switch"')
  if (problems.includes('nutrition') || profile.sugar === 'high' || profile.caffeine === 'heavy') planWeeks.push('Nutrition reset — cut common energy-draining triggers')
  if (problems.includes('exercise') || problems.includes('outdoor')) planWeeks.push('Movement & nature — build your natural recovery habits')
  if (problems.includes('water')) planWeeks.push('Hydration protocol — remove dehydration as a stress trigger')
  if (planWeeks.length === 0) planWeeks.push('Consistency & maintenance — protect your recovery status')

  return { observations, actions, planWeeks }
}

const CATEGORIES=[
  {key:'sleep',label:'Sleep',icon:'😴',color:'#BF5AF2',max:20},
  {key:'stress',label:'Stress',icon:'😰',color:RED,max:18},
  {key:'exercise',label:'Movement',icon:'🏃',color:'#FF9F0A',max:16},
  {key:'nutrition',label:'Nutrition',icon:'🥗',color:'#30D158',max:16},
  {key:'water',label:'Hydration',icon:'💧',color:BLUE,max:10},
  {key:'outdoor',label:'Nature',icon:'🌿',color:'#64D2FF',max:10},
]

function BellCurve({score,color}:{score:number,color:string}){
  const pos=Math.min(Math.max(score,5),95),w=300,h=100,pts:string[]=[]
  for(let i=0;i<=w;i++){const x=(i/w)*6-3;const y=Math.exp(-0.5*x*x)/Math.sqrt(2*Math.PI);pts.push(`${i},${h-y*h*2.2}`)}
  const mX=(pos/100)*w,mx=(pos/100)*6-3,mY=h-(Math.exp(-0.5*mx*mx)/Math.sqrt(2*Math.PI))*h*2.2
  return(<div style={{width:'100%',maxWidth:300,margin:'12px auto 8px'}}><svg viewBox={`0 0 ${w} ${h+30}`} style={{width:'100%',height:'auto'}}><defs><linearGradient id="bG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.3"/><stop offset="100%" stopColor={color} stopOpacity="0.03"/></linearGradient></defs><polygon points={`0,${h} ${pts.join(' ')} ${w},${h}`} fill="url(#bG)"/><polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/><line x1={mX} y1={mY} x2={mX} y2={h} stroke="#1A1A1A" strokeWidth="1.5" strokeDasharray="3,3"/><polygon points={`${mX-6},${h+4} ${mX+6},${h+4} ${mX},${h-2}`} fill="#1A1A1A"/><text x={mX} y={h+20} textAnchor="middle" style={{fontSize:10,fontWeight:600,fill:'#1A1A1A',fontFamily:sf}}>You're here</text></svg></div>)
}

function ScoreRing({score,color,size=160}:{score:number,color:string,size?:number}){
  const[d,setD]=useState(0);const r=54,c=2*Math.PI*r,o=c-(d/100)*c
  useEffect(()=>{let f:number,cur=0;const go=()=>{cur+=Math.ceil((score-cur)/8);setD(Math.min(cur,score));if(cur<score)f=requestAnimationFrame(go)};const t=setTimeout(()=>{f=requestAnimationFrame(go)},300);return()=>{clearTimeout(t);cancelAnimationFrame(f)}},[score])
  return(<svg width={size} height={size} viewBox="0 0 120 120"><circle cx="60" cy="60" r={r} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="7"/><circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={o} transform="rotate(-90 60 60)" style={{transition:'stroke-dashoffset 0.03s'}}/><text x="60" y="57" textAnchor="middle" dominantBaseline="middle" style={{fontFamily:sf,fontWeight:700,fontSize:28,fill:'#1A1A1A',letterSpacing:-1}}>{d}</text><text x="60" y="72" textAnchor="middle" dominantBaseline="middle" style={{fontFamily:sf,fontSize:8,fill:'rgba(0,0,0,0.3)',letterSpacing:0.5}}>/ 100</text></svg>)
}

export default function Dashboard(){
  const router=useRouter()
  const[profile,setProfile]=useState<any>(null)
  const[computed,setComputed]=useState<any>(null)
  useEffect(()=>{
    const p=localStorage.getItem('glowup_profile')
    if(!p){router.push('/onboarding');return}
    if(localStorage.getItem('cortilow_premium')!=='true'){router.push('/paywall');return}
    const parsed=JSON.parse(p);setProfile(parsed)
    const result=calculateScore(parsed);setComputed(result)
    if(!localStorage.getItem('glowup_live_score')){
      localStorage.setItem('glowup_live_score',JSON.stringify({score:result.total,lastDate:new Date().toDateString()}))
      localStorage.setItem('glowup_score',JSON.stringify({total:result.total}))
    }
  },[])
  if(!profile||!computed)return(<div style={{minHeight:'100svh',background:'#FFFFFF',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{width:24,height:24,border:'2px solid rgba(0,0,0,0.08)',borderTopColor:RED,borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>)
  const seg=getSegment(computed.total,profile.prenom,computed.weakest,computed.categories)
  const detailed=getDetailedMessage(profile,computed.total,computed.weakest,computed.categories)
  return(
    <main style={{minHeight:'100svh',background:'#FFFFFF',fontFamily:sf,display:'flex',flexDirection:'column'}}>
      <nav style={{flexShrink:0,padding:'calc(env(safe-area-inset-top) + 12px) 20px 12px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontSize:20,color:'#1A1A1A'}}><span style={{fontWeight:800,letterSpacing:-0.5}}>Corti</span><span style={{fontWeight:300,fontStyle:'italic',fontFamily:'Georgia,serif',letterSpacing:-0.3}}>low</span></span>
        <button onClick={()=>router.push('/share')} style={{background:'rgba(144,213,255,0.15)',border:'0.5px solid rgba(144,213,255,0.3)',borderRadius:20,padding:'6px 12px',color:RED,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:sf}}>⬆ Share</button>
      </nav>
      <div style={{flexShrink:0,display:'flex',flexDirection:'column',alignItems:'center',padding:'4px 20px 12px'}}>
        <p style={{fontSize:13,color:'rgba(0,0,0,0.45)',letterSpacing:-0.2,marginBottom:4}}>Hi {profile.prenom} 👋</p>
        <p style={{fontSize:11,color:'rgba(0,0,0,0.3)',letterSpacing:0.3,textTransform:'uppercase',marginBottom:4}}>Recovery Score</p>
        <ScoreRing score={computed.total} color={seg.color}/>
        <div style={{marginTop:4,textAlign:'center',width:'100%'}}>
          <span style={{fontSize:22,fontWeight:800,color:seg.color,letterSpacing:-0.5,display:'block',marginBottom:4}}>{seg.label}</span>
          <BellCurve score={computed.total} color={seg.color}/>
          <p style={{fontSize:12,fontStyle:'italic',fontWeight:300,color:'rgba(0,0,0,0.45)',letterSpacing:-0.1,marginBottom:8}}>
            <span style={{color:RED,fontWeight:600}}>{seg.hook}</span>{' '}
            <span style={{fontWeight:700,color:'#1A1A1A'}}>{seg.hookBold}</span>
          </p>
          <p style={{fontSize:13,fontWeight:500,color:'rgba(0,0,0,0.55)',letterSpacing:-0.1,lineHeight:1.5,maxWidth:300,textAlign:'center',margin:'0 auto 16px'}}>{seg.message}</p>
        </div>
      </div>

      {/* DETAILED ANALYSIS */}
      <div style={{flex:1,overflowY:'auto',padding:'0 20px 40px'}}>

        {/* WHAT WE FOUND */}
        <p style={{fontSize:11,color:RED,letterSpacing:0.5,textTransform:'uppercase',marginBottom:10,fontWeight:600}}>⚠ What we found</p>
        <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:24}}>
          {detailed.observations.map((obs,i)=>(
            <div key={i} style={{background:'rgba(0,0,0,0.03)',border:'0.5px solid rgba(0,0,0,0.07)',borderRadius:14,padding:'14px 16px'}}>
              <p style={{fontSize:13,color:'#1A1A1A',lineHeight:1.6,letterSpacing:-0.2}}>{obs}</p>
            </div>
          ))}
        </div>

        {/* YOUR ACTION PLAN */}
        <p style={{fontSize:11,color:ACCENT,letterSpacing:0.5,textTransform:'uppercase',marginBottom:10,fontWeight:600}}>✓ Your action plan</p>
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:24}}>
          {detailed.actions.map((act,i)=>(
            <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start',background:'rgba(74,159,229,0.06)',border:'0.5px solid rgba(74,159,229,0.15)',borderRadius:12,padding:'12px 14px'}}>
              <span style={{color:ACCENT,fontSize:14,fontWeight:700,flexShrink:0,marginTop:1}}>{i+1}</span>
              <p style={{fontSize:13,color:'#1A1A1A',lineHeight:1.5,letterSpacing:-0.2}}>{act}</p>
            </div>
          ))}
        </div>

        {/* 30-DAY PLAN OVERVIEW */}
        <p style={{fontSize:11,color:'rgba(0,0,0,0.3)',letterSpacing:0.5,textTransform:'uppercase',marginBottom:10,fontWeight:500}}>Your 30-day focus areas</p>
        <div style={{background:'rgba(0,0,0,0.03)',borderRadius:14,padding:'14px 16px',marginBottom:20}}>
          {detailed.planWeeks.map((week,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:10,marginBottom:i<detailed.planWeeks.length-1?10:0}}>
              <div style={{width:24,height:24,borderRadius:'50%',background:ACCENT,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <span style={{fontSize:11,color:'#fff',fontWeight:700}}>{i+1}</span>
              </div>
              <p style={{fontSize:12,color:'#1A1A1A',letterSpacing:-0.2}}>{week}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button onClick={()=>router.push('/today')} style={{width:'100%',padding:'14px',background:ACCENT,border:'none',borderRadius:14,color:'#FFFFFF',fontSize:15,fontWeight:600,cursor:'pointer',fontFamily:sf,letterSpacing:-0.3,marginBottom:20}}>
          Start Day 1 →
        </button>

        {/* SCORE BREAKDOWN */}
        <p style={{fontSize:11,color:'rgba(0,0,0,0.3)',letterSpacing:0.5,textTransform:'uppercase',marginBottom:12}}>Recovery breakdown</p>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {CATEGORIES.map(cat=>{
            const val=computed.categories[cat.key] as number;const isWeak=computed.weakest===cat.key;const pct=(val/cat.max)*100
            return(<div key={cat.key} style={{background:isWeak?'rgba(255,69,58,0.06)':'rgba(0,0,0,0.04)',border:`0.5px solid ${isWeak?'rgba(255,69,58,0.2)':'rgba(0,0,0,0.07)'}`,borderRadius:14,padding:'14px 16px'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontSize:18}}>{cat.icon}</span>
                  <div><span style={{fontSize:14,fontWeight:600,color:'#1A1A1A',letterSpacing:-0.3}}>{cat.label}</span>
                  {isWeak&&<span style={{display:'block',fontSize:10,color:RED,marginTop:1}}>⚠ Main stress driver</span>}</div>
                </div>
                <span style={{fontSize:18,fontWeight:700,color:cat.color,letterSpacing:-0.5}}>{val}<span style={{fontSize:11,fontWeight:400,color:'rgba(0,0,0,0.3)'}}>/{cat.max}</span></span>
              </div>
              <div style={{height:4,background:'rgba(0,0,0,0.07)',borderRadius:2,overflow:'hidden'}}><div style={{height:'100%',width:`${pct}%`,background:cat.color,borderRadius:2}}/></div>
            </div>)
          })}
        </div>
        <button onClick={()=>router.push('/today')} style={{width:'100%',padding:'14px',background:ACCENT,border:'none',borderRadius:14,color:'#FFFFFF',fontSize:15,fontWeight:600,cursor:'pointer',fontFamily:sf,letterSpacing:-0.3,marginTop:16}}>
          Start Day 1 →
        </button>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} ::-webkit-scrollbar{display:none} *{box-sizing:border-box;margin:0;padding:0;}`}</style>
    </main>
  )
}
