import React from "react";
import { Text, StyleSheet } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Animated, { FadeInUp } from "react-native-reanimated";

interface AlertProps {
  message: string;
  type?: "error" | "success" | "warning";
}

export function Alert({ message, type = "error" }: AlertProps) {
  if (!message) return null;

  const isError = type === "error";
  const isWarning = type === "warning";

  const getIcon = () => {
    if (isError) return "error-outline";
    if (isWarning) return "warning-amber";
    return "check-circle-outline";
  };

  const getColors = () => {
    if (isError) return { bg: "rgba(255, 107, 107, 0.15)", border: "rgba(255, 107, 107, 0.3)", text: "#ff6b6b" };
    if (isWarning) return { bg: "rgba(255, 184, 0, 0.15)", border: "rgba(255, 184, 0, 0.3)", text: "#ffb800" };
    return { bg: "rgba(178, 255, 0, 0.15)", border: "rgba(178, 255, 0, 0.3)", text: "#b2ff00" };
  };

  const colors = getColors();

  return (
    <Animated.View 
      entering={FadeInUp.duration(300)}
      style={[styles.container, { backgroundColor: colors.bg, borderColor: colors.border }]}
    >
      <MaterialIcons name={getIcon()} size={20} color={colors.text} />
      <Text style={[styles.text, { color: colors.text }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    gap: 10,
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
});
