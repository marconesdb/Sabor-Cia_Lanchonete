
import React from 'react';
import { MenuItem } from '../types';
import { Plus, Flame } from 'lucide-react';

interface MenuCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({ item, onAddToCart }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {item.popular && (
          <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Flame size={14} /> MAIS PEDIDO
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-gray-800 text-lg leading-tight">{item.name}</h3>
          <span className="text-orange-600 font-bold text-lg whitespace-nowrap">
            R$ {item.price.toFixed(2)}
          </span>
        </div>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{item.description}</p>
        <button 
          onClick={() => onAddToCart(item)}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors active:scale-95"
        >
          <Plus size={18} /> Adicionar
        </button>
      </div>
    </div>
  );
};
