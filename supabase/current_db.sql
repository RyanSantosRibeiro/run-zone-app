-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.achievements (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL UNIQUE,
  description text,
  icon text,
  category text DEFAULT 'geral'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT achievements_pkey PRIMARY KEY (id)
);
CREATE TABLE public.activities (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid NOT NULL,
  title text,
  activity_type USER-DEFINED NOT NULL DEFAULT 'corrida'::activity_type,
  distance numeric DEFAULT 0,
  duration integer DEFAULT 0,
  average_speed numeric DEFAULT 0,
  calories_burned integer DEFAULT 0,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  route_data jsonb,
  crossed_h3_ids ARRAY,
  steps integer,
  elevation_gain numeric,
  max_elevation numeric,
  splits jsonb,
  perceived_effort integer,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT activities_pkey PRIMARY KEY (id),
  CONSTRAINT activities_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.cells (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  h3_index text NOT NULL UNIQUE,
  owner_id uuid,
  hp integer DEFAULT 0,
  max_hp integer DEFAULT 100,
  boundary jsonb,
  season text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT cells_pkey PRIMARY KEY (id),
  CONSTRAINT cells_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.follows (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT follows_pkey PRIMARY KEY (id),
  CONSTRAINT follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.profiles(id),
  CONSTRAINT follows_following_id_fkey FOREIGN KEY (following_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  username text NOT NULL UNIQUE,
  full_name text,
  avatar_url text,
  color text DEFAULT '#89F336'::text,
  bio text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.season_rankings (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  season text NOT NULL,
  user_id uuid NOT NULL,
  position integer NOT NULL,
  category text NOT NULL,
  score numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT season_rankings_pkey PRIMARY KEY (id),
  CONSTRAINT season_rankings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.user_achievements (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid NOT NULL,
  achievement_id bigint NOT NULL,
  earned_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_achievements_pkey PRIMARY KEY (id),
  CONSTRAINT user_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT user_achievements_achievement_id_fkey FOREIGN KEY (achievement_id) REFERENCES public.achievements(id)
);