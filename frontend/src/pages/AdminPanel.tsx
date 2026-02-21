import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag, TrendingUp, Clock, CheckCircle,
  XCircle, Printer, LogOut, RefreshCw, ChevronDown
} from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pendente:    { label: 'Pendente',     color: 'bg-yellow-100 text-yellow-700' },
  confirmado:  { label: 'Confirmado',   color: 'bg-blue-100 text-blue-700'    },
  em_preparo:  { label: 'Em preparo',   color: 'bg-orange-100 text-orange-700'},
  em_entrega:  { label: 'Em entrega',   color: 'bg-purple-100 text-purple-700'},
  entregue:    { label: 'Entregue',     color: 'bg-green-100 text-green-700'  },
  cancelado:   { label: 'Cancelado',    color: 'bg-red-100 text-red-700'      },
};

const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([k, v]) => ({ value: k, label: v.label }));

// ── LOGIN ──
const LoginAdmin: React.FC<{ onLogin: (token: string, nome: string) => void }> = ({ onLogin }) => {
  const [email, setEmail]   = useState('');
  const [senha, setSenha]   = useState('');
  const [error, setError]   = useState('');
  const [load,  setLoad]    = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoad(true); setError('');
    try {
      const res  = await fetch(`${BACKEND_URL}/api/admin/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onLogin(data.token, data.nome);
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login.');
    } finally { setLoad(false); }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Painel Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Sabor & Cia</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@saborcia.com"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input type="password" required value={senha} onChange={e => setSenha(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          {error && <p className="bg-red-50 text-red-600 p-3 rounded-2xl text-sm text-center">{error}</p>}
          <button type="submit" disabled={load}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white py-4 rounded-2xl font-bold text-lg transition-all">
            {load ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ── EXTRATO PARA IMPRESSÃO ──
const Extrato: React.FC<{ pedido: any; onClose: () => void }> = ({ pedido, onClose }) => {
  const fmt = (iso: string) => new Date(iso).toLocaleString('pt-BR');

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 print:p-2" id="extrato-print">

          {/* Cliente */}
          {pedido.cliente_nome && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                👤 Cliente
              </h2>
              <div className="text-sm text-gray-700 space-y-1">
                <p className="font-medium">{pedido.cliente_nome}</p>
                {pedido.cliente_email    && <p className="text-gray-500">{pedido.cliente_email}</p>}
                {pedido.cliente_telefone && <p className="text-gray-500">📞 {pedido.cliente_telefone}</p>}
              </div>
            </div>
          )}

          {/* Cabeçalho */}
          <div className="text-center border-b pb-4 mb-4">
            <h1 className="text-2xl font-bold text-orange-600">Sabor & Cia</h1>
            <p className="text-gray-500 text-sm">Extrato do Pedido</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">#{String(pedido.id).padStart(6, '0')}</p>
            <p className="text-sm text-gray-500 mt-1 flex items-center justify-center gap-1">
              <Clock size={14} /> {fmt(pedido.criado_em)}
            </p>
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold mt-2 ${STATUS_LABELS[pedido.status]?.color}`}>
              {STATUS_LABELS[pedido.status]?.label}
            </span>
          </div>

          {/* Itens */}
          <div className="mb-4">
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <ShoppingBag size={16} className="text-orange-600" /> Itens
            </h3>
            <div className="space-y-2">
              {pedido.itens?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between text-sm py-1 border-b border-gray-50">
                  <span className="text-gray-700">{item.nome} <span className="text-gray-400">x{item.quantidade}</span></span>
                  <span className="font-medium">R$ {(Number(item.preco) * item.quantidade).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t">
              <span>Total</span>
              <span className="text-orange-600">R$ {Number(pedido.total).toFixed(2)}</span>
            </div>
          </div>

          {/* Endereço */}
          {pedido.rua && (
            <div className="mb-4 bg-gray-50 rounded-2xl p-4">
              <h3 className="font-bold text-gray-900 mb-2 text-sm">📍 Endereço de entrega</h3>
              <p className="text-sm text-gray-700">{pedido.rua}, {pedido.numero}{pedido.complemento ? ` — ${pedido.complemento}` : ''}</p>
              <p className="text-sm text-gray-700">{pedido.bairro}</p>
              <p className="text-sm text-gray-700">{pedido.cidade} — {pedido.estado}</p>
              <p className="text-xs text-gray-400">CEP: {pedido.cep}</p>
            </div>
          )}

          {/* Pagamento */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <h3 className="font-bold text-gray-900 mb-2 text-sm">💳 Pagamento</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Forma</span>
                <span className="font-medium capitalize">{pedido.metodo_pag}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Valor</span>
                <span className="font-bold text-green-600">R$ {Number(pedido.total).toFixed(2)}</span>
              </div>
              {pedido.pag_status && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-bold ${pedido.pag_status === 'aprovado' ? 'text-green-600' : 'text-red-500'}`}>
                    {pedido.pag_status}
                  </span>
                </div>
              )}
              {pedido.gateway_id && (
                <div className="flex justify-between">
                  <span className="text-gray-500">ID transação</span>
                  <span className="text-xs text-gray-400 truncate max-w-[180px]">{pedido.gateway_id}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="p-6 pt-0 flex gap-3 print:hidden">
          <button onClick={() => window.print()}
            className="flex-1 bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2">
            <Printer size={18} /> Imprimir
          </button>
          <button onClick={onClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-2xl font-bold">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

// ── PAINEL PRINCIPAL ──
export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [token,    setToken]    = useState(localStorage.getItem('admin_token') || '');
  const [nome,     setNome]     = useState(localStorage.getItem('admin_nome')  || '');
  const [pedidos,  setPedidos]  = useState<any[]>([]);
  const [relatorio,setRelatorio]= useState<any>(null);
  const [aba,      setAba]      = useState<'pedidos'|'relatorio'>('pedidos');
  const [extrato,  setExtrato]  = useState<any>(null);
  const [load,     setLoad]     = useState(false);
  const [filtro,   setFiltro]   = useState('todos');

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const handleLogin = (t: string, n: string) => {
    setToken(t); setNome(n);
    localStorage.setItem('admin_token', t);
    localStorage.setItem('admin_nome',  n);
  };

  const handleLogout = () => {
    setToken(''); setNome('');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_nome');
  };

  const fetchPedidos = async () => {
    setLoad(true);
    try {
      const res  = await fetch(`${BACKEND_URL}/api/admin/pedidos`, { headers });
      const data = await res.json();
      if (res.ok) setPedidos(data);
    } finally { setLoad(false); }
  };

  const fetchRelatorio = async () => {
    const res  = await fetch(`${BACKEND_URL}/api/admin/relatorio`, { headers });
    const data = await res.json();
    if (res.ok) setRelatorio(data);
  };

  const updateStatus = async (id: number, status: string) => {
    await fetch(`${BACKEND_URL}/api/admin/pedidos/${id}/status`, {
      method: 'PATCH', headers, body: JSON.stringify({ status }),
    });
    fetchPedidos();
  };

  useEffect(() => { if (token) { fetchPedidos(); fetchRelatorio(); } }, [token]);

  if (!token) return <LoginAdmin onLogin={handleLogin} />;

  const pedidosFiltrados = filtro === 'todos' ? pedidos : pedidos.filter(p => p.status === filtro);

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-600 rounded-xl flex items-center justify-center">
            <ShoppingBag size={20} />
          </div>
          <div>
            <p className="font-bold text-sm">Sabor & Cia — Admin</p>
            <p className="text-xs text-gray-400">Olá, {nome}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { fetchPedidos(); fetchRelatorio(); }}
            className="p-2 text-gray-400 hover:text-white transition-colors">
            <RefreshCw size={18} />
          </button>
          <button onClick={handleLogout}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-xl text-sm transition-colors">
            <LogOut size={16} /> Sair
          </button>
        </div>
      </div>

      {/* Abas */}
      <div className="bg-white border-b px-6">
        <div className="max-w-7xl mx-auto flex gap-6">
          {[
            { id: 'pedidos',   label: 'Pedidos',  icon: ShoppingBag },
            { id: 'relatorio', label: 'Relatório', icon: TrendingUp  },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setAba(id as any)}
              className={`flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors
                ${aba === id ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ── ABA PEDIDOS ── */}
        {aba === 'pedidos' && (
          <div className="space-y-4">

            {/* Filtro */}
            <div className="flex gap-2 flex-wrap">
              {[{ value: 'todos', label: 'Todos' }, ...STATUS_OPTIONS].map(s => (
                <button key={s.value} onClick={() => setFiltro(s.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors
                    ${filtro === s.value ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border'}`}>
                  {s.label}
                </button>
              ))}
            </div>

            {load ? (
              <p className="text-center text-gray-400 py-10 animate-pulse">Carregando pedidos...</p>
            ) : pedidosFiltrados.length === 0 ? (
              <p className="text-center text-gray-400 py-10">Nenhum pedido encontrado.</p>
            ) : (
              pedidosFiltrados.map(p => (
                <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <p className="font-bold text-gray-900 text-lg">#{String(p.id).padStart(6, '0')}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <Clock size={12} /> {new Date(p.criado_em).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_LABELS[p.status]?.color}`}>
                        {STATUS_LABELS[p.status]?.label}
                      </span>
                      <span className="text-lg font-bold text-orange-600">R$ {Number(p.total).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Cliente */}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg font-medium">
                      👤 {p.cliente_nome || 'Cliente não identificado'}
                    </span>
                    {p.cliente_telefone && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                        📞 {p.cliente_telefone}
                      </span>
                    )}
                  </div>

                  {/* Itens resumo */}
                  <div className="mt-2 text-sm text-gray-600">
                    {p.itens?.map((item: any, i: number) => (
                      <span key={i}>{item.nome} x{item.quantidade}{i < p.itens.length - 1 ? ', ' : ''}</span>
                    ))}
                  </div>

                  {/* Endereço resumo */}
                  {p.rua && (
                    <p className="text-xs text-gray-400 mt-2">
                      📍 {p.rua}, {p.numero} — {p.bairro}, {p.cidade}
                    </p>
                  )}

                  {/* Ações */}
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <div className="relative">
                      <select
                        value={p.status}
                        onChange={e => updateStatus(p.id, e.target.value)}
                        className="appearance-none bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 pr-8 rounded-xl text-sm font-medium cursor-pointer focus:outline-none"
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-2 top-3 text-gray-500 pointer-events-none" />
                    </div>
                    <button onClick={() => setExtrato(p)}
                      className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                      <Printer size={16} /> Extrato
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── ABA RELATÓRIO ── */}
        {aba === 'relatorio' && relatorio && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total de pedidos', value: relatorio.totais.total_pedidos,         icon: ShoppingBag, color: 'text-blue-600'   },
                { label: 'Receita total',    value: `R$ ${Number(relatorio.totais.receita_total || 0).toFixed(2)}`, icon: TrendingUp, color: 'text-green-600' },
                { label: 'Entregues',        value: relatorio.totais.entregues || 0,         icon: CheckCircle, color: 'text-green-600'  },
                { label: 'Cancelados',       value: relatorio.totais.cancelados || 0,        icon: XCircle,     color: 'text-red-500'    },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <Icon size={24} className={`${color} mb-2`} />
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-sm text-gray-500">{label}</p>
                </div>
              ))}
            </div>

            {/* Últimos 7 dias */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Vendas — últimos 7 dias</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-3">Data</th>
                      <th className="pb-3">Pedidos</th>
                      <th className="pb-3">Receita</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relatorio.porDia.map((d: any) => (
                      <tr key={d.dia} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3">{new Date(d.dia).toLocaleDateString('pt-BR')}</td>
                        <td className="py-3 font-medium">{d.pedidos}</td>
                        <td className="py-3 font-bold text-green-600">R$ {Number(d.receita).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal extrato */}
      {extrato && <Extrato pedido={extrato} onClose={() => setExtrato(null)} />}
    </div>
  );
};