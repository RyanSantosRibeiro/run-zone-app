# Mecânicas de Jogo e Regras de Negócio (Game Design)

Este documento define as regras gamificadas do Run Zone, abordando o sistema de conquista de territórios (hexágonos), mecânicas de pontuação e medidas contra trapaças. O foco é manter uma disputa sadia, divertida e escalável entre os corredores.

## 1. Conquista de Territórios (Hexágonos)

A mecânica central do aplicativo é a disputa por áreas geográficas divididas em hexágonos (ex: resolução H3 da Uber). Para equilibrar a balança entre corredores muito frequentes e corredores mais esporádicos ou iniciantes, o sistema opera através de **Pontuação de Domínio**.

### 1.1. Sistema de Pontos de Domínio
- **Propriedade**: Cada hexágono possui uma "Pontuação de Defesa" e um "Dono" atual.
- **Integração Técnica**: Utilização da biblioteca `h3geo` para mapear coordenadas GPS em IDs únicos de hexágonos.
- **Persistência no Supabase**: Ao final de cada corrida, o sistema processa a rota, identifica os hexágonos afetados e realiza um `upsert` no banco de dados para atualizar pontos de defesa ou transferir a propriedade do território.
- **Acúmulo de Pontos (Defesa)**: Quando o Dono atual passa pelo próprio hexágono durante uma corrida, ele consolida seu domínio somando pontos à defesa desse território.
- **Subtração de Pontos (Ataque)**: Quando um corredor adversário passa por um hexágono que pertence a outra pessoa, ele subtrai pontos da defesa daquele território.
- **Troca de Dono**: Se a pontuação de um hexágono for reduzida a zero (ou ultrapassar o negativo/limite de troca), o atacante assume o domínio daquele hexágono e começa a contar seus próprios pontos de defesa.

### 1.2. Ponderação por Distância da Corrida
Para valorizar o esforço contínuo e não apenas o fato de "passar pelo local", a pontuação gerada em cada hexágono atravessado é multiplicada com base no **esforço/distância total** daquela sessão de corrida.
- **Exemplo**: O corredor A faz um treino de 5 km e passa pelo Hexágono X. O corredor B faz um longão de 20 km e também passa pelo Hexágono X no final da rota. 
- O impacto (ataque ou defesa) gerado pelo corredor B será muito maior que o do corredor A, devido ao multiplicador de distância. 
- Essa regra bonifica quem consegue aguentar corridas mais longas e estratégicas, adicionando um elemento de "peso de conquista" para evitar que percursos muito curtos dominem uma área permanentemente sem o devido esforço.

### 1.3. Temporadas e Reset Mensal
Para manter a competitividade sempre em alta e dar chance a novos corredores, o jogo é dividido em **Temporadas (Mensais)**.
- **No 1º dia de cada mês**, todos os hexágonos têm suas pontuações zeradas e voltam a ficar "neutros".
- O Ranking do mês anterior é fechado, imortalizando os vencedores daquela temporada (quem dominou mais territórios ou correu mais) no perfil de cada usuário.
- Isso garante que o mapa nunca fique "estagnado" com donos impossíveis de serem vencidos e renova o engajamento todo começo de mês.

---

## 2. Prevenção de Trapaças (Anti-Cheat)

A credibilidade da gamificação depende de métricas justas. Como evitar que corredores corram de carro, moto ou bicicleta?

### 2.1. Limites de Velocidade Biológicos (Pace Máximo)
- Será estipulado um pace mínimo aceitável (ex: mais rápido que 2:30 min/km por longos períodos levanta flag de trapaça).
- Picos de velocidade anômalos (ex: o GPS registrar 60 km/h) invalidarão a corrida automaticamente ou retirarão a validade dos hexágonos coletados naqueles trechos.

### 2.2. Aceleração e Padrão de Movimento
- O ato de correr gera impactos (passadas) que os sensores do celular (pedômetro/acelerômetro) registram de forma diferente do deslizar suave de um pneu de carro ou bicicleta. A coleta desses dados pode cruzar informações com o GPS para validar o esforço físico.

### 2.3. Disputa Controlada (Amigos vs. Global)
- **Disputa Gratuita/Básica**: Ocorre apenas entre usuários que se seguem mutuamente (amigos). Isso naturalmente inibe o "cheat", pois o ambiente social e as zoeiras entre o grupo regulam o comportamento de má-fé.
- **Disputa Premium/Global**: Para quem paga o aplicativo, o acesso ao Ranking Global e possíveis Premiações exige um selo de "Usuário Verificado" e as corridas passarão por uma triagem antifraude muito mais rígida, com possível análise de histórico e constância de evolução do atleta.
