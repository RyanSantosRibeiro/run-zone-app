import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Fontisto from '@expo/vector-icons/Fontisto';
import Feather from '@expo/vector-icons/Feather';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useColors } from '@/hooks/use-theme-color';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width / 3;

export default function ProfileScreen() {
  const colors = useColors();
  const { profile, fetchUserHex, user } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'posts' | 'activities' | 'stats'>('posts');
  const [hexCount, setHexCount] = useState(0);
  const [userRuns, setUserRuns] = useState<any[]>([]);
  const [activityFilter, setActivityFilter] = useState('Todas');
  const mockPosts = Array.from({ length: 9 }).map((_, i) => ({ id: i.toString() }));

  useEffect(() => {
    const loadData = async () => {
      const hexes = await fetchUserHex();
      if (hexes) setHexCount(hexes.length);

      if (user?.id) {
        const { data, error } = await supabase
          .from('runs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (data && !error) {
          setUserRuns(data);
        }
      }
    };
    loadData();
  }, [fetchUserHex, user?.id]);

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Feather name="lock" size={16} color={colors.foreground} />
        <ThemedText style={styles.username}>{profile?.username || 'usuario_desconhecido'}</ThemedText>
        <Feather name="chevron-down" size={20} color={colors.foreground} />
      </View>
      <View style={styles.headerRight}>
        <Feather name="plus-square" size={24} color={colors.foreground} style={styles.headerIcon} />
        <Feather name="menu" size={24} color={colors.foreground} />
      </View>
    </View>
  );

  const renderProfileInfo = () => (
    <View style={styles.profileInfoContainer}>
      <View style={styles.profileTopRow}>
        <View style={styles.avatarContainer}>
          <Image
            source={profile?.avatar_url ? { uri: profile.avatar_url } : require('@/assets/images/user-icon.jpg')}
            style={[styles.avatar, { borderColor: colors.border }]}
            contentFit="cover"
          />
          <View style={[styles.noteBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={styles.noteText}>Nota...</ThemedText>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{userRuns.length}</ThemedText>
            <ThemedText style={styles.statLabel}>atividades</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{hexCount}</ThemedText>
            <ThemedText style={styles.statLabel}>seguidores</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>1.186</ThemedText>
            <ThemedText style={styles.statLabel}>seguindo</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.bioContainer}>
        <ThemedText style={styles.fullName}>{profile?.full_name || 'Nome do Usuário'}</ThemedText>
        {profile?.bio ? (
          <ThemedText style={styles.bioText}>{profile.bio}</ThemedText>
        ) : (
          <ThemedText style={styles.bioText}>Corredor explorando novos territórios.</ThemedText>
        )}
      </View>

      <View style={styles.actionButtonsRow}>
        <Button 
          title="Editar perfil" 
          onPress={() => router.push('/profile/edit')} 
          variant="secondary" 
          style={styles.actionButton}
          textStyle={styles.actionButtonText}
        />
        {/* <Button 
          title="Ver Atividades" 
          onPress={() => {}} 
          variant="secondary" 
          style={styles.actionButton}
          textStyle={styles.actionButtonText}
        /> */}
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={[styles.tabsContainer, { borderBottomColor: colors.border }]}>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'posts' && { borderBottomColor: colors.foreground, borderBottomWidth: 1 }]} 
        onPress={() => setActiveTab('posts')}
      >
        <Feather name="grid" size={24} color={activeTab === 'posts' ? colors.foreground : colors.mutedForeground} />
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'activities' && { borderBottomColor: colors.foreground, borderBottomWidth: 1 }]} 
        onPress={() => setActiveTab('activities')}
      >
        <FontAwesome6 name="route" size={22} color={activeTab === 'activities' ? colors.foreground : colors.mutedForeground} />
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'stats' && { borderBottomColor: colors.foreground, borderBottomWidth: 1 }]} 
        onPress={() => setActiveTab('stats')}
      >
        <Feather name="bar-chart-2" size={24} color={activeTab === 'stats' ? colors.foreground : colors.mutedForeground} />
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    if (activeTab === 'posts') {
      return (
        <View style={styles.gridContainer}>
          {mockPosts.map((post, index) => (
            <View key={post.id} style={[styles.gridItem, { borderColor: colors.background }]}>
              <View style={[styles.placeholderImage, { backgroundColor: colors.muted }]} />
            </View>
          ))}
        </View>
      );
    }
    
    if (activeTab === 'activities') {
      return (
        <View style={styles.activitiesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContainer}>
            {['Todas', 'Corrida', 'Bicicleta', 'Trilha'].map((cat) => (
              <TouchableOpacity 
                key={cat} 
                style={[
                  styles.filterChip, 
                  { backgroundColor: activityFilter === cat ? colors.foreground : colors.card, borderColor: colors.border }
                ]}
                onPress={() => setActivityFilter(cat)}
              >
                <ThemedText style={{ color: activityFilter === cat ? colors.background : colors.foreground, fontSize: 13, fontWeight: '600' }}>
                  {cat}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.activitiesList}>
            {userRuns.map((run) => (
              <TouchableOpacity 
                key={run.id} 
                style={[styles.activityListItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push(`/run/${run.id}`)}
              >
                <View style={[styles.activityIconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <FontAwesome6 name="route" size={20} color={colors.primary} />
                </View>
                <View style={styles.activityDetails}>
                  <ThemedText style={styles.activityTitle}>{run.title || 'Corrida'}</ThemedText>
                  <ThemedText style={[styles.activityDate, { color: colors.mutedForeground }]}>
                    {new Date(run.created_at).toLocaleDateString()}
                  </ThemedText>
                </View>
                <View style={styles.activityStats}>
                  <ThemedText style={styles.activityDistance}>{run.distance?.toFixed(2)} km</ThemedText>
                  <ThemedText style={[styles.activitySpeed, { color: colors.mutedForeground }]}>
                    {run.average_speed?.toFixed(1)} km/h
                  </ThemedText>
                </View>
              </TouchableOpacity>
            ))}
            {userRuns.length === 0 && (
              <View style={[styles.emptyState, { width: '100%' }]}>
                <ThemedText style={{ color: colors.mutedForeground }}>Nenhuma atividade registrada.</ThemedText>
              </View>
            )}
          </View>
        </View>
      );
    }

    if (activeTab === 'stats') {
      return (
        <View style={styles.statsTabContainer}>
          
          {/* Seção do Gráfico */}
          <View style={[styles.statsSection, { borderBottomColor: colors.border, borderBottomWidth: 1, paddingBottom: 24 }]}>
            <View style={[styles.activityBadge, { borderColor: colors.primary }]}>
              <FontAwesome6 name="shoe-prints" size={14} color={colors.primary} />
              <ThemedText style={{ color: colors.primary, fontSize: 14, fontWeight: '600' }}>Corrida</ThemedText>
            </View>

            <ThemedText style={styles.sectionHeading}>Esta semana</ThemedText>

            <View style={styles.weeklyStatsRow}>
              <View style={styles.weeklyStatItem}>
                <ThemedText style={styles.weeklyStatLabel}>Distância</ThemedText>
                <ThemedText style={styles.weeklyStatValue}>5,02 km</ThemedText>
              </View>
              <View style={styles.weeklyStatItem}>
                <ThemedText style={styles.weeklyStatLabel}>Tempo</ThemedText>
                <ThemedText style={styles.weeklyStatValue}>28min 51s</ThemedText>
              </View>
              <View style={styles.weeklyStatItem}>
                <ThemedText style={styles.weeklyStatLabel}>Ganho de elev.</ThemedText>
                <ThemedText style={styles.weeklyStatValue}>21 m</ThemedText>
              </View>
            </View>

            <ThemedText style={styles.subHeading}>Últimas 12 semanas</ThemedText>
            
            {/* Espaço reservado para o gráfico */}
            <View style={[styles.chartPlaceholder, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={{ color: colors.mutedForeground }}>Gráfico de Progresso entrará aqui</ThemedText>
            </View>

            <Button
              title="Veja mais do seu progresso"
              onPress={() => {}}
              style={{ width: '100%', backgroundColor: colors.primary, marginTop: 16, paddingVertical: 14 }}
              textStyle={{ color: colors.primaryForeground, fontWeight: 'bold' }}
            />
          </View>

          {/* Seção do Calendário */}
          <View style={styles.statsSection}>
            <View style={styles.calendarHeaderRow}>
              <ThemedText style={styles.sectionHeading}>maio 2026</ThemedText>
              <TouchableOpacity style={[styles.shareButton, { borderColor: colors.border }]}>
                <Feather name="upload" size={16} color={colors.foreground} />
                <ThemedText style={{ fontSize: 14, fontWeight: '600' }}>Compartilhar</ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.sequenceRow}>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.weeklyStatLabel}>Sua sequência</ThemedText>
                <ThemedText style={styles.weeklyStatValue}>2 Semanas</ThemedText>
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.weeklyStatLabel}>Atividades da sequência</ThemedText>
                <ThemedText style={styles.weeklyStatValue}>2</ThemedText>
              </View>
            </View>

            {/* Espaço reservado para o Calendário */}
            <View style={[styles.calendarPlaceholder, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.calendarDaysHeader}>
                {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, i) => (
                  <ThemedText key={i} style={styles.calendarDayText}>{d}</ThemedText>
                ))}
              </View>
              <View style={{ height: 200, alignItems: 'center', justifyContent: 'center' }}>
                <ThemedText style={{ color: colors.mutedForeground }}>Grid do Calendário entrará aqui</ThemedText>
              </View>
            </View>
          </View>

        </View>
      );
    }

    return null;
  };

  // Se a Tab já possui o seu header nativo e safe area superior, talvez você queira ajustar as bordas do SafeAreaView.
  // Vou deixar apenas um ScrollView simples com ThemedView.
  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* {renderHeader()} */}
        {renderProfileInfo()}
        {renderTabs()}
        {renderContent()}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 20,
  },
  profileInfoContainer: {
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 20,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 24,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 1,
  },
  noteBubble: {
    position: 'absolute',
    top: -10,
    right: -10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  noteText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 13,
  },
  bioContainer: {
    marginBottom: 16,
  },
  fullName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: COLUMN_WIDTH,
    height: COLUMN_WIDTH,
    borderWidth: 0.5,
  },
  placeholderImage: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  activitiesContainer: {
    flex: 1,
  },
  filterScroll: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  activitiesList: {
    padding: 16,
    gap: 12,
  },
  activityListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  activityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 12,
  },
  activityStats: {
    alignItems: 'flex-end',
  },
  activityDistance: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  activitySpeed: {
    fontSize: 12,
    marginTop: 4,
  },
  statsTabContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  statsSection: {
    marginBottom: 24,
  },
  activityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  sectionHeading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  weeklyStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  weeklyStatItem: {
    flex: 1,
  },
  weeklyStatLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  weeklyStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subHeading: {
    fontSize: 15,
    marginBottom: 12,
  },
  chartPlaceholder: {
    height: 180,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  sequenceRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  calendarPlaceholder: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  calendarDaysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
});
