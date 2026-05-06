import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import Input from "@/components/ui/Input";
import { ThemedView } from "@/components/themed-view";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import Button from "@/components/ui/Button";
import { colors } from "@/hooks/use-theme-color";

export default function Login() {
  const { user, login } = useAuth();

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
        colors={["transparent", "#000000cc"]} // você pode trocar #000000cc por #ffffffcc no tema claro, ou usar tema dinâmico
        style={styles.gradient}
      />

      {/* Conteúdo por cima da imagem */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <Text style={styles.title}>Entrar</Text>

        <Input
          placeholder="seu@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

        <Button title="Entrar" style={styles.button}
          onPress={handleLogin}
          loading={loading}/>

        <Text style={styles.register}>
          Não tem uma conta?{" "}
          <Text style={styles.link} onPress={() => console.log("ir para signup")}>
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
    justifyContent: "flex-end", // Empurra para o fim (baixo)
    padding: 24,
    marginBottom: 200,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    color: "#fff",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 12,
  },
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  register: {
    marginTop: 24,
    textAlign: "center",
    color: "#ccc",
  },
  link: {
    color: colors.primary,
    fontWeight: "bold",
  },
});
