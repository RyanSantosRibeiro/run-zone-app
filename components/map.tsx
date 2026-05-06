// components/Input.tsx
import { useEffect, useState } from "react";
import { TextInput, StyleSheet, TextInputProps, View, ActivityIndicator, Text } from "react-native";
import MapView, { LatLng, Polygon, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { customMapStyle } from "@/styles/Map";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/hooks/use-theme-color";

interface Props {
  showUserLocation?: boolean;
  hexagons?: any[];
  route?: LatLng[];
  zoom?: number,
  pitch?: number

}

export default function Map(props: Props) {
  const { user } = useAuth();
  const [region, setRegion] = useState<{
      latitude: number;
      longitude: number;
      latitudeDelta: number;
      longitudeDelta: number;
    } | null>(null);

   // Pega Localização
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
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      })();
    }, []);

  if (!region || !user) {
      return <ActivityIndicator color={colors.primary} />;
    }


  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        // region={region}
        showsUserLocation={props?.showUserLocation || true}
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
          pitch: props?.pitch || 50, // Inclinação do mapa (em graus)
          zoom: props?.zoom || 15,
          heading: 0, // Orientação da câmera (em graus)
          // altitude: 150, // Distância da câmera em relação ao mapa
        }}
      >
        {props?.route && props?.route.length > 0 && (
          <Polyline
            coordinates={props?.route}
            fillColor={`${user?.profile?.color}`}
            strokeWidth={4} // espessura da linha
          />
        )}
        {props?.hexagons?.map(({ boundary, color }: { boundary: any }, key: number) => {
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
              strokeColor={`${color}`}
              fillColor={`${color}30`}
              strokeWidth={2}
            />
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
    height: '100%',
    width: '100%'
  },
  map: {
    flex: 1
  }
});
