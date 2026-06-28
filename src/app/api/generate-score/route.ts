import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    const prompt = `Tu es un expert en transformation physique et bien-être. Analyse ce profil et génère un Glow Up Score.

PROFIL:
- Prénom: ${data.prenom}
- Âge: ${data.age} ans
- Poids: ${data.poids}kg, Taille: ${data.taille}cm (IMC: ${(data.poids / ((data.taille/100)**2)).toFixed(1)})
- Sport: ${data.sport} fois/semaine
- Eau: ${data.eau} litres/jour
- Skincare: ${data.skincare}
- Stress: ${data.stress}

Génère un JSON strict (rien d'autre, pas de markdown):
{
  "total": <score 0-100>,
  "training": <0-10>,
  "nutrition": <0-10 estimé>,
  "hydratation": <0-10>,
  "sommeil": <0-10 estimé>,
  "skincare": <0-10>,
  "steps": <0-10 stress inversé>,
  "analyse": "<2 phrases percutantes avec le prénom>",
  "message_faible": "<score < 45 — urgent et alarmant, 1 phrase percutante avec le prénom, montre que le corps envoie des signaux d'alarme ignorés>",
  "message_moyen": "<score 45-70 — frustration + FOMO, 1 phrase, insiste sur le potentiel gâché et la proximité du top 10%, jamais de compliment>",
  "message_eleve": "<score > 70 — challenge le perfectionnisme, 1 phrase, dit clairement que les vrais résultats commencent à 85+ et qu'il n'y est pas encore>",
  "point_faible": "<catégorie la plus basse parmi training/nutrition/hydratation/sommeil/skincare/steps>",
  "plan_semaine1": ["<action 1>", "<action 2>", "<action 3>"],
  "quick_wins": ["<résultat visible en 7 jours 1>", "<résultat visible en 7 jours 2>"]
}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const score = JSON.parse(clean)

    return NextResponse.json({ success: true, score })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Erreur génération score' }, { status: 500 })
  }
}
