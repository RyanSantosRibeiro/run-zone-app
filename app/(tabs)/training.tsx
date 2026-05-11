import { Image } from "expo-image";
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useColors } from "@/hooks/use-theme-color";
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

export default function TrainingScreen() {
  const colors = useColors();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.foreground }}>Carregando treinos...</Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.stepContainer}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <ThemedText type="title">Treinos</ThemedText>

        {/* Sliders laterais para os treinos */}
        <Text style={[styles.sliderTitle, { color: colors.foreground }]}>Treinos Recentes</Text>
        <FlatList
          data={treinoData}
          renderItem={({ item }) => (
            <View key={item.id} style={styles.treinoCardFlat}>
              <Image source={item.image} style={styles.treinoImage} contentFit="cover" placeholder="blur" />
              <View style={styles.treinoContent}>
                <Text style={[styles.treinoTitle, { color: colors.primary }]}>{item.title}</Text>
                <Text style={styles.treinoDescription}>{item.description}</Text>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
        />

        {/* Lista vertical de categorias de treinos */}
        <Text style={[styles.sliderTitle, { color: colors.foreground }]}>Categorias de Treinos</Text>
        <FlatList
          data={categoriaData}
          renderItem={({ item }) => (
            <View key={item.id} style={styles.categoriaCard}>
              <Image source={item.image} style={styles.categoriaImage} contentFit="cover" placeholder="blur" />
              <View style={styles.categoriaContent}>
                <Text style={[styles.categoriaTitle, { color: colors.primary }]}>{item.title}</Text>
                <Text style={styles.categoriaDescription}>{item.description}</Text>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
    padding: 16,
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
    fontWeight: "bold",
  },
  categoriaDescription: {
    fontSize: 16,
    color: "#fff",
    marginTop: 4,
  },
});
