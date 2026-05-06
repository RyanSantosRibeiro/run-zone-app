// /app/run/index.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import Fontisto from "@expo/vector-icons/Fontisto";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

import { ThemedView } from "@/components/themed-view";
import * as Location from "expo-location";
import { customMapStyle } from "@/styles/Map";
import Button from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { router, useNavigation } from "expo-router";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { colors } from "@/hooks/use-theme-color";
import { useColorScheme } from "@/hooks/use-color-scheme.web";
import { formatTime } from "@/utils/run";
import { IconSymbol } from "@/components/ui/icon-symbol";
import Map from "@/components/map";
import { ThemedText } from "@/components/themed-text";

export default function RunScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [region, setRegion] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null); // Estado para armazenar a região do mapa
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null); // Estado para armazenar a localização do usuário
  const {
    stopRun,
    isRunning,
    timer,
    route,
    isPaused,
    pauseRun,
    resumeRun,
    user,
    isFinish,
  } = useAuth();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["42%", "60%"], []);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const handleSheetClose = () => bottomSheetRef?.current?.close();
  const handleSheetOpen = () => bottomSheetRef?.current?.snapToIndex(1);

  

  useEffect(() => {
    if (!navigator) return;
    // Função para obter a localização atual do usuário
    navigator?.geolocation?.getCurrentPosition(
      (position) => {
        // Atualiza o estado com a localização do usuário
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      },
      (error) => alert(error.message), // Em caso de erro
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  }, []); // O hook será executado uma vez quando o componente for montado

  // Pega Localização
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permissão de localização negada!");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location.coords);
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  useEffect(() => {
    console.log({ isFinish });
    if (isFinish) {
      handleSheetOpen();
    }
  }, [isFinish]);

  if (!region || !location) {
    return <Text>Carregando mapa...</Text>;
  }

  const handleStopRun = () => {
    // Aqui você pode iniciar a corrida (se necessário) e então navegar
    handleSheetClose();

    stopRun(); // Começa a corrida
  };
  const handlePauseRun = () => {
    // Aqui você pode iniciar a corrida (se necessário) e então navegar
    pauseRun(); // Começa a corrida
  };
  const handleResumeRun = () => {
    // Aqui você pode iniciar a corrida (se necessário) e então navegar
    resumeRun(); // Começa a corrida
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      {/* Mapa ocupando toda a tela */}
      {/* <MapView
        style={styles.map}
        region={region}
        provider={PROVIDER_GOOGLE}
        customMapStyle={customMapStyle}
      >
        {route.length > 0 && (
          <Polyline
            coordinates={route}
            fillColor={`${user?.profile?.color}`}
            strokeWidth={4} // espessura da linha
          />
        )}
      </MapView> */}
      <View style={styles.map}>
              <Map pitch={0} route={route}  />
            </View>

      <BottomSheet
        ref={bottomSheetRef}
        onChange={handleSheetChanges}
        snapPoints={snapPoints}
        backgroundStyle={{
          backgroundColor: isDark ? colors.foreground : colors.background,
        }}
        handleIndicatorStyle={{
          backgroundColor: isDark ? colors.background : colors.foreground, // ← Altera a cor do tracinho
        }}
      >
        <BottomSheetView
          style={{
            ...styles.contentContainer,
            backgroundColor: isDark ? colors.foreground : colors.background,
          }}
        >
          {isFinish && <ThemedText>Finalizado!</ThemedText>}
          <View style={styles.statsRow}>
            <View style={styles.statsTime}>
              <Text
                style={{
                  ...styles.statTimeTitle,
                  color: isDark ? colors.primary : colors.primaryForeground,
                }}
              >
                Tempo
              </Text>
              <Text
                style={{
                  ...styles.statTime,
                  color: isDark ? colors.primary : colors.primaryForeground,
                }}
              >
                {formatTime(timer)}
              </Text>
            </View>
            {/* <View style={{...styles.statsBox, backgroundColor: isDark ? colors.primaryForeground : colors.background}}>
              <Text style={styles.statTitle}>Pontos</Text>
              <Text style={{...styles.statText, color: colors.primary}}>{route.length}</Text>
            </View> */}
          </View>
          {/* Distancia e Ritimo */}
          <View style={styles.statsRow}>
            <View
              style={{
                ...styles.statsBox,
                backgroundColor: isDark
                  ? colors.primaryForeground
                  : colors.background,
              }}
            >
              <Text style={styles.statTitle}>Ritmo</Text>
              <Text
                style={{
                  ...styles.statText,
                  color: isDark ? colors.primary : colors.primaryForeground,
                }}
              >
                {(route?.[route.length - 1]?.average_speed || 0).toFixed(2)}
              </Text>
            </View>
            <View
              style={{
                ...styles.statsBox,
                backgroundColor: isDark
                  ? colors.primaryForeground
                  : colors.background,
              }}
            >
              <Text style={styles.statTitle}>Distancia</Text>
              <Text
                style={{
                  ...styles.statText,
                  color: isDark ? colors.primary : colors.primaryForeground,
                }}
              >
                {(
                  route.reduce((acc, item) => acc + item.distance, 0) || 0
                ).toFixed(2)}
              </Text>
            </View>
          </View>
          {isFinish ? (
            <View style={styles.floatingContent}>
              <Button
                title="Compartilhar"
                onPress={handleStopRun}
                style={{ flex: 1 }}
                icon={<FontAwesome6 name="stop" size={24} color="black" />}
              />
              <Button
                title="Home"
                onPress={() => router.push("/")}
                style={{ flex: 1 }}
                icon={<IconSymbol
                              size={28}
                              name="house.fill"
                              color="black"
                            />}
              />
            </View>
          ) : (
            <View style={styles.floatingContent}>
              {isPaused ? (
                <Button
                  title="Resume"
                  variant="secondary"
                  onPress={handleResumeRun}
                  style={{ flex: 1 }}
                  icon={<FontAwesome6 name="play" size={24} color="black" />}
                />
              ) : (
                <Button
                  title="Pause"
                  variant="secondary"
                  onPress={handlePauseRun}
                  style={{ flex: 1 }}
                  icon={<FontAwesome6 name="pause" size={24} color="black" />}
                />
              )}
              <Button
                title="Stop"
                onPress={handleStopRun}
                style={{ flex: 1 }}
                icon={<FontAwesome6 name="stop" size={24} color="black" />}
              />
            </View>
          )}
        </BottomSheetView>
      </BottomSheet>

      {/* Conteúdo flutuando sobre o mapa na parte inferior */}
      {/* <View style={styles.floating}>
        <View style={styles.floatingContent}>
          {isPaused ? (
            <Button
              title="Resume"
              variant="secondary"
              onPress={handleStopRun}
              style={{ flex: 1 }}
              icon={<Fontisto name="flash" size={24} color="black" />}
            />
          ) : (
            <Button
              title="Pause"
              variant="secondary"
              onPress={handleStopRun}
              style={{ flex: 1 }}
              icon={<Fontisto name="flash" size={24} color="black" />}
            />
          )}
          <Button
            title="Stop"
            onPress={handleStopRun}
            style={{ flex: 1 }}
            icon={<Fontisto name="flash" size={24} color="black" />}
          />
        </View>
      </View> */}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 36,
    alignItems: "center",
    gap: 10,
  },
  map: {
    ...StyleSheet.absoluteFillObject, // Mapa ocupa a tela inteira
    zIndex: 0,
  },
  floating: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    zIndex: 1,
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  floatingContent: {
    display: "flex",
    flexDirection: "row",
    gap: 5,
  },
  statsRow: {
    display: "flex",
    gap: 8,
    flexDirection: "row",
    justifyContent: "flex-start",
    width: "100%",
  },
  titleContainer: {
    marginBottom: 8,
    flexDirection: "row",
    gap: 8,
  },
  statsBox: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.muted,
    flex: 1,
    maxWidth: "50%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignContent: "center",
  },
  statsTime: {
    padding: 12,
    flex: 1,
    maxWidth: "90%",
  },
  statTime: {
    color: colors.primaryForeground,
    fontSize: 46,
    fontWeight: "bold",
    fontStyle: "italic",
  },
  statTimeTitle: {
    color: colors.primaryForeground,
    fontSize: 14,
    fontWeight: "bold",
    fontStyle: "italic",
  },
  statTitle: {
    color: colors.mutedForeground,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  statText: {
    color: colors.primaryForeground,
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
});
