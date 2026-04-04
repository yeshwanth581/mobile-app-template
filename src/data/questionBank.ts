import type { RegionCode, Question, TranslationLocale } from '@/types'
import appConfig from '@/config/app.config'

// Lazy-load the 370KB question bank — only evaluated on first access
let _questions: Question[] | null = null
function getQuestions(): Question[] {
  if (!_questions) {
    _questions = require('@/data/questions').default
  }
  return _questions!
}

// Category IDs are driven by app.config.ts, not hardcoded
const categoryIds = appConfig.categories.map((c) => c.id)

export function getAllQuestions(): Question[] {
  return getQuestions()
}

export function getQuestionById(id: string): Question | undefined {
  return getQuestions().find((q) => q.id === id)
}

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

export function getQuestionSetByCategory(category: string | null, selectedRegion: RegionCode | null): Question[] {
  if (!category) return getRelevantQuestions(selectedRegion)
  if (isTopicCategory(category)) {
    return getQuestionsForTopicCategory(category, selectedRegion)
  }
  return getQuestions().filter((q) => q.category === category)
}

export function getQuestionLabel(category: string, selectedRegion: RegionCode | null): string {
  // Check if it's a config-defined topic category
  const configCat = appConfig.categories.find((c) => c.id === category)
  if (configCat) return configCat.label
  if (category === 'general') return 'General'
  if (category === selectedRegion) return 'Your Region'
  return category.toUpperCase()
}

export function isTopicCategory(category: string): boolean {
  return categoryIds.includes(category)
}

// ─── Topic classification ────────────────────────────────────────────────────
// If questions have topicCategory set, use it directly.
// Otherwise, fall back to regex classifier from app.config.ts (legacy support).

const _topicCategoryCache = new Map<string, string>()

export function getTopicCategory(question: Question): string {
  // Prefer explicit topicCategory on the question
  if (question.topicCategory) return question.topicCategory

  const cached = _topicCategoryCache.get(question.id)
  if (cached) return cached

  // Fall back to regex classifier from config
  const classifier = appConfig.topicClassifier
  if (!classifier) {
    // No classifier and no topicCategory — default to first category
    return categoryIds[0] ?? 'general'
  }

  const haystack = [
    question.question,
    question.explanation,
    question.source,
    ...question.options,
  ].join(' ')

  let bestCategory = categoryIds[0] ?? 'general'
  let bestScore = -1

  for (const catId of categoryIds) {
    const rules = classifier[catId]
    if (!rules) continue
    const score = rules.reduce((sum, rule) => (
      rule.pattern.test(haystack) ? sum + rule.score : sum
    ), 0)
    if (score > bestScore) {
      bestScore = score
      bestCategory = catId
    }
  }

  _topicCategoryCache.set(question.id, bestCategory)
  return bestCategory
}

export function getQuestionsForTopicCategory(category: string, selectedRegion: RegionCode | null): Question[] {
  return getRelevantQuestions(selectedRegion).filter((q) => getTopicCategory(q) === category)
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
