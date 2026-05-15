-- =====================================================================
-- MIGRAÇÃO: runs → activities
-- Apaga dados existentes e recria a tabela com suporte a múltiplos
-- tipos de atividade: corrida, escalada, trilha, ciclismo.
-- =====================================================================

-- 1. Remove a tabela antiga (apaga todos os dados existentes)
DROP TABLE IF EXISTS public.runs CASCADE;

-- 2. Cria enum de tipos de atividade
DO $$ BEGIN
  CREATE TYPE public.activity_type AS ENUM ('corrida', 'escalada', 'trilha', 'ciclismo');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 3. Cria tabela de atividades
CREATE TABLE public.activities (
  id                bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id           uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title             text,
  activity_type     public.activity_type NOT NULL DEFAULT 'corrida',
  distance          numeric DEFAULT 0,
  duration          integer DEFAULT 0,       -- em segundos
  average_speed     numeric DEFAULT 0,       -- km/h
  calories_burned   integer DEFAULT 0,
  started_at        timestamptz,
  completed_at      timestamptz,
  route_data        jsonb,                   -- array de { lat, lng, timestamp, ... }
  crossed_h3_ids    text[],                  -- IDs H3 dos hexágonos percorridos
  steps             integer,                 -- passos (corrida/trilha)
  elevation_gain    numeric,                 -- ganho de elevação (m)
  max_elevation     numeric,                 -- elevação máxima (m)
  splits            jsonb,                   -- parciais por km
  perceived_effort  integer,                 -- esforço percebido (1-10)
  description       text,
  created_at        timestamptz DEFAULT now()
);

-- 4. Índices para performance
CREATE INDEX idx_activities_user_id    ON public.activities(user_id);
CREATE INDEX idx_activities_type       ON public.activities(activity_type);
CREATE INDEX idx_activities_created_at ON public.activities(created_at DESC);

-- 5. Row Level Security
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Qualquer autenticado pode ver atividades (feed social)
CREATE POLICY "Atividades são visíveis para autenticados"
  ON public.activities FOR SELECT
  TO authenticated
  USING (true);

-- Apenas o dono pode inserir suas atividades
CREATE POLICY "Usuário insere suas próprias atividades"
  ON public.activities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Apenas o dono pode editar suas atividades
CREATE POLICY "Usuário edita suas próprias atividades"
  ON public.activities FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Apenas o dono pode deletar suas atividades
CREATE POLICY "Usuário deleta suas próprias atividades"
  ON public.activities FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
