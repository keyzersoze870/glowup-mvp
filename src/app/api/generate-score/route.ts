import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const imc = data.poids && data.taille ? (data.poids / ((data.taille/100)**2)).toFixed(1) : '?'

    const OBJECTIF_LABELS: Record<string, string> = {
      perte_poids: 'Perdre du poids',
      muscle: 'Prendre du muscle',
      energie: "Avoir plus d'énergie au quotidien",
      peau: 'Améliorer sa peau',
      sommeil: 'Mieux dormir',
      stress: 'Réduire son stress',
    }
    const objectifsTexte = (data.objectifs || []).map((o: string) => OBJECTIF_LABELS[o] || o).join(', ') || 'non précisé'

    const prompt = `Tu es un expert en transformation physique. Génère un Glow Up Score basé sur ce profil.

PROFIL:
- Prénom: ${data.prenom}
- Objectifs prioritaires: ${objectifsTexte}
- Âge: ${data.age} ans
- IMC: ${imc} (poids ${data.poids}kg, taille ${data.taille}cm)
- Sport: ${data.sport} fois/semaine
- Eau: ${data.eau} litres/jour
- Skincare: ${data.skincare}
- Stress: ${data.stress}

IMPORTANT: tout le texte généré (analyse, messages, plan, quick wins) doit être orienté en priorité autour des objectifs prioritaires listés ci-dessus. Si la personne veut "perdre du poids", parle de poids/nutrition/sport. Si elle veut "mieux dormir", parle de sommeil. Ne génère jamais un texte générique déconnecté de ses vrais objectifs.

RÈGLES DE SCORING STRICTES:

training (sport):
- "0" → 1-2
- "1-2" → 4-5
- "3-4" → 7-8
- "5+" → 9-10

hydratation (eau):
- "<1" → 1-2
- "1-1.5" → 4-5
- "1.5-2" → 7-8
- "2+" → 9-10

skincare:
- "aucune" → 1-3
- "basique" → 5-6
- "complete" → 8-9
- "avancee" → 10

steps (stress inversé — moins de stress = meilleur score):
- "extreme" → 1-2
- "eleve" → 3-5
- "modere" → 6-7
- "faible" → 8-10

nutrition: estime entre 3-8 selon l'IMC et le sport (IMC 18-25 = meilleur score)
sommeil: estime entre 4-8 (valeur moyenne car non demandé)

total: moyenne pondérée de tous les scores × 10, arrondie à l'entier

Génère un JSON strict (rien d'autre, pas de markdown, pas de backticks):
{
  "total": <score 0-100 cohérent avec les sous-scores>,
  "training": <0-10 selon règles ci-dessus>,
  "nutrition": <0-10 estimé>,
  "hydratation": <0-10 selon règles ci-dessus>,
  "sommeil": <0-10 estimé>,
  "skincare": <0-10 selon règles ci-dessus>,
  "steps": <0-10 stress inversé selon règles ci-dessus>,
  "analyse": "<2 phrases percutantes personnalisées avec le prénom, basées sur les vrais points faibles>",
  "message_faible": "<si total < 45 — urgent et alarmant, 1 phrase SANS prénom, commence directement par le constat, corps envoie des signaux d'alarme ignorés>",
  "message_moyen": "<si total 45-70 — frustration + FOMO, 1 phrase SANS prénom, potentiel gâché, proximité top 10%, jamais de compliment>",
  "message_eleve": "<si total > 70 — challenge, 1 phrase SANS prénom, vrais résultats commencent à 85+ et pas encore atteint>",
  "point_faible": "<clé exacte parmi: training, nutrition, hydratation, sommeil, skincare, steps>",
  "plan_semaine1": ["<action concrète 1>", "<action concrète 2>", "<action concrète 3>"],
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
