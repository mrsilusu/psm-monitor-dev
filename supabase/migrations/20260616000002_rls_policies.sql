-- ============================================================
-- MIGRAÇÃO 002 — RLS (Row Level Security) em todas as tabelas
-- ============================================================

-- ------------------------------------------------------------
-- psm_data
-- SELECT: qualquer autenticado vê tudo (app colaborativa)
-- ALL:    autenticado pode escrever; user_id deve ser o seu
-- ------------------------------------------------------------
ALTER TABLE psm_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "psm_data: leitura autenticada"
  ON psm_data FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "psm_data: escrita autenticada"
  ON psm_data FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (user_id = auth.uid());

-- ------------------------------------------------------------
-- route_config
-- Qualquer autenticado lê e escreve (backoffice aberto a todos)
-- ------------------------------------------------------------
ALTER TABLE route_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "route_config: leitura autenticada"
  ON route_config FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "route_config: escrita autenticada"
  ON route_config FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ------------------------------------------------------------
-- psm_distribuicao_reparacoes
-- Qualquer autenticado lê e escreve
-- ------------------------------------------------------------
ALTER TABLE psm_distribuicao_reparacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "distribuicao: acesso autenticado"
  ON psm_distribuicao_reparacoes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ------------------------------------------------------------
-- psm_justificativas
-- Qualquer autenticado lê e escreve
-- ------------------------------------------------------------
ALTER TABLE psm_justificativas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "justificativas: acesso autenticado"
  ON psm_justificativas FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ------------------------------------------------------------
-- user_profiles
-- Cada utilizador lê o seu próprio perfil
-- Admins gerem todos os perfis
-- ------------------------------------------------------------
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE email = auth.email() AND role = 'admin' AND is_active = true
  );
$$;

CREATE POLICY "user_profiles: ler próprio perfil"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (email = auth.email());

CREATE POLICY "user_profiles: admin gere todos"
  ON user_profiles FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ------------------------------------------------------------
-- app_settings
-- Qualquer autenticado lê; apenas admins escrevem
-- ------------------------------------------------------------
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "app_settings: leitura autenticada"
  ON app_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "app_settings: escrita admin"
  ON app_settings FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
