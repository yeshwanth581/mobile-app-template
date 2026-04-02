import { TouchableOpacity, View, Text, StyleSheet } from 'react-native'
import type { Question } from '@/types'
import type { TranslationLocale } from '@/types'
import { getQuestionTranslation } from '@/data/questionBank'
import { palette, spacing, radius } from '@/theme'

type State = 'default' | 'selected' | 'selected-correct' | 'selected-wrong' | 'correct-answer'

interface Props {
  index: number
  question: Question
  translationLocale: TranslationLocale
  showTranslation: boolean
  chosenIndex: number | null
  isDark: boolean
  revealAnswer?: boolean
  onPress: (index: number) => void
}

const LETTERS = ['A', 'B', 'C', 'D', 'E']

export function OptionButton({
  index,
  question,
  translationLocale,
  showTranslation,
  chosenIndex,
  isDark,
  revealAnswer = true,
  onPress,
}: Props) {
  const answered = chosenIndex !== null

  let state: State = 'default'
  if (answered) {
    if (!revealAnswer) {
      state = index === chosenIndex ? 'selected' : 'default'
    } else if (index === question.correct && index === chosenIndex) state = 'selected-correct'
    else if (index === chosenIndex) state = 'selected-wrong'
    else if (index === question.correct) state = 'correct-answer'
  }

  const translation = getQuestionTranslation(question, translationLocale)
  const showTranslationText = showTranslation && !!translation?.options[index]

  const c = isDark ? dark : light

  return (
    <TouchableOpacity
      activeOpacity={answered ? 1 : 0.7}
      onPress={() => onPress(index)}
      style={[styles.wrap, c.wrap, c[state]]}
    >
      <View style={[styles.letter, c.letterBg[state]]}>
        <Text style={[styles.letterText, c.letterText[state]]}>
          {LETTERS[index]}
        </Text>
      </View>

      <View style={styles.textWrap}>
        <Text style={[styles.optionText, c.optionText[state]]}>
          {question.options[index]}
        </Text>
        {showTranslationText && (
          <Text style={[styles.translationText, { color: isDark ? '#94a3b8' : '#64748b' }]}>
            {translation.options[index]}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 2,
  },
  letter: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  letterText: { fontSize: 12, fontWeight: '800' },
  textWrap: { flex: 1 },
  optionText: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
  translationText: { fontSize: 12, marginTop: 4, lineHeight: 18 },
})

// Light theme colour maps
const light = {
  wrap: {
    backgroundColor: '#f8f8f8',
  } as any,
  default:            { borderColor: 'transparent' },
  selected:           { borderColor: '#111111', backgroundColor: '#f8f8f8' },
  'selected-correct': { borderColor: palette.green, backgroundColor: palette.greenLight },
  'selected-wrong':   { borderColor: palette.red,   backgroundColor: palette.redLight },
  'correct-answer':   { borderColor: palette.green, backgroundColor: palette.greenLight },
  letterBg: {
    default:            { backgroundColor: '#f1f5f9' },
    selected:           { backgroundColor: '#111111' },
    'selected-correct': { backgroundColor: palette.green },
    'selected-wrong':   { backgroundColor: palette.red },
    'correct-answer':   { backgroundColor: palette.green },
  },
  letterText: {
    default:            { color: '#475569' },
    selected:           { color: '#ffffff' },
    'selected-correct': { color: '#fff' },
    'selected-wrong':   { color: '#fff' },
    'correct-answer':   { color: '#fff' },
  },
  optionText: {
    default:            { color: '#1e293b' },
    selected:           { color: '#1e293b', fontWeight: '600' as const },
    'selected-correct': { color: '#15803d', fontWeight: '600' as const },
    'selected-wrong':   { color: '#b91c1c', fontWeight: '600' as const },
    'correct-answer':   { color: '#15803d', fontWeight: '600' as const },
  },
}

// Dark theme colour maps
const dark = {
  wrap: { backgroundColor: '#1a1a1a' } as any,
  default:            { borderColor: 'transparent' },
  selected:           { borderColor: '#ffffff', backgroundColor: '#1a1a1a' },
  'selected-correct': { borderColor: palette.green, backgroundColor: palette.greenDim },
  'selected-wrong':   { borderColor: palette.red,   backgroundColor: palette.redDim },
  'correct-answer':   { borderColor: palette.green, backgroundColor: palette.greenDim },
  letterBg: {
    default:            { backgroundColor: '#222222' },
    selected:           { backgroundColor: '#ffffff' },
    'selected-correct': { backgroundColor: palette.green },
    'selected-wrong':   { backgroundColor: palette.red },
    'correct-answer':   { backgroundColor: palette.green },
  },
  letterText: {
    default:            { color: '#777777' },
    selected:           { color: '#111111' },
    'selected-correct': { color: '#fff' },
    'selected-wrong':   { color: '#fff' },
    'correct-answer':   { color: '#fff' },
  },
  optionText: {
    default:            { color: '#e2e8f0' },
    selected:           { color: '#ffffff', fontWeight: '600' as const },
    'selected-correct': { color: '#4ade80', fontWeight: '600' as const },
    'selected-wrong':   { color: '#f87171', fontWeight: '600' as const },
    'correct-answer':   { color: '#4ade80', fontWeight: '600' as const },
  },
}
