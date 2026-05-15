import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { StyleSheet, Text, View } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Fontisto from "@expo/vector-icons/Fontisto";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import Button from "@/components/ui/Button";
import Map from "@/components/shared/Map";
import { useRun } from "@/contexts/RunContext";
import { useColors, type ThemeColors } from "@/hooks/use-theme-color";
import { formatTime } from "@/utils/run";
import { router } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import type { LatLng } from "react-native-maps";
import { Card } from "@/components/ui/Card";
import { h3ToGeoBoundary, kRing } from "h3-reactnative";
import type { HexWithOwner } from "@/utils/supabase";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPace(totalDistanceKm: number, totalSeconds: number): string {
  if (totalDistanceKm <= 0 || totalSeconds <= 0) return "--:--";
  const paceSeconds = totalSeconds / totalDistanceKm;
  const mins = Math.floor(paceSeconds / 60);
  const secs = Math.floor(paceSeconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// ─── Subcomponentes ───────────────────────────────────────────────────────────

interface StatBoxProps {
  label: string;
  value: string;
  unit?: string;
  large?: boolean;
  colors: ThemeColors;
}

function StatBox({ label, value, unit, large = false, colors }: StatBoxProps) {
  return (
    <View style={[staticStyles.statBox, { backgroundColor: colors.card }]}>
      <Text style={[staticStyles.statLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <View style={staticStyles.statValueRow}>
        <Text
          style={[
            large ? staticStyles.statValueLarge : staticStyles.statValueMedium,
            { color: colors.cardForeground },
          ]}
        >
          {value}
        </Text>
        {unit && (
          <Text style={[staticStyles.statUnit, { color: colors.mutedForeground }]}>
            {unit}
          </Text>
        )}
      </View>
    </View>
  );
}

// RunSummary removido pois a tela de detalhes cuidará de exibir o resumo.

// ─── Controles durante a corrida ──────────────────────────────────────────────

interface RunControlsProps {
  timer: number;
  totalDistance: number;
  lastSpeed: number;
  isPaused: boolean;
  isRunning: boolean;
  colors: ThemeColors;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

function RunControls({
  timer,
  totalDistance,
  lastSpeed,
  isRunning,
  isPaused,
  colors,
  onStart,
  onPause,
  onResume,
  onStop,
}: RunControlsProps) {
  return (
    <View style={staticStyles.controlsContainer}>
      <View style={[staticStyles.buttonsRow, { justifyContent: 'center', alignItems: 'center', gap: 32 }]}>
        <View style={staticStyles.controlsButton}>
          {
            !isRunning ? (
              <Button
                variant="outline"
                onPress={() => { }}
                icon={<Fontisto name="nav-icon-list-a" size={20} color={colors.primary} />}
                style={{ width: 60, height: 60, borderRadius: 40, paddingVertical: 0, paddingHorizontal: 0, borderColor: colors.primary }}
                textStyle={{ borderColor: colors.primary }}
              />
            ) : isPaused && (
                <Animated.View entering={FadeIn} exiting={FadeOut}>
                  <Text
                    style={[
                      staticStyles.pausedBadge,
                      { color: colors.primary, backgroundColor: `${colors.primary}18` },
                    ]}
                  >
                    Pausado
                  </Text>
                </Animated.View>
              )
          }
        </View>

        {/* Botão play */}
        <View style={staticStyles.controlsButton}>
          {
            isRunning ? isPaused ? (
              <Button
                variant="secondary"
                onPress={onResume}
                icon={<Fontisto name="play" size={26} color={colors.primary} />}
                style={{ width: 80, height: 80, borderRadius: 40, paddingVertical: 0, paddingHorizontal: 0, borderColor: colors.primary }}
                textStyle={{ borderColor: colors.primary }}
              />
            ) : (
              <Button
                variant="secondary"
                onPress={onPause}
                icon={<Fontisto name="pause" size={26} color={colors.primary} />}
                style={{ width: 80, height: 80, borderRadius: 40, paddingVertical: 0, paddingHorizontal: 0, borderColor: colors.primary }}
                textStyle={{ borderColor: colors.primary }}
              />
            ) : (
              <Button
                variant="secondary"
                onPress={onStart}
                icon={<Fontisto name="play" size={26} color={colors.primaryForeground} />}
                style={{ width: 80, height: 80, borderRadius: 40, paddingVertical: 0, paddingHorizontal: 0, borderColor: colors.primary, backgroundColor: colors.primary }}
              />
            )
          }
        </View>

        <View style={staticStyles.controlsButton}>
          {
            !isRunning ? (
              <Button
                variant="outline"
                onPress={() => { }}
                icon={<Fontisto name="heart" size={20} color={colors.foreground} />}
                style={{ width: 60, height: 60, borderRadius: 40, paddingVertical: 0, paddingHorizontal: 0, borderColor: colors.foreground, opacity: 0.6 }}
                textStyle={{}}
              />
            ) : (
              <Button
                variant="outline"
                onPress={() => onStop()}
                icon={<Fontisto name="stop" size={20} color={colors.primary} />}
                style={{ width: 60, height: 60, borderRadius: 40, paddingVertical: 0, paddingHorizontal: 0, borderColor: colors.primary }}
                textStyle={{}}
              />
            )
          }
        </View>
      </View>
    </View>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function RunScreen() {
  const colors = useColors();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => [], []);

  const {
    runData,
    stopRun,
    isRunning,
    isFinish,
    timer,
    route,
    crossedH3Ids,
    currentH3,
    isPaused,
    startRun,
    pauseRun,
    resumeRun,
    resetRun,
  } = useRun();

  // ── Stats derivados ─────────────────────────────────────────────────────────

  const totalDistance = useMemo(
    () => route.reduce((acc, pt) => acc + (pt.distance ?? 0), 0),
    [route]
  );

  const lastSpeed = useMemo(
    () => route[route.length - 1]?.average_speed ?? 0,
    [route]
  );

  const routeAsLatLng: LatLng[] = useMemo(
    () => route.map(({ latitude, longitude }) => ({ latitude, longitude })),
    [route]
  );

  const liveHexagons = useMemo(() => {
    const hexes: HexWithOwner[] = [];
    if (!isRunning && !isFinish) return hexes;

    // Conquered/Crossed Hexes (highlighted)
    crossedH3Ids.forEach((h3) => {
      hexes.push({
        h3_index: h3,
        boundary: h3ToGeoBoundary(h3).map(([lat, lng]) => [lng, lat]),
        color: colors.primary,
        owner: null,
        opacity: 0,
        id: 0,
        owner_id: null,
        hp: 0,
        max_hp: 0,
        season: null,
        created_at: "",
        updated_at: ""
      });
    });

    // Adjacent Hexes (gray)
    if (currentH3 && isRunning && !isFinish) {
      const neighbors = kRing(currentH3, 1);
      neighbors.forEach((n) => {
        if (!crossedH3Ids.includes(n)) {
          hexes.push({
            h3_index: n,
            boundary: h3ToGeoBoundary(n).map(([lat, lng]) => [lng, lat]),
            color: "#808080",
            owner: null,
            opacity: 0,
            id: 0,
            owner_id: null,
            hp: 0,
            max_hp: 0,
            season: null,
            created_at: "",
            updated_at: ""
          });
        }
      });
    }
    return hexes;
  }, [crossedH3Ids, currentH3, colors.primary, isRunning, isFinish]);

  // ── Sheet: abrir ao finalizar ───────────────────────────────────────────────

  useEffect(() => {
    if (isFinish && runData?.id) {
      router.replace(`/run/${runData.id}/edit`);
      setTimeout(() => resetRun(), 500); // Limpa o estado depois da navegação
    }
  }, [isFinish, runData?.id]);

  useEffect(() => {
    if (isRunning) {
      bottomSheetRef.current?.snapToIndex(0);
    }
  }, [isRunning]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleStop = useCallback(async () => {
    await stopRun();
  }, [stopRun]);

  const handleHome = useCallback(() => {
    resetRun();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <ThemedView style={staticStyles.screen}>
      {/* Mapa */}
      <View style={StyleSheet.absoluteFillObject}>
        <Map pitch={0} route={routeAsLatLng} showUserLocation zoom={16} hexagons={liveHexagons} />
      </View>

      {/* Botão voltar */}
      <Button
        title=""
        onPress={handleHome}
        icon={<FontAwesome6 name="arrow-left" size={20} color={colors.background} />}
        variant="secondary"
        style={{
          position: "absolute",
          top: 40,
          left: 16,
          zIndex: 1,
          gap: 0,
          paddingVertical: 8,
          paddingHorizontal: 8,
          backgroundColor: colors.foreground,
        }}
      />

      {/* Botoes do mapa */}
      <View style={staticStyles.mapButtonsContainer}>
        {/* Botao de centralizar no usuario */}
        <Button
          title=""
          onPress={() => {
            console.log("[RunScreen] Centralizar no usuario");
          }}
          icon={<Fontisto name="world-o" size={20} color={colors.popoverForeground} />}
          variant="secondary"
          style={{
            zIndex: 1,
            gap: 0,
            paddingVertical: 8,
            paddingHorizontal: 8,
            backgroundColor: colors.background,
          }}
        />
        {/* Botao de mapa 2D/3D */}
        <Button
          title=""
          onPress={() => {
            console.log("[RunScreen] Atualizar mapa");
          }}
          icon={<FontAwesome6 name="crosshairs" size={20} color={colors.popoverForeground} />}
          variant="secondary"
          style={{
            zIndex: 1,
            gap: 0,
            paddingVertical: 8,
            paddingHorizontal: 8,
            backgroundColor: colors.popover,
          }}
        />


      </View>

      {/* Timer principal flutuante */}
      {!isFinish && (
        <View style={[staticStyles.statsContainer]}>
          <Card>
            <View style={staticStyles.timerRow}>
              <Text style={[staticStyles.timerText, { color: colors.primary }]}>
                {formatTime(timer)}
              </Text>
              
            </View>
            {/* Stats */}
            <View style={staticStyles.statsRow}>
              <StatBox label="Distância" value={totalDistance.toFixed(2)} unit="km" colors={colors} />
              <StatBox label="Velocidade" value={lastSpeed.toFixed(1)} unit="km/h" colors={colors} />
              <StatBox label="Ritmo" value={formatPace(totalDistance, timer)} unit="min/km" colors={colors} />
            </View>
          </Card>
        </View>
      )}

      {/* BottomSheet */}
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        index={0}
        backgroundStyle={{ backgroundColor: colors.card }}
        handleIndicatorStyle={{ backgroundColor: colors.border }}
      >
        <BottomSheetView
          style={[staticStyles.sheetContent, { backgroundColor: colors.card }]}
        >
          {!isFinish && (
            <RunControls
              timer={timer}
              totalDistance={totalDistance}
              lastSpeed={lastSpeed}
              isPaused={isPaused}
              isRunning={isRunning}
              colors={colors}
              onStart={startRun}
              onPause={pauseRun}
              onResume={resumeRun}
              onStop={handleStop}
            />
          )}
        </BottomSheetView>
      </BottomSheet>
    </ThemedView>
  );
}

// ─── Estilos estáticos (não dependem de tema) ─────────────────────────────────

const staticStyles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  mapButtonsContainer: {
    position: "absolute",
    top: 200,
    right: 16,
    zIndex: 1,
    flexDirection: "column",
    gap: 12,
  },

  controlsButton: {
    flex: 0.3,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  // Timer flutuante
  statsContainer: {
    position: "absolute",
    bottom: "17%",
    left: 16,
    right: 16,
    zIndex: 1,
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  timerText: {
    fontSize: 52,
    fontWeight: "800",
    fontStyle: "italic",
    letterSpacing: -1,
  },
  pausedBadge: {
    fontSize: 13,
    fontWeight: "600",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  // Sheet
  sheetContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 24,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
  },
  statValueLarge: {
    fontSize: 28,
    fontWeight: "800",
    fontStyle: "italic",
  },
  statValueMedium: {
    fontSize: 20,
    fontWeight: "700",
    fontStyle: "italic",
  },
  statUnit: {
    fontSize: 11,
    fontWeight: "500",
    opacity: 0.6,
    marginBottom: 3,
  },

  // Buttons
  buttonsRow: {
    flexDirection: "row",
    gap: 10,
  },
  controlsContainer: {
    flex: 1,
  },

  // Summary styles removidos
});


