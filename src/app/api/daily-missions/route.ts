import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { profile, score, completedYesterday } = await req.json()

    const prompt = `Tu es un coach personnel IA. Génère 3 missions pour aujourd'hui basées sur ce profil.

PROFIL:
- Prénom: ${profile.prenom}
- Score actuel: ${score.total}/100
- Point faible: ${score.point_faible}
- Sport: ${profile.sport}
- Eau: ${profile.eau}
- Skincare: ${profile.skincare}
- Stress: ${profile.stress}
- Missions complétées hier: ${completedYesterday || 0}/3

RÈGLES:
- 3 missions ULTRA concrètes et faisables aujourd'hui
- Ciblées sur les points faibles du profil
- Courtes (max 8 mots chacune)
- Variées (pas toutes sur le même aspect)
- Progressives si completedYesterday > 0

Génère un JSON strict (rien d'autre):
{
  "missions": [
    { "id": "m1", "texte": "<mission courte>", "categorie": "<training|nutrition|hydratation|sommeil|skincare|stress>", "points": <5|10|15> },
    { "id": "m2", "texte": "<mission courte>", "categorie": "<categorie>", "points": <5|10|15> },
    { "id": "m3", "texte": "<mission courte>", "categorie": "<categorie>", "points": <5|10|15> }
  ],
  "message_matin": "<1 phrase motivante courte pour démarrer la journée, sans prénom>"
}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }]
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const data = JSON.parse(clean)

    return NextResponse.json({ success: true, ...data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Erreur génération missions' }, { status: 500 })
  }
}
