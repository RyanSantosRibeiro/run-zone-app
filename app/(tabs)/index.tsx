import { Image } from "expo-image";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useCallback, useEffect, useState } from "react";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useColors, type ThemeColors } from "@/hooks/use-theme-color";
import { useAuth } from "@/contexts/AuthContext";
import Map from "@/components/shared/Map";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { formatTime } from "@/utils/run";
import RecentAchievements from "@/components/shared/RecentAchievements";
import type { Run, HexWithOwner } from "@/utils/supabase";
import { Card } from "@/components/ui/Card";

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface HomeData {
  hexagons: HexWithOwner[];
  record: Run | null;
  achievements: unknown[] | null;
}

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function SectionHeader({ name }: { name: string }) {
  return (
    <View style={staticStyles.sectionHeader}>
      <ThemedText style={staticStyles.sectionHeaderText}>{name}</ThemedText>
    </View>
  );
}

function WeeklyTracker({ colors }: { colors: ThemeColors }) {
  // Mock: Segunda(S), Terça(T), Quarta(Q), Quinta(Q), Sexta(S), Sábado(S), Domingo(D)
  const days = [
    { label: 'S', active: false },
    { label: 'T', active: true },
    { label: 'Q', active: false },
    { label: 'Q', active: true },
    { label: 'S', active: false },
    { label: 'S', active: false },
    { label: 'D', active: false },
  ];

  return (
    <View style={[staticStyles.weeklyTrackerContainer, { backgroundColor: colors.card, borderColor: colors.primary }]}>
      
      {/* Header do Tracker: Foguinho de constância e Km */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16, alignItems: "center" }}>
        <ThemedText style={{ fontSize: 14, fontWeight: "bold" }}>Sua Semana</ThemedText>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <FontAwesome6 name="fire" size={14} color={colors.primary} />
            <ThemedText style={{ fontSize: 13, fontWeight: "600" }}>2 dias</ThemedText>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <FontAwesome6 name="route" size={14} color={colors.primary} />
            <ThemedText style={{ fontSize: 13, fontWeight: "600" }}>12.5 km</ThemedText>
          </View>
        </View>
      </View>

      {/* Dias da Semana */}
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {days.map((day, idx) => (
          <View key={idx} style={staticStyles.dayItemContainer}>
            <View 
              style={[
                staticStyles.dayCircle, 
                { 
                  backgroundColor: day.active ? colors.primaryLight : 'transparent',
                  borderColor: day.active ? colors.primary : colors.border,
                }
              ]}
            >
              {day.active && <FontAwesome6 name="check" size={10} color={colors.primary || '#fff'} />}
            </View>
            <Text style={{ fontSize: 12, color: day.active ? colors.foreground : colors.mutedForeground, marginTop: 6, fontWeight: day.active ? 'bold' : 'normal' }}>
              {day.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function TerritoryCard({ hexagons, colors }: { hexagons: HexWithOwner[]; colors: ThemeColors }) {
  const hexCount = hexagons.length;
  const estimatedCalories = Math.round(70 * 0.2 * hexCount);

  return (
    <View style={[staticStyles.card, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
      <View style={staticStyles.territoryInfo}>
        <Text style={[staticStyles.cardLabel, { color: colors.cardForeground }]}>
          Território atual
        </Text>
        <Text style={[staticStyles.bigNumber, { color: colors.cardForeground }]}>
          {hexCount}
        </Text>
        <Text style={[staticStyles.cardSubLabel, { color: colors.mutedForeground }]}>
          ~{estimatedCalories} cal conquistadas
        </Text>
      </View>
      <View style={staticStyles.miniMap}>
        <Map zoom={13} pitch={0} hexagons={hexagons} showUserLocation={false} />
      </View>
    </View>
  );
}

function RecordCard({ record, colors }: { record: Run; colors: ThemeColors }) {
  return (
    <Card
      style={[
        { padding: 20 },
      ]}
    >
      <Text style={[staticStyles.cardLabel, { color: colors.primary }]}>
        Melhor corrida
      </Text>
      <View style={staticStyles.recordRow}>
        <RecordStat label="Tempo" value={formatTime(record.duration)} colors={colors} />
        <RecordStat
          label="Distância"
          value={`${Number(record.distance).toFixed(2)} km`}
          colors={colors}
        />
        <RecordStat
          label="Hexágonos"
          value={String(record.crossed_h3_ids?.length ?? 0)}
          colors={colors}
        />
      </View>
    </Card>
  );
}

function RecordStat({ label, value, colors }: { label: string; value: string; colors: ThemeColors }) {
  return (
    <View style={staticStyles.recordStat}>
      <Text style={[staticStyles.cardSubLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text style={[staticStyles.recordValue, { color: colors.foreground }]}>
        {value}
      </Text>
    </View>
  );
}

function WeeklyChallengeBanner() {
  return (
    <View style={staticStyles.challengeSection}>
      <SectionHeader name="Desafio Semanal" />
      <View style={staticStyles.challengeBanner}>
        <Image
          source={require("@/assets/images/login.jpg")}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
        />
        <View style={staticStyles.challengeOverlay}>
          <Text style={staticStyles.challengeTitle}>Meus primeiros 4 KM</Text>
          <Text style={staticStyles.challengeSubtitle}>
            Conquiste 20 hexágonos esta semana e ganhe recompensas exclusivas!
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function HomeScreen() {
  const colors = useColors();
  const { user, profile, fetchUserHex, fetchUserRecord, fetchUserRecentAchievements } = useAuth();

  const [data, setData] = useState<HomeData>({
    hexagons: [],
    record: null,
    achievements: null,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ── Carregamento paralelo de todos os dados da home ───────────────────────

  const loadData = useCallback(async () => {
    try {
      const [hexagons, record, achievements] = await Promise.all([
        fetchUserHex(),
        fetchUserRecord(),
        fetchUserRecentAchievements(),
      ]);

      setData({
        hexagons: (hexagons as HexWithOwner[]) ?? [],
        record: record ?? null,
        achievements: (achievements as unknown[]) ?? null,
      });
    } catch (err) {
      console.error("[HomeScreen] Erro ao carregar dados:", err);
    }
  }, [fetchUserHex, fetchUserRecord, fetchUserRecentAchievements]);

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  // ── Pull-to-refresh ───────────────────────────────────────────────────────

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // ── Loading state ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <ThemedView style={staticStyles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ThemedView>
    );
  }

  const displayName = profile?.full_name || profile?.username || user?.email?.split("@")[0] || "";

  return (
    <ScrollView
      contentContainerStyle={staticStyles.scroll}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <ThemedView style={staticStyles.container}>

        {/* Saudação */}
        <View style={staticStyles.greeting}>
          <ThemedText style={staticStyles.greetingName}>
            Olá, {displayName} 👋
          </ThemedText>
          <ThemedText style={staticStyles.greetingSubtitle}>
            Pronto para conquistar território hoje?
          </ThemedText>
        </View>

        {/* Rastreador Semanal */}
        <WeeklyTracker colors={colors} />

        {/* Território */}
        {/* <TerritoryCard hexagons={data.hexagons} colors={colors} /> */}

        {/* Melhor corrida */}
        {/* {data.record && <RecordCard record={data.record} colors={colors} />} */}

        {/* Conquistas recentes */}
        {data.achievements && data.achievements.length > 0 && (
          <RecentAchievements recentAchievements={data.achievements} />
        )}

        {/* Desafio Semanal */}
        <WeeklyChallengeBanner />

      </ThemedView>
    </ScrollView>
  );
}

// ─── Estilos estáticos (não dependem de tema) ─────────────────────────────────

const staticStyles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: {
    paddingBottom: 120,
  },
  container: {
    flex: 1,
    gap: 16,
    padding: 16,
  },

  // Saudação
  greeting: {
    paddingVertical: 8,
  },
  greetingName: {
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 28,
  },
  greetingSubtitle: {
    fontSize: 13,
    opacity: 0.5,
    marginTop: 2,
  },

  // Weekly Tracker
  weeklyTrackerContainer: {
    flexDirection: "column",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  dayItemContainer: {
    alignItems: "center",
  },
  dayCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // Seção
  sectionHeader: {
    marginBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: "700",
  },

  // Card base
  card: {
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    gap: 12,
    overflow: "hidden",
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: "600",
    opacity: 0.7,
    marginBottom: 4,
  },
  cardSubLabel: {
    fontSize: 11,
    opacity: 0.5,
    marginTop: 4,
  },
  bigNumber: {
    fontSize: 52,
    fontWeight: "800",
    fontStyle: "italic",
    lineHeight: 58,
  },

  // Território
  territoryInfo: {
    flex: 1,
    justifyContent: "center",
  },
  miniMap: {
    width: "45%",
    borderRadius: 8,
    overflow: "hidden",
  },

  // Record
  recordCard: {
    borderWidth: 1,
    flexDirection: "column",
  },
  recordRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  recordStat: {
    flexDirection: "column",
    flex: 1,
  },
  recordValue: {
    fontSize: 24,
    fontWeight: "800",
    fontStyle: "italic",
    lineHeight: 30,
  },

  // Desafio
  challengeSection: {
    gap: 0,
  },
  challengeBanner: {
    height: 160,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  challengeOverlay: {
    flex: 1,
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  challengeTitle: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 4,
  },
  challengeSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },
});
