# Run Zone

**O Run Zone é, em sua essência, uma ferramenta de performance e saúde.** Nosso objetivo primário é oferecer rastreamento preciso, estatísticas e análises profundas de treinos para corredores. A gamificação (conquista de territórios em hexágonos) atua como uma camada secundária engajadora e divertida, mas construída sobre uma fundação sólida de monitoramento atlético. O projeto tem a visão de bater de frente com o mercado, oferecendo mais valor e diversão. O backend é sustentado pelo Supabase.

## Escopo do MVP

O Produto Mínimo Viável (MVP) tem como foco as funcionalidades principais que tornam o Run Zone único, unindo rastreamento a gamificação:
1. **Cadastro e Login de Usuários**: Integração segura e ágil através do Supabase.
2. **Registro de Corridas**: Monitoramento via GPS (Strava-like) gravando distância, pace, tempo e rota.
3. **Conquista de Territórios**: Gamificação em background onde cada corrida afeta o controle dos hexágonos do trajeto.
4. **Sistema de Rede Social Básica**: Usuários podem se seguir mutuamente.
5. **Ranking Mensal (Temporadas)**: Classificação baseada na performance e conquista territorial do mês.

## Documentação do Projeto

Para manter a organização e escalabilidade da aplicação, consulte a pasta `docs/`:

- [Guia de Estilos (Identidade Visual & UI/UX)](docs/styleguide.md)
- [Roadmap e Visão de Futuro (Strava Competitor)](docs/roadmap.md)
- [Arquitetura e Mecânicas de Jogo (Game Design)](docs/game_design.md)
- [Checklist de Desenvolvimento (MVP)](docs/checklist.md)
- [Página: Home](docs/pages/home.md)
- [Página: Mapa](docs/pages/mapa.md)
- [Página: Run (Registro de Corrida)](docs/pages/run.md)
- [Página: Detalhes da Corrida (Análise Pós-Treino)](docs/pages/detalhes_corrida.md)
- [Página: Ranking](docs/pages/ranking.md)
- [Página: Usuário (Perfil)](docs/pages/usuario.md)

## Próximos Passos
- Configuração do mapa interativo e renderização de polígonos/hexágonos.
- Implementação da biblioteca `h3geo` para conversão de coordenadas e lógica de `upsert` territorial.
- Setup das tabelas base no Supabase (perfis, corridas, hexágonos).
- Implementação de permissões de GPS e tracking em background.