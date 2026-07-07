'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const sf = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif`
const BLUE = '#0A84FF'
const ACCENT = '#90D5FF'
const RED = '#FF453A'

const FOCUS_MISSIONS:Record<string,Array<Array<{id:string,text:string,icon:string,why:string}>>>={
  sleep:[
    [{id:'s1a',text:'In bed by 10:30pm',icon:'🛏️',why:'Cortisol resets between 10pm-2am'},{id:'s1b',text:'No screen 30 min before bed',icon:'📵',why:'Blue light spikes cortisol at night'},{id:'s1c',text:'No caffeine after 2pm',icon:'☕',why:'Caffeine elevates cortisol for 6+ hours'},{id:'s1d',text:'7+ hours of sleep tonight',icon:'🌙',why:'Under 7h = cortisol stays elevated 24h'},{id:'s1e',text:'5 min breathing before bed',icon:'🫁',why:'Activates parasympathetic nervous system'}],
    [{id:'s2a',text:'Wake up at the same time',icon:'⏰',why:'Consistent wake = stable cortisol rhythm'},{id:'s2b',text:'Dim lights 1 hour before bed',icon:'💡',why:'Darkness triggers melatonin, lowers cortisol'},{id:'s2c',text:'No heavy meal after 8pm',icon:'🍽️',why:'Digestion disrupts cortisol reset during sleep'},{id:'s2d',text:'Read instead of scrolling',icon:'📖',why:'Social media spikes cortisol before sleep'},{id:'s2e',text:'Cool bedroom (under 68°F)',icon:'❄️',why:'Cool temps optimize cortisol recovery'}],
  ],
  stress:[
    [{id:'st1a',text:'5 min meditation',icon:'🧘',why:'Meditation reduces cortisol by 25%'},{id:'st1b',text:'Write 3 things you\'re grateful for',icon:'📝',why:'Gratitude journaling lowers cortisol significantly'},{id:'st1c',text:'10 min phone-free break',icon:'📵',why:'Constant notifications = constant cortisol'},{id:'st1d',text:'15 min outside in nature',icon:'🌿',why:'Nature lowers cortisol + blood pressure'},{id:'st1e',text:'Listen to calming music 10 min',icon:'🎵',why:'Slow music activates rest-and-digest mode'}],
    [{id:'st2a',text:'Journal 5 min about your day',icon:'📓',why:'Writing about stress lowers cortisol 23%'},{id:'st2b',text:'Say no to one draining thing',icon:'🙅',why:'Boundaries prevent cortisol buildup'},{id:'st2c',text:'3 deep breaths before each meal',icon:'🫁',why:'Shifts body from stress to digest mode'},{id:'st2d',text:'5 min stretching during a break',icon:'🤸',why:'Movement breaks cortisol accumulation'},{id:'st2e',text:'Do Not Disturb for 1 hour',icon:'🔇',why:'Uninterrupted time = cortisol drops fast'}],
  ],
  exercise:[
    [{id:'e1a',text:'30 min walk or light jog',icon:'🚶',why:'Moderate exercise lowers baseline cortisol'},{id:'e1b',text:'10 min yoga or stretching',icon:'🧘',why:'Yoga reduces cortisol + norepinephrine'},{id:'e1c',text:'Take stairs all day',icon:'🦵',why:'Micro-movement prevents cortisol buildup'},{id:'e1d',text:'Dance for 10 min',icon:'💃',why:'Joyful movement lowers cortisol better than forced exercise'},{id:'e1e',text:'15 min walk after dinner',icon:'🌆',why:'Post-meal walks reduce cortisol spike from food'}],
    [{id:'e2a',text:'20 min swim, bike, or hike',icon:'🚴',why:'Aerobic exercise regulates cortisol rhythm'},{id:'e2b',text:'10 min bodyweight exercises',icon:'💪',why:'Strength training normalizes cortisol response'},{id:'e2c',text:'Walk or bike instead of driving',icon:'🏃',why:'Active transport = daily cortisol regulation'},{id:'e2d',text:'Play a sport or active game',icon:'⚽',why:'Fun movement reduces cortisol more than routine exercise'},{id:'e2e',text:'Gentle evening stretch routine',icon:'🤸',why:'Evening stretching signals cortisol to wind down'}],
  ],
  nutrition:[
    [{id:'n1a',text:'No added sugar today',icon:'🚫',why:'Sugar triggers cortisol release immediately'},{id:'n1b',text:'Eat omega-3 rich food',icon:'🐟',why:'Omega-3s directly lower cortisol levels'},{id:'n1c',text:'Eat leafy greens',icon:'🥬',why:'Magnesium in greens calms the nervous system'},{id:'n1d',text:'Dark chocolate instead of candy',icon:'🍫',why:'Dark chocolate proven to reduce cortisol'},{id:'n1e',text:'No processed food today',icon:'🥗',why:'Processed food = inflammation = cortisol'}],
    [{id:'n2a',text:'Eat 3 different colored vegetables',icon:'🥦',why:'Antioxidants reduce oxidative stress + cortisol'},{id:'n2b',text:'High protein breakfast',icon:'🍳',why:'Protein stabilizes blood sugar = stable cortisol'},{id:'n2c',text:'Replace snack with nuts or fruit',icon:'🥜',why:'Healthy fats regulate cortisol production'},{id:'n2d',text:'Drink green or chamomile tea',icon:'🍵',why:'Chamomile reduces cortisol by 15-20%'},{id:'n2e',text:'Cook one meal from scratch',icon:'👩‍🍳',why:'Home cooking = less sodium = less cortisol'}],
  ],
  water:[
    [{id:'w1a',text:'Drink 8 cups of water today',icon:'💧',why:'Dehydration is a physical stressor that raises cortisol'},{id:'w1b',text:'Full glass first thing in the morning',icon:'🌅',why:'Rehydrating after sleep resets cortisol rhythm'},{id:'w1c',text:'Glass of water before each meal',icon:'🥛',why:'Hydration before meals reduces stress response to food'},{id:'w1d',text:'Replace one coffee with water',icon:'♻️',why:'Less caffeine = less cortisol elevation'},{id:'w1e',text:'Finish 1 liter before noon',icon:'⏳',why:'Early hydration prevents afternoon cortisol spike'}],
    [{id:'w2a',text:'Add lemon or cucumber to water',icon:'🍋',why:'Vitamin C in lemon helps metabolize cortisol'},{id:'w2b',text:'Herbal tea instead of coffee',icon:'🍵',why:'Herbal tea hydrates without spiking cortisol'},{id:'w2c',text:'Set water reminder every 2 hours',icon:'⏰',why:'Consistent hydration = consistent cortisol levels'},{id:'w2d',text:'No alcohol today',icon:'🚫',why:'Alcohol disrupts sleep + raises cortisol for 24h'},{id:'w2e',text:'Coconut water in the afternoon',icon:'🥥',why:'Electrolytes help regulate stress hormones'}],
  ],
  outdoor:[
    [{id:'o1a',text:'15 min walk in nature',icon:'🌿',why:'Nature reduces cortisol + blood pressure'},{id:'o1b',text:'Morning sunlight for 10 min',icon:'☀️',why:'Sunlight resets circadian cortisol rhythm'},{id:'o1c',text:'Eat lunch outside',icon:'🌤️',why:'Outdoor eating reduces meal-related cortisol'},{id:'o1d',text:'Walk barefoot on grass 5 min',icon:'🦶',why:'Grounding shown to normalize cortisol levels'},{id:'o1e',text:'Watch sunset without phone',icon:'🌅',why:'Natural light + no screen = deep cortisol reset'}],
    [{id:'o2a',text:'30 min in a park or garden',icon:'🌳',why:'Green spaces lower cortisol by up to 21%'},{id:'o2b',text:'Exercise outside instead of gym',icon:'🏃',why:'Outdoor exercise reduces cortisol more than indoor'},{id:'o2c',text:'Sit outside with a book or tea',icon:'📖',why:'Relaxing in nature doubles the cortisol benefit'},{id:'o2d',text:'Take a photo of something beautiful outside',icon:'📸',why:'Noticing beauty activates calm neural pathways'},{id:'o2e',text:'Open windows for fresh air',icon:'🪟',why:'Fresh air improves oxygen = lowers stress response'}],
  ],
}

const BONUS_SETS=[[{id:'b1a',text:'No caffeine after 2pm',icon:'☕',cat:'Cortisol',why:'Caffeine keeps cortisol high for 6+ hours'},{id:'b1b',text:'8 cups of water',icon:'💧',cat:'Hydration',why:'Dehydration is a stress trigger'},{id:'b1c',text:'10 min outside in sunlight',icon:'☀️',cat:'Nature',why:'Sunlight resets your cortisol clock'}],[{id:'b2a',text:'No sugar today',icon:'🚫',cat:'Nutrition',why:'Sugar directly spikes cortisol'},{id:'b2b',text:'5 min deep breathing',icon:'🫁',cat:'Stress',why:'Activates rest-and-digest mode'},{id:'b2c',text:'Walk after your biggest meal',icon:'🚶',cat:'Movement',why:'Post-meal walks reduce cortisol spike'}],[{id:'b3a',text:'Phone on DND for 1 hour',icon:'🔇',cat:'Stress',why:'Notifications = constant micro-cortisol spikes'},{id:'b3b',text:'Eat something with omega-3',icon:'🐟',cat:'Nutrition',why:'Omega-3s directly lower cortisol'},{id:'b3c',text:'15 min in nature',icon:'🌿',cat:'Nature',why:'Nature reduces cortisol + heart rate'}],[{id:'b4a',text:'Chamomile or herbal tea',icon:'🍵',cat:'Cortisol',why:'Chamomile reduces cortisol 15-20%'},{id:'b4b',text:'10 min gentle stretching',icon:'🤸',cat:'Movement',why:'Stretching breaks cortisol accumulation'},{id:'b4c',text:'Write 3 things you\'re grateful for',icon:'📝',cat:'Mindset',why:'Gratitude journaling lowers cortisol'}],[{id:'b5a',text:'Dark chocolate instead of candy',icon:'🍫',cat:'Nutrition',why:'Dark chocolate proven to reduce cortisol'},{id:'b5b',text:'Morning glass of water',icon:'🌅',cat:'Hydration',why:'Rehydrating resets cortisol rhythm'},{id:'b5c',text:'Laugh — watch something funny',icon:'😂',cat:'Cortisol',why:'Laughter reduces cortisol by up to 39%'}],[{id:'b6a',text:'No alcohol today',icon:'🚫',cat:'Cortisol',why:'Alcohol raises cortisol for 24 hours'},{id:'b6b',text:'Cook a meal from scratch',icon:'👩‍🍳',cat:'Nutrition',why:'Home cooking = less cortisol triggers'},{id:'b6c',text:'Read 10 pages before bed',icon:'📖',cat:'Sleep',why:'Reading lowers cortisol better than scrolling'}],[{id:'b7a',text:'Gentle yoga or tai chi',icon:'🧘',cat:'Movement',why:'Yoga lowers cortisol + norepinephrine'},{id:'b7b',text:'Eat 3 colors of vegetables',icon:'🥦',cat:'Nutrition',why:'Antioxidants reduce cortisol'},{id:'b7c',text:'Watch sunset without phone',icon:'🌅',cat:'Nature',why:'Natural light signals cortisol to wind down'}]]

function getDayOfYear(){const n=new Date(),s=new Date(n.getFullYear(),0,0);return Math.floor((n.getTime()-s.getTime())/(1000*60*60*24))}
function getStoredScore():{score:number,lastDate:string}{const r=localStorage.getItem('glowup_live_score');if(r)return JSON.parse(r);const o=localStorage.getItem('glowup_score');if(o){const p=JSON.parse(o);return{score:p.total||50,lastDate:new Date().toDateString()}};return{score:50,lastDate:new Date().toDateString()}}
function saveScore(s:number){localStorage.setItem('glowup_live_score',JSON.stringify({score:Math.max(0,Math.min(100,s)),lastDate:new Date().toDateString()}))}

export default function TodayPage(){
  const router=useRouter()
  const[profile,setProfile]=useState<any>(null)
  const[focusCat,setFocusCat]=useState('')
  const[focusMissions,setFocusMissions]=useState<Array<{id:string,text:string,icon:string,why:string}>>([])
  const[bonusMissions,setBonusMissions]=useState<Array<{id:string,text:string,icon:string,cat:string,why:string}>>([])
  const[checked,setChecked]=useState<Record<string,boolean>>({})
  const[liveScore,setLiveScore]=useState(50)
  const[streak,setStreak]=useState(0)
  const[scoreVar,setScoreVar]=useState(0)

  useEffect(()=>{
    const p=localStorage.getItem('glowup_profile');if(!p){router.push('/onboarding');return};setProfile(JSON.parse(p))
    const cats=['sleep','stress','exercise','nutrition','water','outdoor']
    const dayIdx=getDayOfYear(),todayCat=cats[dayIdx%cats.length];setFocusCat(todayCat)
    const setIdx=Math.floor(dayIdx/cats.length)%2
    setFocusMissions(FOCUS_MISSIONS[todayCat]?.[setIdx]||FOCUS_MISSIONS[todayCat]?.[0]||[])
    setBonusMissions(BONUS_SETS[dayIdx%BONUS_SETS.length])
    const stored=getStoredScore();const today=new Date().toDateString()
    if(stored.lastDate!==today){const last=new Date(stored.lastDate),diff=Math.floor((new Date().getTime()-last.getTime())/(1000*60*60*24)),pen=Math.min(diff*2,15);const ns=Math.max(0,stored.score-pen);saveScore(ns);setLiveScore(ns)}else{setLiveScore(stored.score)}
    setStreak(Number(localStorage.getItem('glowup_streak')||'0'))
    const sc=localStorage.getItem('glowup_checked_today'),sd=localStorage.getItem('glowup_checked_date')
    if(sc&&sd===today)setChecked(JSON.parse(sc));else localStorage.removeItem('glowup_checked_today')
  },[])

  const toggle=(id:string)=>{
    const nc={...checked,[id]:!checked[id]};setChecked(nc)
    localStorage.setItem('glowup_checked_today',JSON.stringify(nc));localStorage.setItem('glowup_checked_date',new Date().toDateString())
    const d=nc[id]?1:-1,ns=Math.max(0,Math.min(100,liveScore+d));setLiveScore(ns);setScoreVar(v=>v+d);saveScore(ns)
    const total=focusMissions.length+bonusMissions.length,done=Object.values(nc).filter(Boolean).length
    if(done===total){const s=streak+1;setStreak(s);localStorage.setItem('glowup_streak',String(s))}
  }

  const fDone=focusMissions.filter(m=>checked[m.id]).length,bDone=bonusMissions.filter(m=>checked[m.id]).length
  const tDone=fDone+bDone,tTotal=focusMissions.length+bonusMissions.length,allDone=tDone===tTotal&&tTotal>0
  const catLabels:Record<string,string>={sleep:'Sleep Recovery',stress:'Stress Management',exercise:'Movement & Nature',nutrition:'Cortisol-Friendly Nutrition',water:'Hydration',outdoor:'Nature Exposure'}
  const catColors:Record<string,string>={sleep:'#BF5AF2',stress:RED,exercise:'#FF9F0A',nutrition:'#30D158',water:BLUE,outdoor:'#64D2FF'}

  if(!profile)return(<div style={{height:'100svh',background:'#FFFFFF',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{width:24,height:24,border:'2px solid rgba(0,0,0,0.08)',borderTopColor:RED,borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>)

  const scoreColor=liveScore>=70?'#30D158':liveScore>=45?'#FF9F0A':RED
  const circ=2*Math.PI*38,focusColor=catColors[focusCat]||RED

  return(
    <main style={{height:'100svh',background:'#FFFFFF',fontFamily:sf,overflow:'hidden',display:'flex',flexDirection:'column'}}>
      <nav style={{flexShrink:0,padding:'56px 20px 12px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <button onClick={()=>router.push('/dashboard')} style={{background:'none',border:'none',color:'rgba(0,0,0,0.55)',fontSize:14,cursor:'pointer',fontFamily:sf}}>← Score</button>
        <span style={{fontSize:16,fontWeight:700,color:'#1A1A1A',letterSpacing:-0.5}}>Day {streak + 1} of 30</span>
        <div style={{display:'flex',alignItems:'center',gap:6,background:'rgba(144,213,255,0.15)',border:'0.5px solid rgba(144,213,255,0.3)',padding:'4px 10px',borderRadius:20}}>
          <span style={{fontSize:12}}>🔥</span><span style={{fontSize:12,fontWeight:600,color:ACCENT}}>{streak}d</span>
        </div>
      </nav>
      <div style={{flex:1,overflowY:'auto',padding:'0 20px 40px'}}>
        <div style={{display:'flex',alignItems:'center',gap:16,padding:'12px 16px',background:'rgba(0,0,0,0.03)',border:'0.5px solid rgba(0,0,0,0.07)',borderRadius:16,marginBottom:16}}>
          <svg width={90} height={90} viewBox="0 0 90 90"><circle cx="45" cy="45" r="38" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="6"/><circle cx="45" cy="45" r="38" fill="none" stroke={scoreColor} strokeWidth="6" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ-(liveScore/100)*circ} transform="rotate(-90 45 45)" style={{transition:'stroke-dashoffset 0.3s ease'}}/><text x="45" y="41" textAnchor="middle" dominantBaseline="middle" style={{fontFamily:sf,fontWeight:700,fontSize:20,fill:'#1A1A1A',letterSpacing:-1}}>{liveScore}</text><text x="45" y="55" textAnchor="middle" dominantBaseline="middle" style={{fontFamily:sf,fontSize:7,fill:'rgba(0,0,0,0.3)'}}>/ 100</text></svg>
          <div style={{flex:1}}>
            <p style={{fontSize:12,color:'rgba(0,0,0,0.45)',marginBottom:4}}>{new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</p>
            {scoreVar!==0&&<div style={{display:'inline-flex',alignItems:'center',gap:4,background:scoreVar>0?'rgba(48,209,88,0.12)':'rgba(255,69,58,0.12)',border:`0.5px solid ${scoreVar>0?'rgba(48,209,88,0.3)':'rgba(255,69,58,0.3)'}`,borderRadius:20,padding:'3px 10px',marginBottom:6}}><span style={{fontSize:12,fontWeight:700,color:scoreVar>0?'#30D158':RED}}>{scoreVar>0?'+':''}{scoreVar} pts</span></div>}
            <p style={{fontSize:13,color:'rgba(0,0,0,0.65)',lineHeight:1.4,letterSpacing:-0.2}}>{allDone?'All missions complete 🎉':`${tDone}/${tTotal} — lower your cortisol today`}</p>
          </div>
        </div>

        <div style={{padding:'12px 16px',background:`${focusColor}10`,border:`0.5px solid ${focusColor}25`,borderRadius:12,marginBottom:12}}>
          <p style={{fontSize:11,color:focusColor,fontWeight:600,letterSpacing:0.3,textTransform:'uppercase',marginBottom:4}}>Today's cortisol focus</p>
          <p style={{fontSize:14,color:'#1A1A1A',fontWeight:600,letterSpacing:-0.2}}>{catLabels[focusCat]}</p>
        </div>

        <p style={{fontSize:11,color:'rgba(0,0,0,0.3)',letterSpacing:0.5,textTransform:'uppercase',marginBottom:10}}>Focus missions · {fDone}/{focusMissions.length}</p>
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:24}}>
          {focusMissions.map(m=>{const done=checked[m.id];return(
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

        <p style={{fontSize:11,color:'rgba(0,0,0,0.3)',letterSpacing:0.5,textTransform:'uppercase',marginBottom:10}}>Daily cortisol habits · {bDone}/{bonusMissions.length}</p>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {bonusMissions.map(m=>{const done=checked[m.id];return(
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

        {allDone&&<div style={{marginTop:16,padding:'16px',background:'rgba(48,209,88,0.08)',border:'0.5px solid rgba(48,209,88,0.2)',borderRadius:16,textAlign:'center'}}><p style={{fontSize:24,marginBottom:8}}>😌</p><p style={{fontSize:14,fontWeight:600,color:'#30D158',letterSpacing:-0.3,marginBottom:4}}>Cortisol lowered today!</p><p style={{fontSize:13,color:'rgba(0,0,0,0.55)',lineHeight:1.5}}>Come back tomorrow. Missing a day raises cortisol by 15% and costs you -2 points.</p></div>}

        <div style={{marginTop:16,padding:'12px 16px',background:'rgba(0,0,0,0.03)',borderRadius:12}}>
          <p style={{fontSize:11,color:'rgba(0,0,0,0.35)',lineHeight:1.5,textAlign:'center'}}>Each mission = -1% cortisol (+1 pt) · Missing a day = +15% cortisol (-2 pts) · 3-day streak = bonus recovery</p>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} ::-webkit-scrollbar{display:none} *{box-sizing:border-box;margin:0;padding:0;}`}</style>
    </main>
  )
}
