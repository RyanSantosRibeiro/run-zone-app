# Mapa

A página de Mapa é o centro visual e estratégico do jogo, onde o aspecto de "conquista de território" ganha vida.

## 🎯 Objetivo
Permitir que o usuário explore a malha geográfica, veja claramente as áreas que domina, os territórios neutros e as regiões controladas por seus amigos, planejando sua próxima rota de corrida.

## 📱 Componentes da Interface

1. **Visualização do Mapa com Grade de Hexágonos**
   - O mapa de fundo (Mapbox, Google Maps, ou Apple Maps).
   - Uma camada (overlay) poligonal desenhando a malha de hexágonos.
   - **Esquema de Cores**:
     - *Cor Pessoal (Ex: Azul)*: Territórios do próprio usuário.
     - *Cor Neutra (Ex: Cinza Translúcido)*: Territórios nunca conquistados.
     - *Cores Inimigas (Ex: Vermelho, Laranja)*: Territórios controlados por pessoas que o usuário segue.

2. **Filtros e Controles Rápidos**
   - Botão para centralizar no usuário (localização atual).
   - Filtro (Toggle) para mostrar "Meus Hexágonos", "Meus Amigos" ou "Todos".
   - **Corredores ao Vivo (Live Tracking Futuro)**: Ícones pulsantes no mapa mostrando a localização em tempo real de amigos seguidos que estejam correndo naquele momento.

3. **Painel de Detalhes do Hexágono (Bottom Sheet)**
   - Ao tocar em um hexágono específico, uma aba sobe na parte inferior revelando:
     - Quem é o dono atual com sua foto de perfil.
     - A "Pontuação de Defesa" atual daquele pedaço de chão.
     - Histórico rápido (Ex: "João dominou em 10/10", "Maria tirou pontos em 12/10").

## 💾 Integração e Dados (Supabase)
- Consulta otimizada na tabela de `Hexagons` utilizando restrições de bounding box (BBOX) baseado na tela atual para não carregar o mundo inteiro.
- Associação dos IDs de Donos (`owner_id`) com os perfis da lista de amigos seguidos pelo usuário.
