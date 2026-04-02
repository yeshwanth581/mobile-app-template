import Svg, { Circle, Line, Path, Rect } from 'react-native-svg'

const STROKE = 3.2

export function HomeIcon({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Path d="M8 26L32 6l24 20v28a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3V26z" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M24 57V37h16v20" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

export function StudyIcon({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Circle cx="32" cy="14" r="8" stroke={color} strokeWidth={STROKE} />
      <Path d="M27 10c3-3 7-3 10 0" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M18 38c0-8 6-14 14-14s14 6 14 14" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M14 40c0 0 6-3 18-3v18c-12 0-18 3-18 3V40z" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M50 40c0 0-6-3-18-3v18c12 0 18 3 18 3V40z" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="32" y1="37" x2="32" y2="55" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M18 38l-4 2" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M46 38l4 2" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

export function PracticeIcon({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Path d="M22 12H16a5 5 0 0 0-5 5v34a5 5 0 0 0 5 5h32a5 5 0 0 0 5-5V17a5 5 0 0 0-5-5h-6" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
      <Rect x="22" y="5" width="20" height="10" rx="3" stroke={color} strokeWidth={STROKE} />
      <Path d="M19 28l4 4 7-7" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="36" y1="27" x2="46" y2="27" stroke={color} strokeWidth={STROKE} strokeLinecap="round" />
      <Path d="M19 42l4 4 7-7" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="36" y1="41" x2="46" y2="41" stroke={color} strokeWidth={STROKE} strokeLinecap="round" />
    </Svg>
  )
}

export function ExamIcon({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <Circle cx="60" cy="18" r="13" stroke={color} strokeWidth={STROKE} />
      <Circle cx="60" cy="18" r="1.5" fill={color} />
      <Line x1="60" y1="9" x2="60" y2="18" stroke={color} strokeWidth={STROKE} strokeLinecap="round" />
      <Line x1="60" y1="18" x2="66" y2="22" stroke={color} strokeWidth={STROKE} strokeLinecap="round" />
      <Rect x="12" y="16" width="40" height="52" rx="3" stroke={color} strokeWidth={STROKE} />
      <Rect x="6" y="11" width="40" height="52" rx="3" stroke={color} strokeWidth={STROKE} />
      <Rect x="17" y="7" width="12" height="7" rx="2.5" stroke={color} strokeWidth={STROKE} />
      <Circle cx="15" cy="26" r="3.5" stroke={color} strokeWidth={STROKE} />
      <Path d="M13.2 26l1.8 2 3.5-3.5" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="23" y1="25" x2="40" y2="25" stroke={color} strokeWidth={STROKE} strokeLinecap="round" />
      <Circle cx="15" cy="39" r="3.5" stroke={color} strokeWidth={STROKE} />
      <Path d="M13.2 39l1.8 2 3.5-3.5" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="23" y1="38" x2="40" y2="38" stroke={color} strokeWidth={STROKE} strokeLinecap="round" />
      <Circle cx="15" cy="52" r="3.5" stroke={color} strokeWidth={STROKE} />
      <Path d="M13.2 52l1.8 2 3.5-3.5" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="23" y1="51" x2="40" y2="51" stroke={color} strokeWidth={STROKE} strokeLinecap="round" />
    </Svg>
  )
}

export function BookmarkIcon({ color, fill = 'none', size = 16 }: { color: string; fill?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Path d="M14 6h36a3 3 0 0 1 3 3v49l-21-14-21 14V9a3 3 0 0 1 3-3z" stroke={color} fill={fill} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}
