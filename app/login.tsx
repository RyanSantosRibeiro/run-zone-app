import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Redirect, router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import Input from "@/components/ui/Input";
import { ThemedView } from "@/components/themed-view";
import { Alert } from "@/components/ui/Alert";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import Button from "@/components/ui/Button";
import { useColors } from "@/hooks/use-theme-color";

export default function Login() {
  const { user, login } = useAuth();
  const colors = useColors();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Redirect href="/" />;

  const handleLogin = async () => {
    setErrorMsg("");
    setLoading(true);
    const { error }: { error: any } = await login(email, password);

    if (error) {
      const msg = error?.message || "Erro desconhecido";
      setErrorMsg(msg);
    }

    setLoading(false);
  };

  return (
    <ThemedView style={styles.container}>
      {/* Imagem de fundo */}
      <Image
        source={require("@/assets/images/login.jpg")}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        placeholder="blur"
      />

      {/* Degradê do tema escuro/claro */}
      <LinearGradient
        colors={[
          colors.background === "#FFFFFF" ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
          colors.background === "#FFFFFF" ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.9)",
        ]}
        style={styles.gradient}
      />

      {/* Conteúdo por cima da imagem */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Entrar</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Bem-vindo de volta! Faça login para continuar.
        </Text>

        <Input
          placeholder="seu@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={colors.mutedForeground}
          style={[
            styles.input,
            {
              backgroundColor: `${colors.foreground}15`,
              borderColor: `${colors.foreground}25`,
              color: colors.foreground,
            },
          ]}
        />

        <Input
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor={colors.mutedForeground}
          style={[
            styles.input,
            {
              backgroundColor: `${colors.foreground}15`,
              borderColor: `${colors.foreground}25`,
              color: colors.foreground,
            },
          ]}
        />

        <Alert message={errorMsg} />

        <Button
          title="Entrar"
          style={styles.button}
          onPress={handleLogin}
          loading={loading}
        />

        <Text style={[styles.register, { color: colors.mutedForeground }]}>
          Não tem uma conta?{" "}
          <Text
            style={[styles.link, { color: colors.primary }]}
            onPress={() => router.push("/signup")}
          >
            Criar conta
          </Text>
        </Text>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 24,
    marginBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  register: {
    marginTop: 24,
    textAlign: "center",
  },
  link: {
    fontWeight: "bold",
  },
});
