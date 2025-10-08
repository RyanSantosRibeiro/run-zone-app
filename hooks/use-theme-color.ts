/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

// colors.ts

export const colors = {
  background: '#FFFFFF',
  foreground: '#0A0A0A',
  card: '#FFFFFF',
  cardForeground: '#0A0A0A',
  popover: '#FFFFFF',
  popoverForeground: '#252525',

  primary: '#B2FF00',
  primaryForeground: '#2A2A2A',

  secondary: '#F7F7F7',
  secondaryForeground: '#353535',

  muted: '#F7F7F7',
  mutedForeground: '#8E8E8E',

  accent: '#F7F7F7',
  accentForeground: '#353535',

  destructive: '#D44700',
  destructiveForeground: '#D44700',

  border: '#E5E5E5',
  input: '#EBEBEB',
  ring: '#B5B5B5',

  chart1: '#DA7A00',
  chart2: '#4CAAE9',
  chart3: '#4F69F1',
  chart4: '#FFC547',
  chart5: '#FBA847',

  radius: 10,

  sidebar: '#FBFBFB',
  sidebarForeground: '#252525',
  sidebarPrimary: '#353535',
  sidebarPrimaryForeground: '#FBFBFB',
  sidebarAccent: '#F7F7F7',
  sidebarAccentForeground: '#353535',
  sidebarBorder: '#EBEBEB',
  sidebarRing: '#B5B5B5',
};
