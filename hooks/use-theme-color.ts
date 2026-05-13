/**
 * Design tokens do Run Zone.
 * 
 * `lightColors` / `darkColors` → paletas estáticas (para StyleSheet fora de componentes).
 * `useColors()` → hook que retorna a paleta certa baseada no tema atual.
 */

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

// ─── Hook legado (Expo template) ────────────────────────────────────────────

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? "light";
  const colorFromProps = props[theme];
  return colorFromProps ?? Colors[theme][colorName];
}

// ─── Tokens compartilhados ──────────────────────────────────────────────────

const shared = {
  primary: "#B2FF00",
  primaryLight: "#b8e45348",
  primaryForeground: "#1A1A1A",

  destructive: "#D44700",
  destructiveForeground: "#FFFFFF",

  chart1: "#DA7A00",
  chart2: "#4CAAE9",
  chart3: "#4F69F1",
  chart4: "#FFC547",
  chart5: "#FBA847",

  radius: 10,
} as const;

// ─── Light palette ──────────────────────────────────────────────────────────

export const lightColors = {
  ...shared,

  background: "#FFFFFF",
  foreground: "#0A0A0A",

  card: "#e6e6e6ff",
  cardForeground: "#0A0A0A",

  popover: "#FFFFFF",
  popoverForeground: "#252525",

  secondary: "#F5F5F5",
  secondaryForeground: "#353535",

  muted: "#F5F5F5",
  mutedForeground: "#8E8E8E",

  accent: "#F5F5F5",
  accentForeground: "#353535",

  border: "#E5E5E5",
  input: "#EBEBEB",
  ring: "#B5B5B5",

  overlay: "rgba(0, 0, 0, 0.4)",

  sidebar: "#FBFBFB",
  sidebarForeground: "#252525",
  sidebarPrimary: "#353535",
  sidebarPrimaryForeground: "#FBFBFB",
  sidebarAccent: "#F7F7F7",
  sidebarAccentForeground: "#353535",
  sidebarBorder: "#EBEBEB",
  sidebarRing: "#B5B5B5",
} as const;

// ─── Dark palette ───────────────────────────────────────────────────────────

export const darkColors = {
  ...shared,

  background: "#0A0A0A",
  foreground: "#FAFAFA",

  card: "#161616",
  cardForeground: "#FAFAFA",

  popover: "#1A1A1A",
  popoverForeground: "#E0E0E0",

  secondary: "#1C1C1C",
  secondaryForeground: "#E0E0E0",

  muted: "#1C1C1C",
  mutedForeground: "#8E8E8E",

  accent: "#1C1C1C",
  accentForeground: "#E0E0E0",

  border: "#2A2A2A",
  input: "#252525",
  ring: "#444444",

  overlay: "rgba(0, 0, 0, 0.7)",

  sidebar: "#111111",
  sidebarForeground: "#E0E0E0",
  sidebarPrimary: "#B2FF00",
  sidebarPrimaryForeground: "#0A0A0A",
  sidebarAccent: "#1C1C1C",
  sidebarAccentForeground: "#E0E0E0",
  sidebarBorder: "#2A2A2A",
  sidebarRing: "#444444",
} as const;

// ─── Tipo da paleta ─────────────────────────────────────────────────────────

// Broaden the type to allow any string for color values, 
// but keep the specific keys and non-string types (like radius).
export type ThemeColors = {
  [K in keyof typeof lightColors]: (typeof lightColors)[K] extends string ? string : (typeof lightColors)[K]
};

// ─── Hook principal ─────────────────────────────────────────────────────────

/**
 * Retorna a paleta de cores completa de acordo com o tema atual do dispositivo.
 */
export function useColors(): ThemeColors {
  const theme = useColorScheme() ?? "light";
  return theme === "dark" ? (darkColors as ThemeColors) : (lightColors as ThemeColors);
}

// ─── Fallback estático ───────────────────────────────────────────────────────
export const colors = lightColors;
