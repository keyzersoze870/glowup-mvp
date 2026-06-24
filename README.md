# GlowUp MVP — Body & Glow Up Score SaaS

Stack: Next.js 14 · Tailwind · Anthropic API · Vercel

## Routes
- `/` — Landing page avec score animé
- `/onboarding` — 5 étapes de profiling
- `/dashboard` — Score + Checklist + Plan semaine 1
- `/api/generate-score` — Claude génère le score initial
- `/api/daily-checkin` — Claude recalcule le score du jour

## Déploiement Vercel (10 min)

### 1. Push sur GitHub
```bash
git init
git add .
git commit -m "init glowup mvp"
gh repo create glowup-mvp --public --push
```

### 2. Importer sur Vercel
- vercel.com → "Add New Project" → importer le repo GitHub
- Framework détecté automatiquement : Next.js

### 3. Variables d'environnement sur Vercel
```
ANTHROPIC_API_KEY = sk-ant-...
NEXT_PUBLIC_APP_URL = https://ton-app.vercel.app
```

### 4. Deploy
Vercel build + deploy automatique. Chaque push sur main = redeploy.

## Dev local
```bash
cp .env.example .env.local
# Renseigner ANTHROPIC_API_KEY dans .env.local
npm install
npm run dev
```

## Prochaines étapes MVP+
1. Supabase auth (email magic link)
2. Stripe paywall (9,99€/mois)
3. Historique score en DB
4. Push notifications (Resend)
5. Page de vente TikTok-ready
