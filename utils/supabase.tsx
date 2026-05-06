import { createClient   } from "@supabase/supabase-js";

// Define a function to create a Supabase client for client-side operations
export const createClientBase = () =>
  createClient(
    // Pass Supabase URL and anonymous key from the environment to the client
    "https://axulgeymfpgfivtwwswk.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4dWxnZXltZnBnZml2dHd3c3drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1ODQyMjgsImV4cCI6MjA3NDE2MDIyOH0.L1YnF7tuL-Drd2gJcXtqnzo8xXE6yGH1EXRji68e5s4"
  );

// Função para buscar os hexágonos para exibir no mapa
export async function getHexagons(supabase, user) {
  // 1. Buscar os hexágonos (cells)
  const ids = await getFollowingIds(supabase, user.id);
  console.log({ids})

  const { data: cells, error: cellsError } = await supabase
    .from("cells")
    .select("*")
    .or(`owner_id.eq.${user.id},owner_id.in.(${ids})`);

  

  if (cellsError) {
    console.error("Erro ao buscar células:", cellsError.message);
    return [];
  }

  // 2. Buscar perfis dos donos (apenas os que aparecem nos cells)
  const ownerIds = [
    ...new Set(cells?.map((cell) => cell.owner_id).filter(Boolean)),
  ];

  const { data: owners, error: ownersError } = await supabase
    .from("profiles")
    .select("id, username, full_name, color")
    .in("id", ownerIds);

  if (ownersError) {
    console.error("Erro ao buscar perfis dos donos:", ownersError.message);
    return [];
  }

  // 3. Montar os hexágonos com informações do dono e estilo
  const hexagons =
    cells?.map((cell) => {
      if(!cell) return;
      // Encontre o dono da célula com base no owner_id
      const owner = owners?.find((o) => o.id === cell.owner_id);
      console.log(owner.color)

      // Retorna a estrutura do hexágono com as informações do dono e estilo
      return {
        ...cell,
        owner: owner ? owner.full_name || owner.username : null,
        color: owner?.color, // Se o dono não tiver cor, usa 'gray'
        opacity: 0.2 + (cell.hp / cell.max_hp) * 0.8, // Opacidade baseada no HP
      };
    }) || [];

  return hexagons;
}

// Função auxiliar para pegar os IDs das pessoas que o usuário está seguindo
export async function getFollowingIds(supabase, userId) {
  const { data: follows, error } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId);

  if (error) {
    console.error("Erro ao buscar usuários seguidos:", error.message);
    return [];
  }

  console.log({follows})

  return follows?.map((follow) => follow.following_id) || [];
}
