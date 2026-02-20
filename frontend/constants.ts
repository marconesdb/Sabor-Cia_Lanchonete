
import { MenuItem, Category } from './types';

export const CATEGORIES: Category[] = ['Burgers', 'Hot Dogs', 'Acompanhamentos', 'Bebidas', 'Sobremesas'];

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'b1',
    name: 'Mega Bacon Monster',
    description: 'Pão brioche, 2 blends de 150g, muito bacon crocante, cheddar duplo e maionese defumada.',
    price: 38.90,
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=400&q=80',
    category: 'Burgers',
    popular: true
  },
  {
    id: 'b2',
    name: 'Clássico Sabor',
    description: 'Hambúrguer de 120g, queijo prato, alface, tomate e picles da casa.',
    price: 24.50,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80',
    category: 'Burgers'
  },
  {
    id: 'h1',
    name: 'Hot Dog Especial',
    description: 'Pão macio, duas salsichas, purê de batata, vinagrete, milho e batata palha premium.',
    price: 18.00,
    image: 'https://images.pexels.com/photos/1603901/pexels-photo-1603901.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Hot Dogs',
    popular: true
  },
  {
    id: 'a1',
    name: 'Batata Rústica',
    description: 'Batatas com casca temperadas com alecrim, páprica e sal grosso.',
    price: 15.90,
    image: 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Acompanhamentos'
  },
  {
    id: 'd1',
    name: 'Coca-Cola 350ml',
    description: 'Lata gelada.',
    price: 6.50,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80',
    category: 'Bebidas'
  },
  {
    id: 's1',
    name: 'Petit Gâteau',
    description: 'Bolinho quente de chocolate com sorvete de baunilha e calda.',
    price: 22.00,
    image: 'https://images.pexels.com/photos/3026807/pexels-photo-3026807.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Sobremesas'
  }
];
