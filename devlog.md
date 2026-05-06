Entendi! Você quer ter uma tabela de **treinos** com uma lista de treinos disponíveis, e os usuários podem escolher entre vários treinos. Cada treino terá **desafios**, e o progresso do usuário será registrado em uma tabela auxiliar que associa o treino ao usuário.

Essa estrutura pode ser dividida em três partes principais:

1. **Tabela de Treinos** — Que vai listar os treinos disponíveis.
2. **Tabela de Desafios** — Para definir os desafios individuais que fazem parte de um treino.
3. **Tabela de Progresso do Usuário** — Para registrar o progresso do usuário em relação a um treino específico.

### Estrutura de Tabelas

#### 1. Tabela `trainings`: Tabelas de treinos disponíveis

Aqui, você cria um treino que pode ser associado a diversos desafios.

```sql
CREATE TABLE public.trainings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,           -- Nome do treino (ex: "Treino de 5 dias")
  description text,             -- Descrição do treino
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT trainings_pkey PRIMARY KEY (id)
);
```

#### 2. Tabela `challenges`: Tabelas de desafios

Cada desafio pode ter diferentes tipos (corrida, tiros, longas distâncias, etc.), e ele pode ser associado a um treino específico.

```sql
CREATE TABLE public.challenges (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  training_id uuid NOT NULL,         -- Referência ao treino
  day_number integer NOT NULL,       -- Número do dia do treino (1, 2, 3, ...)
  challenge_type text NOT NULL,      -- Tipo do desafio (ex: "corrida", "tiros", "longa")
  distance numeric,                  -- Distância para desafios de corrida (em km)
  repetitions integer,               -- Repetições para desafios de tiros
  duration integer,                  -- Duração do desafio (para longas distâncias, por exemplo)
  rest_period integer,               -- Período de descanso entre tiros, por exemplo
  CONSTRAINT challenges_pkey PRIMARY KEY (id),
  CONSTRAINT challenges_training_id_fkey FOREIGN KEY (training_id) REFERENCES public.trainings(id)
);
```

#### 3. Tabela `user_trainings`: Tabela auxiliar para linkar treino com o usuário

Essa tabela vai registrar qual treino o usuário escolheu, junto com seu progresso no treino (se completou ou não os desafios, por exemplo).

```sql
CREATE TABLE public.user_trainings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,             -- Usuário que está fazendo o treino
  training_id uuid NOT NULL,         -- Referência ao treino escolhido
  start_date timestamp with time zone DEFAULT now(),  -- Data de início do treino
  end_date timestamp with time zone, -- Data de término (quando o treino for concluído)
  status text DEFAULT 'in_progress', -- Status do treino (ex: "in_progress", "completed")
  CONSTRAINT user_trainings_pkey PRIMARY KEY (id),
  CONSTRAINT user_trainings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT user_trainings_training_id_fkey FOREIGN KEY (training_id) REFERENCES public.trainings(id)
);
```

#### 4. Tabela `user_training_progress`: Tabela auxiliar para o progresso diário do usuário no treino

Aqui você armazena o progresso diário do usuário em relação ao treino, ou seja, se ele completou ou não cada desafio do dia.

```sql
CREATE TABLE public.user_training_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_training_id uuid NOT NULL,   -- Referência ao treino do usuário
  challenge_id uuid NOT NULL,        -- Referência ao desafio do dia
  completed boolean DEFAULT false,   -- Se o usuário completou o desafio
  completed_at timestamp with time zone,  -- Quando o desafio foi completado
  distance_run numeric DEFAULT 0,    -- Distância percorrida (para desafios de corrida)
  duration integer DEFAULT 0,        -- Duração do treino (em segundos)
  rest_period integer DEFAULT 0,     -- Tempo de descanso (se aplicável)
  CONSTRAINT user_training_progress_pkey PRIMARY KEY (id),
  CONSTRAINT user_training_progress_user_training_id_fkey FOREIGN KEY (user_training_id) REFERENCES public.user_trainings(id),
  CONSTRAINT user_training_progress_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.challenges(id)
);
```

### Como funciona o fluxo:

1. **Treinos Disponíveis**:

   * Na tabela `trainings`, você vai listar todos os treinos disponíveis, com informações como nome e descrição.

2. **Desafios do Treino**:

   * Cada treino (na tabela `trainings`) terá vários **desafios** (na tabela `challenges`). Os desafios podem ter tipos como corrida, tiros, longas distâncias, etc.
   * O `training_id` na tabela `challenges` vai vincular cada desafio ao treino correspondente.

3. **Escolha do Treino pelo Usuário**:

   * Quando o usuário escolher um treino, você cria uma entrada na tabela `user_trainings` para vincular o treino ao usuário, incluindo a data de início e o status ("in_progress", "completed", etc.).

4. **Acompanhamento do Progresso**:

   * Para cada desafio de um treino, você cria uma entrada na tabela `user_training_progress` que vai registrar o progresso do usuário. Isso inclui se ele completou o desafio ou não, a distância percorrida, duração, etc.

### Exemplo de Como Isso Funciona:

#### 1. Criação de Treinos e Desafios

Vamos supor que você tem um treino de 5 dias:

* **Treino de 5 dias**

  * **Dia 1**: Corrida de 5 km
  * **Dia 2**: 10 tiros de 400 metros
  * **Dia 3**: Corrida de 8 km
  * **Dia 4**: Descanso
  * **Dia 5**: Longa corrida de 12 km

Na tabela `trainings` você cria um treino assim:

| id | name             | description                                     |
| -- | ---------------- | ----------------------------------------------- |
| 1  | Treino de 5 dias | Desafio de 5 dias com várias distâncias e tiros |

Na tabela `challenges`, você cria os desafios:

| id | training_id | day_number | challenge_type | distance | repetitions | duration | rest_period |
| -- | ----------- | ---------- | -------------- | -------- | ----------- | -------- | ----------- |
| 1  | 1           | 1          | corrida        | 5 km     | NULL        | NULL     | NULL        |
| 2  | 1           | 2          | tiros          | NULL     | 10          | 400 m    | 90 s        |
| 3  | 1           | 3          | corrida        | 8 km     | NULL        | NULL     | NULL        |
| 4  | 1           | 4          | descanso       | NULL     | NULL        | NULL     | NULL        |
| 5  | 1           | 5          | longa          | 12 km    | NULL        | NULL     | NULL        |

#### 2. Escolha de Treino pelo Usuário

Quando o usuário escolher esse treino, você cria uma entrada na tabela `user_trainings`:

| id | user_id | training_id | start_date       | end_date | status      |
| -- | ------- | ----------- | ---------------- | -------- | ----------- |
| 1  | 123     | 1           | 2025-10-12 08:00 | NULL     | in_progress |

#### 3. Acompanhamento do Progresso

À medida que o usuário vai completando os desafios, você vai registrando o progresso na tabela `user_training_progress`:

| id | user_training_id | challenge_id | completed | completed_at | distance_run | duration | rest_period |
| -- | ---------------- | ------------ | --------- | ------------ | ------------ | -------- | ----------- |
| 1  | 1                | 1            | TRUE      | 2025-10-12   | 5 km         | 30 min   | NULL        |
| 2  | 1                | 2            | TRUE      | 2025-10-13   | NULL         | 20 min   | 90 s        |

### Consultas úteis

1. **Obter todos os treinos disponíveis**:

   ```sql
   SELECT * FROM public.trainings;
   ```

2. **Obter os desafios de um treino específico**:

   ```sql
   SELECT * FROM public.challenges
   WHERE training_id = 'TRAINING_ID'
   ORDER BY day_number;
   ```

3. **Obter o progresso de um usuário em um treino**:

   ```sql
   SELECT * FROM public.user_training_progress
   WHERE user_training_id = 'USER_TRAINING_ID'
   ORDER BY challenge_id;
   ```

Com essa estrutura, você consegue facilmente criar uma lista de treinos, associar desafios a cada treino, e acompanhar o progresso do usuário. Isso mantém a flexibilidade de ter diferentes tipos de treino e desafios, além de registrar o progresso de forma clara e eficiente.
