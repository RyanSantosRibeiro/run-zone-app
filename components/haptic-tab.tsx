// components/haptic-tab.tsx
import { useColors } from "@/hooks/use-theme-color";
import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable, Text } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";
import React from "react";
import { View } from "react-native";

export function HapticTab(props: BottomTabBarButtonProps & { label?: string }) {
  const { onPressIn, label, children, ...rest } = props;
  const focused = props["aria-selected"];
  const colors = useColors();
  const isPrincipal = label === "Correr";

  return (
    <PlatformPressable
      {...rest}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === "ios") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPressIn?.(ev);
      }}
      style={{
        maxHeight: isPrincipal ? "100px" : "80px",
        minHeight: isPrincipal ? "90px" : "auto",
        flex: 1,
        marginHorizontal: 2,
        borderRadius: 16,
        backgroundColor: isPrincipal
          ? colors.primary
          : focused
            ? `${colors.primary}15`
            : "transparent",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        paddingHorizontal: 6,
        marginTop: "auto",
        transform: isPrincipal ? [{ translateY: -12 }] : [],
      }}
      accessibilityRole="button"
    >
      <View>{children}</View>
      <Text
        style={{
          fontWeight: 600,
          fontSize: 12,
          color: isPrincipal
            ? colors.primaryForeground
            : focused
              ? colors.primary
              : colors.mutedForeground,
          lineHeight: 14,
        }}
      >
        {label}
      </Text>
    </PlatformPressable>
  );
}
