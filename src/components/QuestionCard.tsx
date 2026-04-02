import { View, Text, StyleSheet, Image } from 'react-native'
import type { Question } from '@/types'
import type { TranslationLocale } from '@/types'
import { getQuestionTranslation } from '@/data/questionBank'
import { getQuestionImage } from '@/data/questionImages'
import { palette, spacing, radius, typography } from '@/theme'

interface Props {
  question: Question
  translationLocale: TranslationLocale
  showTranslation: boolean
  isDark: boolean
  categoryLabel?: string
}

export function QuestionCard({
  question,
  translationLocale,
  showTranslation,
  isDark,
  categoryLabel,
}: Props) {
  const translation = getQuestionTranslation(question, translationLocale)
  const imageSource = getQuestionImage(question.id)
  const showTranslationText = showTranslation && !!translation

  const c = isDark ? palette.dark : palette.light

  return (
    <View style={styles.card}>
      {categoryLabel && (
        <Text style={[styles.categoryLabel, { color: c.textMuted }]}>
          {categoryLabel.toUpperCase()}
        </Text>
      )}

      <Text style={[typography.bodyLg, styles.questionText, { color: c.textPrimary }]}>
        {question.question}
      </Text>

      {showTranslationText && (
        <Text style={[styles.translationText, { color: c.textSecond }]}>
          {translation.question}
        </Text>
      )}

      {imageSource && (
        <View style={[styles.imageWrap, { borderColor: c.border, backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
          <Image source={imageSource} style={styles.image} resizeMode="contain" />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  categoryLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  questionText: { lineHeight: 24, marginBottom: spacing.xs },
  translationText: {
    fontSize: 13,
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  imageWrap: {
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    padding: spacing.sm,
  },
  image: {
    width: '100%',
    height: 220,
  },
})
