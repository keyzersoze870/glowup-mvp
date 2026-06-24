export interface OnboardingData {
  prenom: string
  objectif: 'perdre_gras' | 'prendre_muscle' | 'recomposition' | 'glow_global'
  poids: number
  taille: number
  niveau: 'debutant' | 'intermediaire' | 'avance'
  sport_semaine: number
  heures_sommeil: number
  eau_litres: number
  skincare: boolean
  steps_quotidien: number
}

export interface GlowUpScore {
  total: number
  training: number
  nutrition: number
  hydratation: number
  sommeil: number
  skincare: number
  steps: number
  analyse: string
  plan_semaine1: string[]
  quick_wins: string[]
}

export interface DailyChecklist {
  training: boolean
  steps: boolean
  proteines: boolean
  eau: boolean
  sommeil: boolean
}
