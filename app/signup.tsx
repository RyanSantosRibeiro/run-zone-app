import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Redirect, router } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/contexts/AuthContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useColors, type ThemeColors } from "@/hooks/use-theme-color";
import { Alert } from "@/components/ui/Alert";

// ─── Cores disponíveis para o corredor ───────────────────────────────────────
const RUNNER_COLORS = [
  "#B2FF00", // verde neon (padrão)
  "#00CFFF", // azul ciano
  "#FF4D6D", // vermelho rosado
  "#FFB800", // âmbar
  "#A855F7", // roxo
  "#FF6B35", // laranja
  "#00E5A0", // verde água
  "#FF85E1", // rosa
];

// ─── Etapa 1: credenciais ─────────────────────────────────────────────────────
interface StepOneProps {
  email: string;
  password: string;
  confirmPassword: string;
  onChange: (field: "email" | "password" | "confirmPassword", value: string) => void;
  onNext: () => void;
  error: string;
  loading: boolean;
  colors: ThemeColors;
}

function StepOne({ email, password, confirmPassword, onChange, onNext, error, loading, colors }: StepOneProps) {
  const inputStyle = {
    backgroundColor: `${colors.foreground}15`,
    borderColor: `${colors.foreground}25`,
    color: colors.foreground,
  };

  return (
    <>
      <Text style={[styles.stepLabel, { color: colors.primary }]}>Passo 1 de 2</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>Criar conta</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        Informe seu e-mail e crie uma senha segura.
      </Text>

      <Input
        placeholder="seu@email.com"
        value={email}
        onChangeText={(v) => onChange("email", v)}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        placeholderTextColor={colors.mutedForeground}
        style={[styles.input, inputStyle]}
      />
      <Input
        placeholder="Senha (mín. 6 caracteres)"
        value={password}
        onChangeText={(v) => onChange("password", v)}
        secureTextEntry
        placeholderTextColor={colors.mutedForeground}
        style={[styles.input, inputStyle]}
      />
      <Input
        placeholder="Confirmar senha"
        value={confirmPassword}
        onChangeText={(v) => onChange("confirmPassword", v)}
        secureTextEntry
        placeholderTextColor={colors.mutedForeground}
        style={[styles.input, inputStyle]}
      />

      <Alert message={error} />

      <Button title="Continuar" onPress={onNext} loading={loading} style={styles.button} />
    </>
  );
}

// ─── Etapa 2: perfil ──────────────────────────────────────────────────────────
interface StepTwoProps {
  fullName: string;
  username: string;
  selectedColor: string;
  onChange: (field: "fullName" | "username", value: string) => void;
  onSelectColor: (color: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  error: string;
  loading: boolean;
  colors: ThemeColors;
}

function StepTwo({
  fullName,
  username,
  selectedColor,
  onChange,
  onSelectColor,
  onSubmit,
  onBack,
  error,
  loading,
  colors,
}: StepTwoProps) {
  const inputStyle = {
    backgroundColor: `${colors.foreground}15`,
    borderColor: `${colors.foreground}25`,
    color: colors.foreground,
  };

  return (
    <>
      <Text style={[styles.stepLabel, { color: colors.primary }]}>Passo 2 de 2</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>Seu perfil</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        Como você quer aparecer no mapa?
      </Text>

      <Input
        placeholder="Nome completo"
        value={fullName}
        onChangeText={(v) => onChange("fullName", v)}
        autoCapitalize="words"
        autoComplete="name"
        placeholderTextColor={colors.mutedForeground}
        style={[styles.input, inputStyle]}
      />
      <Input
        placeholder="@username (sem espaços)"
        value={username}
        onChangeText={(v) => onChange("username", v.toLowerCase().replace(/\s/g, ""))}
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor={colors.mutedForeground}
        style={[styles.input, inputStyle]}
      />

      {/* Seletor de cor */}
      <Text style={[styles.colorLabel, { color: colors.mutedForeground }]}>Cor do seu território</Text>
      <View style={styles.colorGrid}>
        {RUNNER_COLORS.map((color) => (
          <Pressable
            key={color}
            style={[
              styles.colorSwatch,
              { backgroundColor: color },
              selectedColor === color && { borderColor: colors.foreground, transform: [{ scale: 1.15 }] },
            ]}
            onPress={() => onSelectColor(color)}
          />
        ))}
      </View>

      <Alert message={error} />

      <Button title="Criar conta" onPress={onSubmit} loading={loading} style={styles.button} />
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={[styles.backText, { color: colors.mutedForeground }]}>← Voltar</Text>
      </TouchableOpacity>
    </>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────
export default function Signup() {
  const { user, signup } = useAuth();
  const colors = useColors();

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Etapa 1
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Etapa 2
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [selectedColor, setSelectedColor] = useState(RUNNER_COLORS[0]);

  if (user) return <Redirect href="/" />;

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleStepOneChange = (
    field: "email" | "password" | "confirmPassword",
    value: string
  ) => {
    if (field === "email") setEmail(value);
    else if (field === "password") setPassword(value);
    else setConfirmPassword(value);
  };

  const handleStepTwoChange = (field: "fullName" | "username", value: string) => {
    if (field === "fullName") setFullName(value);
    else setUsername(value);
  };

  const validateStepOne = (): boolean => {
    if (!email.trim()) { setError("Informe um e-mail."); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("E-mail inválido."); return false; }
    if (password.length < 6) { setError("A senha deve ter pelo menos 6 caracteres."); return false; }
    if (password !== confirmPassword) { setError("As senhas não coincidem."); return false; }
    return true;
  };

  const handleNextStep = () => {
    setError("");
    if (validateStepOne()) setStep(2);
  };

  const handleSubmit = async () => {
    setError("");
    if (!fullName.trim()) { setError("Informe seu nome completo."); return; }
    if (!username.trim() || username.length < 3) { setError("Username deve ter pelo menos 3 caracteres."); return; }

    setLoading(true);
    const { error: signupError } = await signup({
      email,
      password,
      fullName,
      username,
      color: selectedColor,
    });
    setLoading(false);

    if (signupError) {
      setError(signupError.message ?? "Erro ao criar conta.");
    } else {
      router.replace("/");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/login.jpg")}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
      />
      <LinearGradient
        colors={[
          colors.background === "#FFFFFF" ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
          colors.background === "#FFFFFF" ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.9)",
        ]}
        style={StyleSheet.absoluteFillObject}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboard}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 1 ? (
            <StepOne
              email={email}
              password={password}
              confirmPassword={confirmPassword}
              onChange={handleStepOneChange}
              onNext={handleNextStep}
              error={error}
              loading={loading}
              colors={colors}
            />
          ) : (
            <StepTwo
              fullName={fullName}
              username={username}
              selectedColor={selectedColor}
              onChange={handleStepTwoChange}
              onSelectColor={setSelectedColor}
              onSubmit={handleSubmit}
              onBack={() => { setError(""); setStep(1); }}
              error={error}
              loading={loading}
              colors={colors}
            />
          )}

          <Text style={[styles.loginPrompt, { color: colors.mutedForeground }]}>
            Já tem conta?{" "}
            <Text
              style={[styles.link, { color: colors.primary }]}
              onPress={() => router.replace("/login")}
            >
              Entrar
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboard: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: "flex-end",
    padding: 24,
    paddingBottom: 48,
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  input: {
    marginBottom: 12,
  },
  colorLabel: {
    fontSize: 14,
    marginBottom: 12,
    marginTop: 4,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "transparent",
  },
  button: {
    marginTop: 4,
  },
  backBtn: {
    marginTop: 16,
    alignItems: "center",
  },
  backText: {
    fontSize: 14,
  },
  loginPrompt: {
    marginTop: 32,
    textAlign: "center",
    fontSize: 14,
  },
  link: {
    fontWeight: "bold",
  },
});
