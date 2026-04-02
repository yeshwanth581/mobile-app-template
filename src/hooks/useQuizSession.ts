import { useState, useCallback, useRef, useMemo } from 'react'
import questions from '@/data/questions'
import { useProgressStore } from '@/store/useProgressStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { getGeneralQuestions, getQuestionSetByCategory, getRelevantQuestions, getStateQuestions } from '@/data/questionBank'
import type { Question, SessionConfig, SessionResult, Attempt } from '@/types'
import appConfig from '@/config/app.config'

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildQueue(config: SessionConfig): Question[] {
  const { filter, category, count, shuffle, _questionIds } = config
  const { getWeakIds, getBookmarked } = useProgressStore.getState()
  const { selectedStateCode } = useSettingsStore.getState()

  let pool: Question[]

  // Direct ID override — used when practising a specific question
  if (_questionIds && _questionIds.length > 0) {
    const idSet = new Set(_questionIds)
    pool = questions.filter((q) => idSet.has(q.id))
    if (shuffle) pool = shuffleArray(pool)
    return pool.slice(0, count === 0 ? pool.length : count)
  }

  switch (filter) {
    case 'category':
      pool = getQuestionSetByCategory(category, selectedStateCode)
      break
    case 'weak': {
      const weakIds = new Set(getWeakIds())
      pool = getRelevantQuestions(selectedStateCode).filter((q) => weakIds.has(q.id))
      break
    }
    case 'bookmarked': {
      const bIds = new Set(getBookmarked())
      pool = getRelevantQuestions(selectedStateCode).filter((q) => bIds.has(q.id))
      break
    }
    default:
      pool = getRelevantQuestions(selectedStateCode)
  }

  if (config.mode === 'exam') {
    const generalPool = shuffle ? shuffleArray(getGeneralQuestions()) : getGeneralQuestions()
    const statePool = shuffle ? shuffleArray(getStateQuestions(selectedStateCode)) : getStateQuestions(selectedStateCode)
    const examPool = [...generalPool.slice(0, 30), ...statePool.slice(0, 3)]
    return shuffle ? shuffleArray(examPool) : examPool
  }

  if (shuffle) pool = shuffleArray(pool)
  return pool.slice(0, count === 0 ? pool.length : count)
}

export type AnswerState = 'unanswered' | 'correct' | 'wrong'

export function useQuizSession(config: SessionConfig) {
  const { recordAttempt, recordAttempts, saveSession } = useProgressStore()
  const startTime = useRef(Date.now())
  const hasSavedResult = useRef(false)
  const pendingPracticeAttempts = useRef<Record<string, Attempt>>({})

  const [queue] = useState<Question[]>(() => buildQueue(config))
  const [selectedAnswers, setSelectedAnswers] = useState<Array<number | null>>(() =>
    config.presentation === 'study'
      ? queue.map((question) => question.correct)
      : Array.from({ length: queue.length }, () => null)
  )
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFinished, setIsFinished] = useState(false)

  const current = queue[currentIndex]
  const total = queue.length
  const chosenIndex = selectedAnswers[currentIndex] ?? null
  const answerState: AnswerState =
    chosenIndex === null
      ? 'unanswered'
      : chosenIndex === current?.correct
        ? 'correct'
        : 'wrong'

  const selectAnswer = useCallback(
    (index: number) => {
      if (!current) return
      setSelectedAnswers((prev) => {
        const nextAnswers = [...prev]
        nextAnswers[currentIndex] = index
        return nextAnswers
      })

      if (config.mode === 'practice' && chosenIndex === null) {
        const attempt: Attempt = {
          result: index === current.correct ? 'correct' : 'wrong',
          chosenIndex: index,
          mode: 'practice',
          timestamp: Date.now(),
        }
        pendingPracticeAttempts.current[current.id] = attempt
      }
    },
    [chosenIndex, current, currentIndex, config.mode]
  )

  // Helper: snapshot current answers — only call when session ends
  function snapshotAnswers(source: Array<number | null>): SessionResult['answers'] {
    return queue.flatMap((question, index) => {
      const answer = source[index]
      if (answer === null) return []
      return [{ questionId: question.id, correct: answer === question.correct, chosenIndex: answer }]
    })
  }

  const finalizeSession = useCallback((finalAnswers: SessionResult['answers']) => {
    if (hasSavedResult.current) return
    hasSavedResult.current = true

    if (config.mode === 'exam') {
      finalAnswers.forEach(({ questionId, correct, chosenIndex: ci }) => {
        recordAttempt(questionId, {
          result: correct ? 'correct' : 'wrong',
          chosenIndex: ci,
          mode: 'exam',
          timestamp: Date.now(),
        })
      })
    } else {
      recordAttempts(
        Object.entries(pendingPracticeAttempts.current).map(([questionId, attempt]) => ({
          questionId,
          attempt,
        }))
      )
    }

    const result: SessionResult = {
      config,
      answers: finalAnswers,
      durationSeconds: Math.round((Date.now() - startTime.current) / 1000),
      completedAt: Date.now(),
    }
    saveSession(result)
    setIsFinished(true)
  }, [config, recordAttempt, recordAttempts, saveSession])

  const next = useCallback(() => {
    if (chosenIndex === null) return
    if (currentIndex + 1 >= total) {
      finalizeSession(snapshotAnswers(selectedAnswers))
      return
    }
    setCurrentIndex((i) => i + 1)
  }, [chosenIndex, currentIndex, finalizeSession, selectedAnswers, total])

  const previous = useCallback(() => {
    if (currentIndex === 0) return
    setCurrentIndex((i) => i - 1)
  }, [currentIndex])

  const jumpTo = useCallback((index: number) => {
    if (index < 0 || index >= total) return
    setCurrentIndex(index)
  }, [total])

  const finishSession = useCallback(() => {
    finalizeSession(snapshotAnswers(selectedAnswers))
  }, [finalizeSession, selectedAnswers])

  // Only computed once when session finishes — never on every render
  const answers = useMemo(
    () => (isFinished ? snapshotAnswers(selectedAnswers) : ([] as SessionResult['answers'])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isFinished]
  )
  const score = useMemo(() => answers.filter((a) => a.correct).length, [answers])
  const passMark = appConfig.examConfig.passMark

  return {
    queue,
    current,
    currentIndex,
    total,
    chosenIndex,
    answerState,
    isFinished,
    score,
    answers,
    passMark,
    passed: score >= passMark,
    selectAnswer,
    previous,
    jumpTo,
    next,
    finishSession,
  }
}
