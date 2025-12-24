export interface Colors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  secondaryDark: string;
  secondaryLight: string;
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  mutedText: string;
  danger: string;
  dangerLight: string;
  border: string;
  borderLight: string;
  statusOpen: string;
  statusOpenLight: string;
  statusOpenText: string;
  statusInProgress: string;
  statusInProgressLight: string;
  statusInProgressText: string;
  statusResolved: string;
  statusResolvedLight: string;
  statusResolvedText: string;
  success: string;
  warning: string;
  info: string;
  accent: string;
  categoryText: string;
  gradientStart: string;
  gradientEnd: string;
}

export const colors: Colors = {
  // Primary colors - Vibrant Teal & Coral theme (unique and modern)
  primary: '#14B8A6', // Vibrant teal/cyan
  primaryDark: '#0D9488',
  primaryLight: '#5EEAD4',
  secondary: '#F97316', // Warm coral/orange
  secondaryDark: '#EA580C',
  secondaryLight: '#FB923C',

  // Background and surfaces - Rich dark slate with warm undertones
  background: '#0F172A', // Deep slate blue
  surface: '#1E293B', // Slate with subtle warmth
  card: '#1E293B', // Card background with slight elevation feel

  // Text colors - Soft whites with warm tint
  text: '#F8FAFC',
  textSecondary: '#E2E8F0',
  mutedText: '#94A3B8',

  // Status colors - Vibrant and distinct
  danger: '#F43F5E', // Bright rose red
  dangerLight: '#FEE2E2',
  success: '#22C55E', // Fresh green
  warning: '#F59E0B', // Amber
  info: '#3B82F6', // Sky blue

  // Borders and accents
  border: '#334155',
  borderLight: '#475569',
  accent: '#FBBF24', // Golden amber accent
  categoryText: '#34D399', // Mint green for categories

  // Status specific with improved text contrast
  statusOpen: '#F59E0B', // Amber
  statusOpenLight: '#FEF3C7',
  statusOpenText: '#92400E',
  statusInProgress: '#3B82F6', // Sky blue
  statusInProgressLight: '#DBEAFE',
  statusInProgressText: '#1E40AF',
  statusResolved: '#22C55E', // Fresh green
  statusResolvedLight: '#D1FAE5',
  statusResolvedText: '#065F46',

  // Gradients - Teal to Coral (unique combination)
  gradientStart: '#14B8A6',
  gradientEnd: '#F97316',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const shadows = {
  small: {
    shadowColor: '#14B8A6', // Using primary color directly
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  large: {
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  glow: {
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
};

export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeight: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const gradients = {
  primary: ['#14B8A6', '#0D9488', '#F97316'], // Teal to coral
  secondary: ['#F97316', '#FB923C', '#FBBF24'], // Coral to amber
  success: ['#22C55E', '#16A34A'],
  warning: ['#F59E0B', '#D97706'],
  danger: ['#F43F5E', '#E11D48'],
  background: ['#0F172A', '#1E293B', '#334155'], // Deep slate gradient
  accent: ['#14B8A6', '#34D399', '#FBBF24'], // Teal to mint to amber
};

export const animations = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeInOut: 'ease-in-out',
    easeOut: 'ease-out',
    easeIn: 'ease-in',
    linear: 'linear',
  },
};


