// components/haptic-tab.tsx
import { useColorScheme } from '@/hooks/use-color-scheme.web';
import { colors } from '@/hooks/use-theme-color';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable, Text } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { View } from 'react-native';



export function HapticTab(props: BottomTabBarButtonProps & { label?: string }) {
  const { onPressIn, label, children, ...rest } = props;
  const focused = props["aria-selected"];
  const colorScheme = useColorScheme();
  const isPrincipal = label === "Correr"
  const isDark = colorScheme === "dark"

  return (
    <PlatformPressable
      {...rest}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
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
        backgroundColor: isPrincipal ? colors.primary : isDark ? "transparent" : focused ? '#f6fde6' : 'transparent',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 6,
        marginTop: "auto",
        transform: isPrincipal ? [{ translateY: -12 }] : [],
      }}
      accessibilityRole="button"
    >
      <View style={{  }}>
        {/* Ícone controlado externamente via tabBarIcon */}
        {children}
      </View>
      <Text
        style={{
          fontWeight: 600,
          fontSize: 12,
          color: isPrincipal ? colors.primaryForeground : focused ? '#B2FF00' : '#666',
          lineHeight: 14,
        }}
      >
        {label} 
      </Text>
    </PlatformPressable>
  );
}
