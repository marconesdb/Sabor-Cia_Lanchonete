export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: Category;
  popular?: boolean;
}

export type Category = 'Burgers' | 'Hot Dogs' | 'Bebidas' | 'Sobremesas' | 'Acompanhamentos';

export interface CartItem extends MenuItem {
  quantity: number;
}

// A interface abaixo foi removida pois era usada apenas pelo Chat IA
// export interface ChatMessage {
//   role: 'user' | 'model';
//   text: string;
// }
