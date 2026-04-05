import type { RegionCode, Question, TranslationLocale } from '@/types'
import appConfig from '@/config/app.config'

// ─── Lazy load ───────────────────────────────────────────────────────────────

let _questions: Question[] | null = null
function getQuestions(): Question[] {
  if (!_questions) {
    _questions = require('@/data/questions').default
  }
  return _questions!
}

// ─── Query helpers ───────────────────────────────────────────────────────────

export function getAllQuestions(): Question[] {
  return getQuestions()
}

export function getQuestionById(id: string): Question | undefined {
  return getQuestions().find((q) => q.id === id)
}

/** Questions relevant to the user: general + their region (if any) */
export function getRelevantQuestions(selectedRegion: RegionCode | null): Question[] {
  if (!appConfig.hasRegions || !selectedRegion) {
    return getQuestions().filter((q) => q.category === 'general')
  }
  return getQuestions().filter((q) => q.category === 'general' || q.category === selectedRegion)
}

export function getGeneralQuestions(): Question[] {
  return getQuestions().filter((q) => q.category === 'general')
}

export function getRegionQuestions(regionCode: RegionCode | null): Question[] {
  if (!regionCode) return []
  return getQuestions().filter((q) => q.category === regionCode)
}

// Backward compat alias
export const getStateQuestions = getRegionQuestions

// ─── Tag-based filtering ─────────────────────────────────────────────────────
// Categories are defined in app.config.ts. Their order = display order.
// Questions have `tags: string[]` that match category IDs.

/** Get questions that have a specific tag, scoped to user's region */
export function getQuestionsForTag(tag: string, selectedRegion: RegionCode | null): Question[] {
  return getRelevantQuestions(selectedRegion).filter((q) => q.tags.includes(tag))
}

/** Get questions by category — tag-based or region-based */
export function getQuestionSetByCategory(category: string | null, selectedRegion: RegionCode | null): Question[] {
  if (!category) return getRelevantQuestions(selectedRegion)
  // Check if it's a tag (topic category from config)
  if (appConfig.categories.some((c) => c.id === category)) {
    return getQuestionsForTag(category, selectedRegion)
  }
  // Otherwise it's a region code
  return getQuestions().filter((q) => q.category === category)
}

export function getQuestionLabel(category: string, selectedRegion: RegionCode | null): string {
  const configCat = appConfig.categories.find((c) => c.id === category)
  if (configCat) return configCat.label
  if (category === 'general') return 'General'
  if (category === selectedRegion) return 'Your Region'
  return category.toUpperCase()
}

// ─── Translation helpers ─────────────────────────────────────────────────────

export function getQuestionTranslation(question: Question, locale: TranslationLocale): Question['translations'][TranslationLocale] | null {
  if (locale === appConfig.originalLocale) return null
  return question.translations[locale] ?? null
}

export function getQuestionContent(question: Question, locale: TranslationLocale) {
  const translation = getQuestionTranslation(question, locale)

  if (!translation) {
    return {
      question: question.question,
      options: question.options,
      explanation: question.explanation,
      translated: false,
    }
  }

  return {
    question: translation.question,
    options: translation.options,
    explanation: translation.explanation,
    translated: true,
  }
}
