import { memo, useCallback } from 'react'
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native'
import type { Question } from '@/types'
import type { TranslationLocale } from '@/types'
import { getQuestionTranslation } from '@/data/questionBank'
import { palette, semanticLight, semanticDark, spacing, radius, type SemanticColors } from '@/theme'
import { hapticLight, hapticError } from '@/hooks/useHaptics'

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

export const OptionButton = memo(function OptionButton({
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

  const handlePress = useCallback(() => {
    if (chosenIndex === null) {
      if (revealAnswer) {
        // Practice — light for correct, error double-buzz for wrong
        index === question.correct ? hapticLight() : hapticError()
      } else {
        // Exam — neutral light tap, no correct/wrong hint
        hapticLight()
      }
    }
    onPress(index)
  }, [index, question.correct, chosenIndex, revealAnswer, onPress])

  return (
    <TouchableOpacity
      activeOpacity={answered ? 1 : 0.7}
      onPress={handlePress}
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
          <Text style={[styles.translationText, { color: isDark ? semanticDark.translationText : semanticLight.translationText }]}>
            {translation.options[index]}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  )
})

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

// Build theme maps from semantic tokens — change colors in theme/index.ts, not here.
function buildThemeMap(s: SemanticColors) {
  return {
    wrap: { backgroundColor: s.optionBg } as any,
    default:            { borderColor: 'transparent' },
    selected:           { borderColor: s.btnPrimaryBg, backgroundColor: s.optionBg },
    'selected-correct': { borderColor: palette.green, backgroundColor: palette.greenLight },
    'selected-wrong':   { borderColor: palette.red,   backgroundColor: palette.redLight },
    'correct-answer':   { borderColor: palette.green, backgroundColor: palette.greenLight },
    letterBg: {
      default:            { backgroundColor: s.optionLetterBg },
      selected:           { backgroundColor: s.btnPrimaryBg },
      'selected-correct': { backgroundColor: palette.green },
      'selected-wrong':   { backgroundColor: palette.red },
      'correct-answer':   { backgroundColor: palette.green },
    },
    letterText: {
      default:            { color: s.optionLetterText },
      selected:           { color: s.btnPrimaryText },
      'selected-correct': { color: '#fff' },
      'selected-wrong':   { color: '#fff' },
      'correct-answer':   { color: '#fff' },
    },
    optionText: {
      default:            { color: s.optionText },
      selected:           { color: s.optionText, fontWeight: '600' as const },
      'selected-correct': { color: s.optionCorrectText, fontWeight: '600' as const },
      'selected-wrong':   { color: s.optionWrongText, fontWeight: '600' as const },
      'correct-answer':   { color: s.optionCorrectText, fontWeight: '600' as const },
    },
  }
}

const light = buildThemeMap(semanticLight)

// Dark needs greenDim/redDim instead of greenLight/redLight for selected states
const dark = {
  ...buildThemeMap(semanticDark),
  'selected-correct': { borderColor: palette.green, backgroundColor: palette.greenDim },
  'selected-wrong':   { borderColor: palette.red,   backgroundColor: palette.redDim },
  'correct-answer':   { borderColor: palette.green, backgroundColor: palette.greenDim },
}
