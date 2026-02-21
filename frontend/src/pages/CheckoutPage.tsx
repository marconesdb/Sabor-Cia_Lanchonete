import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { MapPin, ArrowRight, ArrowLeft } from 'lucide-react';

const STEPS = ['Login', 'Endereço', 'Pagamento', 'Confirmação'];
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const CheckoutPage: React.FC = () => {
  const { cart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [addr, setAddr] = useState({
    street: '', number: '', complement: '',
    neighborhood: '', city: '', state: '', cep: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Criar pedido + endereço no banco
      const resPedido = await fetch(`${BACKEND_URL}/api/pedidos`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: user?.id || null,
          metodo_pag: 'cartao',
          total,
          endereco: {
            rua:         addr.street,
            numero:      addr.number,
            complemento: addr.complement,
            bairro:      addr.neighborhood,
            cidade:      addr.city,
            estado:      addr.state,
            cep:         addr.cep,
          },
          itens: cart.map(item => ({
            id:       item.id,
            name:     item.name,
            price:    item.price,
            quantity: item.quantity,
          })),
        }),
      });

      const pedido = await resPedido.json();
      if (!pedido.id) throw new Error('Erro ao criar pedido.');

      // 2. Salvar pedido_id e endereço no sessionStorage para usar no pagamento
      sessionStorage.setItem('pedido_id', pedido.id);
      sessionStorage.setItem('endereco',  JSON.stringify(addr));

      navigate('/payment');
    } catch (err: any) {
      setError(err.message || 'Erro ao processar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* Stepper */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <Link to="/" className="text-gray-400 hover:text-gray-600 mr-2"><ArrowLeft size={18} /></Link>
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <span className={`flex items-center gap-1.5 text-sm font-medium ${i <= 1 ? 'text-orange-600' : 'text-gray-400'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${i < 1 ? 'bg-green-500 text-white' : i === 1 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {i < 1 ? '✓' : i + 1}
                </span>
                <span className="hidden sm:block">{s}</span>
              </span>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 max-w-[40px] h-px ${i < 1 ? 'bg-orange-400' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Formulário de endereço */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MapPin className="text-orange-600" /> Endereço de entrega
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rua / Avenida</label>
                <input required value={addr.street} onChange={e => setAddr({ ...addr, street: e.target.value })}
                  placeholder="Ex: Av. Paulista"
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                  <input required value={addr.number} onChange={e => setAddr({ ...addr, number: e.target.value })}
                    placeholder="Ex: 1578"
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                  <input value={addr.complement} onChange={e => setAddr({ ...addr, complement: e.target.value })}
                    placeholder="Apto, bloco..."
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                  <input required value={addr.neighborhood} onChange={e => setAddr({ ...addr, neighborhood: e.target.value })}
                    placeholder="Ex: Bela Vista"
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                  <input required value={addr.cep} onChange={e => setAddr({ ...addr, cep: e.target.value })}
                    placeholder="Ex: 01310-100"
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                  <input required value={addr.city} onChange={e => setAddr({ ...addr, city: e.target.value })}
                    placeholder="Ex: São Paulo"
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <input required value={addr.state} onChange={e => setAddr({ ...addr, state: e.target.value })}
                    placeholder="Ex: SP" maxLength={2}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
              </div>

              {error && (
                <p className="bg-red-50 text-red-600 border border-red-100 p-3 rounded-2xl text-sm text-center">
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-200 active:scale-95">
                {loading ? 'Aguarde...' : <> Ir para pagamento <ArrowRight size={20} /> </>}
              </button>
            </form>
          </div>

          {/* Resumo do pedido */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 h-fit">
            <h3 className="font-bold text-gray-900 mb-4">Resumo do pedido</h3>
            <div className="space-y-3 mb-4">
              {cart.map(item => (
                <div key={item.id} className="flex gap-3">
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">x{item.quantity} — R$ {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <span className="text-orange-600">R$ {total.toFixed(2)}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};