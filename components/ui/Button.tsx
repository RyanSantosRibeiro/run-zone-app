import { useColors } from "@/hooks/use-theme-color";
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
  title?: string;
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
  const colors = useColors();

  // Define estilos base e por variante dependentes do tema
  const variantContainerStyles = {
    primary: {
      backgroundColor: colors.primary,
    },
    secondary: {
      backgroundColor: colors.secondary,
    },
    outline: {
      backgroundColor: "transparent",
      borderWidth: 2,
      borderColor: colors.foreground,
    },
    disabled: {
      backgroundColor: colors.muted,
    },
  };

  const variantTextStyles = {
    primary: {
      color: colors.primaryForeground,
    },
    secondary: {
      color: colors.secondaryForeground,
    },
    outline: {
      color: colors.foreground,
    },
    disabled: {
      color: colors.mutedForeground,
    },
  };

  const containerStyles = [
    styles.base,
    variantContainerStyles[variant],
    disabled && variantContainerStyles.disabled,
    style,
  ];

  const textStyles = [
    styles.textBase,
    variantTextStyles[variant],
    disabled && variantTextStyles.disabled,
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
        <ActivityIndicator color={variant === "outline" ? colors.primary : colors.primaryForeground} />
      ) : (
        <>
        {icon}
        {title ? <Text style={textStyles}>{title}</Text> : null}
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
  textBase: {
    fontSize: 16,
    fontWeight: "600",
  },
});
