import React, { useEffect, useState, useMemo, useRef } from "react";
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useGlobalSearchParams, router } from "expo-router";

import { useAuth } from "@/contexts/AuthContext";
import { useColors, type ThemeColors } from "@/hooks/use-theme-color";
import { h3ToGeoBoundary } from "h3-reactnative";
import Map from "@/components/shared/Map";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import Button from "@/components/ui/Button";

function getDefaultRunTitle(dateString?: string) {
  const date = dateString ? new Date(dateString) : new Date();
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return "Corrida Matinal";
  } else if (hour >= 12 && hour < 14) {
    return "Corrida na hora do almoço";
  } else if (hour >= 14 && hour < 18) {
    return "Corrida à Tarde";
  } else if (hour >= 18 && hour < 24) {
    return "Corrida Noturna";
  } else {
    return "Corrida de Madrugada";
  }
}

function formatPace(totalDistanceKm: number, totalSeconds: number): string {
  if (totalDistanceKm <= 0 || totalSeconds <= 0) return "--:--";
  const paceSeconds = totalSeconds / totalDistanceKm;
  const mins = Math.floor(paceSeconds / 60);
  const secs = Math.floor(paceSeconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

interface StatBoxProps {
  label: string;
  value: string | number;
  unit?: string;
  colors: ThemeColors;
}

function StatBox({ label, value, unit, colors }: StatBoxProps) {
  return (
    <View style={[staticStyles.statBox, { backgroundColor: colors.background }]}>
      <Text style={[staticStyles.statLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <View style={staticStyles.statValueRow}>
        <Text
          style={[
            staticStyles.statValueMedium,
            { color: colors.foreground },
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

export default function RunDetailsScreen() {
  const glob = useGlobalSearchParams();
  const { fetchRunData, user } = useAuth();
  const colors = useColors();

  const [runData, setRunData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["35%", "80%"], []);

  useEffect(() => {
    const fetchRun = async (run_id: string) => {
      try {
        setLoading(true);
        const data = await fetchRunData(run_id);
        setRunData(data);
      } catch (error) {
        console.error("Erro ao buscar dados da corrida", error);
      } finally {
        setLoading(false);
      }
    };

    if (glob.run_id) {
      fetchRun(glob.run_id as string);
    }
  }, [glob.run_id]);

  const routeAsLatLng = useMemo(() => {
    if (!runData?.route_data) return [];
    return runData.route_data.map((e: any) => ({
      latitude: e.latitude,
      longitude: e.longitude,
    }));
  }, [runData]);

  const liveHexagons = useMemo(() => {
    if (!runData?.crossed_h3_ids) return [];
    return runData.crossed_h3_ids.map((h3: string) => ({
      h3_index: h3,
      boundary: h3ToGeoBoundary(h3).map(([lat, lng]) => [lng, lat]),
      color: colors.primary,
    }));
  }, [runData, colors.primary]);

  if (loading) {
    return (
      <ThemedView style={staticStyles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={{ marginTop: 16 }}>Carregando corrida...</ThemedText>
      </ThemedView>
    );
  }

  if (!runData || !user) {
    return (
      <ThemedView style={staticStyles.center}>
        <ThemedText>Não foi possível encontrar dados da corrida.</ThemedText>
      </ThemedView>
    );
  }

  const {
    title,
    distance,
    duration, // seconds
    average_speed,
    calories_burned,
    started_at,
    crossed_h3_ids,
  } = runData;

  const formattedDate = new Date(started_at).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });

  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  const formattedDuration = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <ThemedView style={staticStyles.screen}>
      <View style={StyleSheet.absoluteFillObject}>
        <Map pitch={0} route={routeAsLatLng} showUserLocation={false} zoom={15} hexagons={liveHexagons} />
      </View>

      <Button
        title=""
        onPress={() => router.back()}
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

      <Button
        title=""
        onPress={() => router.push(`/run/${runData.id}/edit`)}
        icon={<FontAwesome6 name="pen" size={20} color={colors.background} />}
        variant="secondary"
        style={{
          position: "absolute",
          top: 40,
          right: 16,
          zIndex: 1,
          gap: 0,
          paddingVertical: 8,
          paddingHorizontal: 8,
          backgroundColor: colors.foreground,
        }}
      />

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        index={1}
        backgroundStyle={{ backgroundColor: colors.card }}
        handleIndicatorStyle={{ backgroundColor: colors.border }}
      >
        <BottomSheetScrollView 
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: colors.card }}
          contentContainerStyle={staticStyles.sheetContent}
        >
          <View style={staticStyles.headerRow}>
              <View>
                <ThemedText style={staticStyles.title}>{title || getDefaultRunTitle(runData?.started_at)}</ThemedText>
                <ThemedText style={[staticStyles.date, { color: colors.mutedForeground }]}>{formattedDate}</ThemedText>
              </View>
              <View style={[staticStyles.distanceBadge, { backgroundColor: colors.primary }]}>
                <ThemedText style={{ color: colors.primaryForeground, fontWeight: "bold", fontSize: 16 }}>
                  {distance?.toFixed(2)} km
                </ThemedText>
              </View>
            </View>

            <View style={staticStyles.statsRow}>
              <StatBox label="Tempo em Movimento" value={formattedDuration} colors={colors} />
              <StatBox label="Ritmo Médio" value={formatPace(distance, duration)} unit="/km" colors={colors} />
            </View>

            <View style={staticStyles.statsRow}>
              <StatBox label="Ganho de Elevação" value={runData.elevation_gain ?? "--"} unit="m" colors={colors} />
              <StatBox label="Elevação Máxima" value={runData.max_elevation ?? "--"} unit="m" colors={colors} />
            </View>

            <View style={staticStyles.statsRow}>
              <StatBox label="Passos" value={runData.steps ?? "--"} colors={colors} />
              <StatBox label="Calorias" value={calories_burned ?? 0} unit="kcal" colors={colors} />
            </View>

            <View style={staticStyles.statsRow}>
              <StatBox label="Territórios Conquistados" value={crossed_h3_ids?.length || 0} unit="hexágonos" colors={colors} />
            </View>

            <View style={staticStyles.divider} />

            {/* Espaço para o Gráfico de Ritmo */}
            <View style={staticStyles.section}>
              <ThemedText style={staticStyles.sectionTitle}>Ritmo</ThemedText>
              <View style={[staticStyles.chartPlaceholder, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <ThemedText style={{ color: colors.mutedForeground }}>Gráfico de Pace vs Km entrará aqui</ThemedText>
              </View>
            </View>

            <View style={staticStyles.divider} />

            {/* Espaço para o Gráfico de Elevação */}
            <View style={staticStyles.section}>
              <ThemedText style={staticStyles.sectionTitle}>Elevação</ThemedText>
              <View style={[staticStyles.chartPlaceholder, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <ThemedText style={{ color: colors.mutedForeground }}>Gráfico de Elevação vs Km entrará aqui</ThemedText>
              </View>
            </View>

            <View style={staticStyles.divider} />

            {/* Secao de Parciais */}
            <View style={staticStyles.section}>
              <ThemedText style={staticStyles.sectionTitle}>Parciais</ThemedText>
              
              <View style={staticStyles.splitsHeader}>
                <ThemedText style={[staticStyles.splitHeaderCell, { color: colors.mutedForeground, flex: 0.5 }]}>Km</ThemedText>
                <ThemedText style={[staticStyles.splitHeaderCell, { color: colors.mutedForeground, flex: 2 }]}>Ritmo</ThemedText>
                <ThemedText style={[staticStyles.splitHeaderCell, { color: colors.mutedForeground, flex: 0.8, textAlign: 'right' }]}>Elev.</ThemedText>
              </View>

              {/* Parciais mapeadas do banco de dados */}
              {runData.splits && runData.splits.length > 0 ? (
                runData.splits.map((split: any) => {
                  const maxDuration = Math.max(...runData.splits.map((s: any) => s.duration));
                  const percentage = maxDuration > 0 ? (split.duration / maxDuration) * 100 : 0;
                  // Limita a largura entre 20% e 100% para não ficar invisível
                  const barWidth = Math.max(20, Math.min(100, percentage));
                  
                  return (
                    <View key={split.km} style={staticStyles.splitRow}>
                      <ThemedText style={[staticStyles.splitCell, { flex: 0.5 }]}>{split.km}</ThemedText>
                      <View style={[staticStyles.splitCell, { flex: 2, flexDirection: 'row', alignItems: 'center' }]}>
                        <ThemedText style={{ width: 45 }}>{formatPace(1, split.duration)}</ThemedText>
                        <View style={{ height: 12, backgroundColor: colors.primary, borderRadius: 2, width: `${barWidth}%`, marginLeft: 8 }} />
                      </View>
                      <ThemedText style={[staticStyles.splitCell, { flex: 0.8, textAlign: 'right' }]}>
                        {split.elevation > 0 ? `+${split.elevation}` : split.elevation} m
                      </ThemedText>
                    </View>
                  );
                })
              ) : (
                <ThemedText style={{ color: colors.mutedForeground, marginTop: 16 }}>Nenhuma parcial registrada para esta corrida.</ThemedText>
              )}
            </View>
            
            <View style={{ height: 40 }} />
        </BottomSheetScrollView>
      </BottomSheet>
    </ThemedView>
  );
}

const staticStyles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  date: {
    fontSize: 14,
    marginTop: 4,
  },
  distanceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  statBox: {
    flex: 1,
    borderRadius: 10,
    padding: 16,
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
  statValueMedium: {
    fontSize: 22,
    fontWeight: "800",
    fontStyle: "italic",
  },
  statUnit: {
    fontSize: 12,
    fontWeight: "500",
    opacity: 0.6,
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 24,
    opacity: 0.2,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  chartPlaceholder: {
    height: 180,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  splitsHeader: {
    flexDirection: "row",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e030",
    marginBottom: 12,
  },
  splitHeaderCell: {
    fontSize: 12,
    fontWeight: "600",
  },
  splitRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  splitCell: {
    fontSize: 14,
    fontWeight: "500",
  },
});
