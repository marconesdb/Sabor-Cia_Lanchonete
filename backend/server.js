require('dotenv').config();

const express  = require('express');
const cors     = require('cors');
const mysql    = require('mysql2/promise');
const stripe   = require('stripe')(process.env.STRIPE_SECRET_KEY);
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

const app = express();
app.use(express.json());
app.use(cors());

// ── Conexão MySQL ──
const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit:    10,
});

pool.getConnection()
  .then(conn => { console.log('✅ MySQL conectado!'); conn.release(); })
  .catch(err  => {
    console.error('❌ Erro MySQL:', err.message);
    console.error('❌ Código:', err.code);
  });

// ── Middleware autenticação admin ──
const authAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido.' });
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido.' });
  }
};

// ────────────────────────────────────────────
// ADMIN — LOGIN
// ────────────────────────────────────────────

app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ error: 'Email e senha obrigatórios.' });

    const [rows] = await pool.query('SELECT * FROM admins WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ error: 'Credenciais inválidas.' });

    const admin = rows[0];
    const ok = await bcrypt.compare(senha, admin.senha_hash);
    if (!ok) return res.status(401).json({ error: 'Credenciais inválidas.' });

    const token = jwt.sign({ id: admin.id, nome: admin.nome, email: admin.email }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, nome: admin.nome });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ────────────────────────────────────────────
// ADMIN — PEDIDOS
// ────────────────────────────────────────────

app.get('/api/admin/pedidos', authAdmin, async (req, res) => {
  try {
    const [pedidos] = await pool.query(`
      SELECT p.*, 
             u.nome AS cliente_nome, u.email AS cliente_email, u.telefone AS cliente_telefone,
             e.rua, e.numero, e.bairro, e.cidade, e.estado, e.cep, e.complemento,
             pg.status AS pag_status, pg.gateway_id, pg.valor AS pag_valor, pg.gateway
      FROM pedidos p
      LEFT JOIN usuarios  u  ON p.usuario_id  = u.id
      LEFT JOIN enderecos e  ON p.endereco_id = e.id
      LEFT JOIN pagamentos pg ON pg.pedido_id = p.id
      ORDER BY p.criado_em DESC
    `);
    for (const p of pedidos) {
      const [itens] = await pool.query('SELECT * FROM pedido_itens WHERE pedido_id = ?', [p.id]);
      p.itens = itens;
    }
    res.json(pedidos);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/admin/pedidos/:id/status', authAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validos = ['pendente','confirmado','em_preparo','em_entrega','entregue','cancelado'];
    if (!validos.includes(status)) return res.status(400).json({ error: 'Status inválido.' });
    await pool.query('UPDATE pedidos SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/relatorio', authAdmin, async (req, res) => {
  try {
    const [[totais]] = await pool.query(`
      SELECT
        COUNT(*)                                          AS total_pedidos,
        SUM(total)                                        AS receita_total,
        SUM(CASE WHEN status = 'entregue'   THEN 1 END)  AS entregues,
        SUM(CASE WHEN status = 'cancelado'  THEN 1 END)  AS cancelados,
        SUM(CASE WHEN status = 'pendente'   THEN 1 END)  AS pendentes,
        SUM(CASE WHEN status = 'em_preparo' THEN 1 END)  AS em_preparo
      FROM pedidos
    `);
    const [porDia] = await pool.query(`
      SELECT DATE(criado_em) AS dia, COUNT(*) AS pedidos, SUM(total) AS receita
      FROM pedidos
      GROUP BY DATE(criado_em)
      ORDER BY dia DESC
      LIMIT 7
    `);
    res.json({ totais, porDia });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ────────────────────────────────────────────
// PRODUTOS
// ────────────────────────────────────────────

app.get('/api/produtos', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, c.nome AS categoria
      FROM produtos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.disponivel = true
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/produtos/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM produtos WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Produto não encontrado.' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ────────────────────────────────────────────
// USUÁRIOS
// ────────────────────────────────────────────

// Login usuário
app.post('/api/usuarios/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ error: 'Email e senha obrigatórios.' });

    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ error: 'E-mail ou senha inválidos.' });

    const usuario = rows[0];
    const ok = await bcrypt.compare(senha, usuario.senha_hash);
    if (!ok) return res.status(401).json({ error: 'E-mail ou senha inválidos.' });

    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, email: usuario.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, user: { id: usuario.id, nome: usuario.nome, email: usuario.email } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Cadastrar usuário
app.post('/api/usuarios', async (req, res) => {
  try {
    const { nome, email, senha, telefone } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
    if (senha.length < 6) return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres.' });

    const [exist] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (exist.length) return res.status(409).json({ error: 'Email já cadastrado.' });

    const hash = await bcrypt.hash(senha, 10);
    const [result] = await pool.query(
      'INSERT INTO usuarios (nome, email, senha_hash, telefone) VALUES (?, ?, ?, ?)',
      [nome, email, hash, telefone || null]
    );
    res.status(201).json({ id: result.insertId, nome, email });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Buscar usuário por ID
app.get('/api/usuarios/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nome, email, telefone, criado_em FROM usuarios WHERE id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Recuperar senha — envia token (adicione envio de e-mail real aqui)
app.post('/api/usuarios/recuperar-senha', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'E-mail obrigatório.' });

    const [rows] = await pool.query('SELECT id, nome FROM usuarios WHERE email = ?', [email]);

    // Sempre retorna 200 por segurança (não revela se o e-mail existe)
    if (!rows.length) return res.json({ ok: true });

    const usuario = rows[0];

    // Gera token temporário (válido por 1h)
    const token = jwt.sign(
      { id: usuario.id, email, tipo: 'recuperacao' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Salva o token no banco
    await pool.query(
      'UPDATE usuarios SET reset_token = ?, reset_token_exp = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id = ?',
      [token, usuario.id]
    );

    // TODO: substituir pelo envio real de e-mail (ex: Nodemailer / Resend)
    // Link para o usuário: http://localhost:3000/resetar-senha?token=${token}
    console.log(`🔑 Token de recuperação para ${email}: ${token}`);

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Resetar senha com token
app.post('/api/usuarios/resetar-senha', async (req, res) => {
  try {
    const { token, novaSenha } = req.body;
    if (!token || !novaSenha) return res.status(400).json({ error: 'Token e nova senha obrigatórios.' });
    if (novaSenha.length < 6) return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres.' });

    // Verifica o token JWT
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(400).json({ error: 'Token inválido ou expirado.' });
    }

    if (payload.tipo !== 'recuperacao') return res.status(400).json({ error: 'Token inválido.' });

    // Verifica se o token ainda está salvo no banco (não foi usado)
    const [rows] = await pool.query(
      'SELECT id FROM usuarios WHERE id = ? AND reset_token = ? AND reset_token_exp > NOW()',
      [payload.id, token]
    );
    if (!rows.length) return res.status(400).json({ error: 'Token inválido ou já utilizado.' });

    const hash = await bcrypt.hash(novaSenha, 10);
    await pool.query(
      'UPDATE usuarios SET senha_hash = ?, reset_token = NULL, reset_token_exp = NULL WHERE id = ?',
      [hash, payload.id]
    );

    res.json({ ok: true, message: 'Senha alterada com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ────────────────────────────────────────────
// ENDEREÇOS
// ────────────────────────────────────────────

app.post('/api/usuarios/:id/enderecos', async (req, res) => {
  try {
    const { rua, numero, complemento, bairro, cidade, estado, cep, principal } = req.body;
    const usuario_id = req.params.id;
    if (principal) {
      await pool.query('UPDATE enderecos SET principal = FALSE WHERE usuario_id = ?', [usuario_id]);
    }
    const [result] = await pool.query(
      'INSERT INTO enderecos (usuario_id, rua, numero, complemento, bairro, cidade, estado, cep, principal) VALUES (?,?,?,?,?,?,?,?,?)',
      [usuario_id, rua, numero, complemento || null, bairro, cidade, estado, cep, principal || false]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/usuarios/:id/enderecos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM enderecos WHERE usuario_id = ?', [req.params.id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ────────────────────────────────────────────
// PEDIDOS
// ────────────────────────────────────────────

app.post('/api/pedidos', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    console.log('📦 Body recebido em /api/pedidos:', JSON.stringify(req.body, null, 2));
    await conn.beginTransaction();

    const { usuario_id, metodo_pag, total, observacao, itens, endereco } = req.body;

    if (!itens || !itens.length) {
      await conn.rollback();
      return res.status(400).json({ error: 'Pedido sem itens.' });
    }

    let endereco_id = null;
    if (endereco && endereco.rua) {
      console.log('📍 Salvando endereço:', endereco);
      const [endRes] = await conn.query(
        'INSERT INTO enderecos (usuario_id, rua, numero, complemento, bairro, cidade, estado, cep, principal) VALUES (?,?,?,?,?,?,?,?,?)',
        [usuario_id || null, endereco.rua, endereco.numero, endereco.complemento || null, endereco.bairro, endereco.cidade, endereco.estado, endereco.cep, false]
      );
      endereco_id = endRes.insertId;
      console.log('✅ Endereço salvo com id:', endereco_id);
    } else {
      console.warn('⚠️ Endereço não recebido ou incompleto:', endereco);
    }

    const [pedido] = await conn.query(
      'INSERT INTO pedidos (usuario_id, endereco_id, metodo_pag, total, observacao) VALUES (?,?,?,?,?)',
      [usuario_id || null, endereco_id, metodo_pag, total, observacao || null]
    );
    const pedido_id = pedido.insertId;

    for (const item of itens) {
      await conn.query(
        'INSERT INTO pedido_itens (pedido_id, produto_id, nome, preco, quantidade) VALUES (?,?,?,?,?)',
        [pedido_id, null, item.name, item.price, item.quantity]
      );
    }

    await conn.commit();
    console.log('✅ Pedido criado com id:', pedido_id);
    res.status(201).json({ id: pedido_id });
  } catch (err) {
    await conn.rollback();
    console.error('❌ Erro ao criar pedido:', err.message);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

app.get('/api/pedidos/:id', async (req, res) => {
  try {
    const [pedidos] = await pool.query(`
      SELECT p.*, u.nome AS cliente_nome, u.email AS cliente_email, u.telefone AS cliente_telefone
      FROM pedidos p
      LEFT JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.id = ?
    `, [req.params.id]);
    if (!pedidos.length) return res.status(404).json({ error: 'Pedido não encontrado.' });

    const pedido = pedidos[0];
    const [itens] = await pool.query('SELECT * FROM pedido_itens WHERE pedido_id = ?', [pedido.id]);
    pedido.itens = itens;

    if (pedido.endereco_id) {
      const [end] = await pool.query('SELECT * FROM enderecos WHERE id = ?', [pedido.endereco_id]);
      pedido.endereco = end[0] || null;
    } else {
      pedido.endereco = null;
    }

    const [pag] = await pool.query('SELECT * FROM pagamentos WHERE pedido_id = ? LIMIT 1', [pedido.id]);
    pedido.pagamento = pag[0] || null;

    res.json(pedido);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/pedidos/usuario/:id', async (req, res) => {
  try {
    const [pedidos] = await pool.query(
      'SELECT * FROM pedidos WHERE usuario_id = ? ORDER BY criado_em DESC',
      [req.params.id]
    );
    for (const p of pedidos) {
      const [itens] = await pool.query('SELECT * FROM pedido_itens WHERE pedido_id = ?', [p.id]);
      p.itens = itens;
    }
    res.json(pedidos);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ────────────────────────────────────────────
// PAGAMENTO (Stripe)
// ────────────────────────────────────────────

app.post('/api/payment', async (req, res) => {
  try {
    console.log('📦 Dados recebidos em /api/payment:', JSON.stringify(req.body, null, 2));

    const { token, transaction_amount, payer, pedido_id } = req.body;
    if (!token) return res.status(400).json({ error: 'Token do cartão não recebido.' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount:              Math.round(transaction_amount * 100),
      currency:            'brl',
      payment_method_data: { type: 'card', card: { token } },
      confirm:             true,
      return_url:          'http://localhost:3000/confirmation',
      receipt_email:       payer?.email,
      description:         'Pedido Sabor & Cia',
    });

    const status = paymentIntent.status === 'succeeded' ? 'aprovado' : 'recusado';

    if (pedido_id) {
      await pool.query(
        'INSERT INTO pagamentos (pedido_id, gateway, gateway_id, status, valor) VALUES (?,?,?,?,?)',
        [pedido_id, 'stripe', paymentIntent.id, status, transaction_amount]
      );
      if (status === 'aprovado') {
        await pool.query('UPDATE pedidos SET status = ? WHERE id = ?', ['confirmado', pedido_id]);
      }
    }

    console.log('✅ Pagamento:', status);
    res.json({ status: status === 'aprovado' ? 'approved' : 'rejected', id: paymentIntent.id });

  } catch (err) {
    console.error('❌ Erro no pagamento:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.listen(3001, () => console.log('✅ Backend rodando em http://localhost:3001'));