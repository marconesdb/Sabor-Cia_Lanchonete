import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Category } from '../types';
import { MENU_ITEMS, CATEGORIES } from '../constants';
import { MenuCard }   from '../components/MenuCard';
import { CartDrawer } from '../components/CartDrawer';
import { useCart }    from '../context/CartContext';
import { useAuth }    from '../context/AuthContext';
import { ShoppingCart, UtensilsCrossed, Search, MapPin, Phone, User, LogOut } from 'lucide-react';

export const MenuPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category | 'Todos'>('Todos');
  const [isCartOpen, setIsCartOpen]         = useState(false);
  const [searchQuery, setSearchQuery]       = useState('');

  const { cart, addToCart, updateQuantity, removeFromCart, clearCart, cartCount } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const filteredItems = MENU_ITEMS.filter(item => {
    const matchesCategory = activeCategory === 'Todos' || item.category === activeCategory;
    const matchesSearch   = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCheckout = () => {
    setIsCartOpen(false);
    if (user) {
      navigate('/checkout');
    } else {
      // Passa { from: '/checkout' } para o login saber para onde redirecionar após autenticar
      navigate('/login', { state: { from: '/checkout' } });
    }
  };

  return (
    <div className="min-h-screen pb-20">

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-600 text-white p-2 rounded-2xl">
              <UtensilsCrossed size={28} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Sabor & Cia</h1>
              <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Aberto agora
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden md:flex items-center bg-gray-100 rounded-2xl px-4 py-2 w-64">
              <Search size={18} className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="O que vamos comer?"
                className="bg-transparent border-none outline-none text-sm w-full"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden md:block text-sm font-medium text-gray-700">Olá, {user.name}</span>
                <button onClick={logout} title="Sair"
                  className="bg-gray-100 hover:bg-gray-200 p-2.5 rounded-2xl transition-colors">
                  <LogOut size={20} className="text-gray-600" />
                </button>
              </div>
            ) : (
              <button onClick={() => navigate('/login')}
                className="hidden md:flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-2xl text-sm font-medium text-gray-700 transition-colors">
                <User size={16} /> Entrar
              </button>
            )}

            <button onClick={() => setIsCartOpen(true)}
              className="relative bg-gray-100 hover:bg-gray-200 p-3 rounded-2xl transition-colors">
              <ShoppingCart size={24} className="text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* Banner */}
        <div className="mb-10 relative h-64 rounded-3xl overflow-hidden shadow-xl">
          <img
            src="https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80"
            alt="Promo Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col justify-center px-8 md:px-12 text-white">
            <span className="bg-orange-600 w-fit px-3 py-1 rounded-full text-xs font-bold mb-4">OFERTA DO DIA</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-2">Combo Prime Bacon</h2>
            <p className="text-gray-200 mb-6 text-lg max-w-md">
              Burger + Batata M + Bebida por apenas <span className="text-orange-400 font-bold">R$ 45,90</span>
            </p>
            <button className="bg-white text-gray-900 w-fit px-8 py-3 rounded-2xl font-bold hover:bg-orange-50 transition-colors shadow-lg shadow-black/20">
              Aproveitar agora
            </button>
          </div>
        </div>

        {/* Categorias */}
        <div className="flex items-center gap-3 overflow-x-auto pb-6 mb-8 no-scrollbar">
          <button onClick={() => setActiveCategory('Todos')}
            className={`px-6 py-3 rounded-2xl font-semibold whitespace-nowrap transition-all ${activeCategory === 'Todos' ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'}`}>
            Todos
          </button>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-6 py-3 rounded-2xl font-semibold whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Grid de produtos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <MenuCard key={item.id} item={item} onAddToCart={addToCart} />
          ))}
          {filteredItems.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-500">
              <p className="text-lg">Não encontramos nenhum item com esse nome :(</p>
              <button onClick={() => { setSearchQuery(''); setActiveCategory('Todos'); }}
                className="mt-4 text-orange-600 font-bold underline">
                Mostrar todo o menu
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-gray-100 pt-12 pb-24 md:pb-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <UtensilsCrossed className="text-orange-600" /> Sabor & Cia
            </h4>
            <p className="text-gray-500 text-sm leading-relaxed">
              Desde 2015 trazendo o melhor hambúrguer artesanal da região. Ingredientes frescos, blend exclusivo e atendimento de primeira.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Atendimento</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="flex items-center gap-2"><Phone size={16} /> (11) 98765-4321</li>
              <li className="flex items-center gap-2"><MapPin size={16} /> Av. dos Sabores, 123 - Centro</li>
              <li>Seg - Dom: 18:00 às 23:30</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Siga-nos</h4>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-100 transition-colors">📸</div>
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-100 transition-colors">📘</div>
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-100 transition-colors">💬</div>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Cart Drawer ── */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onCheckout={handleCheckout}
      />

      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
};