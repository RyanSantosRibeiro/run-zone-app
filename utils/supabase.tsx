import { createClient, SupabaseClient, User } from "@supabase/supabase-js";
import { Database } from "../types/supabase";

// ─── Singleton do cliente Supabase ──────────────────────────────────────────
// No Expo, variáveis públicas devem começar com EXPO_PUBLIC_
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[supabase] EXPO_PUBLIC_SUPABASE_URL ou EXPO_PUBLIC_SUPABASE_ANON_KEY não definidos no .env"
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // necessário para React Native
  },
});

/** @deprecated Use o singleton `supabase` exportado diretamente */
export const createClientBase = () => supabase;

// ─── Tipos auxiliares ────────────────────────────────────────────────────────
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Cell = Database["public"]["Tables"]["cells"]["Row"];
export type Follow = Database["public"]["Tables"]["follows"]["Row"];
export type Run = Database["public"]["Tables"]["runs"]["Row"];

export interface HexWithOwner extends Cell {
  owner: string | null; // full_name ou username
  color: string | undefined;
  opacity: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Retorna os IDs dos usuários que `userId` segue */
export async function getFollowingIds(
  client: SupabaseClient<Database>,
  userId: string
): Promise<string[]> {
  const { data: follows, error } = await client
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId) as any;

  if (error) {
    console.error("[getFollowingIds] Erro:", error.message);
    return [];
  }

  return follows?.map((f) => f.following_id) ?? [];
}

/**
 * Busca os hexágonos pertencentes ao usuário e às pessoas que ele segue,
 * já enriquecidos com dados do dono (nome + cor).
 */
export async function getHexagons(
  client: SupabaseClient<Database>,
  userId: string
): Promise<HexWithOwner[]> {
  // 1. IDs dos seguidos
  const ids = await getFollowingIds(client, userId);

  // 2. Buscar cells
  let query = client.from("cells").select("*");

  if (ids.length > 0) {
    query = query.or(`owner_id.eq.${userId},owner_id.in.(${ids.join(",")})`);
  } else {
    query = query.eq("owner_id", userId);
  }

  const { data: cells, error: cellsError } = await (query as any);

  if (cellsError) {
    console.error("[getHexagons] Erro ao buscar células:", cellsError.message);
    return [];
  }

  if (!cells || cells.length === 0) return [];

  // 3. Buscar perfis dos donos
  const ownerIds = [
    ...new Set(
      cells
        .map((c) => c.owner_id)
        .filter((id): id is string => !!id)
    ),
  ];

  const { data: owners, error: ownersError } = await client
    .from("profiles")
    .select("id, username, full_name, color")
    .in("id", ownerIds) as any;

  if (ownersError) {
    console.error("[getHexagons] Erro ao buscar perfis:", ownersError.message);
    return [];
  }

  // 4. Montar hexágonos enriquecidos
  return cells.map((cell): HexWithOwner => {
    const owner = owners?.find((o) => o.id === cell.owner_id);
    return {
      ...cell,
      owner: owner ? owner.full_name || owner.username : null,
      color: owner?.color,
      opacity: 0.2 + (cell.hp / cell.max_hp) * 0.8,
    };
  });
}
