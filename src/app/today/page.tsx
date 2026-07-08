'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const sf = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif`
const ACCENT = '#4A9FE5'
const RED = '#FF453A'

// ─── PRIORITY ACTIONS (same every day — the 3 cortisol pillars) ───
const PRIORITIES = [
  { id:'p1', text:'Sleep 7+ hours tonight', icon:'😴', why:'Cortisol resets during deep sleep — under 7h keeps it elevated all day' },
  { id:'p2', text:'No sugar or processed food', icon:'🚫', why:'Sugar spikes cortisol within minutes and keeps it high for hours' },
  { id:'p3', text:'No caffeine after 2pm', icon:'☕', why:'Late caffeine blocks your cortisol reset cycle at night' },
]

// ─── DAILY ACTIONS (rotate each day — combine cortisol factors) ───
const DAILY_SETS = [
  [
    { id:'d1a', text:'10 min morning walk in sunlight', icon:'☀️', why:'Sunlight resets your cortisol clock + vitamin D' },
    { id:'d1b', text:'5 min deep breathing before lunch', icon:'🫁', why:'Activates your parasympathetic system, drops cortisol 25%' },
    { id:'d1c', text:'Eat omega-3 today (salmon, walnuts, chia)', icon:'🐟', why:'Omega-3 directly lowers cortisol production' },
    { id:'d1d', text:'Phone on DND for 1 hour', icon:'🔇', why:'Notifications create micro-cortisol spikes all day' },
  ],
  [
    { id:'d2a', text:'30 min walk, yoga, or light exercise', icon:'🧘', why:'Moderate movement lowers baseline cortisol' },
    { id:'d2b', text:'Write 3 things you\'re grateful for', icon:'📝', why:'Gratitude journaling reduces cortisol by 23%' },
    { id:'d2c', text:'Drink 8 cups of water', icon:'💧', why:'Dehydration is a physical stressor that raises cortisol' },
    { id:'d2d', text:'Dim lights 1 hour before bed', icon:'💡', why:'Darkness triggers melatonin and drops cortisol' },
  ],
  [
    { id:'d3a', text:'15 min outside in nature', icon:'🌿', why:'Nature lowers cortisol + blood pressure simultaneously' },
    { id:'d3b', text:'Chamomile or herbal tea instead of coffee', icon:'🍵', why:'Chamomile reduces cortisol 15-20%' },
    { id:'d3c', text:'10 min stretching during a break', icon:'🤸', why:'Stretching breaks cortisol accumulation in muscles' },
    { id:'d3d', text:'No screen 30 min before bed', icon:'📵', why:'Blue light spikes cortisol right when it should drop' },
  ],
  [
    { id:'d4a', text:'Dance or do something fun for 10 min', icon:'💃', why:'Joyful movement lowers cortisol more than forced exercise' },
    { id:'d4b', text:'Eat 3 different colored vegetables', icon:'🥦', why:'Antioxidants reduce oxidative stress + cortisol' },
    { id:'d4c', text:'Call or text someone you love', icon:'💬', why:'Social connection directly lowers cortisol levels' },
    { id:'d4d', text:'In bed by 10:30pm', icon:'🛏️', why:'Cortisol recovery peaks between 10pm-2am' },
  ],
  [
    { id:'d5a', text:'Morning glass of lemon water', icon:'🍋', why:'Vitamin C helps metabolize excess cortisol' },
    { id:'d5b', text:'5 min meditation or breathing', icon:'🧘', why:'Even 5 min of meditation measurably drops cortisol' },
    { id:'d5c', text:'Walk after your biggest meal', icon:'🚶', why:'Post-meal walks reduce the cortisol spike from food' },
    { id:'d5d', text:'Dark chocolate instead of candy', icon:'🍫', why:'Dark chocolate is clinically proven to reduce cortisol' },
  ],
  [
    { id:'d6a', text:'20 min swim, bike, or hike', icon:'🚴', why:'Aerobic exercise regulates your cortisol rhythm' },
    { id:'d6b', text:'Laugh — watch something funny', icon:'😂', why:'Laughter reduces cortisol by up to 39%' },
    { id:'d6c', text:'Eat a high-protein breakfast', icon:'🍳', why:'Protein stabilizes blood sugar = stable cortisol' },
    { id:'d6d', text:'Watch sunset without phone', icon:'🌅', why:'Natural light + no screen = deep cortisol reset' },
  ],
  [
    { id:'d7a', text:'Active rest — gentle walk or yoga', icon:'🧘', why:'Rest days prevent exercise-induced cortisol spikes' },
    { id:'d7b', text:'Cook a meal from scratch', icon:'👩‍🍳', why:'Home cooking = less sodium + processed ingredients = less cortisol' },
    { id:'d7c', text:'Spend 15 min in a park or garden', icon:'🌳', why:'Green spaces lower cortisol by up to 21%' },
    { id:'d7d', text:'Read 10 pages before bed', icon:'📖', why:'Reading lowers cortisol better than scrolling' },
  ],
]

function getDayOfYear(){const n=new Date(),s=new Date(n.getFullYear(),0,0);return Math.floor((n.getTime()-s.getTime())/(1000*60*60*24))}
function getStoredScore():{score:number,lastDate:string}{const r=localStorage.getItem('glowup_live_score');if(r)return JSON.parse(r);const o=localStorage.getItem('glowup_score');if(o){const p=JSON.parse(o);return{score:p.total||50,lastDate:new Date().toDateString()}};return{score:50,lastDate:new Date().toDateString()}}
function saveScore(s:number){localStorage.setItem('glowup_live_score',JSON.stringify({score:Math.max(0,Math.min(100,s)),lastDate:new Date().toDateString()}))}

export default function TodayPage(){
  const router=useRouter()
  const[profile,setProfile]=useState<any>(null)
  const[tab,setTab]=useState<'missions'|'progress'|'photos'>('missions')
  const[dailyMissions,setDailyMissions]=useState<typeof DAILY_SETS[0]>([])
  const[checked,setChecked]=useState<Record<string,boolean>>({})
  const[liveScore,setLiveScore]=useState(50)
  const[streak,setStreak]=useState(0)
  const[scoreVar,setScoreVar]=useState(0)
  const[history,setHistory]=useState<Record<string,string>>({})
  const[photos,setPhotos]=useState<Array<{date:string,src:string}>>([])

  useEffect(()=>{
    const p=localStorage.getItem('glowup_profile');if(!p){router.push('/onboarding');return};setProfile(JSON.parse(p))
    const dayIdx=getDayOfYear()
    setDailyMissions(DAILY_SETS[dayIdx%DAILY_SETS.length])

    // Score
    const stored=getStoredScore();const today=new Date().toDateString()
    if(stored.lastDate!==today){const last=new Date(stored.lastDate),diff=Math.floor((new Date().getTime()-last.getTime())/(1000*60*60*24)),pen=Math.min(diff*2,15);const ns=Math.max(0,stored.score-pen);saveScore(ns);setLiveScore(ns)}else{setLiveScore(stored.score)}
    setStreak(Number(localStorage.getItem('glowup_streak')||'0'))
    const sc=localStorage.getItem('glowup_checked_today'),sd=localStorage.getItem('glowup_checked_date')
    if(sc&&sd===today)setChecked(JSON.parse(sc));else localStorage.removeItem('glowup_checked_today')

    // History
    const h=localStorage.getItem('glowup_history')
    if(h)setHistory(JSON.parse(h))

    // Photos
    const ph=localStorage.getItem('glowup_photos')
    if(ph)setPhotos(JSON.parse(ph))
  },[])

  const toggle=(id:string)=>{
    const nc={...checked,[id]:!checked[id]};setChecked(nc)
    localStorage.setItem('glowup_checked_today',JSON.stringify(nc));localStorage.setItem('glowup_checked_date',new Date().toDateString())
    const d=nc[id]?1:-1,ns=Math.max(0,Math.min(100,liveScore+d));setLiveScore(ns);setScoreVar(v=>v+d);saveScore(ns)

    // Save to history
    const today=new Date().toDateString()
    const totalM=PRIORITIES.length+dailyMissions.length
    const doneM=Object.values(nc).filter(Boolean).length
    const status=doneM===totalM?'done':doneM>0?'partial':'none'
    const newH={...history,[today]:status}
    setHistory(newH);localStorage.setItem('glowup_history',JSON.stringify(newH))

    if(doneM===totalM){const s=streak+1;setStreak(s);localStorage.setItem('glowup_streak',String(s))}
  }

  const handlePhoto=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0];if(!file)return
    const reader=new FileReader()
    reader.onload=()=>{
      const newPhotos=[...photos,{date:new Date().toLocaleDateString('en-US',{month:'short',day:'numeric'}),src:reader.result as string}]
      setPhotos(newPhotos);localStorage.setItem('glowup_photos',JSON.stringify(newPhotos))
    }
    reader.readAsDataURL(file)
  }

  const pDone=PRIORITIES.filter(m=>checked[m.id]).length
  const dDone=dailyMissions.filter(m=>checked[m.id]).length
  const tDone=pDone+dDone,tTotal=PRIORITIES.length+dailyMissions.length
  const allDone=tDone===tTotal&&tTotal>0

  if(!profile)return(<div style={{height:'100svh',background:'#FFFFFF',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{width:24,height:24,border:'2px solid rgba(0,0,0,0.08)',borderTopColor:ACCENT,borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>)

  const scoreColor=liveScore>=70?'#30D158':liveScore>=45?'#FF9F0A':RED
  const circ=2*Math.PI*38

  // Calendar: last 30 days
  const calendarDays:Array<{label:string,status:string}>=[]
  for(let i=29;i>=0;i--){
    const d=new Date();d.setDate(d.getDate()-i)
    const ds=d.toDateString()
    const dayLabel=d.getDate().toString()
    const status=ds===new Date().toDateString()?(allDone?'done':tDone>0?'partial':'today'):(history[ds]||'none')
    calendarDays.push({label:dayLabel,status})
  }

  return(
    <main style={{height:'100svh',background:'#FFFFFF',fontFamily:sf,overflow:'hidden',display:'flex',flexDirection:'column'}}>
      {/* NAV */}
      <nav style={{flexShrink:0,padding:'56px 20px 12px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <button onClick={()=>router.push('/dashboard')} style={{background:'none',border:'none',color:'rgba(0,0,0,0.55)',fontSize:14,cursor:'pointer',fontFamily:sf}}>← Score</button>
        <span style={{fontSize:16,fontWeight:700,color:'#1A1A1A',letterSpacing:-0.5}}>Day {streak+1} of 30</span>
        <div style={{display:'flex',alignItems:'center',gap:6,background:'rgba(74,159,229,0.12)',border:'0.5px solid rgba(74,159,229,0.25)',padding:'4px 10px',borderRadius:20}}>
          <span style={{fontSize:12}}>🔥</span><span style={{fontSize:12,fontWeight:600,color:ACCENT}}>{streak}d</span>
        </div>
      </nav>

      {/* SCORE BAR */}
      <div style={{flexShrink:0,padding:'0 20px',marginBottom:12}}>
        <div style={{display:'flex',alignItems:'center',gap:16,padding:'12px 16px',background:'rgba(0,0,0,0.03)',border:'0.5px solid rgba(0,0,0,0.07)',borderRadius:16}}>
          <svg width={70} height={70} viewBox="0 0 90 90"><circle cx="45" cy="45" r="38" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="6"/><circle cx="45" cy="45" r="38" fill="none" stroke={scoreColor} strokeWidth="6" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ-(liveScore/100)*circ} transform="rotate(-90 45 45)" style={{transition:'stroke-dashoffset 0.3s ease'}}/><text x="45" y="41" textAnchor="middle" dominantBaseline="middle" style={{fontFamily:sf,fontWeight:700,fontSize:20,fill:'#1A1A1A',letterSpacing:-1}}>{liveScore}</text><text x="45" y="55" textAnchor="middle" dominantBaseline="middle" style={{fontFamily:sf,fontSize:7,fill:'rgba(0,0,0,0.3)'}}>/ 100</text></svg>
          <div style={{flex:1}}>
            <p style={{fontSize:12,color:'rgba(0,0,0,0.45)',marginBottom:4}}>{new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</p>
            {scoreVar!==0&&<div style={{display:'inline-flex',alignItems:'center',gap:4,background:scoreVar>0?'rgba(48,209,88,0.12)':'rgba(255,69,58,0.12)',border:`0.5px solid ${scoreVar>0?'rgba(48,209,88,0.3)':'rgba(255,69,58,0.3)'}`,borderRadius:20,padding:'3px 10px',marginBottom:4}}><span style={{fontSize:12,fontWeight:700,color:scoreVar>0?'#30D158':RED}}>{scoreVar>0?'+':''}{scoreVar}</span></div>}
            <p style={{fontSize:13,color:'rgba(0,0,0,0.65)',lineHeight:1.4}}>{allDone?'All done 🎉':`${tDone}/${tTotal} — lower your cortisol`}</p>
          </div>
        </div>
      </div>

      {/* TAB BAR */}
      <div style={{flexShrink:0,padding:'0 20px',marginBottom:12,display:'flex',gap:4}}>
        {([{key:'missions',label:'Daily Plan',icon:'⚡'},{key:'progress',label:'Streak',icon:'📊'},{key:'photos',label:'Face Log',icon:'📸'}] as const).map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)} style={{
            flex:1,padding:'10px 0',background:tab===t.key?'rgba(74,159,229,0.1)':'rgba(0,0,0,0.04)',
            border:`0.5px solid ${tab===t.key?ACCENT:'rgba(0,0,0,0.07)'}`,borderRadius:12,
            cursor:'pointer',fontFamily:sf,fontSize:12,fontWeight:600,
            color:tab===t.key?ACCENT:'rgba(0,0,0,0.4)',letterSpacing:-0.2,
          }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{flex:1,overflowY:'auto',padding:'0 20px 40px'}}>

        {/* ─── MISSIONS TAB ─── */}
        {tab==='missions'&&(<>
          {/* PRIORITIES */}
          <p style={{fontSize:11,color:RED,letterSpacing:0.5,textTransform:'uppercase',marginBottom:8,fontWeight:600}}>⚠ Daily priorities — non-negotiable</p>
          <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:20}}>
            {PRIORITIES.map(m=>{const done=checked[m.id];return(
              <button key={m.id} onClick={()=>toggle(m.id)} style={{width:'100%',background:done?'rgba(48,209,88,0.08)':'rgba(255,69,58,0.04)',border:`0.5px solid ${done?'rgba(48,209,88,0.2)':'rgba(255,69,58,0.12)'}`,borderRadius:14,padding:'14px 16px',display:'flex',alignItems:'center',gap:12,cursor:'pointer',fontFamily:sf,transition:'all 0.15s',textAlign:'left'}}>
                <span style={{fontSize:20,flexShrink:0}}>{m.icon}</span>
                <div style={{flex:1}}>
                  <p style={{fontSize:14,fontWeight:600,color:done?'rgba(0,0,0,0.35)':'#1A1A1A',letterSpacing:-0.3,textDecoration:done?'line-through':'none'}}>{m.text}</p>
                  <p style={{fontSize:11,color:done?'rgba(0,0,0,0.2)':'rgba(0,0,0,0.35)',marginTop:2,fontStyle:'italic'}}>{m.why}</p>
                </div>
                <div style={{width:24,height:24,borderRadius:'50%',background:done?'#30D158':'rgba(0,0,0,0.07)',border:`0.5px solid ${done?'#30D158':'rgba(0,0,0,0.12)'}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  {done&&<span style={{fontSize:13,color:'#fff',fontWeight:700}}>✓</span>}
                </div>
              </button>
            )})}
          </div>

          {/* DAILY ACTIONS */}
          <p style={{fontSize:11,color:'rgba(0,0,0,0.3)',letterSpacing:0.5,textTransform:'uppercase',marginBottom:8,fontWeight:500}}>Today's cortisol-lowering actions</p>
          <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:16}}>
            {dailyMissions.map(m=>{const done=checked[m.id];return(
              <button key={m.id} onClick={()=>toggle(m.id)} style={{width:'100%',background:done?'rgba(48,209,88,0.08)':'rgba(0,0,0,0.04)',border:`0.5px solid ${done?'rgba(48,209,88,0.2)':'rgba(0,0,0,0.07)'}`,borderRadius:14,padding:'14px 16px',display:'flex',alignItems:'center',gap:12,cursor:'pointer',fontFamily:sf,transition:'all 0.15s',textAlign:'left'}}>
                <span style={{fontSize:20,flexShrink:0}}>{m.icon}</span>
                <div style={{flex:1}}>
                  <p style={{fontSize:14,fontWeight:600,color:done?'rgba(0,0,0,0.35)':'#1A1A1A',letterSpacing:-0.3,textDecoration:done?'line-through':'none'}}>{m.text}</p>
                  <p style={{fontSize:11,color:done?'rgba(0,0,0,0.2)':'rgba(0,0,0,0.35)',marginTop:2,fontStyle:'italic'}}>{m.why}</p>
                </div>
                <div style={{width:24,height:24,borderRadius:'50%',background:done?'#30D158':'rgba(0,0,0,0.07)',border:`0.5px solid ${done?'#30D158':'rgba(0,0,0,0.12)'}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  {done&&<span style={{fontSize:13,color:'#fff',fontWeight:700}}>✓</span>}
                </div>
              </button>
            )})}
          </div>

          {allDone&&<div style={{padding:'16px',background:'rgba(48,209,88,0.08)',border:'0.5px solid rgba(48,209,88,0.2)',borderRadius:16,textAlign:'center'}}><p style={{fontSize:24,marginBottom:8}}>😌</p><p style={{fontSize:14,fontWeight:600,color:'#30D158',letterSpacing:-0.3,marginBottom:4}}>Cortisol lowered today!</p><p style={{fontSize:13,color:'rgba(0,0,0,0.55)',lineHeight:1.5}}>Come back tomorrow. Missing a day raises cortisol by 15%.</p></div>}
        </>)}

        {/* ─── PROGRESS TAB (Calendar) ─── */}
        {tab==='progress'&&(<>
          <p style={{fontSize:15,fontWeight:700,color:'#1A1A1A',letterSpacing:-0.3,marginBottom:4}}>Your 30-day journey</p>
          <p style={{fontSize:12,color:'rgba(0,0,0,0.45)',marginBottom:16}}>Each day counts. Consistency is how you lower cortisol permanently.</p>

          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:6,marginBottom:20}}>
            {['M','T','W','T','F','S','S'].map((d,i)=>(
              <div key={i} style={{textAlign:'center',fontSize:10,color:'rgba(0,0,0,0.3)',fontWeight:500,marginBottom:2}}>{d}</div>
            ))}
            {/* Offset for first day of week */}
            {calendarDays.map((d,i)=>{
              const bg=d.status==='done'?'#30D158':d.status==='partial'?'#FF9F0A':d.status==='today'?'rgba(74,159,229,0.15)':'rgba(0,0,0,0.06)'
              const textColor=d.status==='done'||d.status==='partial'?'#fff':d.status==='today'?ACCENT:'rgba(0,0,0,0.3)'
              return(
                <div key={i} style={{aspectRatio:'1',borderRadius:8,background:bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:600,color:textColor,border:d.status==='today'?`1.5px solid ${ACCENT}`:'none'}}>
                  {d.label}
                </div>
              )
            })}
          </div>

          <div style={{display:'flex',gap:16,justifyContent:'center',marginBottom:20}}>
            <div style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:10,height:10,borderRadius:3,background:'#30D158'}}/><span style={{fontSize:11,color:'rgba(0,0,0,0.45)'}}>All done</span></div>
            <div style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:10,height:10,borderRadius:3,background:'#FF9F0A'}}/><span style={{fontSize:11,color:'rgba(0,0,0,0.45)'}}>Partial</span></div>
            <div style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:10,height:10,borderRadius:3,background:'rgba(0,0,0,0.06)'}}/><span style={{fontSize:11,color:'rgba(0,0,0,0.45)'}}>Missed</span></div>
          </div>

          <div style={{background:'rgba(0,0,0,0.03)',borderRadius:14,padding:'16px',textAlign:'center'}}>
            <p style={{fontSize:28,fontWeight:700,color:ACCENT,letterSpacing:-1}}>{streak}</p>
            <p style={{fontSize:12,color:'rgba(0,0,0,0.45)',marginTop:2}}>day streak</p>
            <p style={{fontSize:11,color:'rgba(0,0,0,0.3)',marginTop:8,lineHeight:1.5}}>Missing a day raises cortisol by 15% and costs -2 points. Keep going.</p>
          </div>
        </>)}

        {/* ─── PHOTOS TAB (Face Log) ─── */}
        {tab==='photos'&&(<>
          <p style={{fontSize:15,fontWeight:700,color:'#1A1A1A',letterSpacing:-0.3,marginBottom:4}}>Face Log</p>
          <p style={{fontSize:12,color:'rgba(0,0,0,0.45)',marginBottom:16,lineHeight:1.5}}>Take a selfie once a week to track visible changes. Lower cortisol = slimmer face, clearer skin, less puffiness.</p>

          {/* Upload button */}
          <label style={{display:'block',width:'100%',padding:'20px',background:'rgba(74,159,229,0.06)',border:`1px dashed ${ACCENT}`,borderRadius:16,textAlign:'center',cursor:'pointer',marginBottom:20}}>
            <input type="file" accept="image/*" capture="user" onChange={handlePhoto} style={{display:'none'}}/>
            <span style={{fontSize:28,display:'block',marginBottom:8}}>📸</span>
            <p style={{fontSize:14,fontWeight:600,color:ACCENT,letterSpacing:-0.3}}>Take this week's photo</p>
            <p style={{fontSize:11,color:'rgba(0,0,0,0.3)',marginTop:4}}>Same angle, same lighting for best comparison</p>
          </label>

          {/* Photo grid */}
          {photos.length>0?(
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
              {photos.map((p,i)=>(
                <div key={i} style={{position:'relative',borderRadius:12,overflow:'hidden',aspectRatio:'3/4',background:'rgba(0,0,0,0.05)'}}>
                  <img src={p.src} alt={`Week ${i+1}`} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  <div style={{position:'absolute',bottom:0,left:0,right:0,background:'rgba(0,0,0,0.5)',padding:'4px 8px'}}>
                    <p style={{fontSize:10,color:'#fff',fontWeight:600}}>Week {i+1}</p>
                    <p style={{fontSize:9,color:'rgba(255,255,255,0.7)'}}>{p.date}</p>
                  </div>
                </div>
              ))}
            </div>
          ):(
            <div style={{textAlign:'center',padding:'40px 20px',background:'rgba(0,0,0,0.03)',borderRadius:16}}>
              <p style={{fontSize:32,marginBottom:8}}>🪞</p>
              <p style={{fontSize:14,fontWeight:600,color:'#1A1A1A',marginBottom:4}}>No photos yet</p>
              <p style={{fontSize:12,color:'rgba(0,0,0,0.4)',lineHeight:1.5}}>Take your first photo now to start tracking your transformation. You'll be surprised at the difference in 3 weeks.</p>
            </div>
          )}
        </>)}

      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} ::-webkit-scrollbar{display:none} *{box-sizing:border-box;margin:0;padding:0;}`}</style>
    </main>
  )
}
