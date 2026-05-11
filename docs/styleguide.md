# Guia de Estilos e Identidade Visual (Styleguide)

A identidade visual do **Run Zone** foi concebida para equilibrar perfeitamente dois mundos: a seriedade, limpeza e foco exigidos por **corredores de alta performance** (inspirado na estética funcional e ousada da Nike) e a energia vibrante necessária para **atrair e engajar** pessoas através da gamificação.

## 🎨 1. Paleta de Cores

O contraste é a principal ferramenta de design do app. Utilizaremos o preto profundo e brancos puros para fazer a cor principal "saltar" aos olhos, gerando um visual premium.

- **Cor Primária (Energia & Ação)**: `Lime Green (#89F336)`
  - *Uso*: Botões de ação principais (ex: botão gigante de Iniciar Corrida), barras de progresso ativas, ícones de destaque e a pintura dos hexágonos conquistados pelo usuário no mapa. Ela traz o lado "Game" e esportivo para a tela.
- **Bases e Fundos (Elegância & Foco)**: 
  - `Black (#000000) / Very Dark Grey (#121212)`: Fundo principal do aplicativo no Dark Mode. Proporciona um contraste absurdo e sofisticado com o Verde Limão.
  - `White (#FFFFFF)`: Fundo principal no Light Mode, focado na leitura pura e clara de dados.
- **Tons de Cinza (Hierarquia Analítica)**:
  - `Cinza Escuro (#333333)`: Elementos de apoio, fundos de cartões (cards) de estatísticas no modo escuro.
  - `Cinza Médio (#888888)`: Textos secundários, rótulos (ex: as palavras "Pace Médio", "Distância", "BPM"). O cinza rebaixa a importância do rótulo para dar destaque ao número.
  - `Cinza Claro (#F4F4F4)`: Divisórias sutis ou fundos de cards no modo claro.

## 🔤 2. Tipografia

A tipografia deve ser de extrema legibilidade. O usuário estará correndo, sob o sol, balançando o celular. A fonte precisa ser "gorda" e legível de longe.

- **Fonte Recomendada**: Sem serifa e geométrica, como `Inter`, `SF Pro Display` (nativa da Apple), `Roboto` ou `Montserrat` (para cabeçalhos).
- **Numerais e Métricas**: Devem ser os "heróis" da tela. Números de Pace, Distância e Tempo usarão pesos altos (`Bold` ou `Black`) e tamanhos massivos. 
- **Leitura Limpa**: Textos secundários devem ser discretos. A tela não deve ter excesso de texto lido, apenas dados e botões.

## 📐 3. Princípios de Interface (Clean & Moderno)

- **Menos é Mais (Clean)**: O espaço negativo (fundo vazio) é vital. Sem caixas desnecessárias. Inspirado no "Nike Run Club", os dados devem flutuar de forma elegante na tela.
- **Cantos e Formas**: Bordas arredondadas moderadamente (`border-radius: 12px` a `16px`). Amigável, moderno, mas sem parecer um app infantil. Os **hexágonos** no mapa são a única geometria rígida, gerando um contraste interessante de formas.
- **Fat-Finger Friendly**: Áreas de toque imensas. Quem corre suado não consegue clicar em ícones minúsculos. Botões de "Pausar" e "Finalizar" devem ocupar áreas generosas da tela inferior.

## ⚖️ 4. O Equilíbrio: Divertido x Analítico

A chave para atrair usuários casuais sem afastar os profissionais é separar a identidade por momentos da jornada de uso:

1. **Momento Analítico (Durante o Treino / Vendo Gráficos)**: 
   - A interface fica puramente matemática e minimalista. 
   - Fundo liso (preto ou branco), numerais enormes de altíssimo contraste, gráficos precisos. O Verde Limão (`#89F336`) é usado cirurgicamente apenas para mostrar onde ele está batendo metas. Foco total em desempenho de atleta.

2. **Momento Divertido (Pós-Treino / Visualização do Mapa)**: 
   - Aqui entra a gamificação. Ao finalizar a corrida, se o usuário conquistou territórios, a tela entrega reforço positivo.
   - O mapa ganha vida com hexágonos brilhando em Verde Limão.
   - Uso de micro-animações (elementos expandindo, preenchimento suave de barras). 
   - A linguagem visual recompensa o esforço, fazendo a ponte entre "terminei meu sofrido treino analítico" para "agora sou dono do bairro no jogo".
