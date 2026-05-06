import { getHexagons } from "@/utils/supabase";
import { createClient } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import { calculateDistance } from "@/utils/run";
import { router } from "expo-router";

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
  isFinish: false,
  timer: 0,
  route: [],
  startRun: () => {},
  pauseRun: () => {},
  stopRun: () => {},
  saveRun: () => {},
  fetchRunData: (run_id) => [],
  fetchSocialFeed: (page) => [],
  fetchUserHex: () => [],
  resumeRun: () => {},
  fetchUserRecord: () => null,
  fetchHexagons: () => [],
  fetchUserRecentAchievements: () => [],
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinish, setIsFinish] = useState(false);
  const [runData, setRunData] = useState(null);
  const [route, setRoute] = useState([]);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);
  const locationWatchRef = useRef(null);

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

  useEffect(() => {
    const getProfile = async (id) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();
      console.log({ ...user, profile });
      setUser((prev) => ({ ...prev, profile }));
    };

    if (user?.id && !user?.profile?.username) {
      getProfile(user?.id);
    }
  }, [user]);

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

  // Run Configs
  // Função para iniciar a corrida
  const startRun = () => {
    if (isRunning) return; // Se já estiver em execução, não faz nada
    setIsFinish(false);

    setIsRunning(true);
    setIsPaused(false);
    setTimer(0);
    setRoute([
      {
        latitude: -22.988921, 
        longitude: -43.191984,
        average_speed: 4.5,
        distance: 0.2,
      },
      {
        latitude: -22.988343, 
        longitude: -43.194411,
        average_speed: 4.5,
        distance: 0.2,
      },
      {
        latitude: -22.988851, 
        longitude: -43.192597,
        average_speed: 4.5,
        distance: 0.2,
      },
      {
        latitude: -22.987697, 
        longitude: -43.197563,
        average_speed: 4.5,
        distance: 0.2,
      },
      {
        latitude: -22.986715, 
        longitude: -43.200892,
        average_speed: 4.5,
        distance: 0.2,
      },
      {
        latitude: -22.987183, 
        longitude: -43.203057,
        average_speed: 4.5,
        distance: 0.2,
      },
      {
        latitude: -22.986515, 
        longitude: -43.207225,
        average_speed: 4.5,
        distance: 0.2,
      },
      {
        latitude: -22.986946, 
        longitude: -43.209194,
        average_speed: 4.5,
        distance: 0.2,
      },
      {
        latitude: -22.986986,  
        longitude: -43.214344,
        average_speed: 4.5,
        distance: 0.2,
      },
      {
        latitude: -22.987144, 
        longitude: -43.219107  ,
        average_speed: 4.5,
        distance: 0.2,
      },
      {
        latitude: -22.986622, 
        longitude: -43.215709 ,
        average_speed: 4.5,
        distance: 0.2,
      },
      {
        latitude: -22.987855, 
        longitude: -43.223871, 
        average_speed: 4.5,
        distance: 0.2,
      },
      {
        latitude: -22.987162,  
        longitude: -43.222343, 
        average_speed: 4.5,
        distance: 0.2,
      },
      {
        latitude: -22.989530, 
        longitude: -43.227323, 
        average_speed: 4.5,
        distance: 0.2,
      },
      
    ]);

    const startTime = new Date();
    setRunData({ startTime, distance: 0, timeElapsed: 0 });

    // Inicia o cronômetro
    timerRef.current = setInterval(() => {
      if (!isPaused) {
        setTimer((prev) => prev + 1);
      }
    }, 1000);

    // Inicia o rastreamento de localização
    locationWatchRef.current = Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 10000, // 10 segundos
        distanceInterval: 50, // 50 metros
      },
      (loc) => {
        const { latitude, longitude } = loc.coords;
        const timestamp = Date.now();
        let currentDistance = 0;

        setRoute((prev) => {
          let average_speed = 0;

          if (prev.length > 0) {
            const lastPoint = prev[prev.length - 1];

            const distanceKm = calculateDistance(
              lastPoint.latitude,
              lastPoint.longitude,
              latitude,
              longitude
            );
            currentDistance = distanceKm;

            const timeHours = (timestamp - lastPoint.timestamp) / 3600000; // ms → horas

            if (timeHours > 0) {
              average_speed = distanceKm / timeHours; // km/h
            }
          }

          const newPoint = {
            distance: currentDistance,
            latitude,
            longitude,
            timestamp,
            average_speed,
          };

          console.log("🧭 Novo ponto:", newPoint);

          return [...prev, newPoint];
        });
      }
    );
  };

  // Função para pausar a corrida
  const pauseRun = () => {
    if (isRunning && !isPaused) {
      setIsPaused(true);
      const timeElapsed = (new Date() - runData.startTime) / 1000; // Tempo em segundos
      setRunData((prevData) => ({ ...prevData, timeElapsed }));
      clearInterval(timerRef.current); // Para o cronômetro
    }
  };

  const resumeRun = () => {
    if (isRunning && isPaused) {
      setIsPaused(false); // Despausa
      const startTime = new Date() - runData.timeElapsed * 1000; // Calcula o tempo que passou até o momento da pausa

      // Ajusta o tempo restante ao continuar a corrida
      setRunData((prevData) => ({ ...prevData, startTime }));

      // Reinicia o cronômetro
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
  };

  // Função para parar a corrida
  const stopRun = async () => {
    if (!isRunning) return;
    setIsRunning(false);
    clearInterval(timerRef.current);
    locationWatchRef.current = null; // Para de escutar localização

    const endTime = new Date();
    const timeElapsed = timer;
    const finalData = {
      ...runData,
      timeElapsed,
      endTime,
      route, // 👈 adiciona o percurso
    };

    setRunData(finalData);
    await saveRun(finalData);
  };

  const saveRun = async (data) => {
    console.log("Salvando corrida");
    try {
      const payload = {
        user_id: user.id,
        distance: data.distance,
        time_elapsed: data.timeElapsed,
        start_time: data.startTime.toISOString(),
        end_time: data.endTime.toISOString(),
        route: JSON.stringify(data.route), // rota serializada como string
      };

      console.log({ payload });
      const response = await fetch("http://192.168.3.70:3000/api/run", {
        // const response = await fetch("http://192.168.1.7:3000/api/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload), // corpo da requisição em JSON
      });

      console.log({ response });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.statusText}`);
      }

      const result = await response.json();
      // router.navigate(`/run/${result.id}`);
      console.log("Corrida salva com sucesso!", result);
      setIsFinish(true);
    } catch (error) {
      console.log("Erro ao salvar corrida: ", error);
    }
  };

  // Fetch Datas
  const fetchRunData = async (run_id) => {
    try {
      const response = await fetch(
        `http://192.168.3.70:3000/api/run?run_id=${run_id}&user_id=${user.id}`,
        // `http://192.168.1.7:3000/api/run?run_id=${run_id}&user_id=${user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log({ response });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.statusText}`);
      }

      const result = await response.json();
      const routeData = JSON.parse(result.route_data);
      return { ...result, route_data: routeData };
    } catch (error) {
      console.log("Erro ao salvar corrida: ", error);
    }
  };

  // Get Social Feed
  const fetchSocialFeed = async (page = 1) => {
    const limit = 20; // número de resultados por página
    const from = (page - 1) * limit; // índice do primeiro resultado na página
    const to = from + limit - 1; // índice do último resultado na página

    console.log(`Fetching page ${page}...`);

    try {
      // Buscar os IDs dos usuários que o usuário segue
      const { data: following } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id);

      const followingIds = following?.map((f) => f.following_id) || [];
      const allUserIds = [user.id, ...followingIds];

      // Buscar as corridas com o range de página
      const { data: socialRuns } = await supabase
        .from("runs")
        .select(
          `
        *,
        profiles!inner (username, full_name, avatar_url),
        run_likes (id, user_id),
        run_comments (
          id,
          content,
          user_id,
          created_at,
          profiles!inner (username, full_name, avatar_url)
        )
        `
        )
        .in("user_id", allUserIds)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false }) // ordenação secundária
        .limit(limit) // Limitar os resultados por página
        .range(from, to); // Usar range para definir a faixa de resultados

      // Logar os IDs das corridas para debug
      // console.log("Carregando Feed");
      // socialRuns?.map((e) => {
      //   console.log({ id: e.id });
      // });

      return socialRuns || [];
    } catch (error) {
      console.log("Erro ao buscar feed: ", error);
      return []; // Retornar uma lista vazia em caso de erro
    }
  };

  const fetchUserHex = async () => {
    if (!user) return;
    try {
      const { data: userHex } = await supabase
        .from("cells")
        .select("*")
        .eq("owner_id", user.id);

        console.log({userHex})

      return userHex || [];
    } catch (error) {
      console.log("Erro ao salvar corrida: ", error);
    }
  };
  const fetchUserRecentAchievements = async () => {
    if (!user) return;
    try {
      const { data: recentAchievements } = await supabase
        .from("user_achievements")
        .select(
          `
      *,
      achievements (*)
    `
        )
        .eq("user_id", user.id)
        .order("earned_at", { ascending: false })
        .limit(3);

      return recentAchievements || null;
    } catch (error) {
      console.log("Erro ao buscar recentAchievements: ", error);
    }
  };
  const fetchUserRecord = async () => {
    if (!user) return;
    try {
      const { data: record } = await supabase
        .from("runs")
        .select("*")
        .eq("user_id", user.id)
        .order("distance", { ascending: false }) // ordena do maior para o menor
        .limit(1)
        .single(); // retorna direto o objeto ao invés de um array

      return record || null;
    } catch (error) {
      console.log("Erro ao buscar record: ", error);
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
        resumeRun,
        fetchHexagons,
        timer,
        route,
        isFinish,
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
