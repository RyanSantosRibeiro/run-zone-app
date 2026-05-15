-- =====================================================================
-- SEED: Dados de Teste para Run Zone (Versão Corrigida)
-- Este script popula atividades, territórios e conquistas para o SEU usuário.
-- =====================================================================

DO $$ 
DECLARE 
    -- 1. Certifique-se que este ID é o seu UUID do Authentication > Users
    target_user_id uuid := '8af5e34e-f175-4bc3-8310-4a8409b8e961'; 
BEGIN

-- Verificar se o perfil já existe (para evitar erro de FK em atividades)
IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = target_user_id) THEN
    RAISE NOTICE 'Atenção: O perfil para o ID % não existe na tabela public.profiles. Certifique-se de estar logado no App primeiro.', target_user_id;
    RETURN;
END IF;

-- 2. Criar Conquistas Base (Se não existirem)
INSERT INTO public.achievements (name, description, icon, category)
VALUES 
    ('Primeiros Passos', 'Completou sua primeira atividade.', 'shoe-prints', 'geral'),
    ('Explorador', 'Conquistou 10 hexágonos diferentes.', 'map', 'territorio'),
    ('Rei da Montanha', 'Ganhou mais de 500m de elevação em uma trilha.', 'mountain', 'trilha'),
    ('Velocidade Máxima', 'Alcançou mais de 40km/h no ciclismo.', 'bolt', 'ciclismo')
ON CONFLICT (name) DO NOTHING;

-- 3. Criar Atividades de Teste para o SEU Usuário
-- Atividades das últimas 8 semanas para gerar o gráfico de barras
INSERT INTO public.activities 
    (user_id, title, activity_type, distance, duration, average_speed, elevation_gain, started_at, completed_at, calories_burned)
VALUES 
    -- Esta semana
    (target_user_id, 'Corrida no Parque', 'corrida', 5.2, 1800, 10.4, 45, now() - interval '1 day', now() - interval '1 day' + interval '30 minutes', 350),
    (target_user_id, 'Pedal de Quinta', 'ciclismo', 15.0, 3600, 15.0, 120, now() - interval '3 days', now() - interval '3 days' + interval '1 hour', 600),
    -- Semanas passadas (para o gráfico)
    (target_user_id, 'Trilha Longa', 'trilha', 12.5, 10800, 4.1, 450, now() - interval '10 days', now() - interval '10 days' + interval '3 hours', 1200),
    (target_user_id, 'Corrida Rápida', 'corrida', 8.0, 2400, 12.0, 30, now() - interval '18 days', now() - interval '18 days' + interval '40 minutes', 500),
    (target_user_id, 'Escalada Técnica', 'escalada', 0.3, 7200, 0.15, 250, now() - interval '25 days', now() - interval '25 days' + interval '2 hours', 700),
    (target_user_id, 'Giro de Domingo', 'ciclismo', 25.0, 4500, 20.0, 180, now() - interval '32 days', now() - interval '32 days' + interval '75 minutes', 900);

-- 4. Criar Territórios (Cells) Conquistados
-- Isso fará o mapa e o contador de territórios no perfil funcionarem
INSERT INTO public.cells (h3_index, owner_id, hp, max_hp, season)
VALUES 
    ('88a43072b3fffff', target_user_id, 100, 100, '2026-05'),
    ('88a43072b1fffff', target_user_id, 80, 100, '2026-05'),
    ('88a43072b5fffff', target_user_id, 50, 100, '2026-05'),
    ('88a43072a7fffff', target_user_id, 100, 100, '2026-05'),
    ('88a43072a1fffff', target_user_id, 90, 100, '2026-05')
ON CONFLICT (h3_index) DO UPDATE SET owner_id = target_user_id, hp = 100;

-- 5. Vincular algumas conquistas ao usuário
INSERT INTO public.user_achievements (user_id, achievement_id)
SELECT target_user_id, id FROM public.achievements LIMIT 2
ON CONFLICT DO NOTHING;

RAISE NOTICE 'Dados de teste inseridos com sucesso para o usuário %', target_user_id;

END $$;
