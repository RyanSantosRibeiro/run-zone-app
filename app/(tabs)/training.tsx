import { Image } from "expo-image";
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { colors } from "@/hooks/use-theme-color";
import { useEffect, useState } from "react";

const treinoData = [
  { id: "1", title: "Corrida 5 KM", description: "Corra 5 km no seu ritmo", image: require("@/assets/images/login.jpg") },
  { id: "2", title: "Corrida Intervalada", description: "Treino de sprints e recuperação", image: require("@/assets/images/login.jpg") },
  { id: "3", title: "Subida de Colina", description: "Melhore sua resistência com subidas", image: require("@/assets/images/login.jpg") },
  { id: "4", title: "Corrida Longa", description: "Aumente a distância gradualmente", image: require("@/assets/images/login.jpg") },
];

const categoriaData = [
  { id: "1", title: "Longa Distância", image: require("@/assets/images/maratona.jpg"), description: "Para quem busca resistência" },
  { id: "3", title: "Aquecimento", image: require("@/assets/images/alongamento.jpg"), description: "Prepare-se para uma maratona completa" },
  { id: "2", title: "Tiro", image: require("@/assets/images/disparada.jpg"), description: "Treinos de velocidade" },
  { id: "4", title: "HIIT", image: require("@/assets/images/login.jpg"), description: "Treinos de alta intensidade" },
];

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false); // Simulando dados carregados, altere para sua lógica de fetch
  }, []);

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color="#00a86b" />
        <Text>Carregando treinos...</Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.stepContainer}>
      <ScrollView style={styles.scrollContainer}>
        <ThemedText type="title">Treinos</ThemedText>

        {/* Sliders laterais para os treinos */}
        <Text style={styles.sliderTitle}>Treinos Recentes</Text>
        <FlatList
          data={treinoData}
          renderItem={({ item }) => (
            <View key={item.id} style={styles.treinoCardFlat}>
              <Image source={item.image} style={styles.treinoImage} contentFit="cover" placeholder="blur" />
              <View style={styles.treinoContent}>
                <Text style={styles.treinoTitle}>{item.title}</Text>
                <Text style={styles.treinoDescription}>{item.description}</Text>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
        />

        {/* Lista vertical de categorias de treinos */}
        <Text style={styles.sliderTitle}>Categorias de Treinos</Text>
        <FlatList
          data={categoriaData}
          renderItem={({ item }) => (
            <View key={item.id} style={styles.categoriaCard}>
              <Image source={item.image} style={styles.categoriaImage} contentFit="cover" placeholder="blur" />
              <View style={styles.categoriaContent}>
                <Text style={styles.categoriaTitle}>{item.title}</Text>
                <Text style={styles.categoriaDescription}>{item.description}</Text>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
    gap: 20,
    padding: 16,
    marginBottom: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sliderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 18,
    marginTop: 32
  },
  treinoCardFlat: {
    marginRight: 16,
    borderRadius: 16,
    overflow: "hidden",
    width: 250,
    height: 100,
  },
  treinoCard: {
    marginRight: 16,
    borderRadius: 16,
    overflow: "hidden",
    width: 250,
    height: 200,
  },
  treinoImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  treinoContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  treinoTitle: {
    fontSize: 18,
    color: colors.accent,
    fontWeight: "bold",
  },
  treinoDescription: {
    fontSize: 14,
    color: "#fff",
    marginTop: 4,
  },
  categoriaCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    height: 200,
  },
  categoriaImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  categoriaContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    height: '100%',
    right: 0,
    padding: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  categoriaTitle: {
    fontSize: 24,
    color: colors.accent,
    fontWeight: "bold",
  },
  categoriaDescription: {
    fontSize: 16,
    color: "#fff",
    marginTop: 4,
  },
});
