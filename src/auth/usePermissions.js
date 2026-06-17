import { useMemo } from 'react';
import { useAuth } from './useAuth.js';

const usePermissions = () => {
  const { user, profile } = useAuth();

  const roles = useMemo(() => {
    if (profile?.role) return [profile.role];
    // fallback: metadata do JWT (Supabase Dashboard)
    const metaRoles = user?.user_metadata?.roles;
    if (Array.isArray(metaRoles)) return metaRoles;
    return [];
  }, [profile, user]);

  const hasRole = (role) => roles.includes(role);
  const hasAny = (roleList = []) => roleList.some(r => roles.includes(r));

  return { roles, hasRole, hasAny };
};

export default usePermissions;
