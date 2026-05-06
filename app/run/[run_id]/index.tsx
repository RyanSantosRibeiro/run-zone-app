import { Image } from "expo-image";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from "react-native";
import "react-native-gesture-handler";
import "react-native-reanimated";
import * as Location from "expo-location";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useGlobalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import MapView, { Polygon, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { customMapStyle } from "@/styles/Map";

export default function RunDetailsScreen() {
  const glob = useGlobalSearchParams();
  const { fetchRunData, user } = useAuth();

  const [runData, setRunData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);

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
  }, [glob]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permissão de localização negada!");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color="#00a86b" />
        <Text>Carregando corrida...</Text>
      </ThemedView>
    );
  }

  if (!runData || !region || !user) {
    return (
      <ThemedView style={styles.center}>
        <Text>Não foi possível encontrar dados da corrida.</Text>
      </ThemedView>
    );
  }

  const {
    title,
    distance,
    duration,
    average_speed,
    calories_burned,
    started_at,
    completed_at,
    boundary,
    route_data,
  } = runData;

  const route = route_data?.map((e) => {
    return {
      latitude: e.latitude,
      longitude: e.longitude,
    };
  });

  // Converter duração em min:seg
  const minutes = Math.floor(duration / 100 / 60);
  const seconds = duration % 60;

  const formattedDate = new Date(started_at).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <MapView
          style={styles.map}
          showsUserLocation
          region={region}
          followsUserLocation
          provider={PROVIDER_GOOGLE}
          customMapStyle={customMapStyle}
          initialCamera={{
            center: region,
            pitch: 70, // Inclinação do mapa (em graus)
            heading: 0, // Orientação da câmera (em graus)
            altitude: 80, // Distância da câmera em relação ao mapa
          }}
        >
          {boundary?.map((boundaryItem: any, key: number) => {
            const parsedBoundary = boundaryItem?.map(
              ([lng, lat]: [number, number]) => ({
                latitude: lat,
                longitude: lng,
              })
            );

            if (!parsedBoundary || parsedBoundary.length === 0) {
              return <Text key={key}>Carregando mapa...</Text>;
            }

            // return null;

            return (
              <Polygon
                key={key}
                coordinates={parsedBoundary}
                strokeColor={`${user?.profile?.color}`}
                fillColor={`${user?.profile?.color}30`}
                strokeWidth={2}
              />
            );
          })}
          {route.length > 0 && (
            <Polyline
              coordinates={route}
              fillColor={`${user?.profile?.color}`}
              strokeWidth={4} // espessura da linha
            />
          )}
        </MapView>
      }
    >
      <ThemedView style={styles.container}>
        <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'red',width: '100%'}}>
          <View style={{display: 'flex', flexDirection: 'column', width: 'auto'}}>
            <ThemedText style={styles.title}>{title}</ThemedText>
            <ThemedText style={styles.date}>{formattedDate}</ThemedText>
          </View>
          <View style={{display: 'flex', flexDirection: 'column', width: 'auto'}}>
            <ThemedText style={styles.title}>{distance.toFixed(2)} km</ThemedText>
          </View>
        </View>
        <View style={styles.statsContainer}>
         
          <View style={styles.statBox}>
            <ThemedText style={styles.statValue}>
              {distance.toFixed(2)} km
            </ThemedText>
            <ThemedText style={styles.statLabel}>Distância</ThemedText>
          </View>

          <View style={styles.statBox}>
            <ThemedText style={styles.statValue}>
              {minutes}:{seconds.toString().padStart(2, "0")}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Duração</ThemedText>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {average_speed.toFixed(2)} km/h
            </Text>
            <ThemedText style={styles.statLabel}>Velocidade Média</ThemedText>
          </View>

          <View style={styles.statBox}>
            <ThemedText style={styles.statValue}>
              {calories_burned ?? 0}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Calorias</ThemedText>
          </View>
        </View>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  map: {
    zIndex: 1,
    flex: 1,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  container: {
    backgroundColor: 'blue',
    flex: 1,
    alignItems: "flex-start",    
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    width: "45%",
    backgroundColor: "#f2f2f2",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 13,
    color: "#555",
  },
  mapPlaceholder: {
    width: "100%",
    height: 180,
    backgroundColor: "#e9e9e9",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
