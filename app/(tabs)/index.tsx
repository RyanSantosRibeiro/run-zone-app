import { Image } from "expo-image";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import "react-native-gesture-handler";
import "react-native-reanimated";

import { HelloWave } from "@/components/hello-wave";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Link, router, useNavigation } from "expo-router";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Button from "@/components/ui/Button";
import { HeaderTitle } from "@react-navigation/elements";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { colors } from "@/hooks/use-theme-color";
import { useAuth } from "@/contexts/AuthContext";
import Map from "@/components/map";
import { formatTime } from "@/utils/run";
import RecentAchievements from "@/components/RecentAchievements";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["42%", "60%"], []);
  const isDark = colorScheme === "dark";
  const [socialData, setSocialData] = useState<any | null>([]);
  const [userData, setUserData] = useState<any | null>(null);
  const [recordData, setRecordData] = useState<any | null>(null);
  const [recentAchievements, setRecentAchievements] = useState<any | null>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // Para o pull-to-refresh
  const [hasMore, setHasMore] = useState(true); // Para controle do infinite scroll
  const [page, setPage] = useState(1); // Para controle de paginação

  const { fetchSocialFeed, fetchUserHex, user, fetchUserRecord, fetchUserRecentAchievements } = useAuth();

  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  useEffect(() => {
    
    const fetchRecentAchievements = async () => {
      try {
        setLoading(true);
        const data = await fetchUserRecentAchievements();
        setRecentAchievements(data);
      } catch (error) {
        console.error("Erro ao buscar dados da corrida", error);
      } finally {
        setLoading(false);
      }
    };
    const fetchHex = async () => {
      try {
        setLoading(true);
        const data = await fetchUserHex();
        setUserData(data);
      } catch (error) {
        console.error("Erro ao buscar dados da corrida", error);
      } finally {
        setLoading(false);
      }
    };
    const fetchRecord = async () => {
      try {
        setLoading(true);
        const data = await fetchUserRecord();
        console.log({ record: data?.crossed_h3_ids?.length });
        setRecordData(data);
      } catch (error) {
        console.error("Erro ao buscar dados da corrida", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
    fetchRecentAchievements();
    fetchHex();
  }, [ fetchUserHex, fetchUserRecord, fetchUserRecentAchievements]);

  const fetchSocial = useCallback(async (page:number) => {
    try {
      setLoading(true);
      const data = await fetchSocialFeed(page);
      if (data?.length === 0) {
        setHasMore(false); // Quando não houver mais dados
      }
      setSocialData((prev) => [...prev, ...data]);
    } catch (error) {
      console.error("Erro ao buscar dados sociais", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchSocialFeed])

  // const handleRefresh = async () => {
  //   setRefreshing(true);
  //   setPage(1); // Resetar a página para recarregar tudo
  //   setSocialData([]); // Limpar os dados antigos
  //   await fetchSocial(1);
  // };

  // const handleLoadMore = async () => {
  //   if (hasMore) {
  //     setPage((prev) => prev + 1); // Incrementar a página
  //     await fetchSocial(page + 1); // Carregar mais dados
  //   }
  // };

  useEffect(() => {
    if(socialData?.length <= 0) {
      fetchSocial(page);
    }
  }, [page,fetchSocial,socialData]);

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color="#00a86b" />
      </ThemedView>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 200 }}>
      <ThemedView style={styles.container}>
        <View
          style={{
            paddingVertical: 16,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {user && (
            <>
              <ThemedText
                style={{
                  fontSize: 22,
                  height: 24,
                  lineHeight: 24,
                  fontWeight: "600",
                }}
              >
                Olá, {user?.profile?.full_name || ""}
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: 12,
                  height: 14,
                  lineHeight: 14,
                  fontWeight: "400",
                  opacity: 0.5,
                }}
              >
                Pronto para conquistar ?
              </ThemedText>
            </>
          )}
        </View>
        {/* Resumo info */}
        <ThemedView
          style={styles.resumeContainer}
          lightColor={colors.accent}
          darkColor={colors.accentForeground}
        >
          <View
            style={{ width: "50%", display: "flex", flexDirection: "column" }}
          >
            <ThemedText
              style={{ fontSize: 14, fontWeight: "600", opacity: 0.8 }}
            >
              Território atual
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 56,
                lineHeight: 60,
                fontWeight: "800",
                height: 60,
                fontStyle: "italic",
              }}
            >
              {userData?.length || 0}
            </ThemedText>
            <ThemedText
              style={{ fontSize: 12, opacity: 0.4, height: 14, lineHeight: 14 }}
            >
              {70 * 0.2 * userData?.length} calorias até agora
            </ThemedText>
          </View>
          <View
            style={{
              width: "50%",
              display: "flex",
              flexDirection: "column",
              height: "100%",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <Map
              zoom={13}
              pitch={0}
              hexagons={userData}
              showUserLocation={false}
            />
          </View>
        </ThemedView>

        {/* Record info */}
        { recordData && (
          <ThemedView
          style={styles.recordContainer}
          lightColor={colors.foreground}
          darkColor={colors.foreground}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              opacity: 0.8,
              color: colors.accent,
            }}
          >
            Recorde Semanal
          </Text>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{ width: "45%", display: "flex", flexDirection: "column" }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  opacity: 0.4,
                  color: colors.accent,
                }}
              >
                Tempo
              </Text>
              <Text
                style={{
                  fontSize: 26,
                  lineHeight: 34,
                  fontWeight: "800",
                  height: 34,
                  fontStyle: "italic",
                  color: colors.accent,
                }}
              >
                {formatTime(recordData?.duration)}
              </Text>
            </View>
            <View
              style={{ width: "25%", display: "flex", flexDirection: "column" }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  opacity: 0.4,
                  color: colors.accent,
                }}
              >
                Distância
              </Text>
              <Text
                style={{
                  fontSize: 26,
                  lineHeight: 34,
                  fontWeight: "800",
                  height: 34,
                  fontStyle: "italic",
                  color: colors.accent,
                }}
              >
                {recordData?.distance}
              </Text>
            </View>
            <View
              style={{ width: "20%", display: "flex", flexDirection: "column" }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  opacity: 0.4,
                  color: colors.accent,
                }}
              >
                Hexagons
              </Text>
              <Text
                style={{
                  fontSize: 26,
                  lineHeight: 34,
                  fontWeight: "800",
                  height: 34,
                  fontStyle: "italic",
                  color: colors.accent,
                }}
              >
                {recordData?.crossed_h3_ids?.length || 0}
              </Text>
            </View>
          </View>
        </ThemedView>
        )}

        <RecentAchievements recentAchievements={recentAchievements || []} />

        {/* Desafios */}
        <View style={styles.challengerContainer}>
          <ThemedText style={styles.challengeHeader}>
            Desafio Semanal
          </ThemedText>
          <ThemedView
            style={styles.challengeBannerContainer}
            lightColor={colors.foreground}
            darkColor={colors.foreground}
          >
            <Image
              source={require("@/assets/images/login.jpg")}
              style={styles.challengeBannerImage}
              contentFit="cover"
              placeholder="blur"
            />

            {/* Conteúdo sobreposto */}
            <View style={styles.challengeContent}>
              <Text style={styles.challengeTitle}>Meus primeiros 4 KM</Text>
              <Text style={styles.challengeSubtitle}>
                Conquiste 20 hexágonos esta semana e ganhe recompensas
                exclusivas!
              </Text>
            </View>
          </ThemedView>
        </View>

        {/* <FlatList
        data={socialData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View key={item?.profiles?.username} style={styles.socialItem}>
            <Text style={styles.username}>{item?.profiles?.username}</Text>
            <Text>{item.content}</Text>
          </View>
        )}
        // onRefresh={handleRefresh} // Função de refresh
        // refreshing={refreshing} // Indicador de carregamento de pull-to-refresh
        // onEndReached={handleLoadMore} // Função de infinite scroll
        // onEndReachedThreshold={0.5} // Disparar quando chegar a 50% do final da lista
        ListFooterComponent={loading ? <ActivityIndicator size="small" color={colors.primary} /> : null}
      /> */}

        {/* <BottomSheet
          ref={bottomSheetRef}
          onChange={handleSheetChanges}
          snapPoints={snapPoints}
          backgroundStyle={{
            backgroundColor: isDark ? colors.foreground : colors.background,
          }}
          handleIndicatorStyle={{
            backgroundColor: isDark ? colors.background : colors.background, // ← Altera a cor do tracinho
          }}
        >
          <BottomSheetView
            style={{
              backgroundColor: isDark ? colors.foreground : colors.background,
            }}
          >
            <View></View>
          </BottomSheetView>
        </BottomSheet> */}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    gap: 16,
    padding: 16,
    marginBottom: 8,
    flex: 1
  },
  resumeContainer: {
    display: "flex",
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
  },
  challengerContainer: {
    display: "flex",
    flexDirection: "column",
    borderRadius: 16,
  },
  challengerImage: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  recordContainer: {
    display: "flex",
    flexDirection: "column",
    padding: 16,
    borderRadius: 16,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  challengeBannerContainer: {
    height: 160,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    position: "relative",
    justifyContent: "flex-end",
  },

  challengeBannerImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },

  challengeContent: {
    height: "100%",
    padding: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // leve escurecimento para contraste
  },

  challengeHeader: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  challengeTitle: {
    fontSize: 20,
    color: colors.accent,
    fontWeight: "bold",
    marginBottom: 4,
  },

  challengeSubtitle: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 8,
  },

  challengeButton: {
    backgroundColor: colors.accent,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  socialItem: {
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  username: {
    fontWeight: "bold",
    marginBottom: 5,
  },
});
