# Ranking

A página de Ranking promove o aspecto social competitivo do aplicativo, mostrando o quão engajado o corredor está em comparação com seus amigos ou com o mundo.

## 🎯 Objetivo
Proporcionar reconhecimento (status) para os corredores mais ativos, incentivando corridas regulares e o aumento da distância, criando rivalidades sadias baseadas em controle territorial.

## 📱 Componentes da Interface

1. **Abas de Filtragem (Amigos vs. Global)**
   - **Amigos (Grátis)**: Ranking limitado às pessoas que o usuário e ele próprio seguem mutuamente.
   - **Global (Premium)**: Ranking geral para usuários pagantes verificados.

2. **Categorias de Ranking (Leaderboards)**
   - O jogo funciona em **Temporadas Mensais**. Todo dia 1º, a pontuação é zerada no mapa e o ranking recomeça.
   - É possível consultar Rankings de temporadas passadas (ex: "Julho 2024").
   - **Maior Império**: Quem tem o maior número de hexágonos sob domínio atual no mês.
   - **Maior Distância**: Quem correu mais KM na temporada atual.

3. **Lista de Colocação**
   - Design de lista clássica. 1º, 2º e 3º lugares recebem ícones/medalhas de destaque visual.
   - Cada linha deve conter: Posição, Foto, Username, Métrica Principal (ex: 250 hexágonos).
   - Tocar em um usuário abre a [Página de Perfil (Usuário)](usuario.md).

## 💾 Integração e Dados (Supabase)
- Uso pesado de Views ou Edge Functions (RPC) no banco de dados para agregar e calcular as posições do ranking de forma rápida sem sobrecarregar o cliente.
- Consulta deve juntar (JOIN) tabela de Profiles, Followers (rede social) e contagem/score em Hexagons/Runs.
