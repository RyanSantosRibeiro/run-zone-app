-- ============================================================
-- Run Zone MVP — Schema + Row Level Security
-- Execute este script no SQL Editor do Supabase (Dashboard)
-- ============================================================

-- =====================
-- 1. PROFILES
-- =====================
-- Extende auth.users com dados públicos do corredor.
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique not null,
  full_name   text,
  avatar_url  text,
  color       text default '#89F336',   -- cor pessoal no mapa
  bio         text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.profiles enable row level security;

-- Qualquer pessoa logada pode ver perfis (dados públicos).
create policy "Perfis são visíveis para usuários autenticados"
  on public.profiles for select
  to authenticated
  using (true);

-- Apenas o dono pode editar seu próprio perfil.
create policy "Usuário edita apenas o próprio perfil"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- O perfil é criado automaticamente pelo trigger (abaixo).
create policy "Perfil pode ser criado pelo próprio usuário"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- =====================
-- 2. FOLLOWS (Rede Social)
-- =====================
create table public.follows (
  id            bigint generated always as identity primary key,
  follower_id   uuid not null references public.profiles(id) on delete cascade,
  following_id  uuid not null references public.profiles(id) on delete cascade,
  created_at    timestamptz default now(),

  -- Evita duplicatas
  unique (follower_id, following_id),
  -- Impede que o usuário siga a si mesmo
  check (follower_id <> following_id)
);

alter table public.follows enable row level security;

-- Qualquer autenticado pode ver as relações de follow.
create policy "Follows são visíveis para autenticados"
  on public.follows for select
  to authenticated
  using (true);

-- Apenas o próprio follower pode criar a relação.
create policy "Usuário cria seus próprios follows"
  on public.follows for insert
  to authenticated
  with check (auth.uid() = follower_id);

-- Apenas o follower pode desfazer o follow.
create policy "Usuário deleta seus próprios follows"
  on public.follows for delete
  to authenticated
  using (auth.uid() = follower_id);

-- =====================
-- 3. RUNS (Corridas)
-- =====================
create table public.runs (
  id              bigint generated always as identity primary key,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  title           text,
  distance        numeric(10,2) default 0,           -- km
  duration        integer default 0,                  -- segundos
  average_speed   numeric(6,2) default 0,             -- km/h
  calories_burned integer default 0,
  started_at      timestamptz,
  completed_at    timestamptz,
  route_data      jsonb,                              -- array de {lat, lng, timestamp, speed, distance}
  crossed_h3_ids  text[],                             -- IDs H3 dos hexágonos atravessados
  created_at      timestamptz default now()
);

alter table public.runs enable row level security;

-- O dono sempre vê suas próprias corridas.
-- Corridas de outros são visíveis se o viewer os segue.
create policy "Usuário vê suas corridas e de quem segue"
  on public.runs for select
  to authenticated
  using (
    user_id = auth.uid()
    or
    exists (
      select 1 from public.follows
      where follower_id = auth.uid() and following_id = runs.user_id
    )
  );

-- Apenas o dono cria suas corridas.
create policy "Usuário cria suas próprias corridas"
  on public.runs for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Apenas o dono edita (ex: mudar título).
create policy "Usuário edita suas próprias corridas"
  on public.runs for update
  to authenticated
  using (auth.uid() = user_id);

-- Apenas o dono deleta.
create policy "Usuário deleta suas próprias corridas"
  on public.runs for delete
  to authenticated
  using (auth.uid() = user_id);

-- =====================
-- 4. CELLS (Hexágonos / Territórios)
-- =====================
create table public.cells (
  id          bigint generated always as identity primary key,
  h3_index    text unique not null,                   -- ID hexadecimal gerado pela lib h3geo
  owner_id    uuid references public.profiles(id) on delete set null,
  hp          integer default 0,                      -- pontos de defesa atuais
  max_hp      integer default 100,                    -- teto de defesa
  boundary    jsonb,                                  -- array de [lng, lat] para renderizar o polígono
  season      text,                                   -- ex: '2026-05' (temporada mensal)
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.cells enable row level security;

-- Hexágonos são dados públicos de jogo — todos autenticados podem ver.
create policy "Hexágonos são visíveis para autenticados"
  on public.cells for select
  to authenticated
  using (true);

-- Inserção: qualquer autenticado pode criar um hexágono novo (primeira conquista).
create policy "Autenticados podem criar hexágonos"
  on public.cells for insert
  to authenticated
  with check (true);

-- Atualização: qualquer autenticado pode atacar/defender um hexágono (lógica de jogo).
-- A validação real (quem pode alterar o quê) deve ser feita via Edge Function.
create policy "Autenticados podem atualizar hexágonos"
  on public.cells for update
  to authenticated
  using (true);



-- =====================
-- 5. ACHIEVEMENTS (Definições de Conquistas)
-- =====================
create table public.achievements (
  id          bigint generated always as identity primary key,
  name        text unique not null,
  description text,
  icon        text,                  -- nome do ícone ou URL
  category    text default 'geral',  -- ex: 'distancia', 'territorio', 'social'
  created_at  timestamptz default now()
);

alter table public.achievements enable row level security;

-- Conquistas são dados públicos — todos podem ver o catálogo.
create policy "Achievements são visíveis para autenticados"
  on public.achievements for select
  to authenticated
  using (true);

-- =====================
-- 6. USER_ACHIEVEMENTS (Conquistas Desbloqueadas)
-- =====================
create table public.user_achievements (
  id              bigint generated always as identity primary key,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  achievement_id  bigint not null references public.achievements(id) on delete cascade,
  earned_at       timestamptz default now(),

  unique (user_id, achievement_id)
);

alter table public.user_achievements enable row level security;

-- Conquistas desbloqueadas são visíveis por autenticados.
create policy "User achievements são visíveis para autenticados"
  on public.user_achievements for select
  to authenticated
  using (true);

-- Apenas o sistema (via service_role) ou o próprio usuário deveria criar.
create policy "Inserção de achievements"
  on public.user_achievements for insert
  to authenticated
  with check (auth.uid() = user_id);

-- =====================
-- 7. SEASON_RANKINGS (Histórico de Temporadas)
-- =====================
-- Salva o snapshot do ranking ao final de cada mês.
create table public.season_rankings (
  id            bigint generated always as identity primary key,
  season        text not null,         -- ex: '2026-05'
  user_id       uuid not null references public.profiles(id) on delete cascade,
  position      integer not null,
  category      text not null,         -- 'maior_imperio' | 'maior_distancia'
  score         numeric(12,2) default 0,
  created_at    timestamptz default now(),

  unique (season, user_id, category)
);

alter table public.season_rankings enable row level security;

-- Rankings são dados públicos.
create policy "Rankings são visíveis para autenticados"
  on public.season_rankings for select
  to authenticated
  using (true);

-- ============================================================
-- TRIGGER: Criar perfil automaticamente ao cadastrar
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', 'runner_' || left(new.id::text, 8)),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ÍNDICES para performance
-- ============================================================
create index idx_runs_user_id on public.runs(user_id);
create index idx_runs_created_at on public.runs(created_at desc);
create index idx_cells_owner_id on public.cells(owner_id);
create index idx_cells_h3_index on public.cells(h3_index);
create index idx_cells_season on public.cells(season);
create index idx_follows_follower on public.follows(follower_id);
create index idx_follows_following on public.follows(following_id);

create index idx_user_achievements_user on public.user_achievements(user_id);
create index idx_season_rankings_season on public.season_rankings(season);

-- ============================================================
-- SEED: Conquistas iniciais
-- ============================================================
insert into public.achievements (name, description, icon, category) values
  ('Primeiro Passo',     'Complete sua primeira corrida.',                                'trophy',    'geral'),
  ('5K Runner',          'Complete uma corrida de 5 km ou mais.',                         'medal',     'distancia'),
  ('10K Runner',         'Complete uma corrida de 10 km ou mais.',                        'medal',     'distancia'),
  ('Meia Maratona',      'Complete uma corrida de 21 km ou mais.',                        'star',      'distancia'),
  ('Maratonista',        'Complete uma corrida de 42 km ou mais.',                        'crown',     'distancia'),
  ('Conquistador',       'Conquiste seu primeiro hexágono.',                              'hexagon',   'territorio'),
  ('Império Nascente',   'Domine 10 hexágonos simultaneamente.',                          'castle',    'territorio'),
  ('Senhor da Guerra',   'Domine 50 hexágonos simultaneamente.',                          'sword',     'territorio'),
  ('Consistência',       'Corra pelo menos 3 vezes em uma semana.',                       'fire',      'geral'),
  ('Social Runner',      'Siga 5 corredores.',                                            'users',     'social');
