# Checklist de Desenvolvimento: Run Zone MVP

Este documento serve como guia técnico e de produto para garantir que todas as funcionalidades essenciais do MVP (Produto Mínimo Viável) sejam implementadas com qualidade. Itens marcados com ✅ já possuem uma implementação funcional no código; itens com ☐ ainda precisam ser desenvolvidos.

---

## 🛠 1. Infraestrutura e Backend (Supabase)
O alicerce de dados e segurança do aplicativo.
- [x] **Cliente Supabase**: Instância do `@supabase/supabase-js` configurada e funcional.
- [x] **Tabelas Core**: `profiles`, `runs`, `cells` (hexágonos), `follows` criadas no Supabase.
- [x] **Tabelas Sociais**: `run_likes`, `run_comments`, `user_achievements`, `achievements` criadas.
- [ ] **Autenticação Completa**: Login funcional (✅), porém **Cadastro (Sign Up)** e **Recuperação de Senha** ainda não implementados na UI (botão "Criar conta" apenas faz `console.log`).
- [ ] **Segurança (RLS)**: Implementação de Row Level Security para proteger a privacidade das corridas e dados dos usuários.
- [ ] **Variáveis de Ambiente**: As credenciais do Supabase (URL e Anon Key) estão hardcoded em `AuthContext.jsx` e `utils/supabase.tsx`. Mover para variáveis de ambiente (`.env`) com `expo-constants`.
- [ ] **Edge Functions / RPC**: Scripts para cálculos pesados (processamento de hexágonos pós-corrida, cálculos de ranking) no lado do servidor. Atualmente o salvamento de corrida usa uma API local (`http://192.168.x.x:3000`) que precisa ser migrada para o Supabase ou um backend de produção.

## 🏃‍♂️ 2. Registro de Corrida (Core Engine)
A funcionalidade principal de monitoramento atlético.
- [x] **Permissões de GPS**: Solicitação de `requestForegroundPermissionsAsync` implementada.
- [x] **Tracking em Tempo Real**: `Location.watchPositionAsync` implementado com `Accuracy.High`.
- [x] **Cálculo de Distância**: Fórmula de Haversine implementada em `utils/run.tsx`.
- [x] **Cálculo de Velocidade Média**: Velocidade km/h calculada entre pontos consecutivos.
- [x] **Cronômetro**: Timer funcional com formatação HH:MM:SS.
- [x] **Controles de Corrida**: Botões de Pause, Resume e Stop implementados.
- [ ] **Background Tracking**: Solicitar `requestBackgroundPermissionsAsync` e configurar `expo-location` para tracking em segundo plano com Foreground Service (Android) e Background Modes (iOS). Atualmente, se o usuário bloquear a tela, o GPS para.
- [ ] **Filtro de Precisão GPS**: Lógica para descartar pontos com `accuracy` baixa (o `watchPositionAsync` aceita pontos de qualquer precisão atualmente).
- [ ] **Long Press no Stop**: O botão Stop pode ser pressionado acidentalmente. Implementar `onLongPress` conforme documentado.
- [ ] **Sincronização Offline**: Atualmente depende de uma API local via `fetch`. Implementar salvamento local (AsyncStorage/SQLite) e sync posterior com Supabase.
- [ ] **Notificação Persistente**: Exibir corrida ativa na Central de Notificações do sistema (Android: Foreground Service Notification / iOS: Background Activity) com pace e distância.
- [ ] **Remover Mock Data**: A função `startRun()` em `AuthContext.jsx` ainda inicializa a rota com ~14 pontos hardcoded de coordenadas estáticas. Limpar para iniciar com `[]`.

## ⬢ 3. Gamificação (Hexágonos e Domínio)
O diferencial competitivo do Run Zone.
- [x] **Integração h3-js**: Biblioteca `h3-js` já instalada no `package.json`.
- [x] **Visualização no Mapa**: Componente `Map` renderiza hexágonos com overlay colorido por dono.
- [x] **Leitura de Hexágonos (Supabase)**: Função `getHexagons()` busca cells + profiles dos donos.
- [x] **Cores por Dono**: Cada perfil tem um campo `color` e os hexágonos são renderizados com a cor do dono.
- [x] **Opacidade por HP**: A opacidade do hexágono é proporcional ao `hp/max_hp`.
- [ ] **Sincronização com Supabase (Upsert)**: Lógica client-side ou Edge Function para, ao salvar uma corrida, converter a rota em IDs H3 e executar `upsert` na tabela `cells` (ataque/defesa/troca de dono).
- [ ] **Multiplicador de Esforço**: Algoritmo que bonifica o domínio baseado na distância total da corrida (documentado em `game_design.md` mas não implementado).
- [ ] **Reset de Temporada**: Automação (Cron Job / Supabase pg_cron) para zerar hexágonos e imortalizar ranking no 1º dia de cada mês.
- [ ] **Painel de Detalhes do Hexágono**: Bottom Sheet ao tocar em um hexágono no mapa mostrando dono, pontuação de defesa e histórico rápido (documentado em `mapa.md` mas não implementado).

## 📱 4. Telas e Navegação
Garantir que todas as telas documentadas existam e funcionem.
- [x] **Home (index.tsx)**: Território atual, recorde semanal, conquistas recentes, desafio semanal.
- [x] **Mapa/Explore (explore.tsx)**: Mapa com overlay de hexágonos e botão "Iniciar Corrida".
- [x] **Run Tab (run.tsx)**: Tela de mapa pré-corrida com hexágonos e botão de iniciar.
- [x] **Run Screen (/run/index.tsx)**: Interface de gravação com mapa, timer, pace, distância e controles.
- [x] **Run Details (/run/[run_id])**: Rota dinâmica para detalhes da corrida já criada.
- [x] **Training (training.tsx)**: Tela de treinos com dados estáticos (mock).
- [x] **Login (login.tsx)**: Tela de login com email/senha funcional.
- [ ] **Sign Up**: Tela de cadastro de novo usuário (não existe, apenas um `console.log`).
- [ ] **Perfil do Usuário (profile.tsx)**: Ainda é o template padrão do Expo com conteúdo boilerplate. Precisa implementar: avatar, username, lifetime stats (km, corridas, hexágonos, pace médio) e feed de corridas passadas conforme `usuario.md`.
- [ ] **Ranking**: Tela de leaderboards não existe. Criar com abas Amigos/Global, categorias "Maior Império" e "Maior Distância" conforme `ranking.md`.
- [ ] **Detalhes da Corrida (UI Completa)**: A rota `/run/[run_id]` existe mas precisa implementar: mapa com rota, grid de estatísticas, conquistas de território, splits/parciais e gráficos de pace/elevação conforme `detalhes_corrida.md`.
- [ ] **Configurações (settings)**: Tela de configurações está vazia (`index.tsx` com 269 bytes).

## 🎨 5. Interface e Experiência (UI/UX)
Garantir a estética premium e facilidade de uso.
- [x] **Design System Básico**: Paleta de cores definida em `use-theme-color.ts` com tokens (primary, foreground, accent, etc.).
- [x] **Dark Mode**: Suporte a tema escuro implementado com `useColorScheme`.
- [x] **Componentes UI Base**: Button, Input, Collapsible, IconSymbol, BottomSheet.
- [x] **Mapa Customizado**: Componente `Map` com estilo personalizado e suporte a hexágonos/rotas.
- [ ] **Tipografia Premium**: Implementar fonte geométrica (Inter/Montserrat) via `expo-font` conforme `styleguide.md`. Atualmente usa fontes padrão do sistema.
- [ ] **Micro-Animações**: Animações de reforço ao conquistar hexágonos, finalizar corrida ou bater recordes (reanimated está instalado mas não usado para gamificação).
- [ ] **Tela de Splash Customizada**: Splash screen com branding do Run Zone (expo-splash-screen já instalado).
- [ ] **Onboarding**: Fluxo de primeira vez do usuário (permissão de GPS, escolha de cor, tutorial rápido).

## 🏆 6. Social e Ranking
Fomentar a competitividade e comunidade.
- [x] **Sistema de Seguidores**: Tabela `follows` funcional, queries de `getFollowingIds` implementadas.
- [x] **Feed Social**: `fetchSocialFeed` busca corridas de quem o usuário segue com likes e comentários.
- [x] **Conquistas (Achievements)**: Tabela `user_achievements` + `achievements` com fetch implementado.
- [ ] **UI do Feed Social**: O FlatList do feed está comentado na Home. Reativar e estilizar os cards de corridas dos amigos.
- [ ] **Ações Sociais**: UI para curtir e comentar corridas dos amigos (dados existem no backend, falta a interação na UI).
- [ ] **Follow/Unfollow na UI**: Botão de seguir/deixar de seguir no perfil de outros usuários (lógica de follow existe, falta a UI).
- [ ] **Leaderboard (Ranking)**: Tela de ranking com Views ou RPC no Supabase para agregar posições.
- [ ] **Busca de Usuários**: Funcionalidade para encontrar e seguir outros corredores.

## 🛡 7. Integridade e Anti-Cheat
Manter o jogo justo para todos.
- [ ] **Validação de Velocidade (Pace)**: Bloqueio de atividades com velocidades impossíveis para humanos (ex: > 25 km/h sustentado = flag de veículo).
- [ ] **Filtragem de Pontos Anômalos**: Descartar pontos GPS que indiquem teletransporte (distância impossível entre 2 pontos consecutivos no intervalo de tempo).

## 🔧 8. Qualidade e Produção
Preparar o app para distribuição.
- [ ] **Migrar API Local**: Substituir chamadas a `http://192.168.x.x:3000/api/run` por chamadas diretas ao Supabase ou Edge Functions.
- [ ] **Tratamento de Erros**: Implementar feedback visual para erros de rede, GPS indisponível, sessão expirada, etc. (atualmente apenas `console.log`).
- [ ] **Loading States**: Telas de carregamento adequadas (a Home usa `ActivityIndicator` genérico).
- [ ] **Limpar Console.logs**: Remover todos os `console.log` de debug espalhados pelo código.
- [ ] **TypeScript Consistente**: `AuthContext.jsx` é o único arquivo `.jsx`. Migrar para `.tsx` com tipagens adequadas.
- [ ] **Refatorar AuthContext**: O contexto mistura autenticação, estado de corrida, e queries de dados. Separar em contextos/hooks dedicados (ex: `RunContext`, `useSocialFeed`, `useHexagons`).
