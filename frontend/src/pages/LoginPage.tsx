import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UtensilsCrossed, Eye, EyeOff } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();                              // ← NOVO

  // Se veio do carrinho (handleCheckout), redireciona pro checkout; senão vai pra home
  const redirectTo = (location.state as any)?.from || '/';    // ← NOVO

  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(false);

  const [recovering,  setRecovering]  = useState(false);
  const [recEmail,    setRecEmail]    = useState('');
  const [recMsg,      setRecMsg]      = useState('');
  const [recLoading,  setRecLoading]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(redirectTo);                                     // ← CORRIGIDO
    } catch (err: any) {
      setError(err.message || 'E-mail ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecLoading(true);
    setRecMsg('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/usuarios/recuperar-senha`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: recEmail }),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error('Servidor indisponível. Tente novamente mais tarde.');
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRecMsg('✅ Se este e-mail estiver cadastrado, você receberá as instruções em breve.');
    } catch (err: any) {
      setRecMsg(err.message || 'Erro ao solicitar recuperação.');
    } finally {
      setRecLoading(false);
    }
  };

  // ── TELA DE RECUPERAÇÃO ──
  if (recovering) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-orange-600 text-white p-3 rounded-2xl">
            <UtensilsCrossed size={32} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-1">Recuperar senha</h1>
        <p className="text-center text-gray-500 text-sm mb-8">
          Informe seu e-mail cadastrado e enviaremos as instruções.
        </p>

        {recMsg && (
          <p className={`p-3 rounded-2xl mb-4 text-sm text-center border ${
            recMsg.startsWith('✅')
              ? 'bg-green-50 text-green-700 border-green-100'
              : 'bg-red-50 text-red-600 border-red-100'
          }`}>{recMsg}</p>
        )}

        <form onSubmit={handleRecover} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input type="email" required value={recEmail} onChange={e => setRecEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <button type="submit" disabled={recLoading}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white py-3 rounded-2xl font-bold transition-all shadow-lg shadow-orange-200 active:scale-95">
            {recLoading ? 'Enviando...' : 'Enviar instruções'}
          </button>
          <button type="button" onClick={() => { setRecovering(false); setRecMsg(''); }}
            className="w-full text-gray-400 text-sm hover:text-gray-600 py-2">
            ← Voltar ao login
          </button>
        </form>
      </div>
    </div>
  );

  // ── TELA DE LOGIN ──
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-orange-600 text-white p-3 rounded-2xl">
            <UtensilsCrossed size={32} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-1">Bem-vindo de volta!</h1>
        <p className="text-center text-gray-500 text-sm mb-8">Entre na sua conta para continuar o pedido</p>

        {error && (
          <p className="bg-red-50 text-red-600 border border-red-100 p-3 rounded-2xl mb-4 text-sm text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} required value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="text-right mt-1">
              <button type="button" onClick={() => setRecovering(true)}
                className="text-orange-600 text-xs hover:underline font-medium">
                Esqueceu sua senha?
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white py-3 rounded-2xl font-bold transition-all shadow-lg shadow-orange-200 active:scale-95">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Não tem conta?{' '}
          <Link to="/register" className="text-orange-600 font-bold hover:underline">Cadastre-se</Link>
        </p>
        <p className="text-center mt-3">
          <Link to="/" className="text-gray-400 text-xs hover:underline">← Voltar ao menu</Link>
        </p>
      </div>
    </div>
  );
};