import { colors } from "@/hooks/use-theme-color";
import React, { ReactElement } from "react";
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
  icon?: ReactElement;
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
  icon,
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
        <ActivityIndicator color={variant === "outline" ? colors.primary : "#fff"} />
      ) : (
        <>
        {icon}
        <Text style={textStyles}>{title}</Text>
        </>
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
    flexDirection: "row",
    gap: 8
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: colors.primary,
  },
  disabled: {
    backgroundColor: "#d1d5db",
  },

  textBase: {
    fontSize: 16,
    fontWeight: "600",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px"
  },
  textPrimary: {
    color: colors.primaryForeground,
  },
  textSecondary: {
    color: colors.secondaryForeground,
  },
  textOutline: {
    color: colors.primary,
  },
  textDisabled: {
    color: "#9ca3af",
  },
});
