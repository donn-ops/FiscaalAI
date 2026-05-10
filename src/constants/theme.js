import { StyleSheet, Platform } from 'react-native';

export const Colors = {
  pageBg:        '#dbeafe',
  phoneBg:       '#eff6ff',
  surface:       'rgba(255,255,255,0.65)',
  surfaceHigh:   'rgba(255,255,255,0.82)',
  blue:          '#2563eb',
  blueDeep:      '#1d4ed8',
  blueBright:    '#3b82f6',
  blueLight:     '#60a5fa',
  bluePale:      '#93c5fd',
  textPrimary:   '#0f172a',
  textSecond:    '#334155',
  textMuted:     '#64748b',
  textLight:     '#94a3b8',
  green:         '#10b981',
  greenBg:       'rgba(16,185,129,0.1)',
  greenBorder:   'rgba(16,185,129,0.25)',
  greenText:     '#065f46',
  amber:         '#f59e0b',
  red:           '#ef4444',
  border:        'rgba(255,255,255,0.9)',
  borderBlue:    'rgba(59,130,246,0.2)',
  borderBlueMid: 'rgba(59,130,246,0.35)',
  white:         '#ffffff',
};

export const Shadows = {
  sm: { shadowColor:'#1d4ed8', shadowOpacity:0.08, shadowRadius:8,  shadowOffset:{width:0,height:2}, elevation:2 },
  md: { shadowColor:'#1d4ed8', shadowOpacity:0.13, shadowRadius:16, shadowOffset:{width:0,height:4}, elevation:4 },
  lg: { shadowColor:'#1d4ed8', shadowOpacity:0.22, shadowRadius:28, shadowOffset:{width:0,height:8}, elevation:8 },
  blue:{ shadowColor:'#1d4ed8', shadowOpacity:0.35, shadowRadius:16, shadowOffset:{width:0,height:4}, elevation:6 },
};

export const Radii = {
  pill: 999,
  xl:   24,
  lg:   18,
  md:   14,
  sm:   10,
};

export const Spacing = {
  xs:4, sm:8, md:14, lg:20, xl:28, xxl:40,
};
