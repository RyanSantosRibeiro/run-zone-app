import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Polygon, PROVIDER_GOOGLE } from "react-native-maps";
import Fontisto from "@expo/vector-icons/Fontisto";

import { ThemedView } from "@/components/themed-view";
import * as Location from "expo-location";
import { customMapStyle } from "@/styles/Map";
import Button from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import Map from "@/components/map";

export default function RunScreen() {
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
  const { startRun, fetchHexagons, user } = useAuth();
  const [hexagons, setHexagons] = useState<any | null>(null);

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
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
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
    const handleFetchHexagons = async () => {
      const data = await fetchHexagons(); // Chama a função manualmente quando necessário
      setHexagons(data);
    };
    if (hexagons === null) {
      handleFetchHexagons();
    }
  }, [hexagons, fetchHexagons]);

  if (!region || !location || !user) {
    return <Text>Carregando mapa...</Text>;
  }

  const handleStartRun = () => {
    // Aqui você pode iniciar a corrida (se necessário) e então navegar
    startRun(); // Começa a corrida
    router.push("/run");
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      {/* Mapa ocupando toda a tela */}
      {/* <MapView
        style={styles.map}
        // region={region}
        showsUserLocation
        followsUserLocation
        provider={PROVIDER_GOOGLE}
        customMapStyle={customMapStyle}
        pitchEnabled
        // cameraZoomRange={{
        //   minCenterCoordinateDistance: 18,
        //   maxCenterCoordinateDistance: 20,
        // }}
        initialCamera={{
          center: region,
          pitch: 50, // Inclinação do mapa (em graus)
          zoom: 15,
          heading: 0, // Orientação da câmera (em graus) 
          // altitude: 150, // Distância da câmera em relação ao mapa
        }}
      >
        {hexagons?.map(({ boundary }: { boundary: any }, key: number) => {
          const parsedBoundary = boundary.map(
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
      </MapView> */}

      <View style={styles.map}>
        <Map hexagons={hexagons} zoom={hexagons?.length > 20 ? 15 : 16} />
      </View>

      {/* Conteúdo flutuando sobre o mapa na parte inferior */}
      <View style={styles.floatingContent}>
        <Button
          title="Iniciar Corrida"
          onPress={handleStartRun}
          icon={<Fontisto name="flash" size={24} color="black" />}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject, // Mapa ocupa a tela inteira
    zIndex: 0,
  },
  floatingContent: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    zIndex: 1,
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  titleContainer: {
    marginBottom: 8,
    flexDirection: "row",
    gap: 8,
  },
  statsBox: {
    position: "absolute",
    top: 40,
    left: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 12,
    borderRadius: 8,
  },
  statText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
