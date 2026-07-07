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
function getSegment(score:number,name:string,weakest:string){
  const pctAbove=getPercentileAbove(score)
  const weakLabels:Record<string,string>={sleep:'sleep',stress:'stress',exercise:'movement',nutrition:'diet',water:'hydration',outdoor:'nature exposure'}
  const wl=weakLabels[weakest]||'habits'
  if(score<25){return{label:'Cortisol overload 🚨',color:RED,hook:`${pctAbove}% of women your age have lower cortisol.`,hookBold:'Your body is in chronic stress mode.',message:`${name}, your ${wl} is keeping your cortisol dangerously elevated. This causes face puffiness, belly fat storage, and accelerated skin aging. Every day without a plan, the damage compounds.`}}
  if(score<45){return{label:'Danger zone 🔴',color:RED,hook:`${pctAbove}% of women your age have lower cortisol.`,hookBold:'Your cortisol is silently aging you.',message:`${name}, your ${wl} is your biggest cortisol trigger. Women in your range show visible face puffiness and stress-related breakouts within weeks. The good news: this is fixable in 30 days.`}}
  if(score<70){return{label:'Elevated ⚠️',color:'#FF9F0A',hook:`${pctAbove}% of women your age have lower cortisol.`,hookBold:'You\'re close to balanced — but not there yet.',message:`${name}, your ${wl} is the one thing keeping your cortisol elevated. Fix this and you\'ll notice your face slimming down, better sleep, and calmer energy within 2-3 weeks.`}}
  const ep=Math.max(pctAbove,15)
  return{label:'Low cortisol 😌',color:'#30D158',hook:`Only ${ep}% have lower cortisol than you.`,hookBold:'You\'re in the calm zone. Stay there.',message:score>=90?`${name}, you're in the top 15%. But 91% of women in this range slip back within 60 days without a structured routine. The question isn't how you got here — it's whether you'll still be here next month.`:`${name}, you're doing great but your ${wl} is a weak spot. One slip and cortisol rebounds fast — it takes 72 hours for cortisol to re-elevate but 3 weeks to bring it back down.`}
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
    const parsed=JSON.parse(p);setProfile(parsed)
    const result=calculateScore(parsed);setComputed(result)
    if(!localStorage.getItem('glowup_live_score')){
      localStorage.setItem('glowup_live_score',JSON.stringify({score:result.total,lastDate:new Date().toDateString()}))
      localStorage.setItem('glowup_score',JSON.stringify({total:result.total}))
    }
  },[])
  if(!profile||!computed)return(<div style={{minHeight:'100svh',background:'#FFFFFF',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{width:24,height:24,border:'2px solid rgba(0,0,0,0.08)',borderTopColor:RED,borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>)
  const seg=getSegment(computed.total,profile.prenom,computed.weakest)
  return(
    <main style={{minHeight:'100svh',background:'#FFFFFF',fontFamily:sf,display:'flex',flexDirection:'column'}}>
      <nav style={{flexShrink:0,padding:'56px 20px 12px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontSize:20,fontWeight:700,color:'#1A1A1A',letterSpacing:-0.5}}>GlowApp</span>
        <button onClick={()=>router.push('/share')} style={{background:'rgba(144,213,255,0.15)',border:'0.5px solid rgba(144,213,255,0.3)',borderRadius:20,padding:'6px 12px',color:RED,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:sf}}>⬆ Share</button>
      </nav>
      <div style={{flexShrink:0,display:'flex',flexDirection:'column',alignItems:'center',padding:'4px 20px 12px'}}>
        <p style={{fontSize:13,color:'rgba(0,0,0,0.45)',letterSpacing:-0.2,marginBottom:4}}>Hi {profile.prenom} 👋</p>
        <p style={{fontSize:11,color:'rgba(0,0,0,0.3)',letterSpacing:0.3,textTransform:'uppercase',marginBottom:4}}>Cortisol Score</p>
        <ScoreRing score={computed.total} color={seg.color}/>
        <div style={{marginTop:4,textAlign:'center',width:'100%'}}>
          <span style={{fontSize:22,fontWeight:800,color:seg.color,letterSpacing:-0.5,display:'block',marginBottom:4}}>{seg.label}</span>
          <BellCurve score={computed.total} color={seg.color}/>
          <p style={{fontSize:12,fontStyle:'italic',fontWeight:300,color:'rgba(0,0,0,0.45)',letterSpacing:-0.1,marginBottom:8}}>
            <span style={{color:RED,fontWeight:600}}>{seg.hook}</span>{' '}
            <span style={{fontWeight:700,color:'#1A1A1A'}}>{seg.hookBold}</span>
          </p>
          <p style={{fontSize:13,fontWeight:500,color:'rgba(0,0,0,0.55)',letterSpacing:-0.1,lineHeight:1.5,maxWidth:300,textAlign:'center',margin:'0 auto 12px'}}>{seg.message}</p>
          <button onClick={()=>router.push('/today')} style={{padding:'11px 24px',background:ACCENT,border:'none',borderRadius:12,color:'#FFFFFF',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:sf,letterSpacing:-0.2}}>
            Start my 30-day cortisol reset →
          </button>
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'0 20px 40px'}}>
        <p style={{fontSize:11,color:'rgba(0,0,0,0.3)',letterSpacing:0.5,textTransform:'uppercase',marginBottom:12}}>Cortisol breakdown</p>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {CATEGORIES.map(cat=>{
            const val=computed.categories[cat.key] as number;const isWeak=computed.weakest===cat.key;const pct=(val/cat.max)*100
            return(<div key={cat.key} style={{background:isWeak?'rgba(255,69,58,0.06)':'rgba(0,0,0,0.04)',border:`0.5px solid ${isWeak?'rgba(255,69,58,0.2)':'rgba(0,0,0,0.07)'}`,borderRadius:14,padding:'14px 16px'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontSize:18}}>{cat.icon}</span>
                  <div><span style={{fontSize:14,fontWeight:600,color:'#1A1A1A',letterSpacing:-0.3}}>{cat.label}</span>
                  {isWeak&&<span style={{display:'block',fontSize:10,color:RED,marginTop:1}}>⚠ Main cortisol driver</span>}</div>
                </div>
                <span style={{fontSize:18,fontWeight:700,color:cat.color,letterSpacing:-0.5}}>{val}<span style={{fontSize:11,fontWeight:400,color:'rgba(0,0,0,0.3)'}}>/{cat.max}</span></span>
              </div>
              <div style={{height:4,background:'rgba(0,0,0,0.07)',borderRadius:2,overflow:'hidden'}}><div style={{height:'100%',width:`${pct}%`,background:cat.color,borderRadius:2}}/></div>
            </div>)
          })}
        </div>
        <button onClick={()=>router.push('/today')} style={{width:'100%',padding:'14px',background:ACCENT,border:'none',borderRadius:14,color:'#FFFFFF',fontSize:15,fontWeight:600,cursor:'pointer',fontFamily:sf,letterSpacing:-0.3,marginTop:16}}>
          Start my 30-day cortisol reset →
        </button>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} ::-webkit-scrollbar{display:none} *{box-sizing:border-box;margin:0;padding:0;}`}</style>
    </main>
  )
}
