import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import MapView, { LatLng, Polygon, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { customMapStyle } from "@/styles/Map";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/use-theme-color";
import type { HexWithOwner } from "@/utils/supabase";

interface MapProps {
  showUserLocation?: boolean;
  hexagons?: HexWithOwner[];
  route?: LatLng[];
  zoom?: number;
  pitch?: number;
}

export default function Map({ showUserLocation = true, hexagons, route, zoom = 15, pitch = 50 }: MapProps) {
  const { profile } = useAuth();
  const colors = useColors();
  const [region, setRegion] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("[Map] Permissão de localização negada.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    })();
  }, []);

  if (!region) {
    return (
      <View style={[styles.loader, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        showsUserLocation={showUserLocation}
        followsUserLocation={showUserLocation}
        provider={PROVIDER_GOOGLE}
        customMapStyle={customMapStyle}
        pitchEnabled
        initialCamera={{
          center: region,
          pitch,
          zoom,
          heading: 0,
        }}
      >
        {/* Rota da corrida */}
        {route && route.length > 0 && (
          <Polyline
            coordinates={route}
            strokeColor={profile?.color ?? colors.primary}
            strokeWidth={4}
          />
        )}

        {/* Hexágonos de território */}
        {hexagons?.map((hex, index) => {
          if (!hex.boundary) return null;

          const boundary = hex.boundary as [number, number][];
          const coords = boundary.map(([lng, lat]) => ({
            latitude: lat,
            longitude: lng,
          }));

          if (coords.length === 0) return null;

          return (
            <Polygon
              key={hex.h3_index ?? index}
              coordinates={coords}
              strokeColor={hex.color ?? colors.primary}
              fillColor={`${hex.color ?? colors.primary}30`}
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
    flex: 1,
    width: "100%",
    height: "100%",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    flex: 1,
  },
});
