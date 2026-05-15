import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Text } from 'react-native';
import { Image } from 'expo-image';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Feather from '@expo/vector-icons/Feather';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useColors } from '@/hooks/use-theme-color';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'expo-router';
import type { ActivityType } from '@/types/supabase';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width / 3;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60}min`;
  return `${m}min ${s}s`;
}

/** Retorna segundos desde o início da semana atual (segunda-feira) */
function getWeekStart(date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=dom
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** ISO week label "Sem N" */
function getWeekLabel(date: Date): string {
  const start = getWeekStart(date);
  return `${start.getDate()}/${start.getMonth() + 1}`;
}

/** Últimas N semanas como objetos { label, start, end } */
function getLastNWeeks(n: number) {
  const weeks = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay() - i * 7 + (now.getDay() === 0 ? -6 : 1));
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    weeks.push({ label: getWeekLabel(start), start, end });
  }
  return weeks;
}

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  corrida: 'Corrida',
  escalada: 'Escalada',
  trilha: 'Trilha',
  ciclismo: 'Ciclismo',
};

const ACTIVITY_ICONS: Record<ActivityType, string> = {
  corrida: 'person-running',
  escalada: 'person-falling',
  trilha: 'mountain',
  ciclismo: 'bicycle',
};

// ─── Gráfico de barras simples ────────────────────────────────────────────────

interface BarChartProps {
  data: { label: string; value: number }[];
  unit: string;
  color: string;
  mutedColor: string;
  bgColor: string;
}

function BarChart({ data, unit, color, mutedColor, bgColor }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 0.01);
  const chartH = 100;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: chartH + 24 }}>
      {data.map((item, i) => {
        const barH = Math.max(4, (item.value / max) * chartH);
        const isLast = i === data.length - 1;
        return (
          <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
            <View
              style={{
                width: '100%',
                height: barH,
                borderRadius: 4,
                backgroundColor: isLast ? color : color + '55',
              }}
            />
            <Text style={{ fontSize: 8, color: mutedColor, marginTop: 4, textAlign: 'center' }}>
              {item.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ─── Calendário de atividades ─────────────────────────────────────────────────

interface ActivityCalendarProps {
  activeDates: Set<string>; // "YYYY-MM-DD"
  color: string;
  mutedColor: string;
  cardColor: string;
  borderColor: string;
  currentMonth: Date;
}

function ActivityCalendar({ activeDates, color, mutedColor, cardColor, borderColor, currentMonth }: ActivityCalendarProps) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay(); // 0=dom
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1; // ajusta para seg=0
  const cells = Array.from({ length: offset + daysInMonth }, (_, i) =>
    i < offset ? null : i - offset + 1
  );
  const DAY_SIZE = (width - 32 - 6 * 6) / 7;

  return (
    <View style={[{ borderRadius: 12, borderWidth: 1, padding: 16 }, { backgroundColor: cardColor, borderColor }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 }}>
        {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, i) => (
          <Text key={i} style={{ fontSize: 11, fontWeight: '600', color: mutedColor, width: DAY_SIZE, textAlign: 'center' }}>{d}</Text>
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {cells.map((day, i) => {
          if (!day) return <View key={i} style={{ width: DAY_SIZE, height: DAY_SIZE }} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const active = activeDates.has(dateStr);
          return (
            <View
              key={i}
              style={{
                width: DAY_SIZE,
                height: DAY_SIZE,
                borderRadius: DAY_SIZE / 2,
                backgroundColor: active ? color : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 12, color: active ? '#000' : mutedColor, fontWeight: active ? '700' : '400' }}>
                {day}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const colors = useColors();
  const { profile, fetchUserHex, user } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'posts' | 'activities' | 'stats'>('posts');
  const [hexCount, setHexCount] = useState(0);
  const [userActivities, setUserActivities] = useState<any[]>([]);
  const [activityFilter, setActivityFilter] = useState<string>('Todas');
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const currentMonth = useMemo(() => new Date(), []);

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      setLoading(true);
      const [hexes, acts, followers, following] = await Promise.all([
        fetchUserHex(),
        supabase.from('activities').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('follows').select('id', { count: 'exact' }).eq('following_id', user.id),
        supabase.from('follows').select('id', { count: 'exact' }).eq('follower_id', user.id),
      ]);
      if (hexes) setHexCount(hexes.length);
      if (acts.data) setUserActivities(acts.data);
      setFollowerCount(followers.count ?? 0);
      setFollowingCount(following.count ?? 0);
      setLoading(false);
    };
    load();
  }, [user?.id]);

  // ── Dados calculados ─────────────────────────────────────────────────────

  const filteredActivities = useMemo(() => {
    if (activityFilter === 'Todas') return userActivities;
    const map: Record<string, ActivityType> = {
      Corrida: 'corrida', Escalada: 'escalada', Trilha: 'trilha', Ciclismo: 'ciclismo',
    };
    return userActivities.filter((a) => a.activity_type === map[activityFilter]);
  }, [userActivities, activityFilter]);

  const weeklyStats = useMemo(() => {
    const weekStart = getWeekStart();
    const thisWeek = userActivities.filter((a) => {
      const d = new Date(a.started_at || a.created_at);
      return d >= weekStart;
    });
    return {
      distance: thisWeek.reduce((s, a) => s + (a.distance ?? 0), 0),
      duration: thisWeek.reduce((s, a) => s + (a.duration ?? 0), 0),
      elevationGain: thisWeek.reduce((s, a) => s + (a.elevation_gain ?? 0), 0),
      count: thisWeek.length,
    };
  }, [userActivities]);

  const weeklyChartData = useMemo(() => {
    const weeks = getLastNWeeks(8);
    return weeks.map((w) => {
      const km = userActivities
        .filter((a) => {
          const d = new Date(a.started_at || a.created_at);
          return d >= w.start && d <= w.end;
        })
        .reduce((s, a) => s + (a.distance ?? 0), 0);
      return { label: w.label, value: parseFloat(km.toFixed(1)) };
    });
  }, [userActivities]);

  const activeDatesThisMonth = useMemo(() => {
    const set = new Set<string>();
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();
    userActivities.forEach((a) => {
      const d = new Date(a.started_at || a.created_at);
      if (d.getFullYear() === y && d.getMonth() === m) {
        set.add(`${y}-${String(m + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
      }
    });
    return set;
  }, [userActivities, currentMonth]);

  // Sequência de semanas com pelo menos 1 atividade
  const weekStreak = useMemo(() => {
    let streak = 0;
    const weeks = getLastNWeeks(12);
    for (let i = weeks.length - 1; i >= 0; i--) {
      const w = weeks[i];
      const hasActivity = userActivities.some((a) => {
        const d = new Date(a.started_at || a.created_at);
        return d >= w.start && d <= w.end;
      });
      if (hasActivity) streak++;
      else break;
    }
    return streak;
  }, [userActivities]);

  const monthLabel = currentMonth.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  // ── Renders ──────────────────────────────────────────────────────────────

  const renderProfileInfo = () => (
    <View style={styles.profileInfoContainer}>
      <View style={styles.profileTopRow}>
        <View style={styles.avatarContainer}>
          <Image
            source={profile?.avatar_url ? { uri: profile.avatar_url } : require('@/assets/images/user-icon.jpg')}
            style={[styles.avatar, { borderColor: colors.border }]}
            contentFit="cover"
          />
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{userActivities.length}</ThemedText>
            <ThemedText style={styles.statLabel}>atividades</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{followerCount}</ThemedText>
            <ThemedText style={styles.statLabel}>seguidores</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{followingCount}</ThemedText>
            <ThemedText style={styles.statLabel}>seguindo</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.bioContainer}>
        <ThemedText style={styles.fullName}>{profile?.full_name || profile?.username || 'Usuário'}</ThemedText>
        <ThemedText style={[styles.bioText, { color: colors.mutedForeground }]}>
          {profile?.bio || 'Explorando novos territórios.'}
        </ThemedText>
      </View>

      <Button
        title="Editar perfil"
        onPress={() => router.push('/profile/edit')}
        variant="secondary"
        style={styles.actionButton}
        textStyle={styles.actionButtonText}
      />
    </View>
  );

  const renderTabs = () => (
    <View style={[styles.tabsContainer, { borderBottomColor: colors.border }]}>
      {([
        { key: 'posts', icon: <Feather name="grid" size={22} /> },
        { key: 'activities', icon: <FontAwesome6 name="route" size={20} /> },
        { key: 'stats', icon: <Feather name="bar-chart-2" size={22} /> },
      ] as const).map(({ key, icon }) => (
        <TouchableOpacity
          key={key}
          style={[styles.tab, activeTab === key && { borderBottomColor: colors.foreground, borderBottomWidth: 1.5 }]}
          onPress={() => setActiveTab(key)}
        >
          {React.cloneElement(icon as any, {
            color: activeTab === key ? colors.foreground : colors.mutedForeground,
          })}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderActivities = () => (
    <View style={styles.activitiesContainer}>
      {/* Filtros */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
        {['Todas', 'Corrida', 'Escalada', 'Trilha', 'Ciclismo'].map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterChip, {
              backgroundColor: activityFilter === cat ? colors.foreground : colors.card,
              borderColor: colors.border,
            }]}
            onPress={() => setActivityFilter(cat)}
          >
            <ThemedText style={{ color: activityFilter === cat ? colors.background : colors.foreground, fontSize: 13, fontWeight: '600' }}>
              {cat}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lista */}
      <View style={styles.activitiesList}>
        {filteredActivities.length === 0 && (
          <View style={styles.emptyState}>
            <FontAwesome6 name="person-running" size={32} color={colors.mutedForeground} />
            <ThemedText style={{ color: colors.mutedForeground, marginTop: 12 }}>
              Nenhuma atividade {activityFilter !== 'Todas' ? `de ${activityFilter}` : ''} registrada.
            </ThemedText>
          </View>
        )}
        {filteredActivities.map((act) => {
          const type: ActivityType = act.activity_type ?? 'corrida';
          return (
            <TouchableOpacity
              key={act.id}
              style={[styles.activityListItem, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push(`/run/${act.id}`)}
            >
              <View style={[styles.activityIconContainer, { backgroundColor: colors.primary + '20' }]}>
                <FontAwesome6 name={ACTIVITY_ICONS[type] ?? 'route'} size={20} color={colors.primary} />
              </View>
              <View style={styles.activityDetails}>
                <ThemedText style={styles.activityTitle}>
                  {act.title || ACTIVITY_LABELS[type]}
                </ThemedText>
                <ThemedText style={{ fontSize: 12, color: colors.mutedForeground }}>
                  {new Date(act.started_at || act.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </ThemedText>
              </View>
              <View style={styles.activityStats}>
                <ThemedText style={styles.activityDistance}>{Number(act.distance ?? 0).toFixed(2)} km</ThemedText>
                <ThemedText style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 2 }}>
                  {formatDuration(act.duration ?? 0)}
                </ThemedText>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsTabContainer}>

      {/* Resumo da semana */}
      <View style={[styles.statsSection, { borderBottomColor: colors.border, borderBottomWidth: 1, paddingBottom: 24 }]}>
        <ThemedText style={styles.sectionHeading}>Esta semana</ThemedText>
        <View style={styles.weeklyStatsRow}>
          <View style={styles.weeklyStatItem}>
            <ThemedText style={[styles.weeklyStatLabel, { color: colors.mutedForeground }]}>Distância</ThemedText>
            <ThemedText style={styles.weeklyStatValue}>{weeklyStats.distance.toFixed(2)} km</ThemedText>
          </View>
          <View style={styles.weeklyStatItem}>
            <ThemedText style={[styles.weeklyStatLabel, { color: colors.mutedForeground }]}>Tempo</ThemedText>
            <ThemedText style={styles.weeklyStatValue}>{formatDuration(weeklyStats.duration)}</ThemedText>
          </View>
          <View style={styles.weeklyStatItem}>
            <ThemedText style={[styles.weeklyStatLabel, { color: colors.mutedForeground }]}>Elev.</ThemedText>
            <ThemedText style={styles.weeklyStatValue}>{Math.round(weeklyStats.elevationGain)} m</ThemedText>
          </View>
        </View>

        {/* Gráfico de barras — últimas 8 semanas */}
        <ThemedText style={[styles.subHeading, { color: colors.mutedForeground }]}>Distância · últimas 8 semanas (km)</ThemedText>
        <View style={[styles.chartBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {weeklyChartData.every((d) => d.value === 0) ? (
            <View style={{ alignItems: 'center', justifyContent: 'center', height: 120 }}>
              <ThemedText style={{ color: colors.mutedForeground }}>Sem atividades recentes</ThemedText>
            </View>
          ) : (
            <BarChart
              data={weeklyChartData}
              unit="km"
              color={colors.primary}
              mutedColor={colors.mutedForeground}
              bgColor={colors.card}
            />
          )}
        </View>
      </View>

      {/* Calendário */}
      <View style={styles.statsSection}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <ThemedText style={styles.sectionHeading}>{monthLabel}</ThemedText>
        </View>

        {/* Sequência */}
        <View style={[styles.sequenceRow, { backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 16 }]}>
          <View style={{ flex: 1 }}>
            <ThemedText style={[styles.weeklyStatLabel, { color: colors.mutedForeground }]}>Sequência de semanas</ThemedText>
            <ThemedText style={styles.weeklyStatValue}>{weekStreak} {weekStreak === 1 ? 'semana' : 'semanas'}</ThemedText>
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={[styles.weeklyStatLabel, { color: colors.mutedForeground }]}>Atividades este mês</ThemedText>
            <ThemedText style={styles.weeklyStatValue}>{activeDatesThisMonth.size}</ThemedText>
          </View>
        </View>

        <ActivityCalendar
          activeDates={activeDatesThisMonth}
          color={colors.primary}
          mutedColor={colors.mutedForeground}
          cardColor={colors.card}
          borderColor={colors.border}
          currentMonth={currentMonth}
        />
      </View>

    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {renderProfileInfo()}
        {renderTabs()}
        {activeTab === 'posts' && (
          <View style={styles.gridContainer}>
            {Array.from({ length: 9 }).map((_, i) => (
              <View key={i} style={[styles.gridItem, { borderColor: colors.background }]}>
                <View style={[{ flex: 1 }, { backgroundColor: colors.muted }]} />
              </View>
            ))}
          </View>
        )}
        {activeTab === 'activities' && renderActivities()}
        {activeTab === 'stats' && renderStats()}
      </ScrollView>
    </ThemedView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileInfoContainer: { paddingHorizontal: 16, paddingTop: 40, paddingBottom: 20 },
  profileTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatarContainer: { marginRight: 24 },
  avatar: { width: 86, height: 86, borderRadius: 43, borderWidth: 1 },
  statsContainer: { flex: 1, flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: 'bold', marginBottom: 2 },
  statLabel: { fontSize: 13 },
  bioContainer: { marginBottom: 16 },
  fullName: { fontSize: 14, fontWeight: 'bold', marginBottom: 2 },
  bioText: { fontSize: 14, lineHeight: 20 },
  actionButton: { paddingVertical: 8 },
  actionButtonText: { fontSize: 14, fontWeight: '600' },

  tabsContainer: { flexDirection: 'row', borderBottomWidth: 0.5 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  gridItem: { width: COLUMN_WIDTH, height: COLUMN_WIDTH, borderWidth: 0.5 },

  activitiesContainer: { flex: 1 },
  filterContainer: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  activitiesList: { padding: 16, gap: 12 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  activityListItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1 },
  activityIconContainer: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  activityDetails: { flex: 1 },
  activityTitle: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  activityStats: { alignItems: 'flex-end' },
  activityDistance: { fontSize: 16, fontWeight: 'bold' },

  statsTabContainer: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 40, gap: 0 },
  statsSection: { marginBottom: 32 },
  sectionHeading: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  weeklyStatsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  weeklyStatItem: { flex: 1 },
  weeklyStatLabel: { fontSize: 12, marginBottom: 4 },
  weeklyStatValue: { fontSize: 18, fontWeight: 'bold' },
  subHeading: { fontSize: 13, marginBottom: 12 },
  chartBox: { borderRadius: 12, borderWidth: 1, padding: 16 },
  sequenceRow: { flexDirection: 'row' },
});
