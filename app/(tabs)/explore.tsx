import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps'; // Importando o MapView

import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import * as Location from 'expo-location';
import { customMapStyle, customMapStyleDark } from '@/styles/Map';
import { useColorScheme } from '@/hooks/use-color-scheme.web';



export default function TabTwoScreen() {
  const colorScheme = useColorScheme();
  const [region, setRegion] = useState<{ latitude:number, longitude:  number, latitudeDelta: number, longitudeDelta: number } | null>(null); // Estado para armazenar a região do mapa
  const [location, setLocation] = useState<{ latitude:number, longitude:  number } | null>(null); // Estado para armazenar a localização do usuário
  const isDark = colorScheme === "dark"

  useEffect(() => {
    if(!navigator) return;
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

  useEffect(() => {
  (async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permissão de localização negada!');
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    setLocation(location.coords);
    setRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
  })();
}, []);

  if (!region || !location) {
    return <Text>Carregando mapa...</Text>; // Exibe uma mensagem enquanto a localização não é carregada
  }
  return (
    <ThemedView style={{ flex: 1 }}>
      <MapView
        style={styles.map}
        initialRegion={region} // Passa a região inicial com as coordenadas obtidas
        region={region} // Mantém a região atualizada conforme a mudança
        showsUserLocation={true} // Exibe a localização do usuário no mapa
        followsUserLocation={true} // Faz o mapa seguir o movimento do usuário
        customMapStyle={isDark ? customMapStyleDark : customMapStyle}  // Aplicando o estilo personalizado
      >
        {/* Marcador para a localização do usuário */}
        {/* <Marker coordinate={location} title="Minha Localização" /> */}
      </MapView>

      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}
        >
          Explore
        </ThemedText>
      </ThemedView>

      <ThemedText>Explore os pontos turísticos de São Paulo.</ThemedText>

      <Collapsible title="File-based routing">
        <ThemedText>
          Este app tem dois arquivos de tela:{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> e{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/explore.tsx</ThemedText>
        </ThemedText>
        <ThemedText>
          O layout do arquivo{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/_layout.tsx</ThemedText>{' '}
          configura o navegador de abas.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <ThemedText type="link">Aprenda mais</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Android, iOS, e suporte à web">
        <ThemedText>
          Você pode abrir este projeto no Android, iOS e na web. Para abrir a versão web, pressione{' '}
          <ThemedText type="defaultSemiBold">w</ThemedText> no terminal.
        </ThemedText>
      </Collapsible>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: 400, // Ajuste a altura conforme necessário
  },
  titleContainer: {
    padding: 16,
    flexDirection: 'row',
    gap: 8,
  },
});
