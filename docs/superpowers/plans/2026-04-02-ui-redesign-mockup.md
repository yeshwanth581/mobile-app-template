# RYG Template — UI Redesign to Match Mockup

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign all screens to match `assets/mockups/final.html` — new nav structure, Home, Study tab, and Practice tab.

**Architecture:** Four tasks in sequence. Each task is a self-contained screen or component change. No backend changes. All data comes from existing stores and question bank.

**Tech Stack:** React Native, Expo Router, TypeScript, Zustand stores (`useProgressStore`, `useSettingsStore`), existing theme/typography tokens.

---

## STATUS BOARD

| # | Task | Status |
|---|------|--------|
| 1 | Update BottomNav (4 tabs: Home → Study → Practice → Exam) | ✅ Done |
| 2 | Redesign Home screen | ✅ Done |
| 3 | Create Study tab screen (`app/study/index.tsx`) | ✅ Done |
| 4 | Redesign Practice screen (`app/practice/index.tsx`) | ✅ Done |

> Update this table as tasks complete: ⬜ Pending → 🔄 In Progress → ✅ Done

---

## Reference: What the Mockup Defines

**Bottom nav (4 tabs):**
- Home (`/`) — house icon
- Study (`/study`) — person reading icon
- Practice (`/practice`) — clipboard + checkmarks icon
- Exam (`/exam`) — clipboard + timer icon

**Home screen layout (top → bottom):**
1. Top row: language icon + dark mode toggle (right-aligned)
2. Centered block: flag emoji, app name (bold), tagline
3. Compact state dropdown pill (📍 Berlin ▾)
4. Big dark button — "Practice Questions / All active questions →"
5. Big light button — "Mock Exam / 33 questions · 60 minutes →"
6. Premium card — amber star icon, "Enjoying the app? Go ad-free", subtitle
7. Stats row — Total | Exam | Duration | To Pass

**Study screen layout:**
1. Stats row (4 cards): Studied | Accuracy (green) | Weak (red) | Saved
2. 2-col action grid: [Weak card] [Bookmarked card]
3. Row: Category dropdown (left) + Shuffle icon button (right)
4. Section label "Categories"
5. Category list rows — emoji, name, "N questions · N weak", chevron
6. Sticky bar above nav: dark "Study All · N Questions" button

**Practice screen layout:** Identical to Study but:
- Stats card label: "Practiced" instead of "Studied"
- Sticky button label: "Practice All · N Questions"

**Key behavioral differences Study vs Practice:**
- Study: starts session with `showTranslation: true`, mode `'practice'` (answers revealed instantly)
- Practice: starts session with user's `translationLocale` setting, mode `'practice'`
- Both launch `/practice/session` with a `SessionConfig`

---

## Task 1 — Update BottomNav

**Files:**
- Modify: `src/components/BottomNav.tsx`
- Modify: `app/study/index.tsx` ← new file, created empty as placeholder (Study screen built in Task 3)

**What changes:**
- Replace `{ key: 'questions', label: 'Questions', icon: '🗂', route: '/questions' }` with `{ key: 'study', label: 'Study', route: '/study' }`
- Replace `{ key: 'exam', label: 'Exam', icon: '📋', route: '/exam' }` with `{ key: 'exam', label: 'Exam', route: '/exam' }`
- Use SVG icons instead of emoji (matching mockup exactly)
- Update `NavKey` type: `'home' | 'study' | 'practice' | 'exam'`
- Dark mode: active icon stroke = `c.textPrimary`, inactive = `c.textMuted`

- [ ] **Step 1: Create empty placeholder for the Study route**

Create `app/study/index.tsx`:

```tsx
import { View, Text } from 'react-native'
import { useThemeColors } from '@/hooks/useThemeColors'

export default function StudyScreen() {
  const { c } = useThemeColors()
  return (
    <View style={{ flex: 1, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: c.textPrimary }}>Study — coming soon</Text>
    </View>
  )
}
```

- [ ] **Step 2: Rewrite BottomNav**

Replace the entire contents of `src/components/BottomNav.tsx` with:

```tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Svg, Path, Rect, Circle, Line } from 'react-native-svg'
import { useRouter } from 'expo-router'
import { useThemeColors } from '@/hooks/useThemeColors'
import { spacing } from '@/theme'

export type NavKey = 'home' | 'study' | 'practice' | 'exam'

interface BottomNavProps {
  active: NavKey
}

function HomeIcon({ stroke }: { stroke: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" stroke={stroke} />
      <Path d="M9 21V13h6v8" stroke={stroke} />
    </Svg>
  )
}

function StudyIcon({ stroke }: { stroke: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 64 64" fill="none" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={32} cy={14} r={8} stroke={stroke} />
      <Path d="M27 10c3-3 7-3 10 0" stroke={stroke} />
      <Path d="M18 38c0-8 6-14 14-14s14 6 14 14" stroke={stroke} />
      <Path d="M14 40c0 0 6-3 18-3v18c-12 0-18 3-18 3V40z" stroke={stroke} />
      <Path d="M50 40c0 0-6-3-18-3v18c12 0 18 3 18 3V40z" stroke={stroke} />
      <Line x1={32} y1={37} x2={32} y2={55} stroke={stroke} />
    </Svg>
  )
}

function PracticeIcon({ stroke }: { stroke: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke={stroke} />
      <Rect x={9} y={2} width={6} height={4} rx={1} stroke={stroke} />
      <Path d="M9 12l1.5 1.5L13 11" stroke={stroke} />
      <Line x1={15} y1={12} x2={16} y2={12} stroke={stroke} />
      <Path d="M9 16l1.5 1.5L13 15" stroke={stroke} />
      <Line x1={15} y1={16} x2={16} y2={16} stroke={stroke} />
    </Svg>
  )
}

function ExamIcon({ stroke }: { stroke: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 80 80" fill="none" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={58} cy={18} r={12} stroke={stroke} />
      <Line x1={58} y1={10} x2={58} y2={18} stroke={stroke} />
      <Line x1={58} y1={18} x2={63} y2={22} stroke={stroke} />
      <Rect x={10} y={16} width={38} height={50} rx={3} stroke={stroke} />
      <Rect x={4} y={11} width={38} height={50} rx={3} stroke={stroke} />
      <Rect x={15} y={7} width={12} height={7} rx={2.5} stroke={stroke} />
      <Circle cx={13} cy={26} r={3.5} stroke={stroke} />
      <Path d="M11.2 26l1.8 2 3.5-3.5" stroke={stroke} />
      <Line x1={21} y1={25} x2={36} y2={25} stroke={stroke} />
      <Circle cx={13} cy={39} r={3.5} stroke={stroke} />
      <Path d="M11.2 39l1.8 2 3.5-3.5" stroke={stroke} />
      <Line x1={21} y1={38} x2={36} y2={38} stroke={stroke} />
      <Circle cx={13} cy={52} r={3.5} stroke={stroke} />
      <Path d="M11.2 52l1.8 2 3.5-3.5" stroke={stroke} />
      <Line x1={21} y1={51} x2={36} y2={51} stroke={stroke} />
    </Svg>
  )
}

const ITEMS: { key: NavKey; label: string; route: string }[] = [
  { key: 'home',     label: 'Home',     route: '/' },
  { key: 'study',    label: 'Study',    route: '/study' },
  { key: 'practice', label: 'Practice', route: '/practice' },
  { key: 'exam',     label: 'Exam',     route: '/exam' },
]

export function BottomNav({ active }: BottomNavProps) {
  const router = useRouter()
  const { c } = useThemeColors()

  function renderIcon(key: NavKey, stroke: string) {
    switch (key) {
      case 'home':     return <HomeIcon stroke={stroke} />
      case 'study':    return <StudyIcon stroke={stroke} />
      case 'practice': return <PracticeIcon stroke={stroke} />
      case 'exam':     return <ExamIcon stroke={stroke} />
    }
  }

  return (
    <View style={[styles.nav, { backgroundColor: c.bg, borderTopColor: c.border }]}>
      {ITEMS.map((item) => {
        const isActive = item.key === active
        const stroke = isActive ? c.textPrimary : c.textMuted
        return (
          <TouchableOpacity
            key={item.key}
            style={styles.navItem}
            onPress={() => { if (!isActive) router.replace(item.route as never) }}
          >
            {renderIcon(item.key, stroke)}
            <Text style={[styles.navLabel, { color: stroke }]}>{item.label}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 6,
    paddingBottom: 26,
    paddingHorizontal: spacing.sm,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minHeight: 44,
  },
  navLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
})
```

- [ ] **Step 3: Update all existing screens that reference old NavKey values**

In `app/questions/index.tsx` line 191: change `active="questions"` → `active="study"`

In `app/index.tsx` line 126: keep `active="home"` — no change needed.

In `app/practice/index.tsx` line 130: keep `active="practice"` — no change needed.

In `app/exam.tsx`: add BottomNav import if missing, or check — exam screen currently has no BottomNav, that's fine.

- [ ] **Step 4: Check `react-native-svg` is available**

Run:
```bash
cd "/Users/yeshwanthgollapalli/Desktop/ryg apps/template" && grep "react-native-svg" package.json
```

Expected: a line showing `"react-native-svg": "..."`. If missing, run:
```bash
npx expo install react-native-svg
```

- [ ] **Step 5: Start dev server and visually verify bottom nav renders correctly**

```bash
cd "/Users/yeshwanthgollapalli/Desktop/ryg apps/template" && npx expo start
```

Open on simulator. Verify: 4 tabs (Home, Study, Practice, Exam), SVG icons visible, active tab icon darker than inactive, Study tab shows placeholder screen.

---

## Task 2 — Redesign Home Screen

**Files:**
- Modify: `app/index.tsx`

**What changes (mockup → code mapping):**
- Remove: stateCard, summaryCard, complex open/close state list
- Add: centered flag + appName + appDesc block
- Add: compact state dropdown pill (single row, tappable → Modal or inline picker)
- Replace buttons: two big `big-btn` style buttons (dark primary + light secondary), with arrow icon
- Add: premium card row (amber icon + text + chevron)
- Add: stats row at bottom (Total | Exam | Duration | To Pass)
- Top row: language selector icon (left? right?) + dark mode toggle

- [ ] **Step 1: Rewrite `app/index.tsx`**

Replace the entire file contents with:

```tsx
import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { Svg, Line, Polyline, Path } from 'react-native-svg'
import { BottomNav } from '@/components/BottomNav'
import { useThemeColors } from '@/hooks/useThemeColors'
import { useSettingsStore } from '@/store/useSettingsStore'
import { GERMAN_STATES, getStateLabel } from '@/data/states'
import { getRelevantQuestions } from '@/data/questionBank'
import { palette, spacing, radius, typography } from '@/theme'
import appConfig from '@/config/app.config'
import { useMemo } from 'react'

function ArrowIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <Line x1={5} y1={12} x2={19} y2={12} stroke={color} />
      <Polyline points="12 5 19 12 12 19" stroke={color} />
    </Svg>
  )
}

function ChevronIcon({ color }: { color: string }) {
  return (
    <Svg width={10} height={10} viewBox="0 0 12 12" fill="none" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 4.5l3 3 3-3" stroke={color} />
    </Svg>
  )
}

export default function HomeScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const { c, isDark } = useThemeColors()
  const { selectedStateCode, setSelectedStateCode } = useSettingsStore()
  const [stateModalOpen, setStateModalOpen] = useState(false)

  const relevantQuestions = useMemo(() => getRelevantQuestions(selectedStateCode), [selectedStateCode])
  const selectedStateLabel = getStateLabel(selectedStateCode)

  const chevronBg  = isDark ? '#333333' : '#dddddd'
  const chevronStroke = isDark ? '#aaaaaa' : '#666666'

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Top row — language + theme icons */}
        <View style={styles.topRow}>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: c.card }]}
            onPress={() => router.push('/language')}
          >
            <Text style={styles.iconBtnText}>🌐</Text>
          </TouchableOpacity>
        </View>

        {/* Centered hero block */}
        <View style={styles.centerBlock}>
          <Text style={styles.flagEmoji}>{appConfig.flagEmoji}</Text>
          <Text style={[styles.appName, { color: c.textPrimary }]}>{appConfig.appName}</Text>
          <Text style={[styles.appDesc, { color: c.textSecond }]}>{appConfig.appTagline}</Text>
        </View>

        {/* State dropdown pill */}
        <View style={styles.dropdownRow}>
          <TouchableOpacity
            style={[styles.stateDropdown, { backgroundColor: c.card, borderColor: c.border }]}
            onPress={() => setStateModalOpen(true)}
          >
            <Text style={styles.ddPin}>📍</Text>
            <Text style={[styles.ddText, { color: c.textPrimary }]}>
              {selectedStateLabel ?? 'Select state'}
            </Text>
            <View style={[styles.ddChevron, { backgroundColor: chevronBg }]}>
              <ChevronIcon color={chevronStroke} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Big dark button — Practice */}
        <TouchableOpacity
          style={[styles.bigBtnDark, { backgroundColor: isDark ? '#ffffff' : '#111111' }]}
          onPress={() => router.push('/practice')}
        >
          <View>
            <Text style={[styles.bigBtnTitle, { color: isDark ? '#111111' : '#ffffff' }]}>Practice Questions</Text>
            <Text style={[styles.bigBtnDesc, { color: isDark ? '#111111' : '#ffffff', opacity: 0.5 }]}>
              {relevantQuestions.length} active questions
            </Text>
          </View>
          <ArrowIcon color={isDark ? '#111111' : '#ffffff'} />
        </TouchableOpacity>

        {/* Big light button — Mock Exam */}
        <TouchableOpacity
          style={[styles.bigBtnLight, { backgroundColor: c.card }]}
          onPress={() => router.push('/exam')}
        >
          <View>
            <Text style={[styles.bigBtnTitle, { color: c.textPrimary }]}>Mock Exam</Text>
            <Text style={[styles.bigBtnDesc, { color: c.textSecond }]}>
              {appConfig.examConfig.examQuestions} questions · {appConfig.examConfig.timeLimitMinutes} minutes
            </Text>
          </View>
          <ArrowIcon color={c.textPrimary} />
        </TouchableOpacity>

        {/* Premium card */}
        <TouchableOpacity
          style={[styles.premiumCard, { backgroundColor: c.card, borderColor: c.border }]}
          onPress={() => router.push('/subscription')}
        >
          <View style={styles.premiumIcon}>
            <Text style={{ fontSize: 14 }}>⭐</Text>
          </View>
          <View style={styles.premiumText}>
            <Text style={[styles.premiumTitle, { color: c.textPrimary }]}>Enjoying the app? Go ad-free</Text>
            <Text style={[styles.premiumSub, { color: c.textMuted }]}>All questions stay free, always</Text>
          </View>
          <Text style={[styles.premiumArrow, { color: c.textMuted }]}>›</Text>
        </TouchableOpacity>

        {/* Stats row */}
        <View style={[styles.statsRow, { borderTopColor: c.border }]}>
          <StatCell value={String(appConfig.examConfig.totalQuestions)} label="Total" c={c} />
          <StatCell value={String(appConfig.examConfig.examQuestions)} label="Exam" c={c} />
          <StatCell value={`${appConfig.examConfig.timeLimitMinutes}m`} label="Duration" c={c} />
          <StatCell value={String(appConfig.examConfig.passMark)} label="To Pass" c={c} />
        </View>

      </ScrollView>

      {/* State picker modal */}
      <Modal visible={stateModalOpen} transparent animationType="slide" onRequestClose={() => setStateModalOpen(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setStateModalOpen(false)}>
          <View style={[styles.modalSheet, { backgroundColor: c.bg }]}>
            <Text style={[styles.modalTitle, { color: c.textPrimary }]}>Select your Bundesland</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {GERMAN_STATES.map((state) => {
                const active = selectedStateCode === state.code
                return (
                  <TouchableOpacity
                    key={state.code}
                    style={[
                      styles.modalOption,
                      {
                        backgroundColor: active ? palette.primary : c.card,
                        borderColor: active ? palette.primary : c.border,
                      },
                    ]}
                    onPress={() => { setSelectedStateCode(state.code); setStateModalOpen(false) }}
                  >
                    <Text style={[styles.modalOptionText, { color: active ? '#fff' : c.textPrimary }]}>
                      {state.label}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <BottomNav active="home" />
    </SafeAreaView>
  )
}

function StatCell({ value, label, c }: { value: string; label: string; c: ReturnType<typeof useThemeColors>['c'] }) {
  return (
    <View style={styles.statCell}>
      <Text style={[styles.statVal, { color: c.textPrimary }]}>{value}</Text>
      <Text style={[styles.statLbl, { color: c.textMuted }]}>{label.toUpperCase()}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safe:       { flex: 1 },
  scroll:     { padding: spacing.lg, paddingBottom: spacing.xxl },
  topRow:     { flexDirection: 'row', justifyContent: 'flex-end', gap: 6, marginBottom: 32 },
  iconBtn:    { width: 32, height: 32, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  iconBtnText: { fontSize: 13 },

  centerBlock: { alignItems: 'center', marginBottom: 24 },
  flagEmoji:   { fontSize: 28, marginBottom: 10 },
  appName:     { fontSize: 24, fontWeight: '800', letterSpacing: -0.5, marginBottom: 6 },
  appDesc:     { fontSize: 13, lineHeight: 19, textAlign: 'center' },

  dropdownRow:   { alignItems: 'center', marginBottom: 28 },
  stateDropdown: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1.5, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 14, // uses c.border
  },
  ddPin:     { fontSize: 14 },
  ddText:    { fontSize: 14, fontWeight: '600' },
  ddChevron: { width: 16, height: 16, borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginLeft: 4 },

  bigBtnDark: {
    borderRadius: 16, padding: 20, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  bigBtnLight: {
    borderRadius: 16, padding: 20, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  bigBtnTitle: { fontSize: 17, fontWeight: '700' },
  bigBtnDesc:  { fontSize: 12, marginTop: 2 },

  premiumCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1.5, borderRadius: 12, padding: 12, marginBottom: 10,
  },
  premiumIcon: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#f59e0b', alignItems: 'center', justifyContent: 'center',
  },
  premiumText:  { flex: 1 },
  premiumTitle: { fontSize: 13, fontWeight: '700' },
  premiumSub:   { fontSize: 11 },
  premiumArrow: { fontSize: 18 },

  statsRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: 28, paddingTop: 20, borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 8,
  },
  statCell: { alignItems: 'center' },
  statVal:  { fontSize: 18, fontWeight: '800' },
  statLbl:  { fontSize: 9, fontWeight: '600', marginTop: 1 },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet:    { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '70%' },
  modalTitle:    { fontSize: 17, fontWeight: '800', marginBottom: 16 },
  modalOption:   { borderWidth: 1.5, borderRadius: 12, padding: 12, marginBottom: 8 },
  modalOptionText: { fontSize: 14, fontWeight: '600' },
})
```

- [ ] **Step 2: Verify theme keys used in the file**

Theme has: `bg`, `card`, `border`, `textPrimary`, `textSecond`, `textMuted` (dark also has `borderSub`).
There is no `textFaint` or `borderMed`. In the code written in Step 1, replace:
- `c.textMuted` → `c.textMuted`
- `c.border` → `c.border`

Open `app/index.tsx` and make those substitutions wherever they appear.

- [ ] **Step 3: Verify on simulator**

Open app. Home screen should show: flag + app name + tagline, state dropdown pill, two big buttons, premium card, stats row. No more radio filter list.

---

## Task 3 — Create Study Screen

**Files:**
- Create: `app/study/index.tsx` (replace the placeholder from Task 1)

**Behaviour:**
- Tapping a category row → launches `/practice/session` with `{ filter: 'category', category: cat.id, showTranslation: true, mode: 'practice', shuffle: false }`
- "Weak" card → launches session with `{ filter: 'weak', showTranslation: true }`
- "Bookmarked" card → launches session with `{ filter: 'bookmarked', showTranslation: true }`
- "Study All" button → launches session with `{ filter: 'all', showTranslation: true }`
- Shuffle icon (dark when active) → toggles `shuffle` on the launched session

**Stats to show (from `useProgressStore`):**
- Studied: count of questions with `attempts.length > 0`
- Accuracy: `(totalCorrect / totalAttempts * 100)%` across all questions
- Weak: `getWeakIds().length`
- Saved: `getBookmarked().length`

- [ ] **Step 1: Write `app/study/index.tsx`**

```tsx
import { useMemo, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Svg, Path, Line } from 'react-native-svg'
import { BottomNav } from '@/components/BottomNav'
import { useThemeColors } from '@/hooks/useThemeColors'
import { useProgressStore } from '@/store/useProgressStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { getRelevantQuestions, getStateQuestions } from '@/data/questionBank'
import { getStateLabel } from '@/data/states'
import { palette, spacing, radius, typography } from '@/theme'
import appConfig from '@/config/app.config'
import type { SessionConfig } from '@/types'

function ShuffleIcon({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M16 3h5v5" stroke={color} />
      <Path d="M4 20L21 3" stroke={color} />
      <Path d="M21 16v5h-5" stroke={color} />
      <Path d="M15 15l6 6" stroke={color} />
      <Path d="M4 4l5 5" stroke={color} />
    </Svg>
  )
}

export default function StudyScreen() {
  const router = useRouter()
  const { c, isDark } = useThemeColors()
  const { progress, getWeakIds, getBookmarked } = useProgressStore()
  const { selectedStateCode } = useSettingsStore()
  const [shuffle, setShuffle] = useState(false)

  const relevantQuestions = useMemo(() => getRelevantQuestions(selectedStateCode), [selectedStateCode])

  // Stats
  const studiedCount = useMemo(
    () => Object.values(progress).filter((p) => p.attempts.length > 0).length,
    [progress]
  )
  const accuracyPct = useMemo(() => {
    const allAttempts = Object.values(progress).flatMap((p) => p.attempts)
    if (allAttempts.length === 0) return 0
    const correct = allAttempts.filter((a) => a.result === 'correct').length
    return Math.round((correct / allAttempts.length) * 100)
  }, [progress])
  const weakCount = getWeakIds().length
  const savedCount = getBookmarked().length

  function launchSession(overrides: Partial<SessionConfig>) {
    const config: SessionConfig = {
      filter: 'all',
      category: null,
      count: relevantQuestions.length,
      shuffle,
      showTranslation: true,
      timed: false,
      mode: 'practice',
      ...overrides,
    }
    router.push({ pathname: '/practice/session', params: { config: JSON.stringify(config) } })
  }

  // Build category list: appConfig categories + state category if selected
  const categories = useMemo(() => {
    const cats: { id: string; label: string; emoji: string; count: number; weakCount: number }[] = []

    if (selectedStateCode) {
      const stateQs = getStateQuestions(selectedStateCode)
      const weakIds = new Set(getWeakIds())
      cats.push({
        id: selectedStateCode,
        label: getStateLabel(selectedStateCode) ?? selectedStateCode.toUpperCase(),
        emoji: '📍',
        count: stateQs.length,
        weakCount: stateQs.filter((q) => weakIds.has(q.id)).length,
      })
    }

    const weakIds = new Set(getWeakIds())
    for (const cat of appConfig.categories) {
      const qs = relevantQuestions.filter((q) => q.category === cat.id)
      cats.push({
        id: cat.id,
        label: cat.label,
        emoji: cat.emoji,
        count: qs.length,
        weakCount: qs.filter((q) => weakIds.has(q.id)).length,
      })
    }
    return cats
  }, [relevantQuestions, selectedStateCode, progress]) // eslint-disable-line

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatCard value={String(studiedCount)} label="Studied" valueColor={c.textPrimary} c={c} />
          <StatCard value={`${accuracyPct}%`} label="Accuracy" valueColor={palette.green} c={c} />
          <StatCard value={String(weakCount)} label="Weak" valueColor={weakCount > 0 ? palette.red : c.textPrimary} c={c} />
          <StatCard value={String(savedCount)} label="Saved" valueColor={c.textPrimary} c={c} />
        </View>

        {/* Weak + Bookmarked 2-col grid */}
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: c.bg, borderColor: c.border }]}
            onPress={() => launchSession({ filter: 'weak', count: weakCount })}
            disabled={weakCount === 0}
          >
            <Text style={[styles.acTitle, { color: c.textPrimary, opacity: weakCount === 0 ? 0.4 : 1 }]}>Weak</Text>
            <Text style={[styles.acSub, { color: c.textSecond }]}>{weakCount} questions</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: c.bg, borderColor: c.border }]}
            onPress={() => launchSession({ filter: 'bookmarked', count: savedCount })}
            disabled={savedCount === 0}
          >
            <Text style={[styles.acTitle, { color: c.textPrimary, opacity: savedCount === 0 ? 0.4 : 1 }]}>Bookmarked</Text>
            <Text style={[styles.acSub, { color: c.textSecond }]}>{savedCount} saved</Text>
          </TouchableOpacity>
        </View>

        {/* Category filter + shuffle row */}
        <View style={styles.filterRow}>
          <Text style={[typography.smallBd, { color: c.textPrimary }]}>All Categories</Text>
          <TouchableOpacity
            style={[
              styles.shuffleBtn,
              { backgroundColor: shuffle ? (isDark ? '#ffffff' : '#111111') : c.card, borderColor: c.border },
            ]}
            onPress={() => setShuffle((v) => !v)}
          >
            <ShuffleIcon color={shuffle ? (isDark ? '#111111' : '#ffffff') : c.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Section label */}
        <Text style={[styles.sectionLabel, { color: c.textMuted }]}>CATEGORIES</Text>

        {/* Category list */}
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.catItem, { backgroundColor: c.card }]}
            onPress={() => launchSession({ filter: 'category', category: cat.id, count: cat.count })}
          >
            <Text style={styles.catEmoji}>{cat.emoji}</Text>
            <View style={styles.catBody}>
              <Text style={[styles.catName, { color: c.textPrimary }]}>{cat.label}</Text>
              <Text style={[styles.catCount, { color: c.textMuted }]}>
                {cat.count} questions{cat.weakCount > 0 ? ` · ${cat.weakCount} weak` : ''}
              </Text>
            </View>
            <Text style={[styles.catArrow, { color: c.textMuted }]}>›</Text>
          </TouchableOpacity>
        ))}

        {/* Spacer for sticky bar */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Sticky "Study All" bar */}
      <View style={[styles.stickyBar, { backgroundColor: c.bg, borderTopColor: c.border }]}>
        <TouchableOpacity
          style={[styles.studyAllBtn, { backgroundColor: isDark ? '#ffffff' : '#111111' }]}
          onPress={() => launchSession({ filter: 'all', count: relevantQuestions.length })}
        >
          <Text style={[styles.studyAllText, { color: isDark ? '#111111' : '#ffffff' }]}>
            Study All · {relevantQuestions.length} Questions
          </Text>
        </TouchableOpacity>
      </View>

      <BottomNav active="study" />
    </SafeAreaView>
  )
}

function StatCard({
  value, label, valueColor, c,
}: {
  value: string
  label: string
  valueColor: string
  c: ReturnType<typeof useThemeColors>['c']
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: c.card }]}>
      <Text style={[styles.statVal, { color: valueColor }]}>{value}</Text>
      <Text style={[styles.statLbl, { color: c.textMuted }]}>{label.toUpperCase()}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safe:   { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: 24 },

  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statCard: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center' },
  statVal:  { fontSize: 20, fontWeight: '800' },
  statLbl:  { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', marginTop: 2 },

  actionGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  actionCard: {
    flex: 1, borderRadius: 14, padding: 16, borderWidth: 1.5,
  },
  acTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  acSub:   { fontSize: 11 },

  filterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  shuffleBtn: {
    width: 34, height: 34, borderRadius: 10, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },

  sectionLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },

  catItem: { borderRadius: 12, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  catEmoji: { fontSize: 16 },
  catBody: { flex: 1 },
  catName:  { fontSize: 13, fontWeight: '600' },
  catCount: { fontSize: 11, marginTop: 1 },
  catArrow: { fontSize: 18 },

  stickyBar: {
    paddingHorizontal: spacing.lg, paddingTop: 10, paddingBottom: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  studyAllBtn: { borderRadius: 14, padding: 14, alignItems: 'center' },
  studyAllText: { fontSize: 15, fontWeight: '700' },
})
```

- [ ] **Step 2: Verify on simulator**

Navigate to Study tab. Should see: 4 stat cards, Weak/Bookmarked grid, category list, sticky "Study All" button. Tapping a category should launch a session.

---

## Task 4 — Redesign Practice Screen

**Files:**
- Modify: `app/practice/index.tsx`

**What changes:**
- Replace radio filter list with same category-grid layout as Study screen
- Stats row: "Practiced" label (not "Studied")
- Sticky button: "Practice All · N Questions" (dark)
- Shuffle icon: starts inactive (light), activates dark
- Sessions launched with `showTranslation` from user's `translationLocale` setting (not forced `true`)

- [ ] **Step 1: Rewrite `app/practice/index.tsx`**

```tsx
import { useMemo, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Svg, Path } from 'react-native-svg'
import { BottomNav } from '@/components/BottomNav'
import { useThemeColors } from '@/hooks/useThemeColors'
import { useProgressStore } from '@/store/useProgressStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { getRelevantQuestions, getStateQuestions } from '@/data/questionBank'
import { getStateLabel } from '@/data/states'
import { palette, spacing, radius, typography } from '@/theme'
import appConfig from '@/config/app.config'
import type { SessionConfig } from '@/types'

function ShuffleIcon({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M16 3h5v5" stroke={color} />
      <Path d="M4 20L21 3" stroke={color} />
      <Path d="M21 16v5h-5" stroke={color} />
      <Path d="M15 15l6 6" stroke={color} />
      <Path d="M4 4l5 5" stroke={color} />
    </Svg>
  )
}

export default function PracticeScreen() {
  const router = useRouter()
  const { c, isDark } = useThemeColors()
  const { progress, getWeakIds, getBookmarked } = useProgressStore()
  const { selectedStateCode, translationLocale } = useSettingsStore()
  const [shuffle, setShuffle] = useState(false)

  const relevantQuestions = useMemo(() => getRelevantQuestions(selectedStateCode), [selectedStateCode])
  const showTranslation = translationLocale !== 'de'

  // Stats
  const practicedCount = useMemo(
    () => Object.values(progress).filter((p) => p.attempts.length > 0).length,
    [progress]
  )
  const accuracyPct = useMemo(() => {
    const allAttempts = Object.values(progress).flatMap((p) => p.attempts)
    if (allAttempts.length === 0) return 0
    const correct = allAttempts.filter((a) => a.result === 'correct').length
    return Math.round((correct / allAttempts.length) * 100)
  }, [progress])
  const weakCount = getWeakIds().length
  const savedCount = getBookmarked().length

  function launchSession(overrides: Partial<SessionConfig>) {
    const config: SessionConfig = {
      filter: 'all',
      category: null,
      count: relevantQuestions.length,
      shuffle,
      showTranslation,
      timed: false,
      mode: 'practice',
      ...overrides,
    }
    router.push({ pathname: '/practice/session', params: { config: JSON.stringify(config) } })
  }

  const categories = useMemo(() => {
    const cats: { id: string; label: string; emoji: string; count: number; weakCount: number }[] = []
    if (selectedStateCode) {
      const stateQs = getStateQuestions(selectedStateCode)
      const weakIds = new Set(getWeakIds())
      cats.push({
        id: selectedStateCode,
        label: getStateLabel(selectedStateCode) ?? selectedStateCode.toUpperCase(),
        emoji: '📍',
        count: stateQs.length,
        weakCount: stateQs.filter((q) => weakIds.has(q.id)).length,
      })
    }
    const weakIds = new Set(getWeakIds())
    for (const cat of appConfig.categories) {
      const qs = relevantQuestions.filter((q) => q.category === cat.id)
      cats.push({
        id: cat.id,
        label: cat.label,
        emoji: cat.emoji,
        count: qs.length,
        weakCount: qs.filter((q) => weakIds.has(q.id)).length,
      })
    }
    return cats
  }, [relevantQuestions, selectedStateCode, progress]) // eslint-disable-line

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatCard value={String(practicedCount)} label="Practiced" valueColor={c.textPrimary} c={c} />
          <StatCard value={`${accuracyPct}%`} label="Accuracy" valueColor={palette.green} c={c} />
          <StatCard value={String(weakCount)} label="Weak" valueColor={weakCount > 0 ? palette.red : c.textPrimary} c={c} />
          <StatCard value={String(savedCount)} label="Saved" valueColor={c.textPrimary} c={c} />
        </View>

        {/* Weak + Bookmarked grid */}
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: c.bg, borderColor: c.border }]}
            onPress={() => launchSession({ filter: 'weak', count: weakCount, showTranslation })}
            disabled={weakCount === 0}
          >
            <Text style={[styles.acTitle, { color: c.textPrimary, opacity: weakCount === 0 ? 0.4 : 1 }]}>Weak</Text>
            <Text style={[styles.acSub, { color: c.textSecond }]}>{weakCount} questions</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: c.bg, borderColor: c.border }]}
            onPress={() => launchSession({ filter: 'bookmarked', count: savedCount, showTranslation })}
            disabled={savedCount === 0}
          >
            <Text style={[styles.acTitle, { color: c.textPrimary, opacity: savedCount === 0 ? 0.4 : 1 }]}>Bookmarked</Text>
            <Text style={[styles.acSub, { color: c.textSecond }]}>{savedCount} saved</Text>
          </TouchableOpacity>
        </View>

        {/* Category filter + shuffle */}
        <View style={styles.filterRow}>
          <Text style={[typography.smallBd, { color: c.textPrimary }]}>All Categories</Text>
          <TouchableOpacity
            style={[
              styles.shuffleBtn,
              { backgroundColor: isDark ? c.card : c.card, borderColor: c.border },
            ]}
            onPress={() => setShuffle((v) => !v)}
          >
            <ShuffleIcon color={shuffle ? c.textPrimary : c.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionLabel, { color: c.textMuted }]}>CATEGORIES</Text>

        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.catItem, { backgroundColor: c.card }]}
            onPress={() => launchSession({ filter: 'category', category: cat.id, count: cat.count, showTranslation })}
          >
            <Text style={styles.catEmoji}>{cat.emoji}</Text>
            <View style={styles.catBody}>
              <Text style={[styles.catName, { color: c.textPrimary }]}>{cat.label}</Text>
              <Text style={[styles.catCount, { color: c.textMuted }]}>
                {cat.count} questions{cat.weakCount > 0 ? ` · ${cat.weakCount} weak` : ''}
              </Text>
            </View>
            <Text style={[styles.catArrow, { color: c.textMuted }]}>›</Text>
          </TouchableOpacity>
        ))}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Sticky "Practice All" bar */}
      <View style={[styles.stickyBar, { backgroundColor: c.bg, borderTopColor: c.border }]}>
        <TouchableOpacity
          style={[styles.practiceAllBtn, { backgroundColor: c.card, borderColor: c.border }]}
          onPress={() => launchSession({ filter: 'all', count: relevantQuestions.length, showTranslation })}
        >
          <Text style={[styles.practiceAllText, { color: c.textPrimary }]}>
            Practice All · {relevantQuestions.length} Questions
          </Text>
        </TouchableOpacity>
      </View>

      <BottomNav active="practice" />
    </SafeAreaView>
  )
}

function StatCard({
  value, label, valueColor, c,
}: {
  value: string
  label: string
  valueColor: string
  c: ReturnType<typeof useThemeColors>['c']
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: c.card }]}>
      <Text style={[styles.statVal, { color: valueColor }]}>{value}</Text>
      <Text style={[styles.statLbl, { color: c.textMuted }]}>{label.toUpperCase()}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safe:   { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: 24 },

  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statCard: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center' },
  statVal:  { fontSize: 20, fontWeight: '800' },
  statLbl:  { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', marginTop: 2 },

  actionGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  actionCard: { flex: 1, borderRadius: 14, padding: 16, borderWidth: 1.5 },
  acTitle:    { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  acSub:      { fontSize: 11 },

  filterRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  shuffleBtn: {
    width: 34, height: 34, borderRadius: 10, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },

  sectionLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },

  catItem:  { borderRadius: 12, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  catEmoji: { fontSize: 16 },
  catBody:  { flex: 1 },
  catName:  { fontSize: 13, fontWeight: '600' },
  catCount: { fontSize: 11, marginTop: 1 },
  catArrow: { fontSize: 18 },

  stickyBar: {
    paddingHorizontal: spacing.lg, paddingTop: 10, paddingBottom: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  practiceAllBtn: {
    borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1.5,
  },
  practiceAllText: { fontSize: 15, fontWeight: '700' },
})
```

- [ ] **Step 2: Verify on simulator**

Navigate to Practice tab. Should see: 4 stat cards, Weak/Bookmarked grid, category list, sticky "Practice All" button. Tapping a category launches a session. Shuffle icon toggles.

---

## Notes for Future Reference

- `app/questions/index.tsx` and `app/questions/[id].tsx` still exist as valid routes. They can be removed in a future cleanup pass if no longer linked anywhere.
- `app/language.tsx` is still reachable from the 🌐 button on Home.
- The `AppHeader` component is no longer used on Home/Study/Practice — can be removed in a future cleanup pass.
- RevenueCat integration in `app/subscription.tsx` is stubbed — wire up in a separate task after store accounts are created.
- AdMob interstitial (after exam finish) is not yet implemented — add in a separate task.
