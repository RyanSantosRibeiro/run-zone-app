import React from "react";
import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";

type ButtonVariant = "primary" | "secondary" | "outline";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
}

export default function Button({
  title,
  variant = "primary",
  disabled = false,
  loading = false,
  style,
  textStyle,
  ...rest
}: ButtonProps) {
  // Define estilos base e por variante
  const containerStyles = [
    styles.base,
    variant === "primary" && styles.primary,
    variant === "secondary" && styles.secondary,
    variant === "outline" && styles.outline,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.textBase,
    variant === "primary" && styles.textPrimary,
    variant === "secondary" && styles.textSecondary,
    variant === "outline" && styles.textOutline,
    disabled && styles.textDisabled,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={containerStyles}
      activeOpacity={0.7}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" ? "#3b82f6" : "#fff"} />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: "#3b82f6",
  },
  secondary: {
    backgroundColor: "#6b7280",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#3b82f6",
  },
  disabled: {
    backgroundColor: "#d1d5db",
  },

  textBase: {
    fontSize: 16,
    fontWeight: "600",
  },
  textPrimary: {
    color: "#fff",
  },
  textSecondary: {
    color: "#fff",
  },
  textOutline: {
    color: "#3b82f6",
  },
  textDisabled: {
    color: "#9ca3af",
  },
});
