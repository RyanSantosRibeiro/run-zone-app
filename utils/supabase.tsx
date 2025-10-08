// Função para buscar os hexágonos para exibir no mapa
export async function getHexagons(supabase, user) {
  // 1. Buscar os hexágonos (cells)
  console.log({ user });
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
      // Encontre o dono da célula com base no owner_id
      const owner = owners?.find((o) => o.id === cell.owner_id);

      // Retorna a estrutura do hexágono com as informações do dono e estilo
      return {
        ...cell,
        owner: owner ? owner.full_name || owner.username : null,
        color: owner?.color || "gray", // Se o dono não tiver cor, usa 'gray'
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

  return follows?.map((follow) => follow.following_id) || [];
}
