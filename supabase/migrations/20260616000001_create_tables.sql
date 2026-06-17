-- ============================================================
-- MIGRAÇÃO 001 — Criar todas as tabelas do PSM Monitor
-- ============================================================

-- ------------------------------------------------------------
-- route_config: catálogo de rotas (estáticas + dinâmicas)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS route_config (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  psm           text        NOT NULL,
  route_name    text        NOT NULL,
  province      text        NOT NULL DEFAULT '',
  is_active     boolean     NOT NULL DEFAULT true,
  display_order int         NOT NULL DEFAULT 0,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now(),
  CONSTRAINT route_config_psm_route_key UNIQUE (psm, route_name)
);

-- ------------------------------------------------------------
-- psm_data: dados operacionais por rota/semana
-- Chave de unicidade (psm, week, route, year) suporta UPSERT
-- sem necessidade de SELECT prévio
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS psm_data (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  psm             text        NOT NULL,
  week            text        NOT NULL,
  route           text        NOT NULL,
  year            int         NOT NULL,
  quarter         text        NOT NULL,
  provincia       text        NOT NULL DEFAULT '',
  user_id         uuid        REFERENCES auth.users(id),
  transporte      int         NOT NULL DEFAULT 0,
  indisponiveis   int         NOT NULL DEFAULT 0,
  total_reparadas int         NOT NULL DEFAULT 0,
  reconhecidas    int         NOT NULL DEFAULT 0,
  dep_passagem    int         NOT NULL DEFAULT 0,
  dep_licenca     int         NOT NULL DEFAULT 0,
  dep_cutover     int         NOT NULL DEFAULT 0,
  -- dep_isistel: 'Fibras dep. ISISTEL' para PSMs estáticos;
  --              'Fibras dep. [PSM]'    para PSMs dinâmicos
  dep_isistel     int         NOT NULL DEFAULT 0,
  dep_fibrasol    int         NOT NULL DEFAULT 0,
  dep_anglobal    int         NOT NULL DEFAULT 0,
  testada         boolean     NOT NULL DEFAULT false,
  validada        boolean     NOT NULL DEFAULT false,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  CONSTRAINT psm_data_upsert_key UNIQUE (psm, week, route, year)
);

-- índice para queries frequentes por ano + psm
CREATE INDEX IF NOT EXISTS psm_data_year_psm_idx ON psm_data (year, psm);

-- ------------------------------------------------------------
-- psm_distribuicao_reparacoes: distribuição de reparações por tipo
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS psm_distribuicao_reparacoes (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  psm        text        NOT NULL,
  week       text        NOT NULL,
  route      text        NOT NULL,
  tipo       text        NOT NULL,
  desconto   int         NOT NULL DEFAULT 0,
  year       int         NOT NULL,
  quarter    text        NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT psm_distribuicao_upsert_key UNIQUE (psm, week, route, tipo, year, quarter)
);

-- ------------------------------------------------------------
-- psm_justificativas: justificativas trimestrais por secção
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS psm_justificativas (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  psm           text        NOT NULL,
  quarter       text        NOT NULL,
  year          int         NOT NULL,
  seccao        text        NOT NULL,
  regiao        text        NOT NULL DEFAULT '',
  transporte    int         NOT NULL DEFAULT 0,
  indisponiveis int         NOT NULL DEFAULT 0,
  delta         int         NOT NULL DEFAULT 0,
  justificativa text        NOT NULL DEFAULT '',
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now(),
  CONSTRAINT psm_justificativas_upsert_key UNIQUE (psm, quarter, year, seccao)
);

-- ------------------------------------------------------------
-- user_profiles: perfis e permissões de utilizadores
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_profiles (
  id          uuid        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email       text        NOT NULL UNIQUE,
  full_name   text,
  role        text        NOT NULL DEFAULT 'operator'
                          CHECK (role IN ('admin', 'manager', 'operator', 'viewer')),
  psm_access  jsonb       NOT NULL DEFAULT '[]',
  is_active   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- ------------------------------------------------------------
-- app_settings: configurações globais da aplicação
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS app_settings (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  key        text        NOT NULL UNIQUE,
  value      jsonb       NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
