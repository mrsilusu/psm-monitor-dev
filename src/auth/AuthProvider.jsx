import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient.js';
import { AuthContext } from './AuthContext.jsx';

const fetchProfile = async (email) => {
  if (!email) return null;
  const { data } = await supabase
    .from('user_profiles')
    .select('full_name, role, psm_access, is_active')
    .eq('email', email)
    .maybeSingle();
  return data ?? null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const authUser = session?.user ?? null;
      if (!mounted) return;
      setUser(authUser);

      fetchProfile(authUser?.email)
        .then(p => { if (mounted) setProfile(p); })
        .catch(() => { if (mounted) setProfile(null); })
        .finally(() => { if (mounted) setLoading(false); });
    });

    // Garante que loading=false mesmo que onAuthStateChange não dispare
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!mounted || !session) return;
        setUser(session.user);
        return fetchProfile(session.user?.email).then(p => {
          if (mounted) setProfile(p);
        });
      })
      .catch(e => { if (mounted) setError(e.message); })
      .finally(() => { if (mounted) setLoading(false); });

    return () => {
      mounted = false;
      try { subscription.unsubscribe(); } catch (_) { /* ignore */ }
    };
  }, []);

  const signIn = async (email, password) => {
    setError(null);
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error) setError(result.error.message);
    return result;
  };

  const signUp = async (email, password, options = {}) => {
    setError(null);
    const result = await supabase.auth.signUp({ email, password }, { data: options });
    if (result.error) setError(result.error.message);
    return result;
  };

  const signOut = async () => {
    setError(null);
    const result = await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    if (result.error) setError(result.error.message);
    return result;
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, error, signIn, signUp, signOut, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
