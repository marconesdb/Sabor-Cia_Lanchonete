import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, MapPin, CreditCard, Clock, ShoppingBag, Home, Printer } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Item {
  nome:       string;
  preco:      number;
  quantidade: number;
}

interface Endereco {
  rua:         string;
  numero:      string;
  complemento: string;
  bairro:      string;
  cidade:      string;
  estado:      string;
  cep:         string;
}

interface Pedido {
  id:              number;
  status:          string;
  metodo_pag:      string;
  total:           number;
  criado_em:       string;
  itens:           Item[];
  endereco:        Endereco | null;
  pagamento:       { gateway_id: string; status: string; valor: number } | null;
  cliente_nome?:   string;
  cliente_email?:  string;
  cliente_telefone?: string;
}

export const ConfirmationPage: React.FC = () => {
  const navigate   = useNavigate();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tenta pegar pedido_id da URL primeiro, depois do sessionStorage
    const params    = new URLSearchParams(window.location.search);
    const pedido_id = params.get('pedido_id') || sessionStorage.getItem('pedido_id');
    if (!pedido_id) { navigate('/'); return; }

    fetch(`${BACKEND_URL}/api/pedidos/${pedido_id}`)
      .then(r => r.json())
      .then(data => { setPedido(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [navigate]);

  const handlePrint = () => window.print();

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  };

  const methodLabel: Record<string, string> = {
    cartao:   '💳 Cartão de crédito/débito',
    pix:      '📱 PIX',
    dinheiro: '💵 Dinheiro na entrega',
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500 text-lg animate-pulse">Carregando extrato...</p>
    </div>
  );

  if (!pedido) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col gap-4">
      <p className="text-gray-500 text-lg">Pedido não encontrado.</p>
      <button onClick={() => navigate('/')} className="bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold">
        Voltar ao menu
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-6">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle size={56} className="text-green-500 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900">Pedido confirmado!</h1>
          <p className="text-gray-500 mt-1">Seu pedido foi recebido e está sendo preparado.</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">

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

        {/* Número e horário */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Número do pedido</p>
              <p className="text-2xl font-bold text-orange-600">#{String(pedido.id).padStart(6, '0')}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase tracking-wide flex items-center gap-1 justify-end">
                <Clock size={12} /> Horário
              </p>
              <p className="text-sm font-medium text-gray-700">{formatDate(pedido.criado_em)}</p>
            </div>
          </div>
          <div className="mt-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold
              ${pedido.status === 'confirmado' ? 'bg-green-100 text-green-700' :
                pedido.status === 'pendente'   ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-600'}`}>
              {pedido.status.charAt(0).toUpperCase() + pedido.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Itens do pedido */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingBag size={18} className="text-orange-600" /> Itens do pedido
          </h2>
          <div className="space-y-3">
            {pedido.itens.map((item, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.nome}</p>
                  <p className="text-xs text-gray-400">x{item.quantidade} × R$ {Number(item.preco).toFixed(2)}</p>
                </div>
                <p className="text-sm font-bold text-gray-800">
                  R$ {(Number(item.preco) * item.quantidade).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-bold text-lg text-gray-900 mt-4 pt-4 border-t">
            <span>Total</span>
            <span className="text-orange-600">R$ {Number(pedido.total).toFixed(2)}</span>
          </div>
        </div>

        {/* Endereço */}
        {pedido.endereco && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-orange-600" /> Endereço de entrega
            </h2>
            <div className="text-sm text-gray-700 space-y-1">
              <p className="font-medium">{pedido.endereco.rua}, {pedido.endereco.numero}
                {pedido.endereco.complemento && ` — ${pedido.endereco.complemento}`}
              </p>
              <p>{pedido.endereco.bairro}</p>
              <p>{pedido.endereco.cidade} — {pedido.endereco.estado}</p>
              <p className="text-gray-400">CEP: {pedido.endereco.cep}</p>
            </div>
          </div>
        )}

        {/* Pagamento */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard size={18} className="text-orange-600" /> Pagamento
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Forma</span>
              <span className="font-medium">{methodLabel[pedido.metodo_pag] || pedido.metodo_pag}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Valor pago</span>
              <span className="font-bold text-green-600">R$ {Number(pedido.total).toFixed(2)}</span>
            </div>
            {pedido.pagamento && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-bold ${pedido.pagamento.status === 'aprovado' ? 'text-green-600' : 'text-red-500'}`}>
                    {pedido.pagamento.status.charAt(0).toUpperCase() + pedido.pagamento.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ID transação</span>
                  <span className="text-xs text-gray-400 truncate max-w-[180px]">{pedido.pagamento.gateway_id}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-3 print:hidden">
          <button onClick={handlePrint}
            className="flex-1 bg-gray-800 hover:bg-gray-900 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-95">
            <Printer size={20} /> Imprimir extrato
          </button>
          <button onClick={() => { sessionStorage.removeItem('pedido_id'); navigate('/'); }}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-200 active:scale-95">
            <Home size={20} /> Voltar ao menu
          </button>
        </div>

      </div>
    </div>
  );
};