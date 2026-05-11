import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import * as Location from "expo-location";
import { calculateDistance } from "@/utils/run";
import { supabase, type Run } from "@/utils/supabase";
import { useAuth } from "./AuthContext";
import { latLngToCell, cellToBoundary } from "h3-js";

// ─── Flag de Mock ────────────────────────────────────────────────────────────
// Mude para `true` para simular uma corrida de ~28 min sem sair do lugar.
// 1 segundo real ≈ 1 minuto simulado. A corrida dura ~28 segundos reais.
const __DEV_MOCK_RUN__ = true;

// Configuração do mock
const MOCK_CONFIG = {
  durationMinutes: 28,        // duração simulada em minutos
  speedKmH: 10,               // velocidade média (~6 min/km)
  tickIntervalMs: 1000,       // intervalo entre ticks reais (1s)
  simulatedTickSeconds: 60,   // cada tick real = 60s simulados
  // Direção (bearing em graus): 45 = nordeste
  bearingDeg: 45,
  // Pequena variação aleatória no bearing para parecer natural (±graus)
  bearingJitter: 8,
};

// ─── Tipos ──────────────────────────────────────────────────────────────────

export interface RoutePoint {
  latitude: number;
  longitude: number;
  timestamp?: number;
  average_speed?: number;
  distance?: number;
}

export interface RunData {
  startTime: Date;
  distance: number;
  timeElapsed: number;
  endTime?: Date;
  route?: RoutePoint[];
  crossedH3Ids?: string[];
  conqueredHexes?: number;
  defendedHexes?: number;
}

interface RunContextType {
  // Estado
  runData: RunData | null;
  isRunning: boolean;
  isPaused: boolean;
  isFinish: boolean;
  timer: number;
  route: RoutePoint[];
  // Ações
  startRun: () => void;
  pauseRun: () => void;
  resumeRun: () => void;
  stopRun: () => Promise<void>;
  resetRun: () => void;
  saveRun: (data: RunData) => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const RunContext = createContext<RunContextType>({
  runData: null,
  isRunning: false,
  isPaused: false,
  isFinish: false,
  timer: 0,
  route: [],
  startRun: () => {},
  pauseRun: () => {},
  resumeRun: () => {},
  stopRun: async () => {},
  resetRun: () => {},
  saveRun: async () => {},
});

// ─── Helpers de geo ──────────────────────────────────────────────────────────

/**
 * Dado um ponto (lat, lng) e um bearing (em graus), avança `distKm` km
 * e retorna o novo ponto. Usa fórmula esférica simplificada.
 */
function movePoint(
  lat: number,
  lng: number,
  bearingDeg: number,
  distKm: number
): { latitude: number; longitude: number } {
  const R = 6371; // raio da Terra em km
  const d = distKm / R;
  const brng = (bearingDeg * Math.PI) / 180;
  const lat1 = (lat * Math.PI) / 180;
  const lng1 = (lng * Math.PI) / 180;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) +
      Math.cos(lat1) * Math.sin(d) * Math.cos(brng)
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
      Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
    );

  return {
    latitude: (lat2 * 180) / Math.PI,
    longitude: (lng2 * 180) / Math.PI,
  };
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function RunProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinish, setIsFinish] = useState(false);
  const [runData, setRunData] = useState<RunData | null>(null);
  const [route, setRoute] = useState<RoutePoint[]>([]);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const locationWatchRef = useRef<unknown>(null);
  const mockIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Helpers internos ────────────────────────────────────────────────────────

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const clearLocationWatch = useCallback(() => {
    if (locationWatchRef.current) {
      const subscription = locationWatchRef.current as { remove?: () => void };
      subscription?.remove?.();
      locationWatchRef.current = null;
    }
  }, []);

  const clearMockInterval = useCallback(() => {
    if (mockIntervalRef.current) {
      clearInterval(mockIntervalRef.current);
      mockIntervalRef.current = null;
    }
  }, []);

  // ── Mock: gerar pontos simulados ───────────────────────────────────────────

  const startMockRun = useCallback(async () => {
    console.log("[RunContext] 🧪 MOCK RUN ativado — simulando corrida de 28 min");

    // Pega localização real como ponto de partida
    let startLat = -23.5505; // fallback: São Paulo
    let startLng = -46.6333;

    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      startLat = loc.coords.latitude;
      startLng = loc.coords.longitude;
      console.log(`[Mock] Partindo de: ${startLat.toFixed(5)}, ${startLng.toFixed(5)}`);
    } catch (e) {
      console.warn("[Mock] Não foi possível obter localização real, usando fallback SP");
    }

    const {
      durationMinutes,
      speedKmH,
      tickIntervalMs,
      simulatedTickSeconds,
      bearingDeg,
      bearingJitter,
    } = MOCK_CONFIG;

    const totalTicks = Math.ceil((durationMinutes * 60) / simulatedTickSeconds);
    let tickCount = 0;
    let currentLat = startLat;
    let currentLng = startLng;
    let simulatedTimestamp = Date.now();

    // Primeiro ponto (partida)
    setRoute([{
      latitude: currentLat,
      longitude: currentLng,
      timestamp: simulatedTimestamp,
      average_speed: 0,
      distance: 0,
    }]);

    // Timer acelerado: cada tick real incrementa o timer em `simulatedTickSeconds`
    timerRef.current = setInterval(() => {
      setTimer((prev) => prev + simulatedTickSeconds);
    }, tickIntervalMs);

    // Gerador de pontos mock
    mockIntervalRef.current = setInterval(() => {
      tickCount++;

      if (tickCount >= totalTicks) {
        // Corrida acabou — para automaticamente
        clearMockInterval();
        return;
      }

      // Distância percorrida neste tick
      const distKm = (speedKmH * simulatedTickSeconds) / 3600;

      // Bearing com variação natural
      const jitter = (Math.random() - 0.5) * 2 * bearingJitter;
      const currentBearing = bearingDeg + jitter;

      const newPoint = movePoint(currentLat, currentLng, currentBearing, distKm);
      currentLat = newPoint.latitude;
      currentLng = newPoint.longitude;
      simulatedTimestamp += simulatedTickSeconds * 1000;

      const speed = speedKmH + (Math.random() - 0.5) * 3; // variação ±1.5 km/h

      setRoute((prev) => [
        ...prev,
        {
          latitude: currentLat,
          longitude: currentLng,
          timestamp: simulatedTimestamp,
          average_speed: Math.max(0, speed),
          distance: distKm,
        },
      ]);
    }, tickIntervalMs);
  }, [clearMockInterval]);

  // ── Ações ──────────────────────────────────────────────────────────────────

  const startRun = useCallback(() => {
    if (isRunning) return;
    setIsFinish(false);
    setIsRunning(true);
    setIsPaused(false);
    setTimer(0);
    setRoute([]);

    const startTime = new Date();
    setRunData({ startTime, distance: 0, timeElapsed: 0 });

    if (__DEV_MOCK_RUN__) {
      startMockRun();
      return;
    }

    // ── Produção: GPS real ───────────────────────────────────────────────────
    timerRef.current = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);

    locationWatchRef.current = Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 10000,
        distanceInterval: 50,
      },
      (loc) => {
        const { latitude, longitude } = loc.coords;
        const timestamp = Date.now();

        setRoute((prev) => {
          let average_speed = 0;
          let currentDistance = 0;

          if (prev.length > 0) {
            const last = prev[prev.length - 1];
            const distanceKm = calculateDistance(
              last.latitude,
              last.longitude,
              latitude,
              longitude
            );
            currentDistance = distanceKm;
            const timeHours = (timestamp - (last.timestamp ?? 0)) / 3_600_000;
            if (timeHours > 0) average_speed = distanceKm / timeHours;
          }

          return [...prev, { distance: currentDistance, latitude, longitude, timestamp, average_speed }];
        });
      }
    );
  }, [isRunning, startMockRun]);

  const pauseRun = useCallback(() => {
    if (!isRunning || isPaused) return;
    setIsPaused(true);
    const timeElapsed = (Date.now() - (runData?.startTime.getTime() ?? 0)) / 1000;
    setRunData((prev) => prev ? { ...prev, timeElapsed } : prev);
    clearTimer();
    if (__DEV_MOCK_RUN__) clearMockInterval();
  }, [isRunning, isPaused, runData, clearTimer, clearMockInterval]);

  const resumeRun = useCallback(() => {
    if (!isRunning || !isPaused) return;
    setIsPaused(false);
    const startTime = new Date(Date.now() - (runData?.timeElapsed ?? 0) * 1000);
    setRunData((prev) => prev ? { ...prev, startTime } : prev);

    if (__DEV_MOCK_RUN__) {
      // Retoma o timer acelerado
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + MOCK_CONFIG.simulatedTickSeconds);
      }, MOCK_CONFIG.tickIntervalMs);
      // Nota: não retomamos a geração de pontos por simplicidade
      return;
    }

    timerRef.current = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
  }, [isRunning, isPaused, runData]);

  const saveRun = useCallback(async (data: RunData) => {
    if (!user?.id) return;
    try {
      const totalDistance = (data.route ?? []).reduce(
        (acc, pt) => acc + (pt.distance ?? 0),
        0
      );
      const avgSpeed =
        data.timeElapsed > 0
          ? (totalDistance / (data.timeElapsed / 3600))
          : 0;

      const crossedH3Ids = Array.from(
        new Set((data.route ?? []).map((pt) => latLngToCell(pt.latitude, pt.longitude, 9)))
      );

      const { error } = await supabase.from("runs").insert({
        user_id: user.id,
        distance: totalDistance,
        duration: data.timeElapsed,
        average_speed: avgSpeed,
        started_at: data.startTime.toISOString(),
        completed_at: data.endTime?.toISOString() ?? new Date().toISOString(),
        route_data: data.route as unknown as import("@/types/supabase").Json,
        crossed_h3_ids: crossedH3Ids,
      } as any);

      if (error) throw error;

      // === Lógica de Conquista de Territórios (H3) ===
      let conquered = 0;
      let defended = 0;

      if (crossedH3Ids.length > 0) {
        const currentMonth = new Date().toISOString().slice(0, 7); // ex: '2026-05'
        
        // Busca as células existentes
        const { data: existingCells } = await (supabase
          .from("cells")
          .select("*")
          .in("h3_index", crossedH3Ids) as any);

        const cellsToUpsert = crossedH3Ids.map((h3) => {
          const existing = existingCells?.find((c) => c.h3_index === h3);
          const boundary = cellToBoundary(h3).map(([lat, lng]) => [lng, lat]);
          
          let hp = existing?.hp ?? 0;
          let owner = existing?.owner_id ?? user.id;

          // Multiplicador de distância (ex: 20 base * (distancia / 2km), min 1)
          const multiplier = Math.max(1, totalDistance / 2);
          const points = Math.floor(20 * multiplier);

          if (!existing || owner === user.id) {
            // Defesa ou primeiro dono
            hp = Math.min(100, hp + points);
            owner = user.id;
            defended++;
          } else {
            // Ataque
            hp -= points;
            if (hp <= 0) {
              owner = user.id; // Conquistou!
              hp = Math.min(100, Math.abs(hp) + 10); // HP inicial pós-conquista
              conquered++;
            }
          }

          return {
            h3_index: h3,
            owner_id: owner,
            hp,
            max_hp: 100,
            boundary,
            season: currentMonth,
            updated_at: new Date().toISOString()
          };
        });

        const { error: cellError } = await (supabase
          .from("cells")
          .upsert(cellsToUpsert as any, { onConflict: "h3_index" }) as any);

        if (cellError) {
          console.error("[saveRun] Erro ao atualizar cells:", cellError);
        }
      }

      console.log("[saveRun] Corrida salva com sucesso!");
      
      // Atualiza o estado com as estatísticas de conquista
      setRunData(prev => prev ? { 
        ...prev, 
        crossedH3Ids, 
        conqueredHexes: conquered, 
        defendedHexes: defended 
      } : prev);
      
      setIsFinish(true);
    } catch (error) {
      console.error("[saveRun] Erro ao salvar corrida:", error);
    }
  }, [user?.id]);

  const stopRun = useCallback(async () => {
    if (!isRunning) return;
    setIsRunning(false);
    clearTimer();
    clearLocationWatch();
    clearMockInterval();

    const endTime = new Date();
    const finalData: RunData = {
      ...(runData as RunData),
      timeElapsed: timer,
      endTime,
      route,
    };

    setRunData(finalData);
    await saveRun(finalData);
  }, [isRunning, runData, timer, route, clearTimer, clearLocationWatch, clearMockInterval, saveRun]);

  const resetRun = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setIsFinish(false);
    setTimer(0);
    setRoute([]);
    setRunData(null);
    clearTimer();
    clearLocationWatch();
    clearMockInterval();
  }, [clearTimer, clearLocationWatch, clearMockInterval]);

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <RunContext.Provider
      value={{
        runData,
        isRunning,
        isPaused,
        isFinish,
        timer,
        route,
        startRun,
        pauseRun,
        resumeRun,
        stopRun,
        resetRun,
        saveRun,
      }}
    >
      {children}
    </RunContext.Provider>
  );
}

export function useRun() {
  return useContext(RunContext);
}
