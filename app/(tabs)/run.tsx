import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import Fontisto from "@expo/vector-icons/Fontisto";
import { router } from "expo-router";

import { ThemedView } from "@/components/themed-view";
import Button from "@/components/ui/Button";
import Map from "@/components/shared/Map";
import { useAuth } from "@/contexts/AuthContext";
import { useRun } from "@/contexts/RunContext";
import { useColors } from "@/hooks/use-theme-color";
import type { HexWithOwner } from "@/utils/supabase";
import { useEffect, useState } from "react";

export default function RunTabScreen() {
  const { fetchHexagons } = useAuth();
  const { startRun } = useRun();
  const [hexagons, setHexagons] = useState<HexWithOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const colors = useColors();

  useEffect(() => {
    fetchHexagons()
      .then((data) => setHexagons(data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [fetchHexagons]);

  const handleStartRun = () => {
    startRun();
    router.push("/run");
  };

  return (
    <ThemedView style={styles.screen}>
      {/* Mapa de preview do território */}
      <View style={StyleSheet.absoluteFillObject}>
        <Map
          hexagons={hexagons}
          zoom={hexagons.length > 20 ? 14 : 16}
          pitch={30}
          showUserLocation
        />
      </View>

      {/* Botão de iniciar corrida */}
      <View style={styles.footer}>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Button
            title="Iniciar Corrida"
            onPress={handleStartRun}
            icon={<Fontisto name="flash" size={20} color={colors.primaryForeground} />}
          />
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 16,
    right: 16,
  },
});
