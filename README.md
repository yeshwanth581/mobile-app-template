# Exam App Platform Boilerplate

A reusable, scalable system to build, publish, monetize, and grow exam-preparation apps.

**First app:** Leben in Deutschland (German citizenship test)

**Future apps:** German Driving Theory, UK Citizenship, Canada Citizenship, and more.

**Core idea:** Build the engine once, keep UX simple, swap branding and content, monetize with ads + premium, publish fast, scale slowly and safely.

## Run

```bash
npm install
npx expo start
```

Open the project in Expo Go on iOS or Android.

---

## Table of Contents

1. [Architecture Philosophy](#1-architecture-philosophy)
2. [Building Blocks](#2-building-blocks)
3. [Current Project Structure](#3-current-project-structure)
4. [Target Project Structure](#4-target-project-structure)
5. [Data Models](#5-data-models)
6. [Feature Flags](#6-feature-flags)
7. [UX Rules](#7-ux-rules)
8. [Authentication Plan](#8-authentication-plan)
9. [Content Strategy](#9-content-strategy)
10. [Monetization Strategy](#10-monetization-strategy)
11. [Ad Monetization Rules](#11-ad-monetization-rules)
12. [Analytics Plan](#12-analytics-plan)
13. [API Key Security](#13-api-key-security)
14. [Image and Asset Hosting](#14-image-and-asset-hosting)
15. [Code Review — Current State](#15-code-review--current-state)
16. [Known Issues](#16-known-issues)
17. [Master Execution Plan](#17-master-execution-plan)
18. [App Store Publishing](#18-app-store-publishing)
19. [Budget Plan](#19-budget-plan)
20. [Scaling to Next Apps](#20-scaling-to-next-apps)
21. [Business Reality](#21-business-reality)
22. [Simple Rulebook](#22-simple-rulebook)
23. [Timeline](#23-timeline)

---

## 1. Architecture Philosophy

What stays the same across ALL apps:
- Navigation structure
- Quiz flow, exam flow, results flow
- Bookmarks, progress tracking, streaks
- Settings and profile screens
- Auth flow (guest-first)
- Paywall flow
- Ads logic
- Analytics events
- Release process

What changes per app:
- App name, colors, icons
- Question bank and exam metadata
- Store screenshots and descriptions
- Package IDs / bundle IDs
- Feature flags (if needed)

---

## 2. Building Blocks

Think of this app like LEGO blocks.

### Block 1: Core Engine (Reusable)
Navigation, quiz logic, mock exam logic, results, mistakes review, bookmarks, settings, profile, paywall hooks, ads hooks, analytics hooks, auth hooks.

### Block 2: App Config (Swap per app)
App name, tagline, package name, theme colors, supported languages, exam rules, enabled features, ad settings, paywall product mapping.

### Block 3: Content (Swap per app)
Exam metadata, questions, options, correct answers, explanations, category info, region info, image references, content version.

### Block 4: Services (Shared infrastructure)
Supabase (auth + optional DB + storage), RevenueCat (purchases), AdMob (ads), analytics/crash reporting, Expo EAS (builds and publishing).

---

## 3. Current Project Structure

```
/app                     — Expo Router screens
  _layout.tsx            — Root layout, theme, status bar
  index.tsx              — Home screen
  exam.tsx               — Timed mock exam
  results.tsx            — Score + pass/fail
  language.tsx           — Language picker modal
  subscription.tsx       — Paywall modal
  practice/
    index.tsx            — Practice config (filters, shuffle)
    session.tsx          — Practice quiz session
  questions/
    index.tsx            — Question bank browser
    [id].tsx             — Single question detail

/src
  /components            — AdBanner, AppHeader, BottomNav, OptionButton, ProgressBar, QuestionCard, QuestionJumpPicker
  /config
    app.config.ts        — Single config file to swap per app
  /data
    questions.ts         — Full question bank (~460 questions)
    questionBank.ts      — Query helpers (by state, category, etc.)
    questionImages.ts    — Static image require() map
    states.ts            — German state codes + labels
  /hooks
    useQuizSession.ts    — Core quiz logic (practice + exam modes)
    useThemeColors.ts    — Theme color derivation hook
  /i18n
    index.ts             — i18next initialization
    locales/en.ts        — English UI strings
    locales/de.ts        — German UI strings
  /store
    useProgressStore.ts  — Per-question progress, bookmarks, sessions, streaks
    useSettingsStore.ts  — Theme, locale, state, subscription status, onboarding
  /theme
    index.ts             — Colors, spacing, radius, typography tokens
  /types
    index.ts             — All TypeScript interfaces
```

---

## 4. Target Project Structure

After Phase A (foundation cleanup), the structure evolves to:

```
/app                           — Expo Router screens (unchanged)

/src
  /components                  — Reusable UI components (unchanged)
  /config
    app.config.ts              — App identity + exam rules + feature flags
    monetization.config.ts     — Ad settings + paywall product mapping
  /content
    /leben_in_deutschland      — Content pack for first app
      metadata.ts              — Exam name, rules, regions
      questions.ts             — Question bank
      regions.ts               — State/region codes + labels
      assets/                  — Question images
    /germany_driving           — Content pack for next app (added later)
      ...
  /hooks                       — Shared hooks (unchanged)
  /i18n                        — Translations (unchanged)
  /services
    supabase.ts                — Auth + optional DB client (added in Phase B)
    revenuecat.ts              — Purchase logic (added in Phase C)
    admob.ts                   — Ad manager + interstitial logic (added in Phase C)
    analytics.ts               — Event tracking (added in Phase C)
  /store                       — Zustand stores (unchanged)
  /theme                       — Design tokens (unchanged)
  /types
    index.ts                   — All TypeScript interfaces
```

**Key principle:** Don't create 20 empty folders upfront. Add folders as features are built. The current flat structure works fine for a ~15-file app. Only split into `content/` and `services/` during Phase A.

---

## 5. Data Models

### Question (Updated)

Current `Question` type is close but needs `examId`, `tags`, and `version` for multi-app support. Also split the overloaded `category` field into `topicCategory` + `regionCategory`.

```typescript
export type Question = {
  id: string
  examId: string                    // NEW: "leben_in_deutschland", "germany_driving"
  language: string                  // NEW: "de", "en" — original language
  question: string
  options: string[]
  correctAnswerIndex: number        // RENAMED from "correct"
  explanation?: string
  topicCategory?: string            // NEW: "politik", "recht", "geschichte" (was: category)
  regionCategory?: string           // NEW: "be", "bw", "ontario" (was: category)
  difficulty?: "easy" | "medium" | "hard"
  tags?: string[]                   // NEW: optional search/filter labels
  imageUrl?: string                 // RENAMED from "image"
  source?: string
  version: string                   // NEW: content version tracking
  translations: Partial<Record<string, QuestionTranslation>>
}
```

### ExamConfig (Updated)

```typescript
export type ExamConfig = {
  id: string                        // NEW: "leben_in_deutschland"
  name: string                      // NEW: "Leben in Deutschland"
  shortName: string                 // NEW: "LiD Test"
  languageCodes: string[]           // NEW: ["de", "en"]
  totalQuestionCount: number
  mockExamQuestionCount: number     // RENAMED from "examQuestions"
  mockExamGeneralCount: number      // NEW: configurable pool split (was hardcoded 30)
  mockExamRegionCount: number       // NEW: configurable pool split (was hardcoded 3)
  passingScorePercent: number       // RENAMED from "passMark" — now percentage
  timeLimitMinutes: number
}
```

### Feature Flags (New)

```typescript
export type FeatureFlags = {
  guestMode: boolean                // allow usage without login
  bookmarks: boolean                // enable bookmark feature
  mistakesReview: boolean           // enable "review wrong answers"
  mockExam: boolean                 // enable mock exam mode
  premiumExplanations: boolean      // gate explanations behind premium
  rewardedAds: boolean              // enable rewarded ad unlocks
  bannerAds: boolean                // enable banner ads
  interstitialAds: boolean          // enable interstitial ads
  streaks: boolean                  // enable streak tracking
  regionQuestions: boolean          // enable region/state filtering
}
```

### User Progress

```typescript
export type UserProgress = {
  userId: string                    // "local" for guest, Supabase ID for logged-in
  examId: string
  totalAnswered: number
  correctAnswered: number
  streak: number
  lastActiveAt: string              // ISO date
}
```

**Why the changes matter:** Splitting `category` into `topicCategory` + `regionCategory` fixes the current overloading problem. Adding `examId` makes multi-exam support trivial. Feature flags let you toggle features per app without code changes.

---

## 6. Feature Flags

Feature flags live in `app.config.ts` alongside other config. They control what features are enabled per app.

**Default flags for Leben in Deutschland:**
```typescript
featureFlags: {
  guestMode: true,
  bookmarks: true,
  mistakesReview: true,
  mockExam: true,
  premiumExplanations: false,   // all explanations free for now
  rewardedAds: false,           // add in v2
  bannerAds: true,
  interstitialAds: true,
  streaks: true,
  regionQuestions: true,        // German states
}
```

**Example for a simpler app (UK Citizenship):**
```typescript
featureFlags: {
  guestMode: true,
  bookmarks: true,
  mistakesReview: true,
  mockExam: true,
  premiumExplanations: true,    // gate explanations behind premium
  rewardedAds: true,            // watch ad to unlock explanation
  bannerAds: true,
  interstitialAds: true,
  streaks: true,
  regionQuestions: false,        // no regions for UK test
}
```

---

## 7. UX Rules

Users are usually nervous and just want to pass the exam. The UX should feel calm, simple, and obvious.

**Reference mockups:** `mockups/final.html` — open in browser, toggle dark mode with button at top-right. All screens are organized in labeled rows.

### Principles
- One main action per screen
- Large buttons, simple wording
- Fast loading, no clutter
- Clear progress indicators
- Consistent layout across all apps — don't redesign every time
- Minimize custom UI — use native OS pickers for dropdowns (Bundesland, question jump)
- All icons are SVG stroke icons (no emoji) — uniform style across nav, bookmarks, translate, theme

### Performance — App Must Feel Instant

The app must be fast and responsive. Every tap should feel immediate. Users are stressed about their exam — a laggy app makes them leave.

**Rules:**
- **Zero perceptible delay on navigation.** Screen transitions must be instant. No spinners between screens. Preload data before user needs it.
- **Tap feedback within 16ms.** Use `TouchableOpacity` (not `TouchableHighlight`) with `activeOpacity: 0.7`. Add haptic feedback on answer selection.
- **Question data loads synchronously.** All questions are bundled in the app (not fetched from API). There is no loading state for questions — they appear instantly.
- **No layout shifts.** Screens must not jump/reflow after rendering. Use fixed heights for cards, pre-calculate content dimensions where possible.
- **Ads must not block interaction.** Banner ads load asynchronously — show a placeholder (same height) while loading so the layout doesn't shift. If ad fails to load, collapse the space. Never block UI waiting for an ad.
- **Interstitial ads preload in background.** Call `InterstitialAd.load()` early (after 2nd session). When it's time to show, it appears instantly — no "loading ad..." delay.
- **Rewarded ads preload after 2nd exam.** Same principle — preload before the gate is hit.
- **Store reads are cached.** Zustand stores use AsyncStorage persistence — reads are from memory after first load. Never re-read from disk on every screen mount.
- **FlatList for long lists.** Category lists and question lists use `FlatList` (not `ScrollView` with `.map()`) for virtualized rendering. Prevents jank on 300+ items.
- **Avoid re-renders.** Use `React.memo` on list items, `useCallback` on handlers passed to lists. Profile with React DevTools if any screen feels slow.
- **Images lazy-load.** Question images use `<Image>` with a fixed container height. Show grey placeholder while loading. Use `resizeMode="contain"`.
- **App cold start < 2 seconds.** Minimize work in `_layout.tsx`. Defer analytics init, ad preload, and RevenueCat check to after first paint.

### Shared Components (Code Reuse)

**Study and Practice share the same layout component** — swap a `mode` prop to change labels. Layout from top to bottom:
1. Stats row (4 cards: Studied/Practiced, Accuracy, Weak, Saved)
2. Weak + Bookmarked (two cards in a row)
3. Category dropdown (left) + Shuffle toggle (right) — same row
4. Categories list (each row: emoji + name + count + weak count + arrow)
5. Sticky bottom: full-width "Study All / Practice All" CTA button

**Single-question view is one shared component** used by Study, Practice, Exam, and Review. Only the header context changes:

| Mode | Header left | Header center | Header right | Shows translation | Shows bookmark | Shows banner ad |
|------|------------|---------------|-------------|-------------------|---------------|----------------|
| Study | ← back | Q dropdown | Translate toggle | Yes (if toggled) | Yes (on question row) | Yes |
| Practice | ← back | Q dropdown | Translate toggle | Yes (if toggled) | Yes (on question row) | Yes |
| Exam | ✕ close | Q dropdown | Timer badge | No (never) | No | No |
| Review | ← back | Q dropdown | "6 wrong" badge | No | No | No |

**Question view layout (fixed top + scrollable middle + fixed bottom):**
```
┌─────────────────────────────┐
│ [←] [Q 5/120 ▾] [translate]│ ← fixed header
│ Category · 4%  ████░░░░░   │ ← fixed progress
├─────────────────────────────┤
│ Question 5                🔖│ ← scrollable
│ German question text...     │
│ English translation...      │
│ ┌──────────────────────────┐│
│ │     [Question Image]     ││ ← optional, scrollable
│ └──────────────────────────┘│
│ [A] Answer option text      │
│ [B] Answer option text      │
│ [C] Answer option text      │
│ [D] Answer option text      │
│ ● 3 correct ● 1 wrong      │
├─────────────────────────────┤
│ [Ad Banner] Remove ads      │ ← fixed (not in exam/review)
│ [← Previous]  [Next →]     │ ← fixed
└─────────────────────────────┘
```

The middle section uses `ScrollView` — handles long questions, images, and long answer options. Ad banner and nav buttons are outside the scroll, always visible.

### Screen Inventory

| Screen | Layout | Nav bar | Notes |
|--------|--------|---------|-------|
| Home | Centered: flag, title, tagline, Bundesland dropdown, 2 big CTA buttons, premium card, stats strip | Yes (4 tabs) | Translation + theme icons top-right |
| Study | Shared list component (`mode="study"`) | Yes | Stats, Weak/Bookmarked cards, category dropdown + shuffle, categories list, sticky CTA |
| Practice | Shared list component (`mode="practice"`) | Yes | Identical to Study, different labels |
| Study → Question | Shared question view (`mode="study"`) | No | Translate toggle, bookmark, banner ad, prev/next |
| Practice → Question | Shared question view (`mode="practice"`) | No | Translate toggle, bookmark, banner ad, prev/next |
| Exam | Shared question view (`mode="exam"`) | No | Timer, no translate, no bookmark, no ads, "Submit" on last Q |
| Result (Pass) | Centered: green check, score, %, time, threshold | No | Review Wrong Answers + Retry + Back to Home |
| Result (Fail) | Centered: red X, score, %, time, threshold | No | Review Wrong Answers + Retry + Back to Home |
| Review Wrong | Shared question view (`mode="review"`) | No | Only wrong answers, red progress bar, no ads |
| Paywall | Modal: star icon, features, pricing cards, subscribe CTA | No | Triggered from home card or "Remove ads" link |

### Icons

All icons are SVG, using `stroke="currentColor"` or `fill="currentColor"` to respond to theme:
- **Nav bar:** Home (house), Study (person reading book), Practice (clipboard + checkmarks), Exam (clipboard + stopwatch)
- **Bookmark:** Ribbon/flag SVG — filled when active, outline when inactive
- **Translate:** FontAwesome `language` solid icon (SVG path) — `fill` based
- **Theme:** Sun icon (shown in dark mode) / Moon icon (shown in light mode) — `stroke` based
- **Arrows:** SVG arrow-right with `stroke-width: 3` for bold appearance

### Translation Behavior

There are two independent language layers:

**1. UI language (buttons, nav labels, headings, section titles):**
- Controlled by the locale setting (DE default, EN selectable)
- When EN is selected: all UI chrome switches to English — nav labels ("Home", "Study", "Practice", "Exam"), button text ("Practice All", "Mock Exam", "Next", "Previous"), section titles ("Categories", "Weak", "Bookmarked"), stats labels, etc.
- When DE is selected: all UI chrome is in German — "Startseite", "Lernen", "Üben", "Prüfung", etc.
- This uses `i18next` with `t()` function — all strings come from `src/i18n/locales/en.ts` or `de.ts`

**2. Question content (question text + answer options):**
- Questions are always shown in German (DE) — this is the real exam language
- When user selects EN locale AND toggles the translate icon ON: English translation appears **below** each German text as a secondary line (smaller, italic, muted color)
- The translate toggle icon in the question view header controls this per session
- German text is never replaced — English is a helper underneath
- Layout: `German text` → `English text (italic, muted)` for both question and each option

**3. Exam mode — no translations:**
- No translate toggle shown in header
- No English text shown regardless of locale setting
- The real exam is in German — we simulate that exactly

**Example when locale = EN:**
- Nav labels: "Home", "Study", "Practice", "Exam" (English)
- Buttons: "Practice All · 310 Questions", "Mock Exam" (English)
- Question text: German primary + English below (if translate toggled on)
- Exam: German only, no English anywhere

### Theme System

Two themes: light and dark. Controlled via CSS variables / design tokens:
- Light: white phone bg, `#f8f8f8` cards, `#111` text, `#111` primary buttons
- Dark: `#050505` phone bg, `#1a1a1a` cards, `#fff` text, `#fff` primary buttons (inverted)
- Green/red status colors stay the same, with dark-safe background variants

For each new app, change only:
- `primaryColor` in `app.config.ts`
- App icon and splash screen
- Do NOT redesign the whole UI

### SVG Assets Reference

All SVG icons and app icon concepts used in the app. Copy-paste ready.

#### Navigation Icons

**Home:**
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M8 26L32 6l24 20v28a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3V26z"/>
  <path d="M24 57V37h16v20"/>
</svg>
```

**Study (person reading book):**
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="32" cy="14" r="8"/>
  <path d="M27 10c3-3 7-3 10 0"/>
  <path d="M18 38c0-8 6-14 14-14s14 6 14 14"/>
  <path d="M14 40c0 0 6-3 18-3v18c-12 0-18 3-18 3V40z"/>
  <path d="M50 40c0 0-6-3-18-3v18c12 0 18 3 18 3V40z"/>
  <line x1="32" y1="37" x2="32" y2="55"/>
  <path d="M18 38l-4 2"/>
  <path d="M46 38l4 2"/>
</svg>
```

**Practice (clipboard + checkmarks):**
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M22 12H16a5 5 0 0 0-5 5v34a5 5 0 0 0 5 5h32a5 5 0 0 0 5-5V17a5 5 0 0 0-5-5h-6"/>
  <rect x="22" y="5" width="20" height="10" rx="3"/>
  <path d="M19 28l4 4 7-7"/>
  <line x1="36" y1="27" x2="46" y2="27"/>
  <path d="M19 42l4 4 7-7"/>
  <line x1="36" y1="41" x2="46" y2="41"/>
</svg>
```

**Exam (clipboard + stopwatch):**
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="60" cy="18" r="13" fill="white"/>
  <circle cx="60" cy="18" r="1.5" fill="currentColor"/>
  <line x1="60" y1="9" x2="60" y2="18"/>
  <line x1="60" y1="18" x2="66" y2="22"/>
  <line x1="60" y1="6.5" x2="60" y2="8"/>
  <line x1="60" y1="28" x2="60" y2="29.5"/>
  <line x1="48.5" y1="18" x2="50" y2="18"/>
  <line x1="70" y1="18" x2="71.5" y2="18"/>
  <rect x="58" y="1" width="4" height="4" rx="1" fill="white"/>
  <line x1="60" y1="5" x2="60" y2="3"/>
  <path d="M70 9l3-2.5"/>
  <rect x="12" y="16" width="40" height="52" rx="3" fill="white"/>
  <rect x="6" y="11" width="40" height="52" rx="3" fill="white"/>
  <path d="M19 11v-2a4 4 0 0 1 8 0v2" fill="white"/>
  <rect x="17" y="7" width="12" height="7" rx="2.5" fill="white"/>
  <circle cx="15" cy="26" r="3.5"/>
  <path d="M13.2 26l1.8 2 3.5-3.5"/>
  <line x1="23" y1="25" x2="40" y2="25"/>
  <line x1="23" y1="29" x2="35" y2="29"/>
  <circle cx="15" cy="39" r="3.5"/>
  <path d="M13.2 39l1.8 2 3.5-3.5"/>
  <line x1="23" y1="38" x2="40" y2="38"/>
  <line x1="23" y1="42" x2="35" y2="42"/>
  <circle cx="15" cy="52" r="3.5"/>
  <path d="M13.2 52l1.8 2 3.5-3.5"/>
  <line x1="23" y1="51" x2="40" y2="51"/>
  <line x1="23" y1="55" x2="35" y2="55"/>
</svg>
```

**Bookmark:**
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M14 6h36a3 3 0 0 1 3 3v49l-21-14-21 14V9a3 3 0 0 1 3-3z"/>
</svg>
```

**Translate (FontAwesome language solid):**
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor">
  <path d="M192 64C209.7 64 224 78.3 224 96L224 128L352 128C369.7 128 384 142.3 384 160C384 177.7 369.7 192 352 192L342.4 192L334 215.1C317.6 260.3 292.9 301.6 261.8 337.1C276 345.9 290.8 353.7 306.2 360.6L356.6 383L418.8 243C423.9 231.4 435.4 224 448 224C460.6 224 472.1 231.4 477.2 243L605.2 531C612.4 547.2 605.1 566.1 589 573.2C572.9 580.3 553.9 573.1 546.8 557L526.8 512L369.3 512L349.3 557C342.1 573.2 323.2 580.4 307.1 573.2C291 566 283.7 547.1 290.9 531L330.7 441.5L280.3 419.1C257.3 408.9 235.3 396.7 214.5 382.7C193.2 399.9 169.9 414.9 145 427.4L110.3 444.6C94.5 452.5 75.3 446.1 67.4 430.3C59.5 414.5 65.9 395.3 81.7 387.4L116.2 370.1C132.5 361.9 148 352.4 162.6 341.8C148.8 329.1 135.8 315.4 123.7 300.9L113.6 288.7C102.3 275.1 104.1 254.9 117.7 243.6C131.3 232.3 151.5 234.1 162.8 247.7L173 259.9C184.5 273.8 197.1 286.7 210.4 298.6C237.9 268.2 259.6 232.5 273.9 193.2L274.4 192L64.1 192C46.3 192 32 177.7 32 160C32 142.3 46.3 128 64 128L160 128L160 96C160 78.3 174.3 64 192 64zM448 334.8L397.7 448L498.3 448L448 334.8z"/>
</svg>
```

#### App Icon Concepts

**icon-leben-dark.svg (selected):**
```xml
<svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" rx="224" fill="#111111"/>
  <text x="512" y="200" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="140" font-weight="900" fill="#FFFFFF" letter-spacing="18">LEBEN</text>
  <defs>
    <clipPath id="shieldD">
      <path d="M512 270L740 360V560C740 720 640 852 512 900C384 852 284 720 284 560V360L512 270Z"/>
    </clipPath>
  </defs>
  <g clip-path="url(#shieldD)">
    <rect x="274" y="270" width="476" height="216" fill="#333333"/>
    <rect x="274" y="486" width="476" height="216" fill="#DD0000"/>
    <rect x="274" y="702" width="476" height="216" fill="#FFCC00"/>
  </g>
  <path d="M512 270L740 360V560C740 720 640 852 512 900C384 852 284 720 284 560V360L512 270Z" stroke="#FFFFFF" stroke-width="10" stroke-opacity="0.4"/>
  <circle cx="512" cy="700" r="100" fill="#1F7A4D"/>
  <path d="M462 700L497 735L567 665" stroke="#FFFFFF" stroke-width="32" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="512" y="978" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="700" fill="#FFFFFF">in Deutschland</text>
</svg>
```

**icon-leben-green.svg:**
```xml
<svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" rx="224" fill="#1F7A4D"/>
  <text x="512" y="200" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="140" font-weight="900" fill="#FFFFFF" letter-spacing="18">LEBEN</text>
  <defs>
    <clipPath id="shield">
      <path d="M512 270L740 360V560C740 720 640 852 512 900C384 852 284 720 284 560V360L512 270Z"/>
    </clipPath>
  </defs>
  <g clip-path="url(#shield)">
    <rect x="274" y="270" width="476" height="216" fill="#111111"/>
    <rect x="274" y="486" width="476" height="216" fill="#DD0000"/>
    <rect x="274" y="702" width="476" height="216" fill="#FFCC00"/>
  </g>
  <path d="M512 270L740 360V560C740 720 640 852 512 900C384 852 284 720 284 560V360L512 270Z" stroke="#FFFFFF" stroke-width="8" stroke-opacity="0.2"/>
  <circle cx="512" cy="700" r="100" fill="#1F7A4D"/>
  <circle cx="512" cy="700" r="100" stroke="#FFFFFF" stroke-width="6"/>
  <path d="M462 700L497 735L567 665" stroke="#FFFFFF" stroke-width="32" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="512" y="978" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="700" fill="#FFFFFF" fill-opacity="0.5">in Deutschland</text>
</svg>
```

**icon-leben-white.svg:**
```xml
<svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" rx="224" fill="#FFFFFF"/>
  <text x="512" y="200" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="140" font-weight="900" fill="#111111" letter-spacing="18">LEBEN</text>
  <defs>
    <clipPath id="shieldW">
      <path d="M512 270L740 360V560C740 720 640 852 512 900C384 852 284 720 284 560V360L512 270Z"/>
    </clipPath>
  </defs>
  <g clip-path="url(#shieldW)">
    <rect x="274" y="270" width="476" height="216" fill="#111111"/>
    <rect x="274" y="486" width="476" height="216" fill="#DD0000"/>
    <rect x="274" y="702" width="476" height="216" fill="#FFCC00"/>
  </g>
  <path d="M512 270L740 360V560C740 720 640 852 512 900C384 852 284 720 284 560V360L512 270Z" stroke="#E0E0E0" stroke-width="6"/>
  <circle cx="512" cy="700" r="100" fill="#1F7A4D"/>
  <path d="M462 700L497 735L567 665" stroke="#FFFFFF" stroke-width="32" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="512" y="978" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="700" fill="#AAAAAA">in Deutschland</text>
</svg>
```

**icon-leben-cream.svg:**
```xml
<svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" rx="224" fill="#F5F0E8"/>
  <text x="512" y="200" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="140" font-weight="900" fill="#111111" letter-spacing="18">LEBEN</text>
  <defs>
    <clipPath id="shieldC">
      <path d="M512 270L740 360V560C740 720 640 852 512 900C384 852 284 720 284 560V360L512 270Z"/>
    </clipPath>
  </defs>
  <g clip-path="url(#shieldC)">
    <rect x="274" y="270" width="476" height="216" fill="#111111"/>
    <rect x="274" y="486" width="476" height="216" fill="#DD0000"/>
    <rect x="274" y="702" width="476" height="216" fill="#FFCC00"/>
  </g>
  <path d="M512 270L740 360V560C740 720 640 852 512 900C384 852 284 720 284 560V360L512 270Z" stroke="#D8D0C4" stroke-width="6"/>
  <circle cx="512" cy="700" r="100" fill="#1F7A4D"/>
  <path d="M462 700L497 735L567 665" stroke="#FFFFFF" stroke-width="32" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="512" y="978" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="700" fill="#B0A898">in Deutschland</text>
</svg>
```

**icon-leben-clean.svg (no subtitle):**
```xml
<svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" rx="224" fill="#1F7A4D"/>
  <text x="512" y="196" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="148" font-weight="900" fill="#FFFFFF" letter-spacing="20">LEBEN</text>
  <defs>
    <clipPath id="shieldClean">
      <path d="M512 260L760 358V580C760 752 652 892 512 944C372 892 264 752 264 580V358L512 260Z"/>
    </clipPath>
  </defs>
  <g clip-path="url(#shieldClean)">
    <rect x="254" y="260" width="516" height="232" fill="#111111"/>
    <rect x="254" y="492" width="516" height="232" fill="#DD0000"/>
    <rect x="254" y="724" width="516" height="232" fill="#FFCC00"/>
  </g>
  <path d="M512 260L760 358V580C760 752 652 892 512 944C372 892 264 752 264 580V358L512 260Z" stroke="#FFFFFF" stroke-width="8" stroke-opacity="0.15"/>
  <circle cx="512" cy="716" r="108" fill="#1F7A4D"/>
  <circle cx="512" cy="716" r="108" stroke="#FFFFFF" stroke-width="8"/>
  <path d="M458 716L496 754L570 680" stroke="#FFFFFF" stroke-width="36" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

---

## 8. Authentication Plan

### Strategy: Guest-First

Do NOT force login on first open. Use this flow:

1. User opens app → can practice immediately as guest
2. All progress saved locally via AsyncStorage
3. Login prompted ONLY when user wants:
   - Cloud sync / backup
   - Restore premium purchase
   - Bookmarks across devices
   - Exam history

### Implementation (Phase B)

**Use Supabase Auth.**

Why: Good for solo developers, simple auth, simple DB, simple storage, free tier is generous (50K MAU).

**Launch auth methods:**
- Email OTP / magic link (simplest, no password management)

**Add later:**
- Google login
- Apple login (required by Apple if you offer any social login)

### Supabase Tables (Start Small)

**Phase B (launch):**
- `profiles` — basic user info
- `user_progress` — synced progress per exam

**Phase B+ (add only when needed):**
- `user_bookmarks` — cloud bookmark sync
- `exam_catalog` — if you need server-managed exam metadata
- `content_versions` — if you need remote content updates
- `user_entitlements_cache` — RevenueCat entitlement backup

**Do NOT create all 8 tables upfront.** Add tables one at a time as features demand them.

### Security Rules
- Use only public `anon` key in app
- NEVER put `service_role` key inside the app
- Enable Row Level Security (RLS) on all tables
- Protect each user row with `auth.uid()`

---

## 9. Content Strategy

### Phase A (App 1): Static Content

Keep questions bundled inside the app. The Leben in Deutschland test is standardized by BAMF and changes maybe once a year. Static is fine.

```
/src/content/leben_in_deutschland/
  metadata.ts      — exam config, region list
  questions.ts     — 460 questions
  regions.ts       — 16 German states
  assets/          — question images
```

### Phase B+ (App 2+): Hybrid Content

When you have multiple apps or need frequent updates:

1. Keep starter content inside the app (works offline on first launch)
2. Fetch updated content packs from Supabase Storage
3. Cache content locally after download
4. Allow offline use after first sync

### Content Versioning

Every content pack should have:
- `examId`
- `language`
- `version` (semver)
- `updatedAt` (ISO date)

This lets you check "is my local content outdated?" on app launch and offer silent background updates.

---

## 10. Monetization Strategy

Use ads + premium together. Don't depend only on ads. Don't hide everything behind a paywall.

### Core Principle
**All questions, study, and practice are always free and unlimited.** Mock exams are gated at 3/day for free users (unlock more via rewarded ad or premium). Mistake reviews are always free. Premium removes all ads and unlocks unlimited exams.

### Free Users Get
- Full question bank access (all 460+ questions)
- Study mode (unlimited, all categories)
- Practice mode (unlimited, all categories)
- Mock exam mode (3 per day, then rewarded ad to unlock 1 more)
- Results review + review wrong answers (always free, not gated)
- Bookmarks, progress tracking
- Banner + interstitial ads (respectful placement)

### Premium Users Get
- Zero ads anywhere in the app
- Unlimited mock exams (no daily limit)
- Offline mode
- Cloud sync (when Supabase is added)
- Cancel anytime

### Mock Exam Gating

```
exams_today < 3       → free, no friction
exams_today >= 3      → show gate screen
  ├── "Watch ad to unlock 1 exam"  → rewarded ad → unlock 1 exam
  └── "Go Premium — unlimited"     → paywall
isSubscribed === true → unlimited, gate never shown
```

**Gate screen UI:**
- "You've used your 3 free exams today"
- Two buttons: "Watch ad for 1 more exam" (secondary) + "Go Premium" (primary)
- Resets at midnight local time
- Track `examsCompletedToday` + `lastExamDate` in progress store

### Revenue Streams

| Stream | Where | Expected Revenue |
|--------|-------|-----------------|
| Banner ads (AdMob) | Study/Practice question views (fixed above prev/next) | ~$0.50-2.00 eCPM (EU) |
| Interstitial ads | After completing practice/study sessions (smart frequency) | ~$5-15 eCPM |
| Rewarded ads | Watch to unlock extra mock exam after 3/day limit | ~$10-30 eCPM |
| Subscription | Monthly €2.99 / Yearly €9.99 | 2-5% conversion |

### RevenueCat Setup (First Approach)

Use RevenueCat as the single source of truth for subscriptions. ONE entitlement: `premium`.

```
if user has "premium" entitlement → remove all ads, unlimited exams
if not → free flow + ads + exam gate + paywall prompts
```

Don't check individual store products in app code. Check the entitlement only. RevenueCat handles the rest.

**Pricing — start simple, iterate with data:**

| Plan | Price (EUR) | Per day | Notes |
|------|------------|---------|-------|
| Monthly | €2.99 | €0.10 | Standard plan, most users pick this |
| Yearly | €9.99 | €0.03 | "Save 72%" badge, power users |

Start with 2 plans. Add weekly (€1.99) after 1 month if conversion data suggests users want shorter commitments. Test-prep users often prepare in 2-4 week bursts — weekly may convert well.

**Country-level pricing via RevenueCat:**

RevenueCat returns localized price strings from App Store Connect / Google Play Console. Set price tiers per country in the store dashboards. The app displays whatever RevenueCat returns — no hardcoded currencies.

For initial store setup, use these reference tiers:

```typescript
// Reference pricing per region (set in App Store Connect / Google Play Console)
// RevenueCat fetches actual localized prices at runtime
//
// EUR (DE, FR, IT, ES):    Monthly €2.99  |  Yearly €9.99
// GBP (UK):                Monthly £2.49  |  Yearly £7.99
// INR (India):             Monthly ₹99    |  Yearly ₹299
// TRY (Turkey):            Monthly ₺59.99 |  Yearly ₺149.99
// USD (US, fallback):      Monthly $2.99  |  Yearly $9.99
```

**A/B testing:** RevenueCat supports experiments natively. After 500+ users, test:
- Different price points (€1.99 vs €2.99 monthly)
- Adding weekly plan
- Different paywall copy/layout

### Paywall UI & Placement (A+B Approach)

Two complementary placements — never aggressive, always dismissible:

**Placement A — Subtle card on Home screen:**
- Below the Practice/Exam buttons, above the stats strip
- Small card: "Enjoying the app? Go ad-free →"
- Non-intrusive, always visible, easy to tap
- Remove the card once user subscribes

**Placement B — "Remove ads" link on every banner ad:**
- Tiny text link below/next to the banner ad: "Remove ads"
- Natural conversion funnel: user sees ad → gets annoyed → taps remove
- Highest converting placement because user is already annoyed

**Placement C — Exam gate screen:**
- After 3 exams/day, show gate with "Watch ad" + "Go Premium" options
- Direct path to paywall from the gate

**Paywall screen layout (see mockup):**
- Close button (always dismissible)
- Gold star icon
- Headline: "Go Ad-Free"
- Description: "All questions stay free. Remove ads and unlock unlimited exams."
- Feature checklist (green checks): All questions free, Zero ads, Unlimited exams, Offline mode, Cancel anytime
- Monthly / Yearly pricing cards side by side (yearly pre-selected with "Save 72%" badge)
- Primary CTA: "Subscribe · €9.99/year" (displays RevenueCat's localized price)
- Footer: Restore Purchase | Terms | Privacy

### Smart Paywall Timing

Trigger the paywall modal at high-intent moments (max once per day):
- After user completes their 10th practice session (they're committed)
- After user passes their first mock exam (they're happy, willing to pay)
- After 3rd interstitial ad dismissal in a single day (they're annoyed enough)
- When hitting the exam gate (Placement C — always shown, this is not the modal)

**Never:**
- Show paywall modal on first app open
- Show paywall modal more than once per day
- Force paywall without dismiss option
- Show paywall during or immediately before/after exam
- Gate mistake reviews or any study/practice content

### Free Rewards (Growth Strategies)

Small rewards for actions that benefit the app's growth. These grant temporary premium access — not full subscriptions.

**1. Rate & Review → 1 day unlimited exams**
- Trigger: after 3rd passed exam or 20th practice session
- Prompt: "Enjoying the app? Rate us and get 1 day unlimited exams!"
- User taps "Rate now" → opens native store review (`expo-store-review`) → on return, grant reward
- Cannot verify actual review (Apple/Google don't allow it) — grant on tap, trust the user
- One-time reward only. Track `hasClaimedRatingReward: boolean` in settings store.
- Wording must be neutral ("Rate us" not "Leave 5 stars") — Apple guidelines

**2. Practice mastery → 1 day unlimited exams**
- Trigger: user has practiced/studied ALL questions (310) with overall accuracy >= 65%
- Prompt on completion: "You've mastered all questions! Enjoy 1 day unlimited exams"
- Automatically granted, no user action needed
- One-time reward. Track `hasClaimedMasteryReward: boolean` in settings store.
- This rewards dedication — user who's done all 310 questions at 65%+ is deeply engaged

**Reward mechanics:**
- Both rewards grant `premiumUntil: Date` (current time + 24 hours) in settings store
- During reward period: exam gate is skipped (unlimited exams), but ads still show (it's not full premium)
- Check: `isSubscribed || Date.now() < premiumUntil` for exam gate bypass
- Rewards don't stack — if both claimed on same day, still just 24 hours from latest claim

```typescript
// In useSettingsStore
hasClaimedRatingReward: boolean     // one-time, never resets
hasClaimedMasteryReward: boolean    // one-time, never resets
premiumUntil: number | null         // timestamp, null = no active reward
```

### Revenue Projection (Single App — Leben in Deutschland)

~200K people take this test annually in Germany.

| Metric | Conservative | Optimistic |
|--------|-------------|-----------|
| Monthly downloads (after 3 months ASO) | 500 | 2,000 |
| DAU (20% retention) | 100 | 400 |
| Ad revenue/month (banner + interstitial) | 30-50 EUR | 150-300 EUR |
| Rewarded ad revenue/month | 10-20 EUR | 40-80 EUR |
| Subscriptions (3% conversion) | 30-60 EUR | 120-240 EUR |
| **Total monthly** | **70-130 EUR** | **310-620 EUR** |

**To reach 1-2L INR (1,000-2,000 EUR/month):** Need 3-5 apps doing 200-500 EUR/month each. Achievable in 6-12 months.

---

## 11. Ad Monetization Rules

**Golden rule: Ads should feel like a pause, not a punishment.**

### Exam Mode — Completely Ad-Free
- No banner ads, no interstitials — before, during, or after exam
- Exam simulates the real test. Ads break immersion and feel disrespectful
- The result screen is an emotional moment — don't punish it with ads
- Exam is the trust-building feature. Keep it sacred.

### Banner Ads
- Show on: Study question view, Practice question view — fixed at bottom, above prev/next buttons
- Each banner includes a small "Remove ads" link (Placement B for paywall)
- Do NOT show on: Home, Study/Practice list screens, Exam, Results, Review
- Banner is outside the ScrollView — always visible regardless of question/image length
- Layout: `[scrollable question content]` → `[fixed: ad banner + prev/next buttons]`

### Interstitial Ads — Smart Placement

**Where to show:**
- After finishing a practice/study session (after "Finish" tap, before returning to list)
- When returning from a category view back to the study/practice list

**Where NEVER to show:**
- On dropdown taps (question jump, category filter, bundesland) — this is navigation, not content transition
- Mid-question or between questions
- On bookmark toggle or translate toggle
- During or around exam mode (before, during, after, or on results)
- Within 30 seconds of app open

**Smart frequency logic:**
- Track `sessionsSinceLastAd` counter in store
- Show interstitial every 3rd completed session (configurable via `interstitialFrequency`)
- Skip interstitials for the first 3 sessions (`firstInterstitialAfter`)
- Cap at max 3 interstitials per hour
- If user just failed an exam, skip the next interstitial — show empathy
- Premium users see zero ads (check `isSubscribed` before any ad call)

### Rewarded Ads — Exam Gate Unlock

- Shown only when user hits the 3/day exam gate
- User chooses to watch — never forced
- On successful completion: unlock 1 additional exam for today
- If ad fails to load: show "Try again later" or just offer paywall
- Preload rewarded ad after 2nd exam of the day (anticipate gate)

### Ad Config

```typescript
adConfig: {
  enabled: true,                    // global kill switch for development
  bannerIdAndroid: "...",
  bannerIdIOS: "...",
  interstitialIdAndroid: "...",
  interstitialIdIOS: "...",
  rewardedIdAndroid: "...",         // for exam gate unlock
  rewardedIdIOS: "...",             // for exam gate unlock
  interstitialFrequency: 3,        // show every Nth completed session
  firstInterstitialAfter: 3,       // no interstitial before 3rd session
  maxInterstitialsPerHour: 3,      // cap to prevent frustration
  skipAdAfterExamFail: true,       // empathy: no ad after failed exam
  freeExamsPerDay: 3,              // exam gate threshold
}
```

---

## 12. Analytics Plan

Without analytics, scaling is guessing.

### Events to Track

| Event | When |
|-------|------|
| `app_open` | App launched |
| `onboarding_complete` | Onboarding finished |
| `quiz_start` | Practice session started |
| `quiz_complete` | Practice session finished |
| `mock_exam_start` | Mock exam started |
| `mock_exam_complete` | Mock exam finished |
| `answer_selected` | Any answer tapped |
| `paywall_shown` | Subscription screen viewed |
| `paywall_purchase_started` | User tapped subscribe |
| `paywall_purchase_success` | Purchase completed |
| `restore_purchase_clicked` | Restore tapped |
| `ad_banner_shown` | Banner ad displayed |
| `ad_interstitial_shown` | Interstitial displayed |
| `rewarded_ad_started` | Rewarded ad started |
| `rewarded_ad_completed` | Rewarded ad finished |
| `login_started` | Auth flow began |
| `login_success` | Auth completed |
| `bookmark_added` | Question bookmarked |
| `review_prompt_shown` | "Rate this app" shown |

### Tool
Use Firebase Analytics (free, unlimited events) or Posthog (free tier: 1M events/month). Add in Phase C.

### Crash Reporting
Add Sentry (free tier) or `expo-dev-tools` crash reporting before production launch.

---

## 13. API Key Security

### Safe in Client App

| Key | Location | Why Safe |
|-----|----------|---------|
| Supabase `anon` key | `app.config.ts` or env | Public by design, RLS protects data |
| RevenueCat public SDK key | `app.config.ts` | Device-facing, not secret |
| AdMob ad unit IDs | `app.config.ts` | Public by design |
| AdMob App ID | `app.json` (build-time) | Required by native SDK |

### NEVER in Client App

| Key | Where Instead |
|-----|--------------|
| Supabase `service_role` key | EAS Secrets / server only |
| Webhook secrets | CI/CD env variables |
| Admin/backend tokens | Service dashboards |

### `.gitignore` Additions

```
google-services.json
GoogleService-Info.plist
.env
.env.local
```

---

## 14. Image and Asset Hosting

### Keep Inside App (Static)
- App icon, splash screen
- Onboarding illustrations
- Placeholder graphics
- Question images for v1 (current: ~40 images, ~2MB — acceptable)

### Host Remotely (Later)
- Question images for content packs with 200+ images
- Diagrams, maps, flags
- Updateable learning media

### Tool
Use Supabase Storage (5GB free tier). Cache locally after first download for offline use. Use `expo-image` for fast caching when adding remote images.

---

## 15. Code Review — Current State

### Score: 7.5/10

### What's Good
- Config-swap architecture — `app.config.ts` is a single file to swap per app
- Clean type system — comprehensive TypeScript interfaces
- Zustand stores well-designed — persistence, streaks, computed helpers
- Theme system works — light/dark, surface variants, centralized palette
- i18n ready — locale switching, translation keys
- Quiz logic solid — `useQuizSession` handles practice + exam modes
- File structure clean and intuitive

### What Needs Work
- AdMob + RevenueCat completely stubbed (placeholder only)
- `category` field overloaded — mixes topic and region
- Hardcoded values break template reuse (exam pool 30/3, colors, store keys)
- No onboarding (flag exists but unused)
- No settings screen
- No feature flags
- No analytics, no error boundaries, no crash reporting
- Subscription screen English-only, BottomNav labels not translated
- No rewarded ads
- No guest-first auth flow

---

## 16. Known Issues

| # | Issue | Severity | File(s) |
|---|-------|----------|---------|
| 1 | AdMob completely commented out | Critical | `AdBanner.tsx:27-42` |
| 2 | RevenueCat completely commented out | Critical | `subscription.tsx:29-45, 56-63` |
| 3 | No auth system (Supabase) | Medium | Missing |
| 4 | `category` overloaded (topic + region) | Medium | `types/index.ts`, all data files |
| 5 | Exam pool hardcoded 30+3 | Medium | `useQuizSession.ts:54` |
| 6 | BottomNav hardcodes `#111111` | Medium | `BottomNav.tsx:42` |
| 7 | No onboarding flow | Medium | `useSettingsStore.ts:30` |
| 8 | Subscription text not translated | Medium | `subscription.tsx:10-16, 79-82` |
| 9 | No interstitial or rewarded ads | Medium | Missing |
| 10 | No feature flags | Medium | Missing |
| 11 | Exam timer colors hardcoded | Low | `exam.tsx:128-132` |
| 12 | No error boundaries | Low | Missing |
| 13 | No tests | Low | Missing |
| 14 | No analytics or crash reporting | Low | Missing |
| 15 | No session recovery on app kill | Low | `useQuizSession.ts` |
| 16 | Store keys hardcoded as `ryg-*` | Low | `useProgressStore.ts`, `useSettingsStore.ts` |

---

## 17. Master Execution Plan

### Phase A: Foundation (2-3 days)

Fix the template so it's truly reusable. No new features — just cleanup.

**Data model fixes:**
- [ ] **A.1** Split `category` into `topicCategory` + `regionCategory` across types, data, and all components that filter/display categories
- [ ] **A.2** Add `examId`, `tags`, `version` to `Question` type
- [ ] **A.3** Rename `GermanStateCode` to generic `RegionCode` (string type) so other apps can reuse
- [ ] **A.4** Move questions into `src/content/leben_in_deutschland/` folder (questions.ts, regions.ts, metadata.ts)
- [ ] **A.5** Update `ExamConfig` to include `mockExamGeneralCount` and `mockExamRegionCount`

**Hardcoded value fixes:**
- [ ] **A.6** Fix `useQuizSession.ts:54` — use exam config for pool split, not hardcoded 30/3
- [ ] **A.7** Fix `BottomNav.tsx:42` — replace `#111111` with `c.textPrimary`
- [ ] **A.8** Fix `exam.tsx:128-132` — move hardcoded timer colors to theme
- [ ] **A.9** Rename store keys from `ryg-progress`/`ryg-settings` to use app slug

**Template quality:**
- [ ] **A.10** Add `FeatureFlags` type and default config to `app.config.ts`
- [ ] **A.11** Extract `getWeakIds` duplication between store and questions screen
- [ ] **A.12** Translate subscription screen — move all strings to i18n
- [ ] **A.13** Translate BottomNav labels — use `t()`
- [ ] **A.14** Add error boundary component, wrap in `_layout.tsx`
- [ ] **A.15** Create `src/config/monetization.config.ts` — separate ad + paywall config from app identity

### Phase B: Auth + Onboarding + Settings (2-3 days)

Add the screens that are missing for a complete user experience.

**Onboarding:**
- [ ] **B.1** Create `app/onboarding.tsx` — 2-3 screens: welcome, select region, select language
- [ ] **B.2** Gate on `hasCompletedOnboarding` — redirect from `index.tsx` if false
- [ ] **B.3** Set flag after completing onboarding

**Settings:**
- [ ] **B.4** Create `app/settings.tsx` — theme toggle, language, region, reset progress, about, privacy policy link
- [ ] **B.5** Add settings access from `AppHeader` (gear icon)

**Auth (optional for v1 — can defer):**
- [ ] **B.6** Install `@supabase/supabase-js`, create `src/services/supabase.ts`
- [ ] **B.7** Add Supabase anon key + URL to config
- [ ] **B.8** Implement guest-first flow: app works without login, prompt only for sync/restore
- [ ] **B.9** Add email OTP login screen
- [ ] **B.10** Create `profiles` table with RLS

**Note:** B.6-B.10 can be deferred to after launch if you want to ship faster. Guest-only (local storage) is fine for v1.

### Phase C: UX Rebuild (4-5 days)

Rebuild screens to match the mockup in `mockups/final.html`. Reference that file for all visual decisions.

**C.1 — Shared Components:**
- [ ] **C.1.1** Create `src/components/StatsRow.tsx` — 4 stat cards (Studied, Accuracy, Weak, Saved). Reused on Study + Practice screens. Props: `{ studied, accuracy, weak, saved }`.
- [ ] **C.1.2** Create `src/components/CategoryList.tsx` — scrollable category list. Each row: emoji + name + question count + weak count + arrow. Props: `{ categories, onSelect }`.
- [ ] **C.1.3** Create `src/components/ActionCards.tsx` — "Weak" + "Bookmarked" two-column card row. Props: `{ weakCount, bookmarkedCount, onWeakPress, onBookmarkedPress }`.
- [ ] **C.1.4** Create `src/components/StickyBottomCTA.tsx` — full-width button pinned above bottom nav. Props: `{ label, onPress }`. Example: "Study All · 310 Questions".

**C.2 — Navigation Icons (replace emoji with SVG):**
- [ ] **C.2.1** Add SVG icon files to `assets/icons/`: `home.svg`, `study.svg`, `practice.svg`, `exam.svg`, `bookmark.svg`, `translate.svg` (FontAwesome language path). Use icons from `icons/` folder.
- [ ] **C.2.2** Update `BottomNav.tsx` — replace emoji with SVG icons via `react-native-svg`. Active = `stroke: var(--text)`, inactive = `stroke: var(--nav-inactive)`.
- [ ] **C.2.3** Replace theme toggle emoji with SVG: sun icon (shown in dark mode) / moon icon (shown in light mode). Use `isDark` from `useThemeColors` to swap.
- [ ] **C.2.4** Replace language globe emoji with FontAwesome `language` solid SVG icon. Uses `fill` not `stroke`.

**C.3 — Home Screen:**
- [ ] **C.3.1** Rebuild `app/index.tsx` to match mockup: centered flag + title + tagline, Bundesland native dropdown (`@react-native-picker/picker`), two big CTA buttons (Practice + Mock Exam) with bold SVG arrows, premium card (Placement A), stats strip.
- [ ] **C.3.2** Premium card: gold gradient icon, "Enjoying the app? Go ad-free", arrow. Tapping opens `/subscription` modal. Hidden when `isSubscribed === true`.

**C.4 — Study + Practice Screens (shared component):**
- [ ] **C.4.1** Create `src/components/QuestionListScreen.tsx` with `mode: 'study' | 'practice'` prop. Layout: StatsRow → ActionCards (Weak + Bookmarked) → category dropdown + shuffle toggle row → CategoryList → StickyBottomCTA.
- [ ] **C.4.2** Category dropdown: native `Picker` with options: All, Berlin, Politik, Recht, Geschichte, Gesellschaft, Wirtschaft. Filters the category list below.
- [ ] **C.4.3** Shuffle toggle: icon button, black when active, grey when inactive. Stores state in session config.
- [ ] **C.4.4** Wire `app/practice/index.tsx` to use `QuestionListScreen` with `mode="practice"`.
- [ ] **C.4.5** Create `app/study/index.tsx` using `QuestionListScreen` with `mode="study"`. Add route to Expo Router.

**C.5 — Single Question View (shared component):**
- [ ] **C.5.1** Create `src/components/QuestionSession.tsx` — shared by all modes. Props: `{ mode: 'study' | 'practice' | 'exam' | 'review', questions, ... }`.
- [ ] **C.5.2** Fixed header: back/close button, native `Picker` for question jump, right side depends on mode (translate toggle for study/practice, timer for exam, wrong count for review).
- [ ] **C.5.3** Fixed progress bar below header: category/context label + percentage + bar.
- [ ] **C.5.4** Scrollable body (`ScrollView`): question label row ("Question X" + bookmark icon on right, only for study/practice), question text, optional EN translation below DE (controlled by translate toggle, never in exam), optional image (bordered container), 4 answer options, attempt stats.
- [ ] **C.5.5** Fixed bottom: banner ad (study/practice only, hidden for exam/review) + prev/next buttons. Banner includes "Remove ads" link. Both are outside ScrollView.
- [ ] **C.5.6** Answer states: default (neutral bg), selected (dark border, exam mode only), correct (green bg + border), wrong (red bg + border). In exam mode, only show "selected" state — no green/red until review.
- [ ] **C.5.7** Last question: "Next" button changes to "Finish" (study/practice) or "Submit Exam" (green, exam mode).

**C.6 — Exam Mode:**
- [ ] **C.6.1** Timer component: shows remaining time in header. Normal = black text, under 5 min = red text + red bg badge. Counts down from `timeLimitMinutes`.
- [ ] **C.6.2** No translate toggle, no bookmark, no banner ad, no translations.
- [ ] **C.6.3** "No feedback until exam is complete" note below progress bar.
- [ ] **C.6.4** Disable back gesture (`gestureEnabled: false`). Close button shows confirmation alert.

**C.7 — Results Screen:**
- [ ] **C.7.1** Pass: large green circle with bold white checkmark + shadow, "Congratulations!", score (27/33), pass threshold text, Score % + Time stat cards, Review Wrong Answers (primary) + Retry + Back to Home.
- [ ] **C.7.2** Fail: large red circle with bold white X + shadow, "Keep Practising", same layout, different colors.
- [ ] **C.7.3** Review Wrong Answers: opens QuestionSession with `mode="review"`, filters to only wrong answers, red progress bar, no ads.

**C.8 — Translation Toggle:**
- [ ] **C.8.1** Translate icon button in question view header (FontAwesome language SVG). Active state = filled circle bg. Toggles `showTranslation` state.
- [ ] **C.8.2** When active: EN text appears below DE question text and each option (smaller, italic, muted color via `.trans` class).
- [ ] **C.8.3** Never available in exam mode or review mode.

### Phase D: Monetization (4-5 days)

Wire up the revenue infrastructure. RevenueCat is the first approach — single source of truth for subscriptions.

**D.1 — RevenueCat Setup (do this first):**
- [ ] **D.1.1** Create RevenueCat account at revenuecat.com
- [ ] **D.1.2** Create project, connect App Store Connect + Google Play Console
- [ ] **D.1.3** Create ONE entitlement: `premium`
- [ ] **D.1.4** Create offerings with 2 products: Monthly (€2.99) + Yearly (€9.99)
- [ ] **D.1.5** Set country-level pricing in App Store Connect / Google Play Console (EUR, GBP, INR, TRY, USD — see reference tiers in Section 10)
- [ ] **D.1.6** Install `react-native-purchases` and initialize in `_layout.tsx` with `Purchases.configure()`
- [ ] **D.1.7** On app launch: check entitlements → set `isSubscribed` in settings store
- [ ] **D.1.8** Create `src/services/revenuecat.ts` with helpers: `checkPremium()`, `purchasePackage(pkg)`, `restorePurchases()`

**D.2 — Paywall Screen:**
- [ ] **D.2.1** Rebuild `subscription.tsx` to match paywall mockup: close button, gold star icon, "Go Ad-Free" headline, "Unlimited exams" in feature list, Monthly/Yearly pricing cards (yearly pre-selected, "Save 72%" badge)
- [ ] **D.2.2** Display RevenueCat's localized price strings (not hardcoded) — `offering.monthly.product.priceString`
- [ ] **D.2.3** Wire subscribe button to `Purchases.purchasePackage()`
- [ ] **D.2.4** Wire restore purchases link
- [ ] **D.2.5** On successful purchase: set `isSubscribed = true`, dismiss modal, hide all ads

**D.3 — Exam Gating (3/day + rewarded ad):**
- [ ] **D.3.1** Add to progress store: `examsCompletedToday: number`, `lastExamDate: string`
- [ ] **D.3.2** On exam start: check `examsCompletedToday`. If `< 3` → start exam. If `>= 3` → show gate screen.
- [ ] **D.3.3** Reset counter when `lastExamDate !== today` (midnight local time reset)
- [ ] **D.3.4** Create `ExamGateScreen` component: "You've used 3 free exams today" + two buttons:
  - "Watch ad for 1 more exam" → show rewarded ad → on complete, increment allowed exams by 1 → start exam
  - "Go Premium — unlimited exams" → open paywall
- [ ] **D.3.5** Skip gate entirely when `isSubscribed === true`
- [ ] **D.3.6** Add rewarded ad unit IDs to `adConfig` (test IDs for dev, production IDs for release)

**D.4 — AdMob Setup:**
- [ ] **D.4.1** Add `expo-dev-client` (AdMob doesn't work in Expo Go)
- [ ] **D.4.2** Implement GDPR consent with AdMob UMP SDK — must be done before any ad loads
- [ ] **D.4.3** Implement iOS ATT prompt (`expo-tracking-transparency`) — must show before ads on iOS

**D.5 — Banner Ads:**
- [ ] **D.5.1** Update `AdBanner.tsx` — renders inside `QuestionSession` component, fixed above prev/next buttons, outside the ScrollView
- [ ] **D.5.2** Only show when `mode === 'study' || mode === 'practice'`. Never show for exam or review.
- [ ] **D.5.3** Add "Remove ads" text link below banner → opens `/subscription` modal
- [ ] **D.5.4** Hide banner entirely when `isSubscribed === true`

**D.6 — Interstitial Ads:**
- [ ] **D.6.1** Create `src/services/admob.ts` with `InterstitialAdManager`:
  - `sessionsSinceLastAd` counter (persisted in Zustand)
  - `interstitialsShownThisHour` with hourly reset
  - `shouldShowAd()`: true if `sessionsSinceLastAd >= 3` AND `interstitialsShownThisHour < 3` AND `completedSessions >= 3`
  - `recordAdShown()`: resets session counter, increments hourly count
- [ ] **D.6.2** Show interstitial after completing a practice/study session (after "Finish" tap, before navigating to list). Never mid-question, never on nav taps, never during/around exam.
- [ ] **D.6.3** If user just failed an exam, skip next interstitial (empathy)
- [ ] **D.6.4** Hide all interstitials when `isSubscribed === true`

**D.7 — Rewarded Ads:**
- [ ] **D.7.1** Create `RewardedAdManager` in `src/services/admob.ts`
- [ ] **D.7.2** Preload rewarded ad when user approaches exam gate (after 2nd exam of the day)
- [ ] **D.7.3** On rewarded ad completion callback: unlock 1 exam, update `examsCompletedToday` allowance
- [ ] **D.7.4** If rewarded ad fails to load: show fallback "Try again later" or just show paywall

**D.8 — Paywall Placement + Smart Triggers:**
- [ ] **D.8.1** Home screen: premium card (Placement A) — hidden when subscribed
- [ ] **D.8.2** Banner ads: "Remove ads" link (Placement B) — opens paywall
- [ ] **D.8.3** Exam gate: "Go Premium" button (Placement C) — opens paywall
- [ ] **D.8.4** Smart modal triggers (max once per day, always dismissible):
  - After 10th completed practice session
  - After first passed mock exam
  - After 3rd interstitial ad dismissal in a day
- [ ] **D.8.5** Track `lastPaywallShownDate` in settings store — never show modal more than once per calendar day
- [ ] **D.8.6** Never show paywall modal during exam, on results screen, or on first app open

**D.9 — Analytics:**
- [ ] **D.9.1** Add Firebase Analytics or Posthog
- [ ] **D.9.2** Track events: `ad_banner_shown`, `ad_banner_remove_tapped`, `ad_interstitial_shown`, `ad_rewarded_shown`, `ad_rewarded_completed`, `exam_gate_shown`, `exam_gate_ad_chosen`, `exam_gate_premium_chosen`, `paywall_shown`, `paywall_purchase_started`, `paywall_purchase_success`, `paywall_dismissed`
- [ ] **D.9.3** Add crash reporting (Sentry free tier)

**Ad Config (updated):**

```typescript
adConfig: {
  enabled: true,
  bannerIdAndroid: "...",
  bannerIdIOS: "...",
  interstitialIdAndroid: "...",
  interstitialIdIOS: "...",
  rewardedIdAndroid: "...",           // NEW — for exam gate
  rewardedIdIOS: "...",               // NEW — for exam gate
  interstitialFrequency: 3,
  firstInterstitialAfter: 3,
  maxInterstitialsPerHour: 3,
  skipAdAfterExamFail: true,
  freeExamsPerDay: 3,                 // NEW — exam gate threshold
}
```

### Phase E: Polish + Release (3-4 days)

**E.1 — Free Rewards:**
- [ ] **E.1.1** Add `hasClaimedRatingReward`, `hasClaimedMasteryReward`, `premiumUntil` to `useSettingsStore`
- [ ] **E.1.2** Create `src/services/rewards.ts`: `grantReward(type)` sets `premiumUntil` to now + 24h, marks reward as claimed
- [ ] **E.1.3** Update exam gate check: skip gate if `isSubscribed || Date.now() < premiumUntil`
- [ ] **E.1.4** Rate & Review: after 3rd passed exam or 20th session, show prompt if `!hasClaimedRatingReward`. On tap → `StoreReview.requestReview()` → `grantReward('rating')`
- [ ] **E.1.5** Practice mastery: check after each session if all 310 questions attempted with >= 65% overall accuracy. If true and `!hasClaimedMasteryReward` → show congrats + `grantReward('mastery')`

**E.2 — Polish:**
- [ ] **E.2.1** Add proper app icon + splash screen
- [ ] **E.2.2** Add empty states: "No weak questions yet", "No bookmarks yet"
- [ ] **E.2.3** Add haptic feedback on answer selection (`expo-haptics`)
- [ ] **E.2.4** Test on small screens (iPhone SE) and large screens

**E.3 — Release:**
- [ ] **E.3.1** Create Privacy Policy + Terms of Service (host on GitHub Pages)
- [ ] **E.3.2** Configure `app.json` (bundle ID, version, permissions)
- [ ] **E.3.3** Take screenshots, write store listing in DE + EN

### Phase E: Release (2-3 days)

**Preparation:**
- [ ] **E.1** Create Privacy Policy — host on GitHub Pages (free)
- [ ] **E.2** Create Terms of Service
- [ ] **E.3** Configure `app.json` (bundle ID, version, permissions)
- [ ] **E.4** Generate production app icons (1024x1024 iOS, 512x512 Android, adaptive)
- [ ] **E.5** Take screenshots per device size
- [ ] **E.6** Write store listing in German AND English (ASO keywords)
- [ ] **E.7** Register AdMob production ad units
- [ ] **E.8** Set up Apple/Google payment accounts

**Build & Submit:**
- [ ] **E.9** `eas build:configure`
- [ ] **E.10** Add EAS Secrets for `google-services.json`, `GoogleService-Info.plist`
- [ ] **E.11** Build: `eas build --platform all --profile production`
- [ ] **E.12** Test production build on real devices

**Soft Launch First:**
- [ ] **E.13** Android internal testing build
- [ ] **E.14** iOS TestFlight build
- [ ] **E.15** Share with friends, community groups, early reviewers
- [ ] **E.16** Fix bugs from feedback
- [ ] **E.17** Then public launch

### Phase F: Growth (Ongoing)

- [ ] **F.1** Monitor AdMob + RevenueCat dashboards weekly
- [ ] **F.2** Respond to user reviews (improves ranking)
- [ ] **F.3** Improve ASO based on search data
- [ ] **F.4** A/B test subscription pricing after 1 month
- [ ] **F.5** Add OTA updates via `expo-updates` for content fixes
- [ ] **F.6** Run small acquisition campaigns (50-100 EUR) only after retention is proven
- [ ] **F.7** Scale to next app ONLY after good signals (see Business Reality section)

---

## 18. App Store Publishing

### `app.json` Configuration

```json
{
  "expo": {
    "name": "Leben in Deutschland",
    "slug": "leben-in-deutschland",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.yourname.lebenindeutschland",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.yourname.lebenindeutschland",
      "versionCode": 1
    }
  }
}
```

### Build Commands

```bash
eas build:configure
eas secret:create --name GOOGLE_SERVICES_JSON --value "$(cat google-services.json)"
eas build --platform all --profile production
eas submit --platform all
# Review times: iOS ~24-48h, Android ~2-7 days
```

### Store Compliance
- **GDPR (EU):** Consent dialog for personalized ads (AdMob UMP SDK)
- **iOS ATT:** App Tracking Transparency prompt before personalized ads
- **Subscription terms:** Link to Terms of Service + Privacy Policy in subscription screen

---

## 19. Budget Plan

**Target: 100-150 EUR/month for first 4 months.**

### Month 1 — Architecture + Soft Launch Prep
- Apple Developer: 99 EUR/year
- Google Play: 25 EUR (one-time)
- Everything else: free
- **Spend: ~125 EUR**

### Month 2 — Launch + First Users
- EAS builds (if over free tier): ~15 EUR
- Small acquisition test: ~50 EUR
- **Spend: ~65 EUR**

### Month 3 — Optimize
- Improve onboarding, paywall, ASO
- Small ad spend: ~100 EUR
- **Spend: ~100 EUR**

### Month 4 — Scale Decision
- Scale ONLY if metrics are healthy
- Do NOT scale based on installs alone
- **Spend: ~100-150 EUR**

### Ongoing Costs (After Launch)

| Item | Cost | Notes |
|------|------|-------|
| Apple Developer | 99 EUR/year | Shared across all apps |
| RevenueCat | Free | Free up to $2.5K MTR |
| AdMob | Free | Google pays you |
| Supabase | Free | Free tier: 50K MAU |
| EAS Build | Free | 30 builds/month |
| Firebase Analytics | Free | Unlimited events |

---

## 20. Scaling to Next Apps

### When to Scale

Do NOT build many apps too early. Scale only after confirming:
- Users complete quizzes (not just install)
- Users return (D7 retention > 15%)
- Ratings stay decent (> 3.5 stars)
- Crash rate is low
- Some users convert to premium
- Ad revenue exists without complaints

### How to Clone

```bash
# 1. Clone the template
cp -r mobile-app-template german-driving-license-app
cd german-driving-license-app

# 2. Swap these files only:
#    src/config/app.config.ts          — new name, colors, exam rules, feature flags
#    src/config/monetization.config.ts — new ad unit IDs, product IDs
#    src/content/[exam_name]/          — new question bank, regions, metadata
#    src/i18n/locales/*.ts             — app-specific UI strings
#    app.json                          — new bundle ID, name, slug
#    assets/                           — new icon, splash, screenshots

# 3. Nothing else changes.
```

### Planned Apps

| App | Market Size | Difficulty |
|-----|-------------|-----------|
| Leben in Deutschland | ~200K/year in Germany | Low (content exists) |
| German Driving Theory | ~1.5M/year in Germany | Medium (more questions, images) |
| UK Citizenship (Life in UK) | ~200K/year | Low (content exists) |
| Canada Citizenship | ~300K/year | Low (content exists) |

---

## 21. Business Reality

**One app may not be enough.** A small portfolio of good apps can be.

The real model:
1. Build one strong reusable engine
2. Validate the first app (retention, ratings, some monetization)
3. Improve retention and monetization
4. Clone for new exam categories
5. Keep operating costs near zero
6. Grow a portfolio slowly

### Good Signals (Scale After These)
- Users complete quizzes
- Users return again
- Ratings stay above 3.5
- Crash rate is low
- Some premium conversions
- Ad revenue exists without angry reviews

### Bad Signals (Fix Before Scaling)
- High uninstall rate
- Low session completion
- Bad ratings
- Crashes
- Zero conversions

**If signals are weak, fix the app before building more clones.**

---

## 22. Simple Rulebook

### Do This
- Keep UX simple and calm
- Keep architecture modular
- Keep content separate from engine
- Keep login optional at first
- Keep monetization gentle
- Keep secrets safe
- Measure everything
- Scale slowly after proof

### Do NOT Do This
- Force login on first open
- Spam interstitial ads
- Keep all content in one huge file
- Build 5 apps before first one works
- Expose private keys
- Redesign UI from scratch for each app
- Scale based on installs alone
- Create 20 empty folders before writing code

---

## 23. Timeline

| Phase | Duration | What |
|-------|----------|------|
| A | 2-3 days | Foundation — data model fixes, hardcoded values, feature flags, content separation |
| B | 2-3 days | Auth + Onboarding + Settings (auth can be deferred) |
| C | 3-4 days | Monetization — AdMob, RevenueCat, analytics |
| D | 2-3 days | UX polish — icons, splash, empty states, haptics |
| E | 2-3 days | Release — store prep, soft launch, public launch |
| F | Ongoing | Growth — ASO, reviews, optimization, scale decision |
| **Total to first public launch** | **~12-16 days** | |

Each subsequent app after template is proven: **2-4 days** (mostly content creation).

---

## 24. Implementation Steps (Granular, One-by-One)

Every step below is a single, small task. Do them in order. Each step tells you exactly which file to open, what to find, and what to change. After each step, run `npx expo start` to make sure the app still works.

**Rule:** Do ONE step. Test it. Commit it. Move to the next.

---

### PHASE A: Foundation Fixes

These steps fix bugs, remove hardcoded values, and make the template truly reusable. No new features yet.

---

#### Step A.1 — Fix BottomNav dark mode color bug

**Problem:** Active tab label is hardcoded `#111111` which is invisible on dark backgrounds.

**File:** `src/components/BottomNav.tsx`

**Find this (line 42):**
```tsx
<Text style={[styles.navLabel, { color: isActive ? '#111111' : c.textMuted }]}>
```

**Replace with:**
```tsx
<Text style={[styles.navLabel, { color: isActive ? c.textPrimary : c.textMuted }]}>
```

**Why:** `c.textPrimary` is white in dark mode and black in light mode. This makes the active label always visible.

**Test:** Toggle dark mode in the app header. Active tab label should be readable in both modes.

---

#### Step A.2 — Translate BottomNav labels

**Problem:** BottomNav labels are hardcoded English strings ("Home", "Questions", "Practice", "Exam"). They don't change when user switches to German.

**File:** `src/components/BottomNav.tsx`

**Step 1: Add i18n import at the top:**
```tsx
import { useTranslation } from 'react-i18next'
```

**Step 2: Add the hook inside the `BottomNav` function, right after the existing hooks:**
```tsx
const { t } = useTranslation()
```

**Step 3: Change the `ITEMS` array from a const outside the component to inside the component (after the `t` hook), or use `t()` inline. Simplest approach — replace the label rendering.**

**Find this (line 43):**
```tsx
<Text style={[styles.navLabel, { color: isActive ? c.textPrimary : c.textMuted }]}>
  {item.label}
</Text>
```

**But since the labels come from the `ITEMS` array, you need to change the array to use translation keys. Replace the entire `ITEMS` const (lines 12-17):**

**Find:**
```tsx
const ITEMS: { key: NavKey; label: string; icon: string; route: string }[] = [
  { key: 'home', label: 'Home', icon: '🏠', route: '/' },
  { key: 'questions', label: 'Questions', icon: '🗂', route: '/questions' },
  { key: 'practice', label: 'Practice', icon: '📚', route: '/practice' },
  { key: 'exam', label: 'Exam', icon: '📋', route: '/exam' },
]
```

**Replace with:**
```tsx
const ITEMS: { key: NavKey; labelKey: string; icon: string; route: string }[] = [
  { key: 'home', labelKey: 'nav.home', icon: '🏠', route: '/' },
  { key: 'questions', labelKey: 'nav.questions', icon: '🗂', route: '/questions' },
  { key: 'practice', labelKey: 'nav.practice', icon: '📚', route: '/practice' },
  { key: 'exam', labelKey: 'nav.exam', icon: '📋', route: '/exam' },
]
```

**Then update the label rendering to use `t(item.labelKey)` instead of `item.label`.**

**Step 4: Add nav keys to both locale files.**

**File:** `src/i18n/locales/en.ts` — Add inside the object, after the `common` block:
```tsx
nav: {
  home: 'Home',
  questions: 'Questions',
  practice: 'Practice',
  exam: 'Exam',
},
```

**File:** `src/i18n/locales/de.ts` — Add inside the object, after the `common` block:
```tsx
nav: {
  home: 'Start',
  questions: 'Fragen',
  practice: 'Üben',
  exam: 'Prüfung',
},
```

**Test:** Switch language to German. Bottom nav labels should now show "Start", "Fragen", "Üben", "Prüfung".

---

#### Step A.3 — Fix exam timer hardcoded colors

**Problem:** Timer background colors in exam screen are hardcoded hex values instead of using theme.

**File:** `app/exam.tsx`

**Find this (lines 128-132):**
```tsx
const timerBg    = isCritical
  ? (isDark ? '#450a0a' : '#fef2f2')
  : isWarning
    ? (isDark ? '#1c1204' : '#fffbeb')
    : c.card
```

**Replace with:**
```tsx
const timerBg    = isCritical
  ? (isDark ? palette.redDim : palette.redLight)
  : isWarning
    ? (isDark ? '#1c1204' : palette.amberLight)
    : c.card
```

**Why:** Uses existing palette tokens for red states. The amber dark value (`#1c1204`) doesn't have a palette token yet, so keep it for now. The critical red now uses `palette.redDim` and `palette.redLight` which already exist in `src/theme/index.ts`.

**Test:** Start a mock exam. The timer should look the same. No visual change — this is a code quality fix.

---

#### Step A.4 — Rename store keys to use app name slug

**Problem:** Store keys are hardcoded as `ryg-progress` and `ryg-settings`. If a user installs two of your apps, the stores could conflict.

**File:** `src/store/useProgressStore.ts`

**Find (line 129):**
```tsx
name: 'ryg-progress',
```

**Replace with:**
```tsx
name: 'leben-progress',
```

**File:** `src/store/useSettingsStore.ts`

**Find (line 58):**
```tsx
name: 'ryg-settings',
```

**Replace with:**
```tsx
name: 'leben-settings',
```

**Note for future apps:** When you clone for a new app, change these to `driving-progress`, `driving-settings`, etc. Each app gets unique store keys.

**Test:** Open the app. Your existing progress may reset (because the key changed). That's expected during development. Everything else should work normally.

---

#### Step A.5 — Add FeatureFlags type

**Problem:** No way to toggle features per app. Every feature is always on.

**File:** `src/types/index.ts`

**Add this at the end of the file, before the closing of the file:**
```tsx
// ─── Feature Flags (toggle per app) ─────────────────────────────────────────

export interface FeatureFlags {
  guestMode: boolean           // allow usage without login
  bookmarks: boolean           // enable bookmark feature
  mistakesReview: boolean      // enable "review wrong answers"
  mockExam: boolean            // enable mock exam mode
  regionQuestions: boolean     // enable region/state filtering
  streaks: boolean             // enable streak tracking
  bannerAds: boolean           // enable banner ads
  interstitialAds: boolean     // enable interstitial ads
  rewardedAds: boolean         // enable rewarded ad unlocks
}
```

**Then update the `AppConfig` interface in the same file. Find:**
```tsx
export interface AppConfig {
  appName: string
  appTagline: string
  flagEmoji: string
  primaryColor: string
  originalLocale: SupportedLocale
  supportedLocales: SupportedLocale[]
  categories: { id: string; label: string; emoji: string }[]
  examConfig: ExamConfig
  adConfig: AdConfig
  revenueCatConfig: RevenueCatConfig
}
```

**Replace with:**
```tsx
export interface AppConfig {
  appName: string
  appTagline: string
  flagEmoji: string
  primaryColor: string
  originalLocale: SupportedLocale
  supportedLocales: SupportedLocale[]
  categories: { id: string; label: string; emoji: string }[]
  examConfig: ExamConfig
  adConfig: AdConfig
  revenueCatConfig: RevenueCatConfig
  featureFlags: FeatureFlags
}
```

**Test:** The app won't compile yet because `app.config.ts` doesn't have `featureFlags`. Go to the next step.

---

#### Step A.6 — Add feature flags to app.config.ts

**File:** `src/config/app.config.ts`

**Find (right before the closing `}` of the config object, after `revenueCatConfig`):**
```tsx
  revenueCatConfig: {
    apiKeyAndroid:    'REVENUECAT_ANDROID_KEY',
    apiKeyIOS:        'REVENUECAT_IOS_KEY',
    monthlyProductId: 'ryg_leben_monthly_199',
    yearlyProductId:  'ryg_leben_yearly_999',
  },
}
```

**Replace with:**
```tsx
  revenueCatConfig: {
    apiKeyAndroid:    'REVENUECAT_ANDROID_KEY',
    apiKeyIOS:        'REVENUECAT_IOS_KEY',
    monthlyProductId: 'ryg_leben_monthly_199',
    yearlyProductId:  'ryg_leben_yearly_999',
  },

  featureFlags: {
    guestMode: true,
    bookmarks: true,
    mistakesReview: true,
    mockExam: true,
    regionQuestions: true,
    streaks: true,
    bannerAds: true,
    interstitialAds: true,
    rewardedAds: false,
  },
}
```

**Test:** App should compile and run again. No visual changes — just config.

---

#### Step A.7 — Add mockExamGeneralCount and mockExamRegionCount to ExamConfig

**Problem:** The exam pool split (30 general + 3 state) is hardcoded in `useQuizSession.ts:54` instead of coming from config.

**File:** `src/types/index.ts`

**Find:**
```tsx
export interface ExamConfig {
  totalQuestions: number    // total in question bank
  examQuestions: number     // how many in the real test
  passMark: number          // correct answers needed to pass
  timeLimitMinutes: number  // 0 = untimed
}
```

**Replace with:**
```tsx
export interface ExamConfig {
  totalQuestions: number          // total in question bank
  examQuestions: number           // how many in the real test
  mockExamGeneralCount: number   // how many general questions in mock exam
  mockExamRegionCount: number    // how many region questions in mock exam
  passMark: number                // correct answers needed to pass
  timeLimitMinutes: number        // 0 = untimed
}
```

**Test:** Won't compile yet — `app.config.ts` needs updating. Go to next step.

---

#### Step A.8 — Add pool split values to app.config.ts

**File:** `src/config/app.config.ts`

**Find:**
```tsx
  examConfig: {
    totalQuestions: questions.length,
    examQuestions: 33,
    passMark: 17,           // need 17/33 to pass
    timeLimitMinutes: 60,   // 60 minute time limit
  },
```

**Replace with:**
```tsx
  examConfig: {
    totalQuestions: questions.length,
    examQuestions: 33,
    mockExamGeneralCount: 30,
    mockExamRegionCount: 3,
    passMark: 17,           // need 17/33 to pass
    timeLimitMinutes: 60,   // 60 minute time limit
  },
```

**Test:** App compiles again. No visual changes yet.

---

#### Step A.9 — Use config values instead of hardcoded 30/3 in useQuizSession

**Problem:** `useQuizSession.ts` line 54 hardcodes `generalPool.slice(0, 30)` and `statePool.slice(0, 3)`.

**File:** `src/hooks/useQuizSession.ts`

**Find (line 54):**
```tsx
    const examPool = [...generalPool.slice(0, 30), ...statePool.slice(0, 3)]
```

**Replace with:**
```tsx
    const examPool = [
      ...generalPool.slice(0, appConfig.examConfig.mockExamGeneralCount),
      ...statePool.slice(0, appConfig.examConfig.mockExamRegionCount),
    ]
```

**Note:** `appConfig` is already imported at the top of this file (line 7: `import appConfig from '@/config/app.config'`), so no new import needed.

**Test:** Start a mock exam. It should still give you 33 questions (30 general + 3 state). Same behavior, but now driven by config.

---

#### Step A.10 — Make GermanStateCode generic

**Problem:** The type `GermanStateCode` is a hardcoded union of German state codes. Other apps (UK, Canada) can't use it.

**File:** `src/types/index.ts`

**Find:**
```tsx
export type GermanStateCode =
  | 'bw'
  | 'by'
  | 'be'
  | 'bb'
  | 'hb'
  | 'hh'
  | 'he'
  | 'mv'
  | 'ni'
  | 'nw'
  | 'rp'
  | 'sl'
  | 'sn'
  | 'st'
  | 'sh'
  | 'th'
```

**Replace with:**
```tsx
// Generic region code — each app defines its own region codes in content.
// For Leben in Deutschland: 'bw' | 'by' | 'be' | etc.
// For Canada: 'on' | 'bc' | 'qc' | etc.
export type RegionCode = string
```

**Now you need to update every file that imports `GermanStateCode` to use `RegionCode` instead.** Use find-and-replace across the project:

**Files to update (find `GermanStateCode`, replace with `RegionCode`):**
1. `src/types/index.ts` — already done above
2. `src/store/useSettingsStore.ts` — line 4 import + line 24 type
3. `src/data/states.ts` — line 1 import + line 3 type annotation
4. `src/data/questionBank.ts` — line 2 import + function parameter types
5. `src/hooks/useQuizSession.ts` — if it imports it (check — it doesn't import it directly, it uses `useSettingsStore`)

**For each file, find:**
```tsx
GermanStateCode
```
**Replace with:**
```tsx
RegionCode
```

**Example for `src/store/useSettingsStore.ts` line 4:**

**Find:**
```tsx
import type { GermanStateCode, SupportedLocale, TranslationLocale } from '@/types'
```
**Replace with:**
```tsx
import type { RegionCode, SupportedLocale, TranslationLocale } from '@/types'
```

**And line 24:**
**Find:**
```tsx
  selectedStateCode: GermanStateCode | null
  setSelectedStateCode: (code: GermanStateCode | null) => void
```
**Replace with:**
```tsx
  selectedStateCode: RegionCode | null
  setSelectedStateCode: (code: RegionCode | null) => void
```

**Do the same pattern for `states.ts` and `questionBank.ts`.**

**Test:** App should compile and work exactly the same. This is a type-only rename.

---

#### Step A.11 — Translate subscription screen strings

**Problem:** The subscription screen has English strings hardcoded in the JSX instead of using i18n.

**File:** `app/subscription.tsx`

**The i18n keys already exist** in both `en.ts` and `de.ts` under the `subscription` namespace. The screen just doesn't use them.

**Step 1: Add imports at the top of the file. Find:**
```tsx
import appConfig from '@/config/app.config'
```
**Add after it:**
```tsx
import { useTranslation } from 'react-i18next'
```

**Step 2: Add the hook inside `SubscriptionScreen`, after the existing hooks. Find:**
```tsx
const [loading, setLoading] = useState(false)
```
**Add after it:**
```tsx
const { t } = useTranslation()
```

**Step 3: Replace hardcoded strings. Find:**
```tsx
const FEATURES = [
  'All questions — always free',
  'Zero ads — anywhere in app',
  'Offline mode',
  'Detailed progress stats',
  'Cancel anytime',
]
```

**Delete this const entirely** (remove lines 10-16). Instead, build the features list inside the component using `t()`:

**Inside the component (after the `t` hook), add:**
```tsx
const features = [
  t('subscription.feature1'),
  t('subscription.feature2'),
  t('subscription.feature3'),
  t('subscription.feature4'),
  t('subscription.feature5'),
]
```

**Then in the JSX, replace `FEATURES` with `features`. Find:**
```tsx
{FEATURES.map((f) => (
```
**Replace with:**
```tsx
{features.map((f) => (
```

**Step 4: Replace the hero text. Find:**
```tsx
<Text style={[typography.h2, { color: c.textPrimary }]}>Go Ad-Free</Text>
<Text style={[typography.small, { color: c.textMuted, textAlign: 'center', lineHeight: 20 }]}>
  All questions stay free. Remove ads for{'\n'}a distraction-free experience.
</Text>
```
**Replace with:**
```tsx
<Text style={[typography.h2, { color: c.textPrimary }]}>{t('subscription.title')}</Text>
<Text style={[typography.small, { color: c.textMuted, textAlign: 'center', lineHeight: 20 }]}>
  {t('subscription.description')}
</Text>
```

**Step 5: Replace the PlanCard labels. Find:**
```tsx
<PlanCard
  label="Monthly"
  price="€1.99"
```
**Replace `label="Monthly"` with `label={t('subscription.monthly')}`.**

**Find:**
```tsx
<PlanCard
  label="Yearly"
  price="€9.99"
  sub="€0.83/month · Save 58%"
```
**Replace `label="Yearly"` with `label={t('subscription.yearly')}`.**

**Replace `badge="BEST VALUE"` with `badge={t('subscription.bestValue')}`.**

**Test:** Switch to German. The subscription screen should now show German text.

---

#### Step A.12 — Extract weak question logic to remove duplication

**Problem:** Weak question calculation exists in both `useProgressStore.ts` (getWeakIds) and `app/questions/index.tsx` (line 60, inline).

**File:** `app/questions/index.tsx`

**Find this inline weak calculation (around line 60):**
```tsx
const weak = attemptCount >= 2 && accuracy < 0.5
```

**Replace with:**
```tsx
const weak = attemptCount >= 2 && accuracy < 0.5
```

Actually, this one is fine as-is — it's a local variable derived from data already in scope. The real duplication is that `useProgressStore.getWeakIds()` re-derives the same logic from scratch. But the logic is simple (2 lines) and both locations need it for different reasons. The duplication is tolerable.

**Skip this step.** The duplication is too minor to justify a refactor. Move on.

---

#### Step A.13 — Add error boundary component

**Problem:** If any screen crashes (corrupted data, missing question), the whole app goes white with no recovery.

**Step 1: Create new file** `src/components/ErrorBoundary.tsx`:

```tsx
import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>😵</Text>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.sub}>Please restart the app</Text>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => this.setState({ hasError: false })}
          >
            <Text style={styles.btnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )
    }
    return this.props.children
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: '#111' },
  sub: { fontSize: 14, color: '#666', marginBottom: 20 },
  btn: { backgroundColor: '#1f7a4d', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
})
```

**Step 2: Wrap the app in it.**

**File:** `app/_layout.tsx`

**Add import at the top:**
```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary'
```

**Wrap the return. Find:**
```tsx
return (
  <>
    <StatusBar style={isDark ? 'light' : 'dark'} />
    <Stack
```

**Replace with:**
```tsx
return (
  <ErrorBoundary>
    <StatusBar style={isDark ? 'light' : 'dark'} />
    <Stack
```

**And find the closing:**
```tsx
    </Stack>
  </>
)
```

**Replace with:**
```tsx
    </Stack>
  </ErrorBoundary>
)
```

**Test:** App should run normally. The error boundary only shows when something crashes.

---

### PHASE B: Onboarding + Settings

---

#### Step B.1 — Create the onboarding screen

**Create new file:** `app/onboarding.tsx`

```tsx
import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useThemeColors } from '@/hooks/useThemeColors'
import { GERMAN_STATES } from '@/data/states'
import { changeLanguage } from '@/i18n'
import { palette, spacing, radius, typography } from '@/theme'
import appConfig from '@/config/app.config'

export default function OnboardingScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const { c, isDark } = useThemeColors()
  const {
    setSelectedStateCode,
    setTranslationLocale,
    setUiLocale,
    setOnboardingComplete,
  } = useSettingsStore()

  const [step, setStep] = useState(0)
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [selectedLang, setSelectedLang] = useState<'en' | 'de'>('en')

  function finish() {
    if (selectedState) setSelectedStateCode(selectedState)
    setTranslationLocale(selectedLang)
    setUiLocale(selectedLang)
    changeLanguage(selectedLang)
    setOnboardingComplete()
    router.replace('/')
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>
      {step === 0 && (
        <View style={styles.center}>
          <Text style={{ fontSize: 64 }}>{appConfig.flagEmoji}</Text>
          <Text style={[typography.h1, { color: c.textPrimary, textAlign: 'center', marginTop: 16 }]}>
            {appConfig.appName}
          </Text>
          <Text style={[typography.body, { color: c.textMuted, textAlign: 'center', marginTop: 8 }]}>
            {appConfig.appTagline}
          </Text>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: palette.primary }]}
            onPress={() => setStep(1)}
          >
            <Text style={styles.btnText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 1 && (
        <View style={styles.stepContainer}>
          <Text style={[typography.h2, { color: c.textPrimary, marginBottom: 16 }]}>
            Select your region
          </Text>
          <View style={styles.optionList}>
            {GERMAN_STATES.map((state) => (
              <TouchableOpacity
                key={state.code}
                style={[
                  styles.option,
                  {
                    backgroundColor: selectedState === state.code ? palette.primary : c.card,
                    borderColor: selectedState === state.code ? palette.primary : c.border,
                  },
                ]}
                onPress={() => setSelectedState(state.code)}
              >
                <Text style={[typography.smallBd, {
                  color: selectedState === state.code ? '#fff' : c.textPrimary,
                }]}>
                  {state.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: palette.primary, opacity: selectedState ? 1 : 0.5 }]}
            onPress={() => selectedState && setStep(2)}
            disabled={!selectedState}
          >
            <Text style={styles.btnText}>Next</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 2 && (
        <View style={styles.center}>
          <Text style={[typography.h2, { color: c.textPrimary, marginBottom: 16 }]}>
            Choose your language
          </Text>
          {(['en', 'de'] as const).map((lang) => (
            <TouchableOpacity
              key={lang}
              style={[
                styles.langOption,
                {
                  backgroundColor: selectedLang === lang ? palette.primary : c.card,
                  borderColor: selectedLang === lang ? palette.primary : c.border,
                },
              ]}
              onPress={() => setSelectedLang(lang)}
            >
              <Text style={[typography.body, {
                color: selectedLang === lang ? '#fff' : c.textPrimary,
              }]}>
                {lang === 'en' ? '🇬🇧 English' : '🇩🇪 Deutsch'}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: palette.primary }]}
            onPress={finish}
          >
            <Text style={styles.btnText}>Start Learning</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  stepContainer: { flex: 1, padding: spacing.lg },
  optionList: { gap: 8, marginBottom: 20 },
  option: { padding: 12, borderRadius: radius.lg, borderWidth: 1.5 },
  langOption: { width: '100%', padding: 16, borderRadius: radius.lg, borderWidth: 1.5, marginBottom: 8 },
  btn: { marginTop: 24, paddingHorizontal: 32, paddingVertical: 14, borderRadius: radius.lg, width: '100%', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
})
```

**Test:** Won't be wired up yet. Just make sure the file compiles.

---

#### Step B.2 — Register onboarding screen in the router

**File:** `app/_layout.tsx`

**Find (inside the `<Stack>`):**
```tsx
<Stack.Screen name="index" />
```

**Add BEFORE it:**
```tsx
<Stack.Screen name="onboarding" options={{ animation: 'none' }} />
```

**Test:** You can now navigate to `/onboarding` manually. Next step wires it up automatically.

---

#### Step B.3 — Gate home screen on onboarding completion

**File:** `app/index.tsx`

**Add import at the top:**
```tsx
import { useEffect } from 'react'
```

**(Note: `useMemo` and `useState` are already imported. Just add `useEffect` to the existing import.)**

**Find:**
```tsx
import { useMemo, useState } from 'react'
```

**Replace with:**
```tsx
import { useEffect, useMemo, useState } from 'react'
```

**Inside the `HomeScreen` component, add this right after the existing hooks (after `const [isStateOpen, setIsStateOpen] = useState(false)`):**

```tsx
const { hasCompletedOnboarding } = useSettingsStore()

useEffect(() => {
  if (!hasCompletedOnboarding) {
    router.replace('/onboarding')
  }
}, [hasCompletedOnboarding, router])
```

**Note:** `useSettingsStore` is already imported. You just need to destructure `hasCompletedOnboarding` from it. Update the existing destructuring:

**Find:**
```tsx
const { selectedStateCode, setSelectedStateCode } = useSettingsStore()
```

**Replace with:**
```tsx
const { selectedStateCode, setSelectedStateCode, hasCompletedOnboarding } = useSettingsStore()
```

**Test:** Clear app data or reset AsyncStorage. Open the app — you should see the onboarding screen. Complete it, and you land on the home screen. On next app open, you go straight to home.

---

#### Step B.4 — Create settings screen

**Create new file:** `app/settings.tsx`

```tsx
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useProgressStore } from '@/store/useProgressStore'
import { useThemeColors } from '@/hooks/useThemeColors'
import { palette, spacing, radius, typography } from '@/theme'
import appConfig from '@/config/app.config'

export default function SettingsScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const { isDark, c } = useThemeColors()
  const { theme, setTheme } = useSettingsStore()
  const { resetAll } = useProgressStore()

  function confirmReset() {
    Alert.alert(
      'Reset Progress',
      'This will delete all your progress, bookmarks, and session history. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => resetAll(),
        },
      ],
    )
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity style={[styles.backBtn, { backgroundColor: c.card }]} onPress={() => router.back()}>
            <Text style={{ color: c.textSecond }}>✕</Text>
          </TouchableOpacity>
          <Text style={[typography.h3, { color: c.textPrimary }]}>Settings</Text>
          <View style={{ width: 32 }} />
        </View>

        <Text style={[typography.label, { color: c.textMuted, marginBottom: 8 }]}>APPEARANCE</Text>

        {(['light', 'dark', 'system'] as const).map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.row, { backgroundColor: c.card, borderColor: theme === option ? palette.primary : c.border }]}
            onPress={() => setTheme(option)}
          >
            <Text style={[typography.body, { color: c.textPrimary }]}>
              {option === 'light' ? '☀️ Light' : option === 'dark' ? '🌙 Dark' : '📱 System'}
            </Text>
            {theme === option && <Text style={{ color: palette.primary, fontWeight: '700' }}>✓</Text>}
          </TouchableOpacity>
        ))}

        <Text style={[typography.label, { color: c.textMuted, marginTop: 20, marginBottom: 8 }]}>QUICK ACTIONS</Text>

        <TouchableOpacity
          style={[styles.row, { backgroundColor: c.card, borderColor: c.border }]}
          onPress={() => router.push('/language')}
        >
          <Text style={[typography.body, { color: c.textPrimary }]}>🌐 Language</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.row, { backgroundColor: c.card, borderColor: c.border }]}
          onPress={() => router.push('/subscription')}
        >
          <Text style={[typography.body, { color: c.textPrimary }]}>⭐ Go Premium</Text>
        </TouchableOpacity>

        <Text style={[typography.label, { color: c.textMuted, marginTop: 20, marginBottom: 8 }]}>DATA</Text>

        <TouchableOpacity
          style={[styles.row, { backgroundColor: c.card, borderColor: palette.red }]}
          onPress={confirmReset}
        >
          <Text style={[typography.body, { color: palette.red }]}>🗑 Reset All Progress</Text>
        </TouchableOpacity>

        <Text style={[typography.tiny, { color: c.textMuted, marginTop: 20, textAlign: 'center' }]}>
          {appConfig.appName} v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  backBtn: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: radius.lg, borderWidth: 1.5, marginBottom: 8 },
})
```

**Test:** Won't be accessible yet. Next step adds the route and a way to open it.

---

#### Step B.5 — Register settings screen in the router

**File:** `app/_layout.tsx`

**Find:**
```tsx
<Stack.Screen name="subscription" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
```

**Add after it:**
```tsx
<Stack.Screen name="settings" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
```

**Test:** Route registered. Next step adds a button to open it.

---

#### Step B.6 — Add settings gear icon to AppHeader

**File:** `src/components/AppHeader.tsx`

**Find the theme toggle pill (the second TouchableOpacity in the actions area):**
```tsx
<TouchableOpacity
  style={[styles.pill, { backgroundColor: c.card, borderColor: c.border }]}
  onPress={() => setTheme(isDark ? 'light' : 'dark')}
>
  <Text style={[typography.tiny, { color: c.textSecond }]}>
    {isDark ? '☀️' : '🌙'} {themeLabel}
  </Text>
</TouchableOpacity>
```

**Replace with a settings gear button:**
```tsx
<TouchableOpacity
  style={[styles.pill, { backgroundColor: c.card, borderColor: c.border }]}
  onPress={() => router.push('/settings')}
>
  <Text style={[typography.tiny, { color: c.textSecond }]}>
    ⚙️
  </Text>
</TouchableOpacity>
```

**Why:** Theme toggle is now in the settings screen. No need for it in the header anymore. Keeps the header clean.

**Test:** Open the app. Tap the gear icon in the header. Settings screen should open as a modal.

---

### PHASE C: Monetization

---

#### Step C.1 — Install expo-dev-client

**Problem:** AdMob and RevenueCat are native modules. They don't work in Expo Go. You need a development build.

**Run in terminal:**
```bash
cd /path/to/mobile-app-template
npx expo install expo-dev-client
```

**After installing, you'll need to create a dev build instead of using Expo Go:**
```bash
npx expo run:ios
# or
npx expo run:android
```

**Or use EAS for cloud builds:**
```bash
eas build --profile development --platform ios
```

**Test:** The app should still launch, now in a development build instead of Expo Go.

---

#### Step C.2 — Uncomment BannerAd in AdBanner.tsx

**File:** `src/components/AdBanner.tsx`

**Replace the entire file content with:**
```tsx
import { View, Text, StyleSheet, Platform } from 'react-native'
import { useSettingsStore } from '@/store/useSettingsStore'
import { palette, spacing, radius } from '@/theme'
import appConfig from '@/config/app.config'

export function AdBanner({ isDark }: { isDark: boolean }) {
  const isSubscribed = useSettingsStore((s) => s.isSubscribed)
  if (isSubscribed) return null
  if (!appConfig.featureFlags.bannerAds) return null

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.wrap, isDark ? styles.wrapDark : styles.wrapLight]}>
        <Text style={[styles.text, isDark ? styles.textDark : styles.textLight]}>
          Ad placeholder
        </Text>
      </View>
    )
  }

  // Native: use real AdMob banner
  // This import is inside the condition because it crashes on web
  const { BannerAd, BannerAdSize } = require('react-native-google-mobile-ads')
  const adUnitId = Platform.OS === 'ios'
    ? appConfig.adConfig.bannerIdIOS
    : appConfig.adConfig.bannerIdAndroid

  return (
    <View style={{ marginTop: spacing.sm }}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.sm,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  wrapLight: { backgroundColor: '#f8fafc', borderColor: palette.light.border },
  wrapDark:  { backgroundColor: palette.dark.bg, borderColor: palette.dark.border },
  text:  { fontSize: 11, fontWeight: '600' },
  textLight: { color: palette.light.textMuted },
  textDark:  { color: palette.dark.textMuted },
})
```

**Note:** The `require()` inside the function is intentional — it prevents the native module from crashing the web build. This pattern is common in Expo apps.

**Test:** On a dev build (not Expo Go), you should see test banner ads. On web, you see the placeholder text.

---

#### Step C.3 — Add enabled flag to adConfig

**File:** `src/types/index.ts`

**Find:**
```tsx
export interface AdConfig {
  bannerIdAndroid: string
  bannerIdIOS: string
  interstitialIdAndroid: string
  interstitialIdIOS: string
}
```

**Replace with:**
```tsx
export interface AdConfig {
  enabled: boolean
  bannerIdAndroid: string
  bannerIdIOS: string
  interstitialIdAndroid: string
  interstitialIdIOS: string
  interstitialFrequency: number    // show interstitial every Nth session
  firstInterstitialAfter: number   // skip interstitials for first N sessions
}
```

**File:** `src/config/app.config.ts`

**Find:**
```tsx
  adConfig: {
    bannerIdAndroid:         'ca-app-pub-3940256099942544/6300978111', // test ID
    bannerIdIOS:             'ca-app-pub-3940256099942544/2934735716', // test ID
    interstitialIdAndroid:   'ca-app-pub-3940256099942544/1033173712', // test ID
    interstitialIdIOS:       'ca-app-pub-3940256099942544/4411468910', // test ID
  },
```

**Replace with:**
```tsx
  adConfig: {
    enabled: true,
    bannerIdAndroid:         'ca-app-pub-3940256099942544/6300978111', // test ID
    bannerIdIOS:             'ca-app-pub-3940256099942544/2934735716', // test ID
    interstitialIdAndroid:   'ca-app-pub-3940256099942544/1033173712', // test ID
    interstitialIdIOS:       'ca-app-pub-3940256099942544/4411468910', // test ID
    interstitialFrequency:   3,   // show every 3rd session
    firstInterstitialAfter:  3,   // no interstitial before 3rd session
  },
```

**Test:** App compiles. No visual changes.

---

#### Step C.4 — Uncomment RevenueCat in subscription.tsx

**File:** `app/subscription.tsx`

**This step has sub-parts. Do them in order.**

**Sub-step 1: Add RevenueCat import. Add at the top of the file:**
```tsx
import Purchases from 'react-native-purchases'
```

**Sub-step 2: Replace the `subscribe` function. Find the entire `subscribe` function and replace:**

```tsx
async function subscribe() {
  setLoading(true)
  try {
    const offerings = await Purchases.getOfferings()
    const pkg = selectedPlan === 'yearly'
      ? offerings.current?.annual
      : offerings.current?.monthly
    if (pkg) {
      const { customerInfo } = await Purchases.purchasePackage(pkg)
      if (customerInfo.entitlements.active['premium']) {
        setSubscribed(true)
        router.back()
      }
    }
  } catch (e: any) {
    if (!e.userCancelled) Alert.alert('Error', 'Purchase failed. Please try again.')
  } finally {
    setLoading(false)
  }
}
```

**Sub-step 3: Replace the `restore` function:**

```tsx
async function restore() {
  try {
    const { customerInfo } = await Purchases.restorePurchases()
    if (customerInfo.entitlements.active['premium']) {
      setSubscribed(true)
      Alert.alert('Restored', 'Your premium access has been restored.')
      router.back()
    } else {
      Alert.alert('Restore', 'No previous purchase found.')
    }
  } catch {
    Alert.alert('Error', 'Could not restore purchases. Try again later.')
  }
}
```

**Test:** Won't work yet until RevenueCat is configured (Step C.5). But the code should compile.

---

#### Step C.5 — Initialize RevenueCat on app launch

**File:** `app/_layout.tsx`

**Add imports at the top:**
```tsx
import { useEffect } from 'react'
import { Platform } from 'react-native'
import Purchases from 'react-native-purchases'
import appConfig from '@/config/app.config'
```

**(Note: `useEffect` is already imported. Just add the other imports.)**

**Inside `RootLayout`, after the existing `useEffect` for language, add:**

```tsx
useEffect(() => {
  const apiKey = Platform.OS === 'ios'
    ? appConfig.revenueCatConfig.apiKeyIOS
    : appConfig.revenueCatConfig.apiKeyAndroid
  if (apiKey && apiKey !== 'REVENUECAT_ANDROID_KEY' && apiKey !== 'REVENUECAT_IOS_KEY') {
    Purchases.configure({ apiKey })
  }
}, [])
```

**Why the key check:** During development with placeholder keys, this won't crash. Once you add real keys, it auto-initializes.

**Test:** App launches without crash. RevenueCat won't do anything until you set up real keys in the RevenueCat dashboard and replace the placeholders in `app.config.ts`.

---

#### Step C.6 — Check entitlements on app launch

**File:** `app/_layout.tsx`

**Add this inside `RootLayout`, after the RevenueCat configure `useEffect`:**

```tsx
const { setSubscribed } = useSettingsStore()

useEffect(() => {
  async function checkEntitlements() {
    try {
      const customerInfo = await Purchases.getCustomerInfo()
      const isPremium = !!customerInfo.entitlements.active['premium']
      setSubscribed(isPremium)
    } catch {
      // Not configured yet or offline — keep current state
    }
  }
  checkEntitlements()
}, [setSubscribed])
```

**(Note: `useSettingsStore` is already imported. Just destructure `setSubscribed` from the existing usage.)**

**Update the existing destructuring. Find:**
```tsx
const { theme, uiLocale } = useSettingsStore()
```

**Replace with:**
```tsx
const { theme, uiLocale, setSubscribed } = useSettingsStore()
```

**Test:** App launches. If user has a premium entitlement, ads disappear. If not, nothing changes.

---

### PHASE D: UX Polish

---

#### Step D.1 — Add progress summary to home screen

**File:** `app/index.tsx`

**Add import:**
```tsx
import { useProgressStore } from '@/store/useProgressStore'
```

**Inside `HomeScreen`, add after the existing hooks:**
```tsx
const { progress } = useProgressStore()
const totalAnswered = Object.values(progress).filter((p) => p.attempts.length > 0).length
const totalCorrect = Object.values(progress).reduce(
  (sum, p) => sum + p.attempts.filter((a) => a.result === 'correct').length, 0
)
const totalAttempts = Object.values(progress).reduce(
  (sum, p) => sum + p.attempts.length, 0
)
const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0
```

**In the JSX, add this block right after the `summaryCard` View and before the `btnGroup` View. Find:**
```tsx
</View>

<View style={styles.btnGroup}>
```

**Add between them:**
```tsx
{totalAnswered > 0 && (
  <View style={[styles.summaryCard, { backgroundColor: c.card }]}>
    <Text style={[typography.smallBd, { color: c.textPrimary }]}>
      {t('home.progress')}
    </Text>
    <Text style={[typography.small, { color: c.textMuted }]}>
      {totalAnswered}/{relevantQuestions.length} {t('home.practiced')} · {overallAccuracy}% accuracy
    </Text>
  </View>
)}
```

**Test:** Answer a few questions. Go back to home. You should see "X/310 Practiced · Y% accuracy" below the question count card.

---

#### Step D.2 — Add empty states for weak and bookmarked filters

**File:** `app/practice/index.tsx`

**Find the start button area. Find:**
```tsx
<TouchableOpacity style={[styles.startBtn, { backgroundColor: palette.primary }]} onPress={start} disabled={filteredCount === 0}>
  <Text style={styles.startBtnText}>▶ {t('session.start', { count: filteredCount })}</Text>
</TouchableOpacity>
```

**Add right after the `</TouchableOpacity>` and before the closing of `actionRow`:**
```tsx
{filteredCount === 0 && (
  <Text style={[typography.tiny, { color: c.textMuted, textAlign: 'center', marginTop: 8 }]}>
    {filter === 'weak'
      ? 'No weak questions yet. Keep practicing!'
      : filter === 'bookmarked'
        ? 'No bookmarks yet. Tap 🔖 on any question to save it.'
        : 'No questions match this filter.'}
  </Text>
)}
```

Actually, this should go outside the `actionRow`. Let me adjust. Add it right before `<BottomNav active="practice" />`:

**Find:**
```tsx
<BottomNav active="practice" />
```

**Add before it:**
```tsx
{filteredCount === 0 && (
  <View style={{ padding: spacing.lg, alignItems: 'center' }}>
    <Text style={{ fontSize: 32, marginBottom: 8 }}>
      {filter === 'weak' ? '💪' : filter === 'bookmarked' ? '🔖' : '📭'}
    </Text>
    <Text style={[typography.small, { color: c.textMuted, textAlign: 'center' }]}>
      {filter === 'weak'
        ? 'No weak questions yet. Keep practicing!'
        : filter === 'bookmarked'
          ? 'No bookmarks yet. Tap 🔖 on any question to save it.'
          : 'No questions match this filter.'}
    </Text>
  </View>
)}
```

**Test:** Go to Practice. Select "Weak Questions" (should be 0 at start). You should see the friendly empty state message instead of just a disabled button.

---

### PHASE E: Release Preparation

---

#### Step E.1 — Configure app.json for production

**File:** `app.json`

**Update these fields (replace `yourname` with your actual developer name/company):**

```json
{
  "expo": {
    "name": "Leben in Deutschland",
    "slug": "leben-in-deutschland",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "leben",
    "userInterfaceStyle": "automatic",
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourname.lebenindeutschland",
      "buildNumber": "1"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/icon.png",
        "backgroundColor": "#1f7a4d"
      },
      "package": "com.yourname.lebenindeutschland",
      "versionCode": 1
    },
    "plugins": [
      "expo-router",
      "react-native-google-mobile-ads"
    ]
  }
}
```

**Test:** Run `npx expo start`. No crash.

---

#### Step E.2 — Add .gitignore entries for secrets

**File:** `.gitignore`

**Add these lines at the end:**

```
# Secrets
google-services.json
GoogleService-Info.plist
.env
.env.local
.env.production
```

**Test:** Run `git status`. These files (if they exist) should not show up.

---

#### Step E.3 — Create EAS config

**Run in terminal:**
```bash
cd /path/to/mobile-app-template
eas build:configure
```

This creates `eas.json`. Then edit it to have development, preview, and production profiles:

```json
{
  "cli": { "version": ">= 3.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

**Test:** Run `eas build --profile development --platform android` to test. (Uses free tier.)

---

**That's it for the granular steps.** Each step is one small change. Do them in order, test after each one, and commit. By the time you finish Phase A + B + C + D + E, your app is ready for the store.

**For future apps**, you clone this repo and only change:
- `src/config/app.config.ts` (name, colors, exam rules, flags)
- `src/content/` folder (new questions, regions)
- `src/i18n/locales/` (app-specific strings)
- `app.json` (bundle ID, name)
- `assets/` (icon, splash)
- Store keys in both Zustand stores

Everything else stays exactly the same.
