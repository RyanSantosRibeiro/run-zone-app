// app/_layout.tsx
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import RunScreen from "./run";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Image } from "expo-image";
import { View } from "react-native";
import { ThemedText } from "@/components/themed-text";

export const unstable_settings = {
  anchor: "(tabs)", // Aqui você define o âncora para as tabs
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <Stack>
            {/* Aqui vai a stack principal com tabs */}
            <Stack.Screen
              name="(tabs)"
              options={{
                title:"",
                headerShown: false,
                headerTitle: ""
              }}
            />
            <Stack.Screen
              name="run"
              options={{ title: "Corrida", headerShown: false }}
            />
            <Stack.Screen
              name="login"
              options={{ title: "Login", headerShown: false }}
            />

            {/* Navegação para a stack de configurações */}
            <Stack.Screen
              name="settings"
              options={{ title: "Configurações", headerShown: false }}
            />
          </Stack>
          <StatusBar style="auto" />
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
