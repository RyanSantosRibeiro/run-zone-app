import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, FlatList } from 'react-native';
import { Image } from 'expo-image';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Feather from '@expo/vector-icons/Feather';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { useColors } from '@/hooks/use-theme-color';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// ─── Tipos ──────────────────────────────────────────────────────────────────

interface RankingUser {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  score: number;
  rank: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  image: any;
  reward: string;
  progress: number; // 0 to 1
}

// ─── Mocks/Dados ─────────────────────────────────────────────────────────────

const challengesData: Challenge[] = [
  { 
    id: "1", 
    title: "Explorador Urbano", 
    description: "Conquiste 10 novos hexágonos nesta semana.", 
    image: require("@/assets/images/maratona.jpg"),
    reward: "Medalha de Bronze",
    progress: 0.4
  },
  { 
    id: "2", 
    title: "Maratona Mensal", 
    description: "Corra um total de 42km durante o mês de Maio.", 
    image: require("@/assets/images/disparada.jpg"),
    reward: "Ícone Exclusivo",
    progress: 0.75
  },
  { 
    id: "3", 
    title: "Rei da Montanha", 
    description: "Acumule 500m de ganho de elevação em trilhas.", 
    image: require("@/assets/images/alongamento.jpg"),
    reward: "500 XP",
    progress: 0.1
  },
];

// ─── Componentes Auxiliares ──────────────────────────────────────────────────

function ChallengeCard({ challenge, colors }: { challenge: Challenge, colors: any }) {
  return (
    <View style={[styles.challengeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Image source={challenge.image} style={styles.challengeImage} contentFit="cover" />
      <View style={styles.challengeContent}>
        <View style={{ flex: 1 }}>
          <ThemedText style={styles.challengeTitle}>{challenge.title}</ThemedText>
          <ThemedText style={[styles.challengeDescription, { color: colors.mutedForeground }]}>
            {challenge.description}
          </ThemedText>
        </View>
        <View style={styles.rewardBadge}>
          <FontAwesome6 name="award" size={12} color={colors.primary} />
          <ThemedText style={[styles.rewardText, { color: colors.primary }]}>{challenge.reward}</ThemedText>
        </View>
      </View>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
          <View style={[styles.progressFill, { width: `${challenge.progress * 100}%`, backgroundColor: colors.primary }]} />
        </View>
        <ThemedText style={styles.progressText}>{Math.round(challenge.progress * 100)}%</ThemedText>
      </View>
    </View>
  );
}

function RankingItem({ user, isMe, colors }: { user: RankingUser, isMe: boolean, colors: any }) {
  const getRankColor = (rank: number) => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return colors.mutedForeground;
  };

  return (
    <View style={[styles.rankingItem, isMe && { backgroundColor: colors.primary + '15', borderRadius: 12 }]}>
      <View style={styles.rankContainer}>
        {user.rank <= 3 ? (
          <FontAwesome6 name="crown" size={16} color={getRankColor(user.rank)} />
        ) : (
          <ThemedText style={[styles.rankNumber, { color: colors.mutedForeground }]}>{user.rank}</ThemedText>
        )}
      </View>
      
      <Image 
        source={user.avatar_url ? { uri: user.avatar_url } : require('@/assets/images/user-icon.jpg')} 
        style={styles.rankingAvatar} 
      />
      
      <View style={{ flex: 1, marginLeft: 12 }}>
        <ThemedText style={[styles.rankingName, isMe && { fontWeight: 'bold' }]}>
          {user.full_name || user.username}
          {isMe && " (Você)"}
        </ThemedText>
      </View>

      <View style={styles.scoreContainer}>
        <ThemedText style={[styles.scoreValue, { color: colors.primary }]}>{user.score}</ThemedText>
        <ThemedText style={[styles.scoreLabel, { color: colors.mutedForeground }]}>km</ThemedText>
      </View>
    </View>
  );
}

// ─── Tela Principal ──────────────────────────────────────────────────────────

export default function ChallengesScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'ranking' | 'challenges'>('ranking');
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRanking() {
      try {
        setLoading(true);
        // Busca profiles e faz uma conta simples baseada em atividades
        // Para um ranking real "geral", poderíamos usar uma view ou RPC
        // Aqui vamos buscar top profiles e mockar um score baseado no count de atividades ou algo similar
        // enquanto não temos um sistema de pontuação global robusto.
        
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .limit(20);

        if (error) throw error;

        // Mocking scores for demo purposes since we don't have a complex ranking view yet
        const mappedRanking: RankingUser[] = (profiles || []).map((p, i) => ({
          ...p,
          score: Math.floor(Math.random() * 500) + 100, // Score mockado
          rank: i + 1
        })).sort((a, b) => b.score - a.score).map((p, i) => ({ ...p, rank: i + 1 }));

        setRanking(mappedRanking);
      } catch (err) {
        console.error("[Ranking] Erro ao buscar dados:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRanking();
  }, []);

  const renderTabs = () => (
    <View style={[styles.tabsContainer, { borderBottomColor: colors.border }]}>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'ranking' && { borderBottomColor: colors.foreground, borderBottomWidth: 1.5 }]} 
        onPress={() => setActiveTab('ranking')}
      >
        <ThemedText style={[styles.tabText, { color: activeTab === 'ranking' ? colors.foreground : colors.mutedForeground }]}>
          Ranking
        </ThemedText>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'challenges' && { borderBottomColor: colors.foreground, borderBottomWidth: 1.5 }]} 
        onPress={() => setActiveTab('challenges')}
      >
        <ThemedText style={[styles.tabText, { color: activeTab === 'challenges' ? colors.foreground : colors.mutedForeground }]}>
          Desafios
        </ThemedText>
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {renderTabs()}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {activeTab === 'ranking' ? (
            <View style={styles.rankingList}>
              <View style={styles.rankingHeader}>
                <ThemedText style={styles.rankingTitle}>Líderes da Temporada</ThemedText>
                <ThemedText style={[styles.rankingSubtitle, { color: colors.mutedForeground }]}>
                  Maio 2026
                </ThemedText>
              </View>

              {ranking.map((item) => (
                <RankingItem 
                  key={item.id} 
                  user={item} 
                  isMe={item.id === user?.id} 
                  colors={colors} 
                />
              ))}
            </View>
          ) : (
            <View style={styles.challengesList}>
              <View style={styles.rankingHeader}>
                <ThemedText style={styles.rankingTitle}>Objetivos Ativos</ThemedText>
                <ThemedText style={[styles.rankingSubtitle, { color: colors.mutedForeground }]}>
                  Complete para ganhar recompensas
                </ThemedText>
              </View>

              {challengesData.map((challenge) => (
                <ChallengeCard 
                  key={challenge.id} 
                  challenge={challenge} 
                  colors={colors} 
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  rankingList: {
    padding: 16,
  },
  challengesList: {
    padding: 16,
    gap: 16,
  },
  rankingHeader: {
    marginBottom: 20,
    marginTop: 8,
  },
  rankingTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  rankingSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  rankContainer: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  rankingAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  rankingName: {
    fontSize: 15,
  },
  scoreContainer: {
    alignItems: 'flex-end',
    minWidth: 60,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 11,
  },
  challengeCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 8,
  },
  challengeImage: {
    width: '100%',
    height: 120,
  },
  challengeContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
    width: 35,
  },
});
