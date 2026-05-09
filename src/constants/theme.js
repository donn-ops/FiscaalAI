// ─── Taxly Design System ───────────────────────────────────────────────────
// Baby Blue theme — import this in every screen

import { StyleSheet, Platform } from ‘react-native’;

export const Colors = {
// Backgrounds
pageBg:        ‘#dbeafe’,
pageBgDeep:    ‘#bfdbfe’,
phoneBg:       ‘#eff6ff’,
surface:       ‘rgba(255,255,255,0.65)’,
surfaceHigh:   ‘rgba(255,255,255,0.82)’,
surfaceMid:    ‘rgba(255,255,255,0.5)’,

// Brand
blue:          ‘#2563eb’,
blueDeep:      ‘#1d4ed8’,
blueBright:    ‘#3b82f6’,
blueLight:     ‘#60a5fa’,
bluePale:      ‘#93c5fd’,
blueFaint:     ‘#dbeafe’,
blueXFaint:    ‘#eff6ff’,

// Text
textPrimary:   ‘#0f172a’,
textSecond:    ‘#334155’,
textMuted:     ‘#64748b’,
textLight:     ‘#94a3b8’,

// Semantic
green:         ‘#10b981’,
greenBg:       ‘rgba(16,185,129,0.1)’,
greenBorder:   ‘rgba(16,185,129,0.25)’,
greenText:     ‘#065f46’,
amber:         ‘#f59e0b’,
amberBg:       ‘rgba(245,158,11,0.1)’,
red:           ‘#ef4444’,
redBg:         ‘rgba(239,68,68,0.1)’,
purple:        ‘#8b5cf6’,

// Borders
border:        ‘rgba(255,255,255,0.9)’,
borderBlue:    ‘rgba(59,130,246,0.2)’,
borderBlueMid: ‘rgba(59,130,246,0.35)’,

white:         ‘#ffffff’,
black:         ‘#000000’,
};

export const Shadows = {
sm: {
shadowColor: ‘#1d4ed8’,
shadowOpacity: 0.08,
shadowRadius: 8,
shadowOffset: { width: 0, height: 2 },
elevation: 2,
},
md: {
shadowColor: ‘#1d4ed8’,
shadowOpacity: 0.13,
shadowRadius: 16,
shadowOffset: { width: 0, height: 4 },
elevation: 4,
},
lg: {
shadowColor: ‘#1d4ed8’,
shadowOpacity: 0.22,
shadowRadius: 28,
shadowOffset: { width: 0, height: 8 },
elevation: 8,
},
blue: {
shadowColor: ‘#1d4ed8’,
shadowOpacity: 0.35,
shadowRadius: 16,
shadowOffset: { width: 0, height: 4 },
elevation: 6,
},
};

export const Radii = {
pill: 999,
xl:   24,
lg:   18,
md:   14,
sm:   10,
};

export const Spacing = {
xs:  4,
sm:  8,
md:  14,
lg:  20,
xl:  28,
xxl: 40,
};

// ─── Shared component styles ───────────────────────────────────────────────

export const SharedStyles = StyleSheet.create({
// Screen
safe: {
flex: 1,
backgroundColor: Colors.pageBg,
},
screenBg: {
flex: 1,
backgroundColor: Colors.pageBg,
},

// Cards
card: {
backgroundColor: Colors.surface,
borderRadius: Radii.xl,
borderWidth: 1,
borderColor: Colors.border,
padding: Spacing.lg,
…Shadows.sm,
},
cardHigh: {
backgroundColor: Colors.surfaceHigh,
borderRadius: Radii.xl,
borderWidth: 1,
borderColor: Colors.border,
padding: Spacing.lg,
…Shadows.md,
},

// Buttons
btnPrimary: {
backgroundColor: Colors.blueDeep,
borderRadius: Radii.pill,
paddingVertical: 14,
paddingHorizontal: 24,
alignItems: ‘center’,
justifyContent: ‘center’,
flexDirection: ‘row’,
gap: 8,
…Shadows.blue,
},
btnPrimaryText: {
color: Colors.white,
fontSize: 14,
fontWeight: ‘700’,
letterSpacing: 0.2,
},
btnSecondary: {
backgroundColor: Colors.surface,
borderRadius: Radii.pill,
paddingVertical: 11,
paddingHorizontal: 20,
alignItems: ‘center’,
justifyContent: ‘center’,
flexDirection: ‘row’,
gap: 8,
borderWidth: 1,
borderColor: Colors.border,
…Shadows.sm,
},
btnSecondaryText: {
color: Colors.blueDeep,
fontSize: 13,
fontWeight: ‘600’,
},
btnGhost: {
backgroundColor: ‘transparent’,
borderRadius: Radii.pill,
paddingVertical: 10,
paddingHorizontal: 18,
alignItems: ‘center’,
borderWidth: 1,
borderColor: Colors.borderBlue,
},
btnGhostText: {
color: Colors.blueDeep,
fontSize: 13,
fontWeight: ‘600’,
},
btnSmall: {
backgroundColor: Colors.surface,
borderRadius: Radii.pill,
paddingVertical: 7,
paddingHorizontal: 16,
borderWidth: 1,
borderColor: Colors.border,
…Shadows.sm,
},
btnSmallText: {
color: Colors.blueDeep,
fontSize: 12,
fontWeight: ‘600’,
},

// Pills / Tags
pill: {
borderRadius: Radii.pill,
paddingVertical: 4,
paddingHorizontal: 12,
alignSelf: ‘flex-start’,
},
pillText: {
fontSize: 10,
fontWeight: ‘700’,
letterSpacing: 0.5,
},

// Status bar / header
screenHeader: {
flexDirection: ‘row’,
alignItems: ‘center’,
justifyContent: ‘space-between’,
paddingHorizontal: Spacing.lg,
paddingVertical: 13,
backgroundColor: ‘rgba(219,234,254,0.97)’,
borderBottomWidth: 1,
borderBottomColor: Colors.border,
},
screenHeaderTitle: {
fontSize: 15,
fontWeight: ‘700’,
color: Colors.textPrimary,
},

// Input
input: {
backgroundColor: Colors.surface,
borderRadius: Radii.pill,
paddingVertical: 13,
paddingHorizontal: 20,
fontSize: 14,
color: Colors.textPrimary,
borderWidth: 1,
borderColor: Colors.border,
…Shadows.sm,
},
inputFocused: {
borderColor: Colors.borderBlueMid,
backgroundColor: Colors.surfaceHigh,
},

// Section label
sectionLabel: {
fontSize: 10,
fontWeight: ‘700’,
color: Colors.textMuted,
letterSpacing: 1.5,
textTransform: ‘uppercase’,
marginBottom: 10,
marginTop: 16,
},

// Greeting
greetingSmall: {
fontSize: 11,
color: Colors.blueLight,
letterSpacing: 2.5,
textTransform: ‘uppercase’,
fontWeight: ‘700’,
marginBottom: 4,
textAlign: ‘center’,
},
greetingName: {
fontSize: 38,
fontWeight: ‘200’,
color: Colors.textPrimary,
letterSpacing: -1.5,
lineHeight: 42,
textAlign: ‘center’,
},

// Nav
navBar: {
flexDirection: ‘row’,
alignItems: ‘center’,
borderTopWidth: 1,
borderTopColor: Colors.border,
backgroundColor: ‘rgba(219,234,254,0.97)’,
paddingBottom: Platform.OS === ‘ios’ ? 20 : 10,
paddingTop: 8,
},
navBtn: {
flex: 1,
alignItems: ‘center’,
gap: 3,
},
navIcon: {
fontSize: 20,
},
navLabel: {
fontSize: 9,
letterSpacing: 1.2,
textTransform: ‘uppercase’,
fontWeight: ‘700’,
},

// Chip (inline pill with icon)
chip: {
flexDirection: ‘row’,
alignItems: ‘center’,
gap: 10,
backgroundColor: Colors.surface,
borderWidth: 1,
borderColor: Colors.border,
borderRadius: Radii.pill,
paddingVertical: 10,
paddingHorizontal: 16,
…Shadows.sm,
},
chipText: {
flex: 1,
fontSize: 12,
color: Colors.textSecond,
lineHeight: 18,
},
chipTag: {
fontSize: 9,
fontWeight: ‘700’,
borderRadius: Radii.pill,
paddingVertical: 2,
paddingHorizontal: 9,
borderWidth: 1,
overflow: ‘hidden’,
},

// Message bubbles
msgUser: {
alignSelf: ‘flex-end’,
backgroundColor: Colors.blueDeep,
borderRadius: 22,
borderBottomRightRadius: 6,
paddingVertical: 11,
paddingHorizontal: 15,
maxWidth: ‘78%’,
…Shadows.blue,
},
msgUserText: {
color: Colors.white,
fontSize: 13,
lineHeight: 20,
},
msgAi: {
alignSelf: ‘flex-start’,
backgroundColor: Colors.surfaceHigh,
borderRadius: 22,
borderBottomLeftRadius: 6,
paddingVertical: 11,
paddingHorizontal: 15,
maxWidth: ‘78%’,
borderWidth: 1,
borderColor: Colors.border,
…Shadows.sm,
},
msgAiText: {
color: Colors.textPrimary,
fontSize: 13,
lineHeight: 20,
},
});

// ─── Nav tab config ────────────────────────────────────────────────────────
export const NAV_TABS = [
{ screen: ‘Home’,    icon: ‘⊙’, label: ‘Home’ },
{ screen: ‘Chat’,   icon: ‘⬡’, label: ‘Chat’ },
{ screen: ‘Profile’, icon: ‘◯’, label: ‘Profiel’ },
];
