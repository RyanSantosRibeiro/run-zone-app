import React from "react";
import { View, Text, ViewProps, TextProps, StyleSheet } from "react-native";
import { useColors } from "@/hooks/use-theme-color";

// ─── Card Principal ──────────────────────────────────────────────────────────

export function Card({ style, ...props }: ViewProps) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        style,
      ]}
      {...props}
    />
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────

export function CardHeader({ style, ...props }: ViewProps) {
  return <View style={[styles.header, style]} {...props} />;
}

// ─── Título ──────────────────────────────────────────────────────────────────

export function CardTitle({ style, ...props }: TextProps) {
  const colors = useColors();
  return (
    <Text
      style={[
        styles.title,
        { color: colors.cardForeground },
        style,
      ]}
      {...props}
    />
  );
}

// ─── Descrição ───────────────────────────────────────────────────────────────

export function CardDescription({ style, ...props }: TextProps) {
  const colors = useColors();
  return (
    <Text
      style={[
        styles.description,
        { color: colors.mutedForeground },
        style,
      ]}
      {...props}
    />
  );
}

// ─── Conteúdo ────────────────────────────────────────────────────────────────

export function CardContent({ style, ...props }: ViewProps) {
  return <View style={[styles.content, style]} {...props} />;
}

// ─── Footer ──────────────────────────────────────────────────────────────────

export function CardFooter({ style, ...props }: ViewProps) {
  return <View style={[styles.footer, style]} {...props} />;
}

// ─── Estilos Base ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  header: {
    padding: 16,
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  content: {
    padding: 16,
    paddingTop: 0,
  },
  footer: {
    padding: 16,
    paddingTop: 0,
    flexDirection: "row",
    alignItems: "center",
  },
});
