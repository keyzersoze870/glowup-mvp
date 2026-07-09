import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    // Calculate score server-side too for data integrity
    let sleep=0,stress=0,exercise=0,nutrition=0,water=0,outdoor=0
    if(data.sleepHours==='7-8') sleep=14; else if(data.sleepHours==='8+') sleep=11; else if(data.sleepHours==='5-6') sleep=5
    if(data.bedtime==='before10') sleep+=6; else if(data.bedtime==='10-11') sleep+=4; else if(data.bedtime==='11-12') sleep+=2
    if(data.stressLevel==='low') stress=12; else if(data.stressLevel==='moderate') stress=8; else if(data.stressLevel==='high') stress=3
    if(data.relaxation==='regular') stress+=6; else if(data.relaxation==='sometimes') stress+=3
    if(data.exercise==='3-4') exercise=12; else if(data.exercise==='5+') exercise=16; else if(data.exercise==='1-2') exercise=6
    if(data.outdoor==='60+') exercise=Math.min(exercise+4,16); else if(data.outdoor==='30-60') exercise=Math.min(exercise+3,16); else if(data.outdoor==='15-30') exercise=Math.min(exercise+1,16)
    if(data.diet==='good') nutrition=10; else if(data.diet==='average') nutrition=5
    if(data.sugar==='low') nutrition+=6; else if(data.sugar==='moderate') nutrition+=3
    if(data.water==='8+') water=10; else if(data.water==='6-8') water=7; else if(data.water==='4-6') water=4
    if(data.outdoor==='60+') outdoor=10; else if(data.outdoor==='30-60') outdoor=7; else if(data.outdoor==='15-30') outdoor=4; else outdoor=1
    let caffPen=0; if(data.caffeine==='heavy') caffPen=6; else if(data.caffeine==='moderate') caffPen=2
    const total=Math.max(0,Math.min(100,sleep+stress+exercise+nutrition+water+outdoor-caffPen))

    const { error } = await supabase.from('cortisol_profiles').upsert({
      name: data.prenom,
      email: data.email || null,
      age: data.age,
      sleep_hours: data.sleepHours,
      bedtime: data.bedtime,
      stress_level: data.stressLevel,
      relaxation: data.relaxation,
      exercise: data.exercise,
      outdoor: data.outdoor,
      diet: data.diet,
      water: data.water,
      sugar: data.sugar,
      caffeine: data.caffeine,
      cortisol_score: total,
      score_sleep: Math.min(sleep,20),
      score_stress: Math.min(stress,18),
      score_exercise: Math.min(exercise,16),
      score_nutrition: Math.min(nutrition,16),
      score_water: water,
      score_outdoor: outdoor,
      caffeine_penalty: caffPen,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error('Supabase save error:', error)
      // Don't block the user flow if Supabase fails
      return NextResponse.json({ success: true, saved: false, error: error.message })
    }

    return NextResponse.json({ success: true, saved: true })
  } catch (err) {
    console.error('Save profile error:', err)
    return NextResponse.json({ success: true, saved: false })
  }
}
