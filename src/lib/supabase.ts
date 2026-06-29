import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper pour sauvegarder le score quotidien
export async function saveDailyScore(userId: string, score: number, streak: number) {
  const today = new Date().toISOString().split('T')[0]
  return supabase.from('daily_checklist').upsert({
    user_id: userId,
    date: today,
    streak,
  }, { onConflict: 'user_id,date' })
}

// Helper pour sauvegarder les missions cochées
export async function saveMissions(userId: string, missions: any[], checked: Record<string, boolean>) {
  const today = new Date().toISOString().split('T')[0]
  return supabase.from('daily_checklist').upsert({
    user_id: userId,
    date: today,
    sport: checked['m1'] || false,
    eau: checked['m2'] || false,
    nutrition: checked['m3'] || false,
  }, { onConflict: 'user_id,date' })
}
