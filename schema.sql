-- ─────────────────────────────────────
-- 1. ADMINS
-- ─────────────────────────────────────
CREATE TABLE `admins` (
  `id`         int          NOT NULL AUTO_INCREMENT,
  `nome`       varchar(100) NOT NULL,
  `email`      varchar(150) NOT NULL,
  `senha_hash` varchar(255) NOT NULL,
  `criado_em`  datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

-- ─────────────────────────────────────
-- 2. USUÁRIOS
-- ─────────────────────────────────────
CREATE TABLE `usuarios` (
  `id`              int          NOT NULL AUTO_INCREMENT,
  `nome`            varchar(150) NOT NULL,
  `email`           varchar(150) NOT NULL,
  `senha_hash`      varchar(255) NOT NULL,
  `telefone`        varchar(20)      NULL,
  `reset_token`     varchar(512)     NULL,
  `reset_token_exp` datetime         NULL,
  `criado_em`       datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

-- ─────────────────────────────────────
-- 3. CATEGORIAS
-- ─────────────────────────────────────
CREATE TABLE `categorias` (
  `id`   int          NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ─────────────────────────────────────
-- 4. PRODUTOS
-- ─────────────────────────────────────
CREATE TABLE `produtos` (
  `id`           int           NOT NULL AUTO_INCREMENT,
  `categoria_id` int               NULL,
  `nome`         varchar(150)  NOT NULL,
  `descricao`    text              NULL,
  `preco`        decimal(10,2) NOT NULL,
  `imagem_url`   varchar(500)      NULL,
  `disponivel`   tinyint(1)    NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `categoria_id` (`categoria_id`),
  CONSTRAINT `produtos_ibfk_1` FOREIGN KEY (`categoria_id`)
    REFERENCES `categorias` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ─────────────────────────────────────
-- 5. ENDEREÇOS
-- ─────────────────────────────────────
CREATE TABLE `enderecos` (
  `id`          int          NOT NULL AUTO_INCREMENT,
  `usuario_id`  int              NULL,
  `rua`         varchar(200) NOT NULL,
  `numero`      varchar(20)  NOT NULL,
  `complemento` varchar(100)     NULL,
  `bairro`      varchar(100) NOT NULL,
  `cidade`      varchar(100) NOT NULL,
  `estado`      varchar(2)   NOT NULL,
  `cep`         varchar(9)   NOT NULL,
  `principal`   tinyint(1)   NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `enderecos_ibfk_1` FOREIGN KEY (`usuario_id`)
    REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8;

-- ─────────────────────────────────────
-- 6. PEDIDOS
-- ─────────────────────────────────────
CREATE TABLE `pedidos` (
  `id`          int           NOT NULL AUTO_INCREMENT,
  `usuario_id`  int               NULL,
  `endereco_id` int               NULL,
  `metodo_pag`  varchar(50)   NOT NULL,
  `total`       decimal(10,2) NOT NULL,
  `status`      varchar(50)   NOT NULL DEFAULT 'pendente',
  `observacao`  text              NULL,
  `criado_em`   datetime      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id`  (`usuario_id`),
  KEY `endereco_id` (`endereco_id`),
  CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`usuario_id`)
    REFERENCES `usuarios`  (`id`) ON DELETE SET NULL,
  CONSTRAINT `pedidos_ibfk_2` FOREIGN KEY (`endereco_id`)
    REFERENCES `enderecos` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8;

-- ─────────────────────────────────────
-- 7. ITENS DO PEDIDO
-- ─────────────────────────────────────
CREATE TABLE `pedido_itens` (
  `id`         int           NOT NULL AUTO_INCREMENT,
  `pedido_id`  int           NOT NULL,
  `produto_id` int               NULL,
  `nome`       varchar(150)  NOT NULL,
  `preco`      decimal(10,2) NOT NULL,
  `quantidade` int           NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `pedido_id` (`pedido_id`),
  CONSTRAINT `pedido_itens_ibfk_1` FOREIGN KEY (`pedido_id`)
    REFERENCES `pedidos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8;

-- ─────────────────────────────────────
-- 8. PAGAMENTOS
-- ─────────────────────────────────────
CREATE TABLE `pagamentos` (
  `id`         int           NOT NULL AUTO_INCREMENT,
  `pedido_id`  int           NOT NULL,
  `gateway`    varchar(50)   NOT NULL,
  `gateway_id` varchar(255)      NULL,
  `status`     varchar(50)   NOT NULL,
  `valor`      decimal(10,2) NOT NULL,
  `criado_em`  datetime      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `pedido_id` (`pedido_id`),
  CONSTRAINT `pagamentos_ibfk_1` FOREIGN KEY (`pedido_id`)
    REFERENCES `pedidos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;
