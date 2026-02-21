import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UtensilsCrossed, Eye, EyeOff } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const location     = useLocation();                             // ← NOVO

  // Se veio do fluxo de compra, redireciona pro checkout; senão vai pra home
  const redirectTo = (location.state as any)?.from || '/';       // ← NOVO

  const [name,      setName]      = useState('');
  const [email,     setEmail]     = useState('');
  const [telefone,  setTelefone]  = useState('');
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [showConf,  setShowConf]  = useState(false);
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, telefone);
      navigate(redirectTo);                                       // ← CORRIGIDO
    } catch (err: any) {
      if (err.message?.toLowerCase().includes('já cadastrado') ||
          err.message?.toLowerCase().includes('email já')) {
        setError('Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.');
      } else {
        setError(err.message || 'Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 w-full max-w-md">

        <div className="flex justify-center mb-6">
          <div className="bg-orange-600 text-white p-3 rounded-2xl">
            <UtensilsCrossed size={32} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-1">Crie sua conta</h1>
        <p className="text-center text-gray-500 text-sm mb-8">Rápido e fácil, prometo 😄</p>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-100 p-3 rounded-2xl mb-4 text-sm text-center">
            {error}
            {error.includes('já está cadastrado') && (
              <div className="mt-2">
                {/* Preserva o state para que o login também saiba redirecionar corretamente */}
                <Link
                  to="/login"
                  state={{ from: redirectTo }}
                  className="text-orange-600 font-bold hover:underline"
                >
                  Clique aqui para fazer login →
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)}
              placeholder="Seu nome completo"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone <span className="text-gray-400 font-normal">(opcional)</span></label>
            <input type="tel" value={telefone} onChange={e => setTelefone(e.target.value)}
              placeholder="(00) 00000-0000"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} required minLength={6}
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar senha</label>
            <div className="relative">
              <input type={showConf ? 'text' : 'password'} required
                value={confirm} onChange={e => setConfirm(e.target.value)}
                placeholder="Repita a senha"
                className={`w-full border rounded-2xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400
                  ${confirm && confirm !== password ? 'border-red-300' : 'border-gray-200'}`} />
              <button type="button" onClick={() => setShowConf(!showConf)}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600">
                {showConf ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {confirm && confirm !== password && (
              <p className="text-red-500 text-xs mt-1 ml-1">As senhas não coincidem</p>
            )}
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white py-3 rounded-2xl font-bold transition-all shadow-lg shadow-orange-200 active:scale-95">
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Já tem conta?{' '}
          {/* Preserva o state para o login também redirecionar corretamente */}
          <Link to="/login" state={{ from: redirectTo }} className="text-orange-600 font-bold hover:underline">
            Entrar
          </Link>
        </p>
        <p className="text-center mt-3">
          <Link to="/" className="text-gray-400 text-xs hover:underline">← Voltar ao menu</Link>
        </p>
      </div>
    </div>
  );
};