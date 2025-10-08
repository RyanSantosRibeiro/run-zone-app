import { getHexagons } from "@/utils/supabase";
import { createClient } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";

// Supabase client
const supabase = createClient(
  "https://axulgeymfpgfivtwwswk.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4dWxnZXltZnBnZml2dHd3c3drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1ODQyMjgsImV4cCI6MjA3NDE2MDIyOH0.L1YnF7tuL-Drd2gJcXtqnzo8xXE6yGH1EXRji68e5s4"
);

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async (email, password) => ({ error: null }),
  logout: async () => {},
  runData: null,
  isRunning: false,
  isPaused: false,
  startRun: () => {},
  pauseRun: () => {},
  stopRun: () => {},
  saveRun: () => {},
  fetchHexagons: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [runData, setRunData] = useState(null);

  useEffect(() => {
    // Verifica se já há uma sessão ativa
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data?.session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Escuta mudanças na autenticação (login, logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const fetchHexagons = async () => {
    try {
      if (!user) return;
      const hex = await getHexagons(supabase, user);
      return hex;
    } catch (error) {
      console.log("Erro ao buscar hexagons:", error);
    }
  };

  // ✅ Função de login
  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  // ✅ Função de logout
  const logout = async () => {
    await supabase.auth.signOut();
    stopRun(); // Para a corrida caso o usuário faça logout
  };

  // Função para iniciar a corrida
  const startRun = () => {
    setIsRunning(true);
    setIsPaused(false);
    setRunData({
      startTime: new Date(),
      distance: 0, // Exemplo de dado que você pode rastrear
      timeElapsed: 0, // Exemplo de dado de tempo
    });
  };

  // Função para pausar a corrida
  const pauseRun = () => {
    if (isRunning && !isPaused) {
      setIsPaused(true);
      const timeElapsed = (new Date() - runData.startTime) / 1000; // Tempo em segundos
      setRunData((prevData) => ({ ...prevData, timeElapsed }));
    }
  };

  // Função para parar a corrida
  const stopRun = () => {
    if (isRunning) {
      setIsRunning(false);
      setIsPaused(false);
      const timeElapsed = (new Date() - runData.startTime) / 1000; // Tempo em segundos
      setRunData((prevData) => ({ ...prevData, timeElapsed }));

      // Chama a função para salvar os dados da corrida no Supabase
      saveRun(runData);
    }
  };

  // Função para salvar os dados da corrida no Supabase
  const saveRun = async (data) => {
    if (user) {
      const { error } = await supabase.from("runs").insert([
        {
          user_id: user.id,
          distance: data.distance,
          time_elapsed: data.timeElapsed,
          start_time: data.startTime.toISOString(),
          end_time: new Date().toISOString(),
        },
      ]);
      if (error) {
        console.error("Erro ao salvar corrida:", error.message);
      } else {
        console.log("Corrida salva com sucesso!");
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        runData,
        isRunning,
        isPaused,
        startRun,
        pauseRun,
        stopRun,
        saveRun,
        fetchHexagons
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
