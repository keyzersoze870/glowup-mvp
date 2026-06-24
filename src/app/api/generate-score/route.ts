import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    const prompt = `Tu es un expert en transformation physique et bien-être holistique. Analyse ce profil et génère un Glow Up Score initial.

PROFIL:
- Prénom: ${data.prenom}
- Objectif: ${data.objectif}
- Poids: ${data.poids}kg, Taille: ${data.taille}cm (IMC: ${(data.poids / ((data.taille/100)**2)).toFixed(1)})
- Niveau sport: ${data.niveau}
- Séances/semaine actuelles: ${data.sport_semaine}
- Heures sommeil: ${data.heures_sommeil}h
- Eau/jour: ${data.eau_litres}L
- Skincare routine: ${data.skincare ? 'oui' : 'non'}
- Pas/jour estimés: ${data.steps_quotidien}

Génère un JSON strict (rien d'autre, pas de markdown, pas de backticks) avec cette structure exacte:
{
  "total": <score 0-100 basé sur l'ensemble du profil>,
  "training": <score 0-10>,
  "nutrition": <score 0-10 estimé>,
  "hydratation": <score 0-10 basé sur ${data.eau_litres}L>,
  "sommeil": <score 0-10 basé sur ${data.heures_sommeil}h>,
  "skincare": <score 0-10>,
  "steps": <score 0-10 basé sur ${data.steps_quotidien} pas>,
  "analyse": "<2 phrases percutantes personnalisées avec le prénom, ce qui est bien + ce qui bloque>",
  "plan_semaine1": ["<action concrète 1>", "<action concrète 2>", "<action concrète 3>"],
  "quick_wins": ["<quick win visible en 7 jours 1>", "<quick win 2>"]
}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }]
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const score = JSON.parse(text)

    return NextResponse.json({ success: true, score })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Erreur génération score' }, { status: 500 })
  }
}
