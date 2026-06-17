-- RLS policies para user_profiles
-- Executar no Supabase Dashboard > SQL Editor

-- Função auxiliar: verifica se o utilizador autenticado é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE email = auth.email() AND role = 'admin' AND is_active = true
  );
$$;

-- Garantir que RLS está ativo
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Remover policies antigas se existirem
DROP POLICY IF EXISTS "read own profile" ON user_profiles;
DROP POLICY IF EXISTS "admin manage all profiles" ON user_profiles;

-- SELECT: cada utilizador lê apenas o seu próprio perfil
CREATE POLICY "read own profile"
ON user_profiles FOR SELECT
TO authenticated
USING (email = auth.email());

-- ALL (INSERT, UPDATE, DELETE, SELECT): admins gerem todos os perfis
CREATE POLICY "admin manage all profiles"
ON user_profiles FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());
