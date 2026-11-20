-- ==============================================================================
-- SCHEMA E SEED COMPLETO PARA SUPABASE (POSTGRESQL)
-- Projeto: Painel de Inteligência Multi-tenant — Primora / Distribuidora Vetor
-- ==============================================================================
-- Instruções:
-- 1. Abra seu projeto no dashboard do Supabase (https://supabase.com).
-- 2. Vá na barra lateral esquerda e clique em "SQL Editor".
-- 3. Crie uma "New Query", cole todo este código e clique em "RUN".
-- ==============================================================================

-- 1. TABELA DE UNIDADES (TENANTS)
DROP TABLE IF EXISTS cliente_eventos CASCADE;
DROP TABLE IF EXISTS cliente_historico_saude CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;

CREATE TABLE tenants (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    porte TEXT NOT NULL,
    regiao TEXT NOT NULL,
    carteira_total_clientes INTEGER NOT NULL DEFAULT 0,
    risco_absoluto INTEGER NOT NULL DEFAULT 0,
    engajamento_medio NUMERIC(5, 2),
    saude_carteira JSONB NOT NULL DEFAULT '{"saudavel": 0, "atencao": 0, "risco": 0, "critico": 0}'::jsonb,
    funnel_90d JSONB NOT NULL DEFAULT '{"gerada": 0, "vista": 0, "sucesso": 0}'::jsonb,
    historico_tendencia JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE CLIENTES
CREATE TABLE clientes (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    unidade_nome TEXT NOT NULL,
    segmento TEXT NOT NULL,
    status_saude TEXT NOT NULL,
    score_saude_atual INTEGER NOT NULL CHECK (score_saude_atual BETWEEN 0 AND 100),
    tempo_contrato_meses INTEGER NOT NULL DEFAULT 0,
    ticket_medio_mensal TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    desativado_em TIMESTAMPTZ DEFAULT NULL,
    excluir_em TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE HISTÓRICO DE SAÚDE DOS CLIENTES
CREATE TABLE cliente_historico_saude (
    id BIGSERIAL PRIMARY KEY,
    cliente_id TEXT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    periodo TEXT NOT NULL,
    score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA DE EVENTOS DA JORNADA DOS CLIENTES
CREATE TABLE cliente_eventos (
    id TEXT PRIMARY KEY,
    cliente_id TEXT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    data TIMESTAMPTZ NOT NULL,
    tipo TEXT NOT NULL,
    categoria TEXT NOT NULL,
    descricao TEXT NOT NULL,
    valor NUMERIC(12, 2) DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ÍNDICES DE PERFORMANCE
CREATE INDEX idx_clientes_tenant_id ON clientes(tenant_id);
CREATE INDEX idx_historico_cliente_id ON cliente_historico_saude(cliente_id);
CREATE INDEX idx_eventos_cliente_id ON cliente_eventos(cliente_id);

-- 6. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cliente_historico_saude ENABLE ROW LEVEL SECURITY;
ALTER TABLE cliente_eventos ENABLE ROW LEVEL SECURITY;

-- 7. POLÍTICAS DE ACESSO (LEITURA E ESCRITA PÚBLICA PARA DEMONSTRAÇÃO)
CREATE POLICY "Permitir leitura pública de tenants" ON tenants FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de tenants" ON tenants FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de tenants" ON tenants FOR UPDATE USING (true);

CREATE POLICY "Permitir leitura pública de clientes" ON clientes FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de clientes" ON clientes FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de clientes" ON clientes FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de clientes" ON clientes FOR DELETE USING (true);

CREATE POLICY "Permitir leitura pública de historico" ON cliente_historico_saude FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de historico" ON cliente_historico_saude FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir leitura pública de eventos" ON cliente_eventos FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de eventos" ON cliente_eventos FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- 8. POVOAMENTO INICIAL (SEED) A PARTIR DO DATASET OFICIAL
-- ==============================================================================

-- Tenants
INSERT INTO tenants (id, nome, porte, regiao, carteira_total_clientes, risco_absoluto, engajamento_medio, saude_carteira, funnel_90d, historico_tendencia)
VALUES
(
    'tenant-sudeste',
    'Unidade Sudeste (Matriz)',
    'Grande',
    'Sudeste',
    1200,
    100,
    82.5,
    '{"saudavel": 960, "atencao": 140, "risco": 70, "critico": 30}'::jsonb,
    '{"gerada": 450, "vista": 380, "sucesso": 285}'::jsonb,
    '[
        {"mes": "Mai/2026", "engajamento": 78.0, "sucessoFunil": 59.2},
        {"mes": "Jun/2026", "engajamento": 79.5, "sucessoFunil": 60.8},
        {"mes": "Jul/2026", "engajamento": 80.2, "sucessoFunil": 61.5},
        {"mes": "Ago/2026", "engajamento": 81.0, "sucessoFunil": 62.1},
        {"mes": "Set/2026", "engajamento": 81.8, "sucessoFunil": 62.9},
        {"mes": "Out/2026", "engajamento": 82.5, "sucessoFunil": 63.3}
    ]'::jsonb
),
(
    'tenant-sul',
    'Unidade Sul',
    'Médio',
    'Sul',
    550,
    55,
    76.0,
    '{"saudavel": 410, "atencao": 85, "risco": 40, "critico": 15}'::jsonb,
    '{"gerada": 210, "vista": 175, "sucesso": 120}'::jsonb,
    '[
        {"mes": "Mai/2026", "engajamento": 72.0, "sucessoFunil": 53.0},
        {"mes": "Jun/2026", "engajamento": 73.5, "sucessoFunil": 54.2},
        {"mes": "Jul/2026", "engajamento": 74.0, "sucessoFunil": 55.0},
        {"mes": "Ago/2026", "engajamento": 75.1, "sucessoFunil": 56.4},
        {"mes": "Set/2026", "engajamento": 75.8, "sucessoFunil": 56.8},
        {"mes": "Out/2026", "engajamento": 76.0, "sucessoFunil": 57.1}
    ]'::jsonb
),
(
    'tenant-nordeste',
    'Unidade Nordeste',
    'Médio',
    'Nordeste',
    400,
    90,
    64.2,
    '{"saudavel": 240, "atencao": 70, "risco": 60, "critico": 30}'::jsonb,
    '{"gerada": 160, "vista": 110, "sucesso": 65}'::jsonb,
    '[
        {"mes": "Mai/2026", "engajamento": 68.0, "sucessoFunil": 46.5},
        {"mes": "Jun/2026", "engajamento": 67.2, "sucessoFunil": 45.0},
        {"mes": "Jul/2026", "engajamento": 66.0, "sucessoFunil": 43.8},
        {"mes": "Ago/2026", "engajamento": 65.5, "sucessoFunil": 42.1},
        {"mes": "Set/2026", "engajamento": 64.8, "sucessoFunil": 41.2},
        {"mes": "Out/2026", "engajamento": 64.2, "sucessoFunil": 40.6}
    ]'::jsonb
),
(
    'tenant-centro-oeste',
    'Unidade Centro-Oeste',
    'Pequeno',
    'Centro-Oeste',
    150,
    35,
    58.8,
    '{"saudavel": 80, "atencao": 35, "risco": 22, "critico": 13}'::jsonb,
    '{"gerada": 70, "vista": 45, "sucesso": 24}'::jsonb,
    '[
        {"mes": "Mai/2026", "engajamento": 62.0, "sucessoFunil": 38.0},
        {"mes": "Jun/2026", "engajamento": 61.0, "sucessoFunil": 37.5},
        {"mes": "Jul/2026", "engajamento": 60.5, "sucessoFunil": 36.0},
        {"mes": "Ago/2026", "engajamento": 59.8, "sucessoFunil": 35.5},
        {"mes": "Set/2026", "engajamento": 59.2, "sucessoFunil": 34.8},
        {"mes": "Out/2026", "engajamento": 58.8, "sucessoFunil": 34.3}
    ]'::jsonb
);

-- Clientes
INSERT INTO clientes (id, nome, tenant_id, unidade_nome, segmento, status_saude, score_saude_atual, tempo_contrato_meses, ticket_medio_mensal)
VALUES
(
    'CLI-001',
    'Supermercado Alvorada Ltda',
    'tenant-sudeste',
    'Unidade Sudeste (Matriz)',
    'Supermercado Regional',
    'Saudável',
    92,
    28,
    'R$ 48.500,00'
),
(
    'CLI-002',
    'Atacado Horizonte S/A',
    'tenant-nordeste',
    'Unidade Nordeste',
    'Atacado Distribuidor',
    'Risco',
    48,
    14,
    'R$ 32.200,00'
),
(
    'CLI-003',
    'Distribuidora Grão Nobre',
    'tenant-centro-oeste',
    'Unidade Centro-Oeste',
    'Cereais e Grãos',
    'Crítico',
    32,
    9,
    'R$ 19.800,00'
);

-- Histórico de Score de Saúde
INSERT INTO cliente_historico_saude (cliente_id, periodo, score)
VALUES
-- CLI-001
('CLI-001', 'Mai/2026', 82),
('CLI-001', 'Jun/2026', 85),
('CLI-001', 'Jul/2026', 88),
('CLI-001', 'Ago/2026', 89),
('CLI-001', 'Set/2026', 90),
('CLI-001', 'Out/2026', 92),
-- CLI-002
('CLI-002', 'Mai/2026', 75),
('CLI-002', 'Jun/2026', 68),
('CLI-002', 'Jul/2026', 61),
('CLI-002', 'Ago/2026', 56),
('CLI-002', 'Set/2026', 51),
('CLI-002', 'Out/2026', 48),
-- CLI-003
('CLI-003', 'Mai/2026', 60),
('CLI-003', 'Jun/2026', 52),
('CLI-003', 'Jul/2026', 45),
('CLI-003', 'Ago/2026', 41),
('CLI-003', 'Set/2026', 36),
('CLI-003', 'Out/2026', 32);

-- Eventos da Jornada
INSERT INTO cliente_eventos (id, cliente_id, data, tipo, categoria, descricao)
VALUES
-- CLI-001
('EVT-101', 'CLI-001', '2026-05-10T14:30:00Z', 'Reunião Comercial', 'comercial', 'Reunião de alinhamento com a diretoria de suprimentos para expansão do mix de produtos frigorificados.'),
('EVT-102', 'CLI-001', '2026-06-18T10:00:00Z', 'Sucesso na Tarefa', 'operacional', 'Pedido mensal de alto valor despachado e conferido no centro de distribuição com taxa de acerto de 100%.'),
('EVT-103', 'CLI-001', '2026-08-04T16:15:00Z', 'Renovação de Contrato', 'sucesso', 'Aditivo contratual de 12 meses assinado com aumento de cota em 15%.'),
('EVT-104', 'CLI-001', '2026-09-22T09:45:00Z', 'Visita Técnica', 'relacionamento', 'Visita do consultor de campo para treinamento da equipe de recebimento da filial 2.'),
('EVT-105', 'CLI-001', '2026-10-15T11:20:00Z', 'Alinhamento Trimestral', 'sucesso', 'Revisão de QBR concluída. Indicadores de NPS do cliente atingiram nota máxima (10/10).'),

-- CLI-002
('EVT-201', 'CLI-002', '2026-05-20T08:30:00Z', 'Sucesso na Tarefa', 'operacional', 'Implementação do módulo de cotação online concluído.'),
('EVT-202', 'CLI-002', '2026-07-03T15:00:00Z', 'Atraso no Pedido', 'alerta', 'Romaneio 8832 atrasou 48 horas devido a problemas logísticos na rota interestadual.'),
('EVT-203', 'CLI-002', '2026-08-12T11:10:00Z', 'Chamado Aberto', 'suporte', 'Ticket aberto reclamando de divergência nas notas fiscais de bonificação comercial.'),
('EVT-204', 'CLI-002', '2026-09-19T14:40:00Z', 'Queda no Engajamento', 'alerta', 'Nenhum pedido efetuado nos últimos 30 dias na plataforma B2B. Redução drástica de acessos.'),
('EVT-205', 'CLI-002', '2026-10-18T16:00:00Z', 'Reunião de Resgate', 'critico', 'Tentativa de contato emergencial com o comprador chefe para renegociar prazos e evitar churn.'),

-- CLI-003
('EVT-301', 'CLI-003', '2026-06-05T10:00:00Z', 'Reunião Comercial', 'comercial', 'Apresentação de novas condições de frete para a safra do segundo semestre.'),
('EVT-302', 'CLI-003', '2026-07-25T17:30:00Z', 'Inadimplência Notificada', 'critico', 'Duplicatas vencidas há mais de 25 dias sem compensação bancária.'),
('EVT-303', 'CLI-003', '2026-08-15T09:00:00Z', 'Bloqueio Temporário', 'critico', 'Conta bloqueada temporariamente para novas faturas pelo departamento financeiro da Matriz.'),
('EVT-304', 'CLI-003', '2026-09-10T14:15:00Z', 'Tentativa de Renegociação', 'alerta', 'Proposta de parcelamento do saldo devedor enviada por e-mail com resposta pendente.'),
('EVT-305', 'CLI-003', '2026-10-21T15:50:00Z', 'Alerta de Churn', 'critico', 'Cliente sinalizou interesse em romper parceria com acionamento do departamento jurídico.');
