# 🍔 Sabor & Cia — Lanchonete Online

Sistema completo de pedidos online para lanchonete, com cardápio interativo, carrinho, autenticação de usuários e pagamento via Stripe.

---

## 🚀 Tecnologias

**Frontend**
- React + TypeScript
- Vite
- React Router DOM
- Tailwind CSS
- Lucide React (ícones)

**Backend**
- Node.js + Express
- PostgreSQL
- JWT (autenticação)
- Stripe (pagamentos)
- Nodemailer (recuperação de senha)

**Deploy**
- Frontend: Vercel
- Backend: Render
- Banco de dados: Clever Cloud (PostgreSQL)

---

## ✨ Funcionalidades

- 🛒 Cardápio com categorias e busca em tempo real
- 🛍️ Carrinho de compras com drawer lateral
- 👤 Cadastro e login de usuários
- 🔐 Rotas protegidas com autenticação JWT
- 📍 Cadastro de endereço de entrega
- 💳 Pagamento com cartão via Stripe
- ✅ Página de confirmação de pedido
- 🔑 Recuperação de senha por e-mail
- 🧑‍💼 Painel administrativo

---

## 📁 Estrutura do Projeto

```
SaborCia_Lanchonete/
├── frontend/
│   ├── src/
│   │   ├── components/      # CartDrawer, MenuCard, ProtectedRoute...
│   │   ├── context/         # AuthContext, CartContext
│   │   ├── pages/           # MenuPage, LoginPage, CheckoutPage...
│   │   ├── types/           # Tipagens TypeScript
│   │   └── constants/       # Itens do menu, categorias
│   └── .env
└── backend/
    ├── server.js
    ├── routes/              # usuarios, pedidos, pagamentos
    └── .env
```

---

## ⚙️ Como rodar localmente

### Pré-requisitos
- Node.js 18+
- PostgreSQL
- Conta no Stripe (para pagamentos)

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/sabor-e-cia.git
cd sabor-e-cia
```

### 2. Configure o Backend

```bash
cd backend
npm install
```

Crie o arquivo `.env`:

```env
PORT=3001
DATABASE_URL=postgresql://usuario:senha@localhost:5432/saborcia
JWT_SECRET=sua_chave_secreta
STRIPE_SECRET_KEY=sk_test_...
EMAIL_USER=seu@email.com
EMAIL_PASS=sua_senha_email
```

Inicie o servidor:

```bash
node server.js
```

### 3. Configure o Frontend

```bash
cd frontend
npm install
```

Crie o arquivo `.env`:

```env
VITE_API_URL=http://localhost:3001
```

Inicie o frontend:

```bash
npm run dev
```

Acesse em: `http://localhost:5173`

---

## 🌐 Deploy

| Serviço | Plataforma | URL |
|---|---|---|
| Frontend | Vercel | `https://seu-projeto.vercel.app` |
| Backend | Render | `https://seu-backend.onrender.com` |
| Banco de dados | Clever Cloud | PostgreSQL gerenciado |

> ⚠️ Lembre-se de configurar as variáveis de ambiente nos painéis de cada plataforma.

---

## 📸 Screenshots

> *(Adicione prints do cardápio, carrinho e checkout aqui)*

---

## 📄 Licença

Este projeto é de uso educacional/pessoal. Sinta-se livre para usar como base para seus próprios projetos.
