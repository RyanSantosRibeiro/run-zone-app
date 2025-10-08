// app/(tabs)/_layout.tsx
import { Redirect, Tabs } from "expo-router";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ActivityIndicator, View } from "react-native";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors } from "@/hooks/use-theme-color";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();
  console.log(colors.primary)

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) { 
    return <Redirect href="/login" />;
  }

  function getLabel(routeName: string) {
    switch (routeName) {
      case "index":
        return "Home";
      case "explore":
        return "Mapa";
      case "run":
        return "Correr";
      case "history":
        return "Histórico";
      case "profile":
        return "Perfil";
      default:
        return "";
    }
  }

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colors.primary,
        headerShown: true,
        tabBarButton: (props) => (
          <HapticTab {...props} label={getLabel(route.name)} />
        ),
        tabBarShowLabel: false,
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
          height: 100,
          paddingBottom: 20,
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Mapa",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="map.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="run"
        options={{
          title: "Correr", 
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="figure.run" color={"#2A2A2A"} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Histórico",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="clock.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
