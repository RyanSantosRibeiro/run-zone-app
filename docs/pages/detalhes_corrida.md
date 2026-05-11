# Detalhes da Corrida (Post-Run Analysis)

Esta página é o destino final após uma corrida ser salva. Ela foca na análise técnica e na celebração do desempenho do atleta, organizando a informação de forma hierárquica e visual.

## 🎯 Objetivo
Prover uma visão profunda da atividade realizada, permitindo ao usuário analisar seu ritmo (pace), elevação, conquistas geográficas e evolução técnica através de gráficos e tabelas.

## 📱 Componentes da Interface

### 1. Cabeçalho, Mapa e Contexto (O "Hero" da Atividade)
Esta é a primeira dobra da tela, focada no contexto visual e identificação.
- **Mapa Interativo:** O elemento visual de maior destaque. Mostra o trajeto da corrida em destaque (ex: laranja vibrante), marcadores de início/fim e a sobreposição (overlay) dos hexágonos atravessados ou conquistados.
- **Identificação do Usuário:** Foto de perfil, Nome e metadados da corrida (data, hora de início e localização geográfica).
- **Título da Atividade:** Nome editável da corrida (ex: "Treino de Intervalado" ou "Corrida ao entardecer").

### 2. Grid de Estatísticas Principais
Um layout de grid (2 colunas, 3 linhas) com os dados vitais da atividade:
- **Distância:** Total percorrido em km.
- **Ritmo Médio (Pace):** Tempo médio por quilômetro (min/km).
- **Tempo de Movimentação:** Cronômetro total de atividade ativa.
- **Ganho de Elevação:** Total acumulado de subidas.
- **Elevação Máxima:** O ponto mais alto atingido no percurso.
- **Passos / Cadência:** Integração com sensores de movimento.

### 3. Resultados e Conquistas (Gamificação e Território)
Seção dedicada ao engajamento e progresso no jogo.
- **Conquistas de Território:** Lista de hexágonos novos conquistados ou defendidos com sucesso.
- **Recordes Pessoais (PRs):** Medalhas de bronze/prata/ouro para melhores marcas em distâncias específicas (1km, 5km, etc.).
- **Impacto no Ranking:** Indicação de quantos pontos o usuário subiu no ranking global ou local após esta corrida.

### 4. Parciais (Splits)
Tabela detalhada para análise de constância quilômetro a quilômetro.
- **Colunas:** `Km` (parcial), `Ritmo` (tempo do km) e `Elev.` (variação altimétrica do trecho).
- **UI Visual:** Barras de progresso horizontais atrás dos números de ritmo, onde barras mais curtas indicam ritmos mais rápidos (maior velocidade).

### 5. Gráficos Analíticos
Análise técnica profunda através de gráficos de área.
- **Gráfico de Ritmo (Pace):**
  - **Eixo X:** Distância.
  - **Eixo Y:** Ritmo (min/km).
  - Visualização de oscilações de esforço ao longo do percurso.
- **Gráfico de Elevação:**
  - Espelhamento da topografia do percurso.
  - **Eixo X:** Distância.
  - **Eixo Y:** Elevação absoluta (m).

## 💾 Integração e Dados (Supabase)
- **Dados da Atividade:** Recuperação do registro completo na tabela `Runs`.
- **Processamento de Hexágonos:** Cruzamento da rota (Lat/Long) com a malha de `Hexagons` para exibir o impacto territorial.
- **Cálculo de Splits:** Lógica de backend ou frontend para segmentar o Array de coordenadas em blocos de 1km para gerar a tabela de parciais.
- **Mapbox/Google Maps API:** Renderização do mapa estático ou interativo com o GeoJSON da rota.
