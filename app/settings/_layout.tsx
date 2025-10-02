// app/settings/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { View, Text } from 'react-native';

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="settings"
        options={{ title: "Configurações", headerShown: true }}
      />
      <Stack.Screen
        name="privacy"
        options={{ title: "Privacidade", headerShown: true }}
      />
    </Stack>
  );
}
