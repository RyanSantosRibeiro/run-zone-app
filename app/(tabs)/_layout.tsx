// app/(tabs)/_layout.tsx
import { Redirect, Tabs, useRouter } from "expo-router";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import AntDesign from '@expo/vector-icons/AntDesign';
import { useColors } from "@/hooks/use-theme-color";
import { ThemedText } from "@/components/themed-text";
import { Image } from "expo-image";

export default function TabLayout() {
  const colors = useColors();
  const { user, profile, loading } = useAuth();
  const router = useRouter();

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
      case "training":
        return "Treino";
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

        headerLeft: () => (
          <View
            style={{
              paddingHorizontal: 16,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <ThemedText
              style={{
                fontSize: 14,
                height: 16,
                lineHeight: 16,
                fontWeight: "600",
                fontStyle: 'italic'
              }}
            >
              RUNZONE
            </ThemedText>
          </View>
        ),
        headerRight: () => (
          <View
            style={{
              paddingHorizontal: 16,
            }}
            
          >
            <TouchableOpacity onPress={() => router.push("/settings")}>
            {profile?.avatar_url && (
              <Image
                source={require("@/assets/images/user-icon.jpg")}
                style={{
                  objectFit: "cover",
                  borderRadius: 100,
                  width: 32,
                  height: 32,
                }}
                contentFit="cover"
                placeholder="blur"
              />
            )}
            </TouchableOpacity>
          </View>
        ),
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
          headerTitle: "",
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="house.fill"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Mapa",
          headerTitle: "",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="map.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="run"
        options={{
          title: "Correr",
          headerTitle: "",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="figure.run" color={colors.primaryForeground}  />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            // Previne a navegação padrão da tab
            e.preventDefault();
            // Redireciona manualmente para a stack de corrida
            router.push("/run");
          },
        }}
      />
      <Tabs.Screen
        name="training"
        options={{
          title: "Treinos",
          headerTitle: "",
          tabBarIcon: ({ color }) => (
           <AntDesign name="bars" size={24} color={color} />
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
