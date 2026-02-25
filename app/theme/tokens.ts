// Design Tokens — single source of truth for all visual constants.
// Import from here instead of hardcoding values in components.

export const colors = {
  primary: '#1890ff',
  success: '#28d440',
  danger: '#f5222d',
  warning: '#ffa733',
  streamPush: '#11c9f3',

  bgDark: '#001529',
  bgPanel: '#fafafa',
  bgSubtle: '#f5f5f5',
  bgHighlight: '#f3f6f7',

  textPrimary: '#014f9a',
  textSecondary: '#555',
  textMuted: '#888',
  textDisabled: '#bbb',

  borderLight: '#e8e8e8',
  borderSubtle: 'rgba(0, 21, 41, 0.18)',

  white: '#fff',
  black: '#000',
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const fontSize = {
  xs: 11,
  sm: 12,
  base: 13,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 25,
  icon: 50,
} as const;

export const shadow = {
  subtle: '2px 0px 4px 0px rgba(0,0,0,0.10)',
  elevated: '2px 0px 4px 0px rgba(0,0,0,0.20)',
  activeTab: '1px 0px 6px 1px rgba(0,0,0,0.15)',
} as const;

export const radius = {
  none: 0,
  sm: 4,
  md: 8,
  full: '50%',
} as const;

export const zIndex = {
  content: 10,
  overlay: 20,
  popover: 30,
} as const;
