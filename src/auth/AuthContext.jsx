import { createContext } from 'react';

// Contexto de autenticação — fornece `user`, `loading`, `error` e ações de auth
export const AuthContext = createContext(null);
