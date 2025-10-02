import { createClient } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";

const supabase = createClient("https://axulgeymfpgfivtwwswk.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4dWxnZXltZnBnZml2dHd3c3drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1ODQyMjgsImV4cCI6MjA3NDE2MDIyOH0.L1YnF7tuL-Drd2gJcXtqnzo8xXE6yGH1EXRji68e5s4");


const AuthContext = createContext({
  user: null,
  loading: true,
  login: async (email,password) => ({ error: null }),
  logout: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica se já há uma sessão ativa
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data?.session?.user ?? null);
      console.log({userData: data})
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

  // ✅ Função de login
  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  // ✅ Função de logout
  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
