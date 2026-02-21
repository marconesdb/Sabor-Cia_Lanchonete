import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../context/CartContext';
import { CreditCard, QrCode, Banknote, ArrowLeft } from 'lucide-react';

// 🔑 Publishable Key do Stripe
const stripePromise = loadStripe('pk_test_51T31y0POzCGlO8TZqkx0tEoXVVXQDjfkWkgbDttvHz26ff1kTFcqpy6aQKv9wlPz3E8Asqpsq3d1ruoRlZTY87fH00txouizcC');

const BACKEND_URL = 'http://localhost:3001';

type PayMethod = 'card' | 'pix' | 'cash';
const STEPS = ['Login', 'Endereço', 'Pagamento', 'Confirmação'];

// ── Formulário de cartão com Stripe ──
const CardForm: React.FC<{ total: number }> = ({ total }) => {
  const stripe     = useStripe();
  const elements   = useElements();
  const navigate   = useNavigate();
  const { clearCart } = useCart() as any;
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');

    try {
      const cardElement = elements.getElement(CardElement) as any;
      if (!cardElement) throw new Error('Elemento de cartão não encontrado.');

      // Cria token do cartão
      const { token, error: stripeError } = await stripe.createToken(cardElement);
      if (stripeError) throw new Error(stripeError.message);

      const pedido_id = sessionStorage.getItem('pedido_id');

      const res = await fetch(`${BACKEND_URL}/api/payment`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token:              token?.id,
          transaction_amount: total,
          payer:              { email },
          pedido_id:          pedido_id ? Number(pedido_id) : null,
        }),
      });

      const data = await res.json();

      if (data.status === 'approved') {
        clearCart();
        navigate('/confirmation');
      } else {
        setError('Pagamento recusado. Verifique os dados e tente novamente.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar pagamento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="seu@email.com"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Dados do cartão</label>
        <div className="border border-gray-300 rounded-xl px-4 py-3">
          <CardElement options={{
            style: {
              base:    { fontSize: '16px', color: '#1f2937', '::placeholder': { color: '#9ca3af' } },
              invalid: { color: '#ef4444' },
            },
          }} />
        </div>
      </div>

      {error && (
        <p className="bg-red-50 text-red-600 border border-red-100 p-3 rounded-2xl text-sm text-center">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !stripe}
        className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-orange-200 active:scale-95"
      >
        {loading ? 'Processando...' : `Pagar R$ ${total.toFixed(2)}`}
      </button>
    </form>
  );
};

// ── Página principal ──
export const PaymentPage: React.FC = () => {
  const { cart, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [method,  setMethod]  = useState<PayMethod>('card');
  const [loading, setLoading] = useState(false);

  const handleSimplePay = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    clearCart();
    navigate('/confirmation');
  };

  const methods = [
    { id: 'card' as const, label: 'Cartão de crédito/débito', icon: CreditCard },
    { id: 'pix'  as const, label: 'PIX',                      icon: QrCode     },
    { id: 'cash' as const, label: 'Dinheiro na entrega',      icon: Banknote   },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* Stepper */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <button onClick={() => navigate('/checkout')} className="text-gray-400 hover:text-gray-600 mr-2">
            <ArrowLeft size={18} />
          </button>
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <span className={`flex items-center gap-1.5 text-sm font-medium ${i <= 2 ? 'text-orange-600' : 'text-gray-400'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${i < 2 ? 'bg-green-500 text-white' : i === 2 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {i < 2 ? '✓' : i + 1}
                </span>
                <span className="hidden sm:block">{s}</span>
              </span>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 max-w-[40px] h-px ${i < 2 ? 'bg-orange-400' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">

          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <CreditCard className="text-orange-600" /> Forma de pagamento
            </h2>

            {/* Seletor de método */}
            <div className="space-y-3 mb-6">
              {methods.map(({ id, label, icon: Icon }) => (
                <button key={id} type="button" onClick={() => setMethod(id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left
                    ${method === id ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <Icon size={20} className={method === id ? 'text-orange-600' : 'text-gray-400'} />
                  <span className={`font-medium text-sm flex-1 ${method === id ? 'text-orange-700' : 'text-gray-600'}`}>{label}</span>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${method === id ? 'border-orange-500' : 'border-gray-300'}`}>
                    {method === id && <div className="w-2 h-2 rounded-full bg-orange-500" />}
                  </div>
                </button>
              ))}
            </div>

            {/* ── CARTÃO: Stripe ── */}
            {method === 'card' && (
              <Elements stripe={stripePromise}>
                <CardForm total={total} />
              </Elements>
            )}

            {/* ── PIX ── */}
            {method === 'pix' && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100">
                  <div className="w-36 h-36 bg-white border-2 border-gray-200 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-inner">
                    <span className="text-5xl">📱</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Chave PIX</p>
                  <p className="font-mono font-bold text-gray-800">sabor@cia.com.br</p>
                  <p className="text-xs text-gray-400 mt-3">Confirmação automática após pagamento</p>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-orange-600">R$ {total.toFixed(2)}</span>
                </div>
                <button onClick={handleSimplePay} disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-green-200 active:scale-95">
                  {loading ? 'Confirmando...' : 'Já realizei o pagamento'}
                </button>
              </div>
            )}

            {/* ── DINHEIRO ── */}
            {method === 'cash' && (
              <div className="space-y-4">
                <div className="bg-orange-50 rounded-2xl p-6 text-center border border-orange-100">
                  <p className="text-orange-700 font-medium text-lg">Tenha o valor ou troco para</p>
                  <p className="text-3xl font-bold text-orange-600 mt-1">R$ {total.toFixed(2)}</p>
                  <p className="text-orange-500 text-sm mt-2">O entregador levará a maquininha</p>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-orange-600">R$ {total.toFixed(2)}</span>
                </div>
                <button onClick={handleSimplePay} disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-green-200 active:scale-95">
                  {loading ? 'Confirmando...' : 'Confirmar Pedido'}
                </button>
                <p className="text-center text-xs text-gray-400">🔒 Pagamento 100% seguro</p>
              </div>
            )}
          </div>

          {/* Resumo */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 h-fit">
            <h3 className="font-bold text-gray-900 mb-4">Resumo do pedido</h3>
            <div className="space-y-3 mb-4">
              {cart.map((item: any) => (
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