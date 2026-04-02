import questions from '@/data/questions'
import type { GermanStateCode, Question, TranslationLocale } from '@/types'

export type TopicCategoryId = 'politik' | 'recht' | 'geschichte' | 'gesellschaft' | 'wirtschaft'

const TOPIC_PATTERNS: Record<TopicCategoryId, RegExp[]> = {
  wirtschaft: [
    /\bwirtschaft/i, /\bmarkt/i, /\bgeld/i, /\beuro/i, /\bsteuer/i, /\barbeit(slos|nehmer|geber)?/i,
    /\bsozialversicherung/i, /\brente/i, /\bunternehmer/i,
  ],
  geschichte: [
    /\bddr\b/i, /\bns[- ]/i, /\bnationalsozial/i, /\bzweite?n? weltkrieg/i, /\berste?n? weltkrieg/i,
    /\b194[5-9]\b/, /\b19[5-9]\d\b/, /\b20\d{2}\b/, /\bgeschichte/i, /\bwiedervereinigung/i,
    /\bmauer/i, /\bberliner mauer/i, /\bholocaust/i,
  ],
  recht: [
    /\brechtsstaat/i, /\bgesetz/i, /\bgericht/i, /\brecht\b/i, /\bverfassung/i, /\bgrundgesetz/i,
    /\bpolizei/i, /\banwalt/i, /\bstrafe/i, /\bhaft/i, /\bgrundrecht/i,
  ],
  politik: [
    /\bdemokratie/i, /\bbundestag/i, /\bbundesrat/i, /\bkanzler/i, /\bregierung/i, /\bpartei/i,
    /\bwahl/i, /\bminister/i, /\bpräsident/i, /\bparlament/i, /\beu\b/i, /\beuropa/i, /\bpolitik/i,
  ],
  gesellschaft: [
    /\bfamilie/i, /\bschule/i, /\bkind(er)?/i, /\breligion/i, /\bgesellschaft/i, /\bgleichberecht/i,
    /\bintegration/i, /\bkultur/i, /\bnachbar/i, /\behe/i, /\bmann\b/i, /\bfrau\b/i, /\bwohnung/i,
  ],
}

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

export function getTopicCategory(question: Question): TopicCategoryId {
  const haystack = `${question.question} ${question.explanation} ${question.source}`.toLowerCase()

  for (const category of ['wirtschaft', 'geschichte', 'recht', 'politik', 'gesellschaft'] as TopicCategoryId[]) {
    if (TOPIC_PATTERNS[category].some((pattern) => pattern.test(haystack))) {
      return category
    }
  }

  return 'gesellschaft'
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
