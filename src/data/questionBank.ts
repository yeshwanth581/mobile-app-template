import questions from '@/data/questions'
import type { GermanStateCode, Question, TranslationLocale } from '@/types'

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
  return questions.filter((question) => question.category === category)
}

export function getQuestionLabel(category: string, selectedStateCode: GermanStateCode | null): string {
  if (category === 'general') return 'Germany'
  if (category === selectedStateCode) return 'Your State'
  return category.toUpperCase()
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
