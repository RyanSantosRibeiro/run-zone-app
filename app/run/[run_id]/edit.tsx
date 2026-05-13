import React, { useEffect, useState } from "react";
import { StyleSheet, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useGlobalSearchParams, router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/use-theme-color";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import Button from "@/components/ui/Button";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { supabase } from "@/utils/supabase";

function getDefaultRunTitle(dateString?: string) {
  const date = dateString ? new Date(dateString) : new Date();
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return "Corrida Matinal";
  } else if (hour >= 12 && hour < 14) {
    return "Corrida na hora do almoço";
  } else if (hour >= 14 && hour < 18) {
    return "Corrida à Tarde";
  } else if (hour >= 18 && hour < 24) {
    return "Corrida Noturna";
  } else {
    return "Corrida de Madrugada";
  }
}

export default function EditRunScreen() {
  const { run_id } = useGlobalSearchParams();
  const { fetchRunData, user } = useAuth();
  const colors = useColors();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [runData, setRunData] = useState<any>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Corrida");
  const [perceivedEffort, setPerceivedEffort] = useState<number | null>(null);

  useEffect(() => {
    const loadRun = async () => {
      try {
        const data = await fetchRunData(run_id as string);
        setRunData(data);
        setTitle(data?.title || getDefaultRunTitle(data?.started_at));
        setDescription(data?.description || "");
        setCategory(data?.category || "Corrida");
        setPerceivedEffort(data?.perceived_effort || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (run_id) loadRun();
  }, [run_id]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from("runs")
        .update({
          title,
          description,
          category,
          perceived_effort: perceivedEffort,
        })
        .eq("id", run_id)
        .eq("user_id", user?.id);

      if (error) throw error;
      
      // Navigate to details screen
      router.replace(`/run/${run_id}`);
    } catch (error) {
      console.error("Erro ao salvar atividade:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Navigate to details anyway
    router.replace(`/run/${run_id}`);
  };

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header Modal */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerLeft}>
          <ThemedText style={{ color: colors.foreground, fontSize: 16 }}>Cancelar</ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Editar atividade</ThemedText>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Title Input */}
        <ThemedText style={styles.inputLabel}>Título</ThemedText>
        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            value={title}
            onChangeText={setTitle}
            placeholder="Dê um título para sua atividade"
            placeholderTextColor={colors.mutedForeground}
          />
        </View>

        {/* Description Input */}
        <ThemedText style={styles.inputLabel}>Descrição</ThemedText>
        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border, minHeight: 120 }]}>
          <TextInput
            style={[styles.input, { color: colors.foreground, textAlignVertical: "top" }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Como foi? Compartilhe mais informações sobre sua atividade e use @ para marcar alguém."
            placeholderTextColor={colors.mutedForeground}
            multiline
          />
        </View>

        {/* Category Selector Mock */}
        <TouchableOpacity style={[styles.selector, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <FontAwesome6 name="shoe-prints" size={16} color={colors.foreground} />
            <ThemedText style={{ color: colors.foreground, fontSize: 16 }}>{category}</ThemedText>
          </View>
          <FontAwesome6 name="chevron-down" size={14} color={colors.mutedForeground} />
        </TouchableOpacity>

        {/* Media / Map Previews Mock */}
        {/* <View style={styles.mediaRow}>
          <View style={[styles.mediaBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
             <FontAwesome6 name="map" size={24} color={colors.mutedForeground} style={{ marginBottom: 8 }} />
             <ThemedText style={{ color: colors.mutedForeground, fontSize: 12, textAlign: 'center' }}>Mapa da rota</ThemedText>
          </View>
          <TouchableOpacity style={[styles.mediaBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
             <FontAwesome6 name="image" size={24} color={colors.foreground} style={{ marginBottom: 8 }} />
             <ThemedText style={{ color: colors.foreground, fontSize: 14, fontWeight: '500' }}>Adicionar fotos/vídeos</ThemedText>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={{ alignSelf: 'center', marginTop: 16 }}>
          <ThemedText style={{ color: colors.primary, fontWeight: '600' }}>Alterar tipo de mapa</ThemedText>
        </TouchableOpacity> */}

        {/* Detalhes Extra Mock */}
        <ThemedText style={{ fontSize: 20, fontWeight: "bold", marginTop: 32, marginBottom: 16 }}>Detalhes</ThemedText>
        
        {/* <TouchableOpacity style={[styles.selector, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <FontAwesome6 name="tag" size={16} color={colors.foreground} />
            <ThemedText style={{ color: colors.foreground, fontSize: 16 }}>Tag de atividade</ThemedText>
          </View>
          <FontAwesome6 name="chevron-down" size={14} color={colors.mutedForeground} />
        </TouchableOpacity> */}

        {/* Effort Selector - 6 Cards Radio */}
        <View style={{ marginBottom: 24 }}>
          <ThemedText style={[styles.inputLabel, { marginBottom: 12 }]}>Grau de esforço</ThemedText>
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
            {[1, 2, 3, 4, 5, 6].map((level) => {
              const isSelected = perceivedEffort === level;
              return (
                <TouchableOpacity
                  key={level}
                  onPress={() => setPerceivedEffort(level)}
                  style={[
                    styles.effortCard,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.card,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <ThemedText
                    style={{
                      color: isSelected ? colors.background : colors.foreground,
                      fontWeight: isSelected ? "bold" : "normal",
                      fontSize: 16,
                    }}
                  >
                    {level}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8, paddingHorizontal: 4 }}>
            <ThemedText style={{ color: colors.mutedForeground, fontSize: 12 }}>Leve</ThemedText>
            <ThemedText style={{ color: colors.mutedForeground, fontSize: 12 }}>Máximo</ThemedText>
          </View>
        </View>

      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <Button
          title={saving ? "Atualizando..." : "Atualizar atividade"}
          onPress={handleSave}
          disabled={saving}
          style={{ width: "100%", backgroundColor: colors.primary, paddingVertical: 14 }}
          textStyle={{ fontWeight: "bold", fontSize: 16, color: colors.primaryForeground }}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: { flex: 1, alignItems: "flex-start" },
  headerRight: { flex: 1 },
  headerTitle: { flex: 2, fontSize: 18, fontWeight: "bold", textAlign: "center" },
  content: { padding: 16, paddingBottom: 40 },
  inputLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
  },
  input: { fontSize: 16 },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
  },
  mediaRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  mediaBox: {
    flex: 1,
    height: 140,
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  effortCard: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
