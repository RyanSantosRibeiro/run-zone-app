# Home

A Home é a tela inicial do Run Zone e funciona como um painel de controle e engajamento rápido para o corredor assim que ele abre o aplicativo.

## 🎯 Objetivo
Fornecer um resumo imediato do desempenho recente, estimular o início de uma nova corrida e mostrar rapidamente se houve alterações no domínio de territórios.

## 📱 Componentes da Interface

1. **Cabeçalho de Boas-Vindas**
   - Saudação personalizada (ex: "Bora correr, João!").
   - Ícone de atalho rápido para notificações ou configurações.

2. **Resumo da Semana (Estatísticas Principais)**
   - Um card visualmente atrativo (provavelmente em formato de anel de progresso ou gráfico de barras) mostrando:
     - Distância total percorrida na semana vs. Semana passada.
     - Quantidade de corridas realizadas na semana.

3. **Status de Território (Hexágonos)**
   - Resumo do domínio atual: "Você possui X hexágonos".
   - Alertas rápidos de engajamento: "Você perdeu 2 hexágonos para @pedro! Recupere-os!".

4. **Call to Action Primário**
   - Um botão flutuante (FAB) ou botão central muito claro para ir imediatamente para a página de **RUN** e iniciar o rastreamento.

## 💾 Integração e Dados (Supabase)
- Busca agragada (SUM) de distância na tabela de `Runs` filtrada pelos últimos 7 dias.
- Contagem (COUNT) do total de hexágonos vinculados ao `user_id` na tabela de `Hexagons`.
- Histórico de notificações/eventos de território perdidos recentemente.
