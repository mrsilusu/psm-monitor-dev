-- RLS policies para route_config
-- Executar no Supabase Dashboard > SQL Editor

ALTER TABLE route_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated read routes" ON route_config;
DROP POLICY IF EXISTS "admin manage routes" ON route_config;

-- SELECT: todos os utilizadores autenticados podem ler rotas (não são dados sensíveis)
CREATE POLICY "authenticated read routes"
ON route_config FOR SELECT
TO authenticated
USING (true);

-- ALL: apenas admins podem criar, editar e apagar rotas
CREATE POLICY "admin manage routes"
ON route_config FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());
