import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase, getHexagons, type HexWithOwner, type Profile, type Activity } from "@/utils/supabase";

// Alias de compatibilidade
type Run = Activity;

// ─── Tipos ──────────────────────────────────────────────────────────────────

interface RoutePoint {
  latitude: number;
  longitude: number;
  timestamp?: number;
  average_speed?: number;
  distance?: number;
}

interface SignupPayload {
  email: string;
  password: string;
  fullName: string;
  username: string;
  color: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  signup: (payload: SignupPayload) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  // Fetch
  fetchRunData: (run_id: string | number) => Promise<(Run & { route_data: RoutePoint[] }) | undefined>;
  fetchSocialFeed: (page?: number) => Promise<Run[]>;
  fetchUserHex: () => Promise<HexWithOwner[] | undefined>;
  fetchUserRecord: () => Promise<Run | null | undefined>;
  fetchHexagons: () => Promise<HexWithOwner[] | undefined>;
  fetchUserRecentAchievements: () => Promise<unknown[] | null | undefined>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  login: async () => ({ error: null }),
  signup: async () => ({ error: null }),
  logout: async () => {},
  fetchRunData: async () => undefined,
  fetchSocialFeed: async () => [],
  fetchUserHex: async () => [],
  fetchHexagons: async () => [],
  fetchUserRecord: async () => null,
  fetchUserRecentAchievements: async () => [],
});

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Sessão e listener de auth ─────────────────────────────────────────────

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    };

    init();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        // Limpa perfil ao fazer logout
        if (!newSession) setProfile(null);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // ── Carrega o perfil do usuário após login ────────────────────────────────

  useEffect(() => {
    if (!user?.id || profile?.id === user.id) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("[AuthContext] Erro ao buscar perfil:", error.message);
        return;
      }
      setProfile(data);
    };

    fetchProfile();
  }, [user?.id]);

  // ── Auth ──────────────────────────────────────────────────────────────────

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signup = async ({ email, password, fullName, username, color }: SignupPayload) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username,
          color,
        },
      },
    });
    return { error: error as Error | null };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  // ── Fetch helpers ─────────────────────────────────────────────────────────

  const fetchRunData = async (run_id: string | number) => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("id", Number(run_id))
        .eq("user_id", user.id)
        .single() as any;

      if (error) throw error;

      const routeParsed: RoutePoint[] =
        typeof data.route_data === "string"
          ? JSON.parse(data.route_data)
          : (data.route_data as RoutePoint[]) ?? [];

      return { ...data, route_data: routeParsed };
    } catch (error) {
      console.error("[fetchRunData] Erro:", error);
    }
  };

  const fetchSocialFeed = async (page = 1): Promise<Run[]> => {
    if (!user?.id) return [];
    const limit = 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    try {
      const { data: following } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id) as any;

      const followingIds = following?.map((f) => f.following_id) ?? [];
      const allUserIds = [user.id, ...followingIds];

      const { data: socialRuns, error } = await supabase
        .from("activities")
        .select(`*, profiles!inner (username, full_name, avatar_url)`)
        .in("user_id", allUserIds)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(from, to) as any;

      if (error) throw error;
      return (socialRuns as Run[]) ?? [];
    } catch (error) {
      console.error("[fetchSocialFeed] Erro:", error);
      return [];
    }
  };

  const fetchHexagons = async (): Promise<HexWithOwner[] | undefined> => {
    if (!user?.id) return;
    try {
      return await getHexagons(supabase, user.id);
    } catch (error) {
      console.error("[fetchHexagons] Erro:", error);
    }
  };

  const fetchUserHex = async (): Promise<HexWithOwner[] | undefined> => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from("cells")
        .select("*")
        .eq("owner_id", user.id) as any;

      if (error) throw error;
      return (data as HexWithOwner[]) ?? [];
    } catch (error) {
      console.error("[fetchUserHex] Erro:", error);
    }
  };

  const fetchUserRecord = async (): Promise<Run | null | undefined> => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("user_id", user.id)
        .order("distance", { ascending: false })
        .limit(1)
        .maybeSingle() as any;

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("[fetchUserRecord] Erro:", error);
      return null;
    }
  };

  const fetchUserRecentAchievements = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from("user_achievements")
        .select(`*, achievements (*)`)
        .eq("user_id", user.id)
        .order("earned_at", { ascending: false })
        .limit(3) as any;

      if (error) throw error;
      return data ?? null;
    } catch (error) {
      console.error("[fetchUserRecentAchievements] Erro:", error);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        login,
        signup,
        logout,
        fetchHexagons,
        fetchRunData,
        fetchSocialFeed,
        fetchUserHex,
        fetchUserRecord,
        fetchUserRecentAchievements,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
