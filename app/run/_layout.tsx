// app/settings/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { View, Text } from 'react-native';

export default function RunLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Corrida", headerShown: false }}
      />
    </Stack>
  );
}
