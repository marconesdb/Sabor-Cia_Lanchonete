import React, { createContext, useContext, useState, useEffect } from 'react';

const BACKEND_URL = 'http://localhost:3001';

interface User {
  id:    number;
  nome:  string;
  email: string;
}

interface AuthCtx {
  user:     User | null;
  token:    string | null;
  loading:  boolean;
  login:    (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, telefone?: string) => Promise<void>;
  logout:   () => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user,    setUser]    = useState<User | null>(null);
  const [token,   setToken]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaura sessão ao carregar
  useEffect(() => {
    const t = localStorage.getItem('user_token');
    const u = localStorage.getItem('user_data');
    if (t && u) {
      setToken(t);
      setUser(JSON.parse(u));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res  = await fetch(`${BACKEND_URL}/api/usuarios/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, senha: password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao fazer login.');

    localStorage.setItem('user_token', data.token);
    localStorage.setItem('user_data',  JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (name: string, email: string, password: string, telefone?: string) => {
    const res  = await fetch(`${BACKEND_URL}/api/usuarios`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ nome: name, email, senha: password, telefone }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao criar conta.');

    // Faz login automático após cadastro
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_data');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};