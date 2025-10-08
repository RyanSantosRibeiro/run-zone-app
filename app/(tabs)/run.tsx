import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, {
  Polygon,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import Fontisto from "@expo/vector-icons/Fontisto";

import { Collapsible } from "@/components/ui/collapsible";
import { ExternalLink } from "@/components/external-link";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Fonts } from "@/constants/theme";
import * as Location from "expo-location";
import { customMapStyle } from "@/styles/Map";
import Button from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";

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
  const [hexagons, setHexagons] = useState<null | any>(null);
  const { startRun, fetchHexagons } = useAuth();

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
    const handleFetchHexagons = async () => {
      console.log("Buscando Fetch Hex");
      const data = await fetchHexagons(); // Chama a função manualmente quando necessário
      setHexagons(data);
    };
    if (hexagons === null) {
      handleFetchHexagons();
    }
  }, [hexagons, fetchHexagons]);

  if (!region || !location) {
    return <Text>Carregando mapa...</Text>;
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      {/* Mapa ocupando toda a tela */}
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation
        followsUserLocation
        provider={PROVIDER_GOOGLE}
        customMapStyle={customMapStyle}
      >
        {/* {hexagons.map((hexagon: any, key: number) => {
          const { color, h3_hash } = hexagon; // Supondo que o objeto `polygon` contenha as coordenadas
          const boundary = cellToBoundary(h3_hash, true);
          // const coordinates = boundary.map(([lat, lng]) => [lng, lat]);
          console.log({ boundary, color });

          // // Verifique se o campo "polygon" contém as coordenadas geográficas
          // if (coordinates && Array.isArray(coordinates)) {
          //   return <View key={key} style={styles.floatingContent}></View>;
          // }

          return <Text key={key}>Carregando mapa...</Text>;
        })} */}
      </MapView>

      {/* Conteúdo flutuando sobre o mapa na parte inferior */}
      <View style={styles.floatingContent}>
        <Button
          title="Iniciar Corrida"
          onPress={() => startRun()}
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
});
