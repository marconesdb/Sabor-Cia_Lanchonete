import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export const ConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const orderId  = useMemo(() => Math.floor(Math.random() * 90000) + 10000, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 w-full max-w-lg text-center">

        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-5 rounded-full">
            <CheckCircle size={64} className="text-green-500" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pedido confirmado! 🎉</h1>
        <p className="text-gray-500 mb-8">
          Seu pedido <strong className="text-gray-800">#{orderId}</strong> foi recebido pela cozinha
          e está sendo preparado com carinho.
        </p>

        <div className="bg-orange-50 rounded-2xl p-5 mb-8 border border-orange-100">
          <p className="text-orange-700 font-semibold text-lg">⏱ Tempo estimado: 30–45 minutos</p>
          <p className="text-orange-500 text-sm mt-1">Você receberá atualizações via WhatsApp</p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-orange-200 active:scale-95"
        >
          Fazer novo pedido
        </button>
      </div>
    </div>
  );
};