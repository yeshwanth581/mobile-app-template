import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { QuestionProgress, Attempt, SessionResult } from '@/types'

interface ProgressState {
  // Per-question history: questionId → QuestionProgress
  progress: Record<string, QuestionProgress>

  // Completed session results (last 50 kept)
  sessions: SessionResult[]

  // Streak tracking
  lastPracticedDate: string | null  // ISO date string 'YYYY-MM-DD'
  streakDays: number

  // Actions
  recordAttempt: (questionId: string, attempt: Attempt) => void
  recordAttempts: (entries: Array<{ questionId: string; attempt: Attempt }>) => void
  toggleBookmark: (questionId: string) => void
  saveSession: (result: SessionResult) => void
  resetAll: () => void

  // Computed helpers (not stored, derived on call)
  getProgress: (questionId: string) => QuestionProgress
  getAccuracy: (questionId: string) => number        // 0–1, NaN if never attempted
  isWeak: (questionId: string) => boolean             // accuracy < 0.5 and attempted ≥ 2
  getBookmarked: () => string[]
  getWeakIds: () => string[]
}

const defaultProgress = (id: string): QuestionProgress => ({
  questionId: id,
  attempts: [],
  bookmarked: false,
})

const todayISO = () => new Date().toISOString().slice(0, 10)

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      progress: {},
      sessions: [],
      lastPracticedDate: null,
      streakDays: 0,

      recordAttempt(questionId, attempt) {
        const today = todayISO()
        set((s) => {
          const existing = s.progress[questionId] ?? defaultProgress(questionId)
          const updatedProgress = {
            ...s.progress,
            [questionId]: {
              ...existing,
              attempts: [...existing.attempts, attempt],
            },
          }

          // Streak logic
          let { streakDays, lastPracticedDate } = s
          if (lastPracticedDate !== today) {
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            const wasYesterday = lastPracticedDate === yesterday.toISOString().slice(0, 10)
            streakDays = wasYesterday ? streakDays + 1 : 1
            lastPracticedDate = today
          }

          return { progress: updatedProgress, streakDays, lastPracticedDate }
        })
      },

      recordAttempts(entries) {
        if (entries.length === 0) return

        const today = todayISO()
        set((s) => {
          const updatedProgress = { ...s.progress }

          for (const { questionId, attempt } of entries) {
            const existing = updatedProgress[questionId] ?? defaultProgress(questionId)
            updatedProgress[questionId] = {
              ...existing,
              attempts: [...existing.attempts, attempt],
            }
          }

          let { streakDays, lastPracticedDate } = s
          if (lastPracticedDate !== today) {
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            const wasYesterday = lastPracticedDate === yesterday.toISOString().slice(0, 10)
            streakDays = wasYesterday ? streakDays + 1 : 1
            lastPracticedDate = today
          }

          return { progress: updatedProgress, streakDays, lastPracticedDate }
        })
      },

      toggleBookmark(questionId) {
        set((s) => {
          const existing = s.progress[questionId] ?? defaultProgress(questionId)
          return {
            progress: {
              ...s.progress,
              [questionId]: { ...existing, bookmarked: !existing.bookmarked },
            },
          }
        })
      },

      saveSession(result) {
        set((s) => ({
          sessions: [result, ...s.sessions].slice(0, 50),
        }))
      },

      resetAll() {
        set({ progress: {}, sessions: [], streakDays: 0, lastPracticedDate: null })
      },

      getProgress(questionId) {
        return get().progress[questionId] ?? defaultProgress(questionId)
      },

      getAccuracy(questionId) {
        const { attempts } = get().getProgress(questionId)
        if (attempts.length === 0) return NaN
        const correct = attempts.filter((a) => a.result === 'correct').length
        return correct / attempts.length
      },

      isWeak(questionId) {
        const { attempts } = get().getProgress(questionId)
        if (attempts.length < 2) return false
        return get().getAccuracy(questionId) < 0.5
      },

      getBookmarked() {
        return Object.values(get().progress)
          .filter((p) => p.bookmarked)
          .map((p) => p.questionId)
      },

      getWeakIds() {
        return Object.values(get().progress)
          .filter((p) => p.attempts.length >= 2)
          .filter((p) => {
            const correct = p.attempts.filter((a) => a.result === 'correct').length
            return correct / p.attempts.length < 0.5
          })
          .map((p) => p.questionId)
      },
    }),
    {
      name: 'ryg-progress',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
