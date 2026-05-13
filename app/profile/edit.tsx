import React, { useState } from "react";
import { StyleSheet, View, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/use-theme-color";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import Button from "@/components/ui/Button";
import { supabase } from "@/utils/supabase";

export default function EditProfileScreen() {
  const { profile, user } = useAuth();
  const colors = useColors();

  const [saving, setSaving] = useState(false);

  // Form State
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [username, setUsername] = useState(profile?.username || "");
  const [bio, setBio] = useState(profile?.bio || "");

  const handleSave = async () => {
    if (!user?.id) return;
    try {
      setSaving(true);
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          username,
          bio,
        })
        .eq("id", user.id);

      if (error) throw error;
      
      // Navigate back to profile (and let auth context fetch refresh if needed)
      // Usually profile context syncs automatically or needs a refresh call. 
      // For now we just return.
      router.back();
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header Modal */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerLeft}>
          <ThemedText style={{ color: colors.foreground, fontSize: 16 }}>Cancelar</ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Editar perfil</ThemedText>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Name Input */}
        <ThemedText style={styles.inputLabel}>Nome completo</ThemedText>
        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Seu nome"
            placeholderTextColor={colors.mutedForeground}
          />
        </View>

        {/* Username Input */}
        <ThemedText style={styles.inputLabel}>Nome de usuário</ThemedText>
        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            value={username}
            onChangeText={setUsername}
            placeholder="seunome123"
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="none"
          />
        </View>

        {/* Bio Input */}
        <ThemedText style={styles.inputLabel}>Bio</ThemedText>
        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border, minHeight: 120 }]}>
          <TextInput
            style={[styles.input, { color: colors.foreground, textAlignVertical: "top" }]}
            value={bio}
            onChangeText={setBio}
            placeholder="Conte um pouco sobre você..."
            placeholderTextColor={colors.mutedForeground}
            multiline
          />
        </View>

      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <Button
          title={saving ? "Salvando..." : "Salvar alterações"}
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
  footer: {
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
