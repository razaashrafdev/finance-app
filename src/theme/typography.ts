import { Platform } from 'react-native';

const fontFamily = Platform.OS === 'ios' ? 'Inter' : 'Inter';

export const typography = {
  fontFamily,
  display: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  h1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
  },
  h3: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600' as const,
    letterSpacing: -0.1,
  },
  h4: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400' as const,
  },
  bodyMedium: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500' as const,
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
  },
  label: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500' as const,
  },
  labelSmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
  },
  amount: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  amountLarge: {
    fontSize: 40,
    lineHeight: 46,
    fontWeight: '700' as const,
    letterSpacing: -0.8,
  },
  amountSmall: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
  },
  button: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600' as const,
  },
  buttonSmall: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600' as const,
  },
};
