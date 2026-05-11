# Usuário (Perfil Público e Privado)

A página de Perfil é a vitrine do atleta. É aqui que o usuário vê sua própria evolução ou inspeciona o histórico e domínio dos seus rivais/amigos.

## 🎯 Objetivo
Fornecer um resumo visual da identidade e histórico do corredor. Deve ser simples, mas dar foco aos feitos conquistados dentro do MVP.

## 📱 Componentes da Interface

1. **Cabeçalho de Identidade**
   - Avatar (Foto de perfil em formato circular).
   - Nome Real e `@username` único.
   - Botão de Ação: "Editar Perfil" (se for o dono da conta) ou "Seguir/Deixar de Seguir" (se estiver vendo outro corredor).
   - Contadores Sociais: Números de "Seguidores" e "Seguindo".

2. **Resumo de Carreira (Lifetime Stats)**
   - Destaque em blocos/cards limpos:
     - Total de Km corridos de todos os tempos.
     - Quantidade total de corridas realizadas.
     - Total de Hexágonos dominados na história.
     - Pace médio global do usuário.

3. **Feed de Corridas (Histórico)**
   - Uma lista (FlatList) exibindo as corridas anteriores do usuário em formato de cartões (Cards).
   - Cada cartão exibirá:
     - Miniatura de mapa com a rota estática.
     - Informações da atividade: Distância, Pace, Tempo, Quantos hexágonos novos foram dominados naquela sessão, e a Data/Hora.

## 💾 Integração e Dados (Supabase)
- Consulta `SELECT` básica à tabela `Profiles` baseada na rota via ID ou username.
- Consulta paginada (Offset/Limit) da tabela `Runs` vinculadas àquele usuário para formar o feed do histórico sem pesar na memória.
- Requisição do mapa estático (Static Map API) para os cards de histórico.
