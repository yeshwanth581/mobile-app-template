import { useState } from 'react'
import { FlatList, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { palette, radius, spacing, typography } from '@/theme'

interface Props {
  currentIndex: number
  total: number
  onSelect: (index: number) => void
  isDark: boolean
  prefix?: string
  compact?: boolean
}

export function QuestionJumpPicker({ currentIndex, total, onSelect, isDark, prefix, compact }: Props) {
  const [open, setOpen] = useState(false)
  const card = isDark ? palette.dark.card : palette.light.card
  const border = isDark ? palette.dark.border : palette.light.border
  const bg = isDark ? palette.dark.bg : palette.light.bg
  const textPrimary = isDark ? palette.dark.textPrimary : palette.light.textPrimary
  const textMuted = isDark ? palette.dark.textMuted : palette.light.textMuted
  const selectedLabel = compact ? `${currentIndex + 1}/${total}` : `${prefix ? `${prefix} ` : ''}${currentIndex + 1}/${total}`
  const options = Array.from({ length: total }, (_, index) => ({
    index,
    label: compact ? `${index + 1}/${total}` : `${prefix ? `${prefix} ` : ''}${index + 1}/${total}`,
  }))

  return (
    <>
      <TouchableOpacity
        style={[
          compact ? styles.compactWrap : styles.wrap,
          { backgroundColor: card, borderColor: border },
        ]}
        onPress={() => setOpen(true)}
      >
        <Text style={[compact ? typography.tiny : typography.smallBd, { color: textPrimary }]}>
          {selectedLabel}
        </Text>
        <Text style={[typography.tiny, { color: textMuted }]}>▼</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable
            style={[styles.sheet, { backgroundColor: card, borderColor: border }]}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.sheetHeader}>
              <Text style={[typography.smallBd, { color: textPrimary }]}>
                {prefix ? prefix : 'Question'}
              </Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Text style={[typography.smallBd, { color: palette.primary }]}>Done</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.pickerWrap, { backgroundColor: bg, borderColor: border }]}>
              <FlatList
                data={options}
                keyExtractor={(item) => String(item.index)}
                initialNumToRender={24}
                style={styles.list}
                renderItem={({ item }) => {
                  const selected = item.index === currentIndex
                  return (
                    <TouchableOpacity
                      style={[
                        styles.optionRow,
                        {
                          backgroundColor: selected ? (isDark ? '#1e1b4b' : '#eef2ff') : bg,
                          borderBottomColor: border,
                        },
                      ]}
                      onPress={() => {
                        onSelect(item.index)
                        setOpen(false)
                      }}
                    >
                      <Text
                        style={[
                          typography.smallBd,
                          { color: selected ? palette.primary : textPrimary },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  )
                }}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  compactWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  sheet: {
    borderWidth: 1.5,
    borderRadius: radius.xl,
    padding: spacing.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  pickerWrap: {
    borderWidth: 1.5,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  list: {
    maxHeight: 320,
  },
  optionRow: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
})
