// 1. IMPORTAÇÃO DO POLYFILL DEVE SER A PRIMEIRA LINHA ABSOLUTA
import "../polyfills";

export const unstable_settings = {
  anchor: "(tabs)", // Aqui você define o âncora para as tabs
};



// app/_layout.tsx
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { AuthProvider } from "@/contexts/AuthContext";
import { RunProvider } from "@/contexts/RunContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { GestureHandlerRootView } from "react-native-gesture-handler";





export default function RootLayout() {
  const colorScheme = useColorScheme();

  console.log("ColorScheme:", colorScheme);
  console.log("RootLayout");
  console.log("Window exists:", typeof window !== 'undefined');

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <RunProvider>
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
                name="profile/edit"
                options={{ title: "Editar Perfil", presentation: "modal", headerShown: false }}
              />
              <Stack.Screen
                name="login"
                options={{ title: "Login", headerShown: false }}
              />
              <Stack.Screen
                name="signup"
                options={{ title: "Criar conta", headerShown: false }}
              />

            </Stack>
            <StatusBar style="auto" />
          </RunProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
