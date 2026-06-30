import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

const PLANCHER_RATIO = 0.2 // le score ne descend jamais sous 20% du score initial

// GET: charge l'état du jour (score de départ, missions du jour, historique)
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')
    const initialScore = Number(req.nextUrl.searchParams.get('initialScore') || 50)
    if (!userId) return NextResponse.json({ success: false, error: 'userId manquant' }, { status: 400 })

    const supabase = getSupabase()
    const today = new Date().toISOString().split('T')[0]

    // Récupère les 30 derniers jours pour cet user, triés par date desc
    const { data: history } = await supabase
      .from('daily_checklist')
      .select('date, score_du_jour, missions, streak')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(30)

    const todayEntry = history?.find(h => h.date === today)
    const lastEntry = history?.find(h => h.date !== today) // dernier jour différent d'aujourd'hui

    const plancher = Math.round(initialScore * PLANCHER_RATIO)

    if (todayEntry?.score_du_jour) {
      // Aujourd'hui déjà initialisé — renvoyer l'état existant
      return NextResponse.json({
        success: true,
        scoreDepart: todayEntry.score_du_jour,
        missions: todayEntry.missions || [],
        streak: todayEntry.streak || 0,
        history: history || [],
        isNewDay: false,
      })
    }

    // Nouveau jour — calculer le score de départ depuis le dernier jour connu
    let scoreDepart = initialScore
    let streak = 0

    if (lastEntry?.score_du_jour) {
      const lastDate = new Date(lastEntry.date)
      const todayDate = new Date(today)
      const daysAbsent = Math.round((todayDate.getTime() - lastDate.getTime()) / 86400000) - 1

      // Pénalité de stagnation: -1 à -2 pts par jour d'absence, avec plancher
      const penalty = Math.min(daysAbsent * 2, lastEntry.score_du_jour - plancher)
      scoreDepart = Math.max(plancher, lastEntry.score_du_jour - Math.max(0, penalty))
      streak = daysAbsent > 0 ? 0 : (lastEntry.streak || 0) // streak cassé si absence
    }

    return NextResponse.json({
      success: true,
      scoreDepart,
      missions: [],
      streak,
      history: history || [],
      isNewDay: true,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Erreur chargement score' }, { status: 500 })
  }
}

// POST: sauvegarde l'état du jour (score courant, missions cochées, streak)
export async function POST(req: NextRequest) {
  try {
    const { userId, scoreDuJour, missions, streak, messageIA } = await req.json()
    if (!userId) return NextResponse.json({ success: false, error: 'userId manquant' }, { status: 400 })

    const supabase = getSupabase()
    const today = new Date().toISOString().split('T')[0]

    await supabase.from('daily_checklist').upsert({
      user_id: userId,
      date: today,
      score_du_jour: scoreDuJour,
      missions,
      streak,
      message_ia: messageIA || null,
    }, { onConflict: 'user_id,date' })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Erreur sauvegarde score' }, { status: 500 })
  }
}
