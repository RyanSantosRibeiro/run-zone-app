// app/login.tsx
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import Input from "@/components/ui/Input";

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
    const { error } : {error:any} = await login(email, password);

    if (error) {
      // Checagem segura para garantir que error.message existe
      const msg = error?.message || "Erro desconhecido";
      setErrorMsg(msg);
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
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

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Entrar</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.register}>
        Não tem uma conta?{" "}
        <Text style={styles.link} onPress={() => console.log("ir para signup")}>
          Criar conta
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#3b82f6",
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
    color: "#666",
  },
  link: {
    color: "#3b82f6",
    fontWeight: "bold",
  },
});
