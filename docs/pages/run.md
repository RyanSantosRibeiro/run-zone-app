# Run (Registro de Corrida)

Esta é a página mais crítica tecnicamente. Ela será a interface principal enquanto o usuário está fisicamente correndo, necessitando de alta clareza, fontes grandes e botões fáceis de tocar em movimento.

## 🎯 Objetivo
Registrar o percurso GPS, calcular o ritmo (pace), distância e tempo, além de consolidar essas informações para validar a conquista dos hexágonos atravessados.

## 📱 Componentes da Interface

1. **Dashboard Principal de Atividade**
   - **Tempo**: Cronômetro de tempo de atividade decorrido.
   - **Distância**: Odômetro atualizado em tempo real.
   - **Pace Atual e Médio**: Ritmo instantâneo e média global.
   - Opcional: Contador preditivo de quantos hexágonos estão sendo atravessados na sessão.

2. **Aba de Mapa e Rota**
   - Um botão ou aba (swipe) para visualizar o próprio percurso sendo desenhado na malha da cidade.

3. **Controles (Pause / Play / Stop / Live)**
   - Botões gigantes e coloridos.
   - Para finalizar e salvar (Stop), o botão deverá exigir um pressionamento longo (Long Press) para evitar que o usuário finalize a corrida por acidente ao guardar o celular no bolso.
   - **Botão "Live Run" (Futuro)**: Opção (toggle) para compartilhar a corrida em tempo real com seguidores, para que eles possam acompanhar no mapa.

4. **Integração de Notificações do Sistema**
   - O aplicativo precisará exibir a corrida ativa na Central de Notificações (Android e iOS).
   - O usuário deve conseguir ver pace, distância e pausar/retomar a atividade diretamente pela tela de bloqueio do celular, sem precisar abrir o aplicativo (crucial para a experiência "Strava-like").

## 💾 Integração e Dados
- Permissões de Foreground Service / Background Location Ativas.
- Módulo de rastreamento com filtro de GPS (ignorar pontos com precisão baixa).
- Lógica de pós-processamento ao finalizar: Transformar o Array de coordenadas Lat/Long na lista de IDs de Hexágonos, aplicar o multiplicador de distância (veja Game Design) e salvar no Supabase na tabela de `Runs`.
