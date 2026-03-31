import { TouchableOpacity, View, Text, StyleSheet } from 'react-native'
import type { Question } from '@/types'
import type { TranslationLocale } from '@/types'
import { getQuestionContent, getQuestionTranslation } from '@/data/questionBank'
import { palette, spacing, radius } from '@/theme'

type State = 'default' | 'selected-correct' | 'selected-wrong' | 'correct-answer'

interface Props {
  index: number
  question: Question
  translationLocale: TranslationLocale
  showTranslation: boolean
  chosenIndex: number | null
  isDark: boolean
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
  onPress,
}: Props) {
  const answered = chosenIndex !== null

  let state: State = 'default'
  if (answered) {
    if (index === question.correct && index === chosenIndex) state = 'selected-correct'
    else if (index === chosenIndex) state = 'selected-wrong'
    else if (index === question.correct) state = 'correct-answer'
  }

  const localized = getQuestionContent(question, translationLocale)
  const translation = getQuestionTranslation(question, translationLocale)
  const showEnglishUnderGerman = showTranslation && translationLocale === 'en' && !!translation?.options[index]

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
          {showEnglishUnderGerman ? question.options[index] : localized.options[index]}
        </Text>
        {showEnglishUnderGerman && (
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
    padding: 13,
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
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  } as any,
  default:          { borderColor: '#e2e8f0' },
  'selected-correct': { borderColor: palette.green, backgroundColor: palette.greenLight },
  'selected-wrong':   { borderColor: palette.red,   backgroundColor: palette.redLight },
  'correct-answer':   { borderColor: palette.green, backgroundColor: palette.greenLight },
  letterBg: {
    default:            { backgroundColor: '#f1f5f9' },
    'selected-correct': { backgroundColor: palette.green },
    'selected-wrong':   { backgroundColor: palette.red },
    'correct-answer':   { backgroundColor: palette.green },
  },
  letterText: {
    default:            { color: '#475569' },
    'selected-correct': { color: '#fff' },
    'selected-wrong':   { color: '#fff' },
    'correct-answer':   { color: '#fff' },
  },
  optionText: {
    default:            { color: '#1e293b' },
    'selected-correct': { color: '#15803d', fontWeight: '600' as const },
    'selected-wrong':   { color: '#b91c1c', fontWeight: '600' as const },
    'correct-answer':   { color: '#15803d', fontWeight: '600' as const },
  },
}

// Dark theme colour maps
const dark = {
  wrap: { backgroundColor: '#1e293b' } as any,
  default:            { borderColor: '#1e293b' },
  'selected-correct': { borderColor: palette.green, backgroundColor: palette.greenDim },
  'selected-wrong':   { borderColor: palette.red,   backgroundColor: palette.redDim },
  'correct-answer':   { borderColor: palette.green, backgroundColor: palette.greenDim },
  letterBg: {
    default:            { backgroundColor: '#0f172a' },
    'selected-correct': { backgroundColor: palette.green },
    'selected-wrong':   { backgroundColor: palette.red },
    'correct-answer':   { backgroundColor: palette.green },
  },
  letterText: {
    default:            { color: '#64748b' },
    'selected-correct': { color: '#fff' },
    'selected-wrong':   { color: '#fff' },
    'correct-answer':   { color: '#fff' },
  },
  optionText: {
    default:            { color: '#e2e8f0' },
    'selected-correct': { color: '#4ade80', fontWeight: '600' as const },
    'selected-wrong':   { color: '#f87171', fontWeight: '600' as const },
    'correct-answer':   { color: '#4ade80', fontWeight: '600' as const },
  },
}
