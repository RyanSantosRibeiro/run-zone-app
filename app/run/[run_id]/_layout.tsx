// app/settings/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { View, Text } from 'react-native';

export default function RunDetailsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Resumo Corrida", headerShown: false }}
      />
    </Stack>
  );
}
