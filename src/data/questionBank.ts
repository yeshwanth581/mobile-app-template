import questions from '@/data/questions'
import type { GermanStateCode, Question, TranslationLocale } from '@/types'

export type TopicCategoryId = 'politik' | 'recht' | 'geschichte' | 'gesellschaft' | 'wirtschaft'

const TOPIC_PATTERNS: Record<TopicCategoryId, Array<{ pattern: RegExp; score: number }>> = {
  politik: [
    { pattern: /\bdemokratie/i, score: 4 },
    { pattern: /\bbundestag/i, score: 4 },
    { pattern: /\bbundesrat/i, score: 4 },
    { pattern: /\bbundeskanzler/i, score: 4 },
    { pattern: /\bregierung/i, score: 4 },
    { pattern: /\bpartei/i, score: 3 },
    { pattern: /\bwahl/i, score: 4 },
    { pattern: /\bwahlrecht/i, score: 4 },
    { pattern: /\bminister/i, score: 3 },
    { pattern: /\bpräsident/i, score: 3 },
    { pattern: /\bparlament/i, score: 3 },
    { pattern: /\bopposition/i, score: 3 },
    { pattern: /\beuropäische union/i, score: 3 },
    { pattern: /\beu\b/i, score: 2 },
    { pattern: /\bpolitik/i, score: 2 },
  ],
  recht: [
    { pattern: /\brechtsstaat/i, score: 5 },
    { pattern: /\bgesetz/i, score: 4 },
    { pattern: /\bgrundgesetz/i, score: 5 },
    { pattern: /\bverfassung/i, score: 4 },
    { pattern: /\bgrundrecht/i, score: 5 },
    { pattern: /\bgericht/i, score: 4 },
    { pattern: /\brecht\b/i, score: 4 },
    { pattern: /\banwalt/i, score: 4 },
    { pattern: /\bstrafe/i, score: 3 },
    { pattern: /\bpolizei/i, score: 3 },
    { pattern: /\bverboten/i, score: 2 },
    { pattern: /\bfreizügigkeit/i, score: 3 },
  ],
  geschichte: [
    { pattern: /\bgeschichte/i, score: 3 },
    { pattern: /\bddr\b/i, score: 5 },
    { pattern: /\bbundesrepublik/i, score: 2 },
    { pattern: /\bnationalsozial/i, score: 5 },
    { pattern: /\bns-staat/i, score: 5 },
    { pattern: /\bholocaust/i, score: 5 },
    { pattern: /\bzweite[nrms]* weltkrieg/i, score: 5 },
    { pattern: /\berste[nrms]* weltkrieg/i, score: 4 },
    { pattern: /\bwiedervereinigung/i, score: 5 },
    { pattern: /\bberliner mauer/i, score: 5 },
    { pattern: /\bwirtschaftswunder/i, score: 4 },
    { pattern: /\b194[5-9]\b/i, score: 3 },
    { pattern: /\b19[5-9]\d\b/i, score: 2 },
  ],
  gesellschaft: [
    { pattern: /\bfamilie/i, score: 4 },
    { pattern: /\bschule/i, score: 4 },
    { pattern: /\bkind(er)?/i, score: 4 },
    { pattern: /\breligion/i, score: 4 },
    { pattern: /\bgesellschaft/i, score: 4 },
    { pattern: /\bgleichberecht/i, score: 4 },
    { pattern: /\bintegration/i, score: 4 },
    { pattern: /\behe/i, score: 3 },
    { pattern: /\bwohnung/i, score: 3 },
    { pattern: /\bnachbar/i, score: 2 },
    { pattern: /\berziehung/i, score: 3 },
    { pattern: /\bfeiertag/i, score: 2 },
    { pattern: /\bkultur/i, score: 2 },
  ],
  wirtschaft: [
    { pattern: /\bwirtschaft/i, score: 5 },
    { pattern: /\bmarktwirtschaft/i, score: 5 },
    { pattern: /\bsoziale marktwirtschaft/i, score: 6 },
    { pattern: /\bplanwirtschaft/i, score: 5 },
    { pattern: /\bsteuer/i, score: 4 },
    { pattern: /\beuro/i, score: 4 },
    { pattern: /\bgeld/i, score: 2 },
    { pattern: /\bsozialversicherung/i, score: 4 },
    { pattern: /\brente/i, score: 4 },
    { pattern: /\barbeit(nehmer|geber|slos)?/i, score: 4 },
    { pattern: /\bkündigung/i, score: 3 },
    { pattern: /\bunternehmer/i, score: 3 },
    { pattern: /\bfinanz/i, score: 3 },
  ],
}

const TOPIC_FALLBACK_ORDER: TopicCategoryId[] = ['politik', 'recht', 'geschichte', 'gesellschaft', 'wirtschaft']

export function getRelevantQuestions(selectedStateCode: GermanStateCode | null): Question[] {
  return questions.filter((question) => question.category === 'general' || question.category === selectedStateCode)
}

export function getGeneralQuestions(): Question[] {
  return questions.filter((question) => question.category === 'general')
}

export function getStateQuestions(selectedStateCode: GermanStateCode | null): Question[] {
  if (!selectedStateCode) return []
  return questions.filter((question) => question.category === selectedStateCode)
}

export function getQuestionSetByCategory(category: string | null, selectedStateCode: GermanStateCode | null): Question[] {
  if (!category) return getRelevantQuestions(selectedStateCode)
  if (isTopicCategory(category)) {
    return getQuestionsForTopicCategory(category, selectedStateCode)
  }
  return questions.filter((question) => question.category === category)
}

export function getQuestionLabel(category: string, selectedStateCode: GermanStateCode | null): string {
  if (category === 'general') return 'Germany'
  if (category === selectedStateCode) return 'Your State'
  if (isTopicCategory(category)) return category
  return category.toUpperCase()
}

export function isTopicCategory(category: string): category is TopicCategoryId {
  return category in TOPIC_PATTERNS
}

const _topicCategoryCache = new Map<string, TopicCategoryId>()

export function getTopicCategory(question: Question): TopicCategoryId {
  const cached = _topicCategoryCache.get(question.id)
  if (cached) return cached

  const haystack = [
    question.question,
    question.explanation,
    question.source,
    ...question.options,
  ].join(' ')

  let bestCategory: TopicCategoryId = 'gesellschaft'
  let bestScore = -1

  for (const category of TOPIC_FALLBACK_ORDER) {
    const score = TOPIC_PATTERNS[category].reduce((sum, rule) => (
      rule.pattern.test(haystack) ? sum + rule.score : sum
    ), 0)

    if (score > bestScore) {
      bestScore = score
      bestCategory = category
    }
  }

  if (bestScore <= 0) {
    const numericId = Number.parseInt(question.id, 10)
    if (!Number.isNaN(numericId) && numericId >= 1 && numericId <= 300) {
      if (numericId <= 120) return 'politik'
      if (numericId <= 180) return 'recht'
      if (numericId <= 230) return 'geschichte'
      if (numericId <= 270) return 'gesellschaft'
      return 'wirtschaft'
    }
  }

  _topicCategoryCache.set(question.id, bestCategory)
  return bestCategory
}

export function getQuestionsForTopicCategory(category: TopicCategoryId, selectedStateCode: GermanStateCode | null): Question[] {
  return getRelevantQuestions(selectedStateCode).filter((question) => getTopicCategory(question) === category)
}

export function getQuestionTranslation(question: Question, locale: TranslationLocale): Question['translations'][TranslationLocale] | null {
  if (locale === 'de') return null
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
