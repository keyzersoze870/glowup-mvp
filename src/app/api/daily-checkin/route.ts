import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { checklist, prenom, previousScore } = await req.json()

    const done = Object.values(checklist).filter(Boolean).length
    const total = Object.keys(checklist).length

    const prompt = `Tu es un coach bienveillant mais direct. L'utilisateur ${prenom} vient de cocher ${done}/${total} items de sa checklist aujourd'hui.

Items cochés: ${JSON.stringify(checklist)}
Score précédent: ${previousScore}/100

Génère un JSON strict (rien d'autre):
{
  "nouveauScore": <calcule un nouveau score basé sur ${previousScore} +/- selon la checklist>,
  "message": "<message court 1 phrase, direct, motivant, avec le prénom>",
  "emoji": "<un seul emoji qui résume la journée>"
}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }]
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const result = JSON.parse(text)

    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Erreur check-in' }, { status: 500 })
  }
}
