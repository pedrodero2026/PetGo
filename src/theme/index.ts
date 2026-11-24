import { Platform } from 'react-native';

/**
 * Identidade visual do PetGo.
 * Todas as telas devem usar estes tokens em vez de cores/tamanhos soltos.
 */

export const colors = {
  primary: '#FF7A00',
  primaryDark: '#E06500',
  primaryLight: '#FFF1E5',
  secondary: '#6B4E3D',
  secondaryLight: '#F3ECE7',

  background: '#FFF9F4',
  surface: '#FFFFFF',
  border: '#EFE3D9',

  text: '#2B1D14',
  textMuted: '#7A6A5F',
  textOnPrimary: '#FFFFFF',

  success: '#2E9E5B',
  warning: '#F2B705',
  danger: '#D64545',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
} as const;

export const font = {
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 26,
    xxl: 34,
  },
  weight: {
    regular: '400',
    medium: '500',
    bold: '700',
    black: '900',
  },
} as const;

export const shadow = {
  card: {
    shadowColor: '#6B4E3D',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
} as const;

/**
 * Remove o anel de foco que o navegador desenha nos campos de texto (só web).
 * A tipagem do React Native não aceita `outlineStyle: 'none'`, daí a conversão.
 */
export const noWebOutline = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : {};
