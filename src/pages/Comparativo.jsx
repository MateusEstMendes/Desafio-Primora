import React, { useMemo, useState } from 'react';
import {
  Table,
  Card,
  Row,
  Col,
  Tag,
  Typography,
  Space,
  Alert,
  Tooltip,
  Progress,
  Radio
} from 'antd';
import {
  BarChartOutlined,
  TableOutlined,
  InfoCircleOutlined,
  TrophyOutlined,
  WarningOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ComposedChart,
  Line
} from 'recharts';
import {
  classificarUnidadesPorRisco,
  formatarNumero
} from '../utils/metrics';

const { Title, Text, Paragraph } = Typography;

export default function Comparativo({ dataset, isMobile = false }) {
  const [tipoGrafico, setTipoGrafico] = useState('composto'); // 'composto' ou 'barras'

  const tenants = dataset?.tenants || [];

  // Dados enriquecidos com cálculos proporcionais e ranking
  const dadosClassificados = useMemo(() => {
    return classificarUnidadesPorRisco(tenants);
  }, [tenants]);

  // Colunas da Tabela (RF05, RF06, RF12)
  const columns = [
    {
      title: 'Ranking',
      dataIndex: 'posicaoRankingRisco',
      key: 'posicaoRankingRisco',
      width: 110,
      sorter: (a, b) => a.posicaoRankingRisco - b.posicaoRankingRisco,
      defaultSortOrder: 'ascend',
      render: (pos) => {
        const cores = { 1: '#ef4444', 2: '#f97316', 3: '#f59e0b', 4: '#10b981' };
        return (
          <Tag color={cores[pos] || 'default'} style={{ fontWeight: 'bold' }}>
            #{pos}º Lugar
          </Tag>
        );
      }
    },
    {
      title: 'Unidade Regional',
      dataIndex: 'nome',
      key: 'nome',
      width: 200,
      render: (nome, record) => (
        <div>
          <Text strong style={{ color: '#0f172a' }}>{nome}</Text>
          <div>
            <Text type="secondary" style={{ fontSize: 11 }}>Região: {record.regiao}</Text>
          </div>
        </div>
      )
    },
    {
      title: 'Porte',
      dataIndex: 'porte',
      key: 'porte',
      width: 100,
      filters: [
        { text: 'Grande', value: 'Grande' },
        { text: 'Médio', value: 'Médio' },
        { text: 'Pequeno', value: 'Pequeno' }
      ],
      onFilter: (value, record) => record.porte === value,
      render: (porte) => (
        <Tag
          style={{
            backgroundColor: porte === 'Grande' ? '#fef3c7' : porte === 'Médio' ? '#e0f2fe' : '#dcfce7',
            color: porte === 'Grande' ? '#b45309' : porte === 'Médio' ? '#0369a1' : '#15803d',
            border: 'none',
            fontWeight: 600
          }}
        >
          {porte}
        </Tag>
      )
    },
    {
      title: 'Carteira Total',
      dataIndex: 'carteiraTotalClientes',
      key: 'carteiraTotalClientes',
      width: 130,
      sorter: (a, b) => a.carteiraTotalClientes - b.carteiraTotalClientes,
      render: (total) => `${formatarNumero(total)} clientes`
    },
    {
      title: (
        <Space size={4}>
          <span>Risco Absoluto</span>
          <Tooltip title="Soma simples de clientes em Risco + Crítico. Quantidade bruta de contas em perigo.">
            <InfoCircleOutlined style={{ color: '#94a3b8' }} />
          </Tooltip>
        </Space>
      ),
      dataIndex: 'riscoAbsolutoCalculado',
      key: 'riscoAbsolutoCalculado',
      width: 140,
      sorter: (a, b) => a.riscoAbsolutoCalculado - b.riscoAbsolutoCalculado,
      render: (risco, record) => (
        <div>
          <Text strong style={{ color: '#ef4444' }}>{risco} clientes</Text>
          <div>
            <Text type="secondary" style={{ fontSize: 11 }}>
              ({record.saudeCarteira?.risco} risco / {record.saudeCarteira?.critico} crítico)
            </Text>
          </div>
        </div>
      )
    },
    {
      title: (
        <Space size={4}>
          <span>Taxa Proporcional de Risco</span>
          <Tooltip title="Fórmula: ((Risco + Crítico) / Carteira Total) × 100. Revela o impacto real relativo ao porte.">
            <InfoCircleOutlined style={{ color: '#94a3b8' }} />
          </Tooltip>
        </Space>
      ),
      dataIndex: 'taxaRiscoProporcional',
      key: 'taxaRiscoProporcional',
      width: 160,
      sorter: (a, b) => a.taxaRiscoProporcional - b.taxaRiscoProporcional,
      render: (taxa) => {
        let cor = '#10b981';
        if (taxa > 20) cor = '#ef4444';
        else if (taxa > 10) cor = '#f59e0b';

        return (
          <div style={{ width: 120 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <Text strong style={{ color: cor }}>{taxa}%</Text>
            </div>
            <Progress percent={taxa} size="small" strokeColor={cor} showInfo={false} />
          </div>
        );
      }
    },
    {
      title: (
        <Space size={4}>
          <span>Sucesso no Funil</span>
          <Tooltip title="Fórmula: (Sucesso / Geradas) × 100 no ciclo de 90 dias.">
            <InfoCircleOutlined style={{ color: '#94a3b8' }} />
          </Tooltip>
        </Space>
      ),
      dataIndex: 'taxaConversaoFunil',
      key: 'taxaConversaoFunil',
      width: 140,
      sorter: (a, b) => a.taxaConversaoFunil - b.taxaConversaoFunil,
      render: (taxa, record) => (
        <div>
          <Text strong style={{ color: '#684cb1' }}>{taxa}%</Text>
          <div>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {record.funnel90d?.sucesso} de {record.funnel90d?.gerada}
            </Text>
          </div>
        </div>
      )
    },
    {
      title: 'Engajamento',
      dataIndex: 'engajamentoMedio',
      key: 'engajamentoMedio',
      width: 120,
      sorter: (a, b) => a.engajamentoMedio - b.engajamentoMedio,
      render: (eng) => `${eng}%`
    },
    {
      title: 'Ação Recomendada',
      key: 'acao',
      width: 170,
      render: (_, record) => {
        if (record.taxaRiscoProporcional > 22) {
          return <Tag color="error" style={{ fontWeight: 600 }}>Intervenção Imediata</Tag>;
        }
        if (record.taxaRiscoProporcional > 10) {
          return <Tag color="warning" style={{ fontWeight: 600 }}>Atenção Prioritária</Tag>;
        }
        return <Tag color="success" style={{ fontWeight: 600 }}>Monitoramento de Rotina</Tag>;
      }
    }
  ];

  // Dados formatados para o gráfico comparativo
  const dadosGrafico = useMemo(() => {
    return dadosClassificados.map((d) => ({
      nome: isMobile ? d.nome.replace('Unidade ', '').replace(' (Matriz)', '') : d.nome.replace('Unidade ', ''),
      porte: d.porte,
      riscoAbsoluto: d.riscoAbsolutoCalculado,
      taxaRiscoProporcional: d.taxaRiscoProporcional,
      carteiraTotal: d.carteiraTotalClientes,
      sucessoFunil: d.taxaConversaoFunil
    }));
  }, [dadosClassificados, isMobile]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 14 : 20 }}>
      {/* Alerta de Insight de Negócio Principal no Estilo Primora */}
      <Alert
        message={
          <Text strong style={{ fontSize: isMobile ? 13 : 15, color: '#ef4444' }}>
            <WarningOutlined style={{ marginRight: 6 }} />
            Insight Crítico Multi-tenant: Por que normalizar por porte?
          </Text>
        }
        description={
          <div style={{ marginTop: 6, fontSize: isMobile ? 11 : 13, lineHeight: '18px', color: '#475569' }}>
            <Paragraph style={{ margin: 0 }}>
              Comparar apenas números absolutos induz a erros graves de gestão. Veja o contraste de portes:
            </Paragraph>
            <ul style={{ marginTop: 6, marginBottom: 4, paddingLeft: 18 }}>
              <li>
                <strong>Unidade Sudeste (Matriz):</strong> Maior risco absoluto (<strong>100 clientes</strong>), porém com taxa proporcional controlada de apenas <strong>8,33%</strong> de sua carteira de 1.200 clientes.
              </li>
              <li>
                <strong>Unidade Centro-Oeste:</strong> Menor número absoluto (<strong>35 clientes</strong>), porém com taxa proporcional alarmante de <strong>23,33%</strong> de sua carteira (150 clientes) — a mais vulnerável da empresa!
              </li>
            </ul>
          </div>
        }
        type="warning"
        showIcon={false}
        style={{
          borderRadius: 10,
          border: '1px solid #fed7aa',
          backgroundColor: '#fffbeb',
          padding: isMobile ? '10px 14px' : '14px 18px',
          boxShadow: '0 2px 8px rgba(245, 158, 11, 0.05)'
        }}
      />

      {/* Cartões de Ranking (RF06) */}
      <Card
        title={
          <Space size="small">
            <TrophyOutlined style={{ color: '#f59e0b' }} />
            <span style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700 }}>Ranking Oficial de Criticidade (RF06)</span>
          </Space>
        }
        style={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 16px -2px rgba(0,0,0,0.03)' }}
        styles={{ body: { padding: isMobile ? 12 : 16 } }}
      >
        <Row gutter={[isMobile ? 10 : 16, isMobile ? 10 : 16]}>
          {dadosClassificados.map((u) => {
            const isCritica = u.posicaoRankingRisco === 1;
            return (
              <Col xs={24} sm={12} lg={6} key={u.id}>
                <Card
                  style={{
                    borderRadius: 10,
                    borderColor: isCritica ? '#fca5a5' : '#e2e8f0',
                    backgroundColor: isCritica ? '#fff5f5' : '#ffffff',
                    boxShadow: isCritica ? '0 4px 14px rgba(239, 68, 68, 0.12)' : '0 2px 6px rgba(0,0,0,0.02)'
                  }}
                  styles={{ body: { padding: isMobile ? 12 : 14 } }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Tag color={isCritica ? 'red' : u.posicaoRankingRisco === 2 ? 'orange' : 'purple'} style={{ fontWeight: 'bold' }}>
                      #{u.posicaoRankingRisco}º Lugar
                    </Tag>
                    <Tag style={{ margin: 0, fontWeight: 600 }}>{u.porte}</Tag>
                  </div>

                  <Title level={5} style={{ margin: '8px 0 4px 0', fontSize: isMobile ? 14 : 15, fontWeight: 700, color: '#0f172a' }}>
                    {u.nome}
                  </Title>

                  <div style={{ fontSize: 13, marginTop: 6 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Taxa Proporcional:</Text>{' '}
                    <Text strong style={{ color: isCritica ? '#ef4444' : '#f97316', fontSize: 16 }}>
                      {u.taxaRiscoProporcional}%
                    </Text>
                  </div>

                  <div style={{ fontSize: 11, marginTop: 2 }}>
                    <Text type="secondary">
                      Risco: <Text strong>{u.riscoAbsolutoCalculado}</Text> de {u.carteiraTotalClientes} clientes
                    </Text>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Card>

      {/* Gráfico Comparativo no Padrão Primora (RF09) */}
      <Card
        title={
          <Space size="small">
            <BarChartOutlined style={{ color: '#684cb1' }} />
            <span style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700 }}>Visualização Gráfica Comparativa (RF09)</span>
          </Space>
        }
        style={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 16px -2px rgba(0,0,0,0.03)' }}
        styles={{ body: { padding: isMobile ? '12px 6px' : 20 } }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, padding: isMobile ? '0 8px' : 0, flexWrap: 'wrap', gap: 8 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Alternar perspectiva visual:
          </Text>
          <Radio.Group
            value={tipoGrafico}
            onChange={(e) => setTipoGrafico(e.target.value)}
            size={isMobile ? 'small' : 'middle'}
            buttonStyle="solid"
          >
            <Radio.Button value="composto">Eixos Duplos (Qtd vs %)</Radio.Button>
            <Radio.Button value="barras">Taxas Proporcionais (%)</Radio.Button>
          </Radio.Group>
        </div>

        <div style={{ height: isMobile ? 270 : 330, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            {tipoGrafico === 'composto' ? (
              <ComposedChart
                data={dadosGrafico}
                margin={{ top: 15, right: isMobile ? 10 : 30, left: isMobile ? -18 : 10, bottom: 15 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="nome" stroke="#64748b" tick={{ fontSize: isMobile ? 10 : 12 }} />
                <YAxis
                  yAxisId="left"
                  label={!isMobile ? { value: 'Risco Absoluto (clientes)', angle: -90, position: 'insideLeft' } : undefined}
                  stroke="#684cb1"
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 30]}
                  unit="%"
                  label={!isMobile ? { value: 'Taxa Proporcional (%)', angle: 90, position: 'insideRight' } : undefined}
                  stroke="#ef4444"
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                />
                <RechartsTooltip />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: isMobile ? 11 : 12, fontWeight: 600 }} />
                <Bar
                  yAxisId="left"
                  dataKey="riscoAbsoluto"
                  name="Risco Absoluto (Qtd Clientes)"
                  fill="#684cb1"
                  barSize={isMobile ? 26 : 42}
                  radius={[6, 6, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="taxaRiscoProporcional"
                  name="Taxa de Risco Proporcional (%)"
                  stroke="#ef4444"
                  strokeWidth={isMobile ? 2.5 : 3.5}
                  dot={{ r: isMobile ? 4 : 6, fill: '#ef4444' }}
                />
              </ComposedChart>
            ) : (
              <BarChart
                data={dadosGrafico}
                margin={{ top: 15, right: isMobile ? 10 : 30, left: isMobile ? -18 : 10, bottom: 15 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="nome" stroke="#64748b" tick={{ fontSize: isMobile ? 10 : 12 }} />
                <YAxis domain={[0, 100]} unit="%" stroke="#64748b" tick={{ fontSize: isMobile ? 10 : 12 }} />
                <RechartsTooltip />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: isMobile ? 11 : 12, fontWeight: 600 }} />
                <Bar
                  dataKey="taxaRiscoProporcional"
                  name="Taxa de Risco (%)"
                  fill="#ef4444"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="sucessoFunil"
                  name="Taxa de Sucesso no Funil (%)"
                  fill="#0ed5fa"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Tabela Comparativa (RF05, RF09, RF12) */}
      <Card
        title={
          <Space size="small">
            <TableOutlined style={{ color: '#684cb1' }} />
            <span style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700 }}>Tabela Comparativa Multidimensional (RF05, RF12)</span>
          </Space>
        }
        extra={
          <Text type="secondary" style={{ fontSize: 11 }}>
            {isMobile ? 'Arraste para os lados ⇄' : 'Clique no cabeçalho para ordenar (RF12)'}
          </Text>
        }
        style={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 16px -2px rgba(0,0,0,0.03)' }}
        styles={{ body: { padding: isMobile ? 8 : 16 } }}
      >
        <Table
          columns={columns}
          dataSource={dadosClassificados}
          rowKey="id"
          pagination={false}
          scroll={{ x: 880 }}
          bordered
          size={isMobile ? 'small' : 'middle'}
        />
      </Card>

      {/* Justificativa Obrigatória: Indicador Proporcional & Gráfico vs. Tabela (RF06, RF09) */}
      <Card
        title={
          <Space size="small">
            <QuestionCircleOutlined style={{ color: '#684cb1' }} />
            <span style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700 }}>Fundamentação de UX e Dados (RF06 & RF09)</span>
          </Space>
        }
        style={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 16px -2px rgba(0,0,0,0.03)' }}
        styles={{ body: { padding: isMobile ? 14 : 20 } }}
      >
        <Row gutter={[isMobile ? 12 : 24, isMobile ? 12 : 24]}>
          <Col xs={24} md={12}>
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(104, 76, 177, 0.05) 0%, rgba(104, 76, 177, 0.02) 100%)',
                padding: isMobile ? 12 : 18,
                borderRadius: 10,
                border: '1px solid rgba(104, 76, 177, 0.2)',
                height: '100%'
              }}
            >
              <Title level={5} style={{ color: '#533898', marginTop: 0, fontSize: isMobile ? 14 : 16, fontWeight: 700 }}>
                1. Critério do Indicador Comparativo de Risco (RF06)
              </Title>
              <Paragraph style={{ fontSize: 12, color: '#334155' }}>
                <strong>Fórmula Adotada:</strong>
                <pre style={{ backgroundColor: '#ffffff', padding: 8, borderRadius: 6, margin: '6px 0', border: '1px solid rgba(104, 76, 177, 0.3)', fontSize: 11 }}>
                  Taxa_Risco = ((risco + critico) / carteira_total) × 100
                </pre>
              </Paragraph>
              <Paragraph style={{ fontSize: 12, color: '#334155' }}>
                <strong>Por que esta escolha?</strong> Uma unidade de grande porte como a Matriz (Sudeste) absorve 100 contas em risco sem risco de falência (conta com 1.100 contas ativas). Contudo, em uma unidade de 150 contas (Centro-Oeste), 35 contas em risco representam 23,3% da operação.
              </Paragraph>
              <Paragraph style={{ fontSize: 12, color: '#334155', marginBottom: 0 }}>
                <strong>Limites:</strong> Atribui o mesmo peso para risco e crítico e não pondera o ticket médio individual.
              </Paragraph>
            </div>
          </Col>

          <Col xs={24} md={12}>
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(14, 213, 250, 0.05) 0%, rgba(14, 213, 250, 0.02) 100%)',
                padding: isMobile ? 12 : 18,
                borderRadius: 10,
                border: '1px solid rgba(14, 213, 250, 0.25)',
                height: '100%'
              }}
            >
              <Title level={5} style={{ color: '#0284c7', marginTop: 0, fontSize: isMobile ? 14 : 16, fontWeight: 700 }}>
                2. Justificativa: Quando usar Gráfico vs. Tabela? (RF09)
              </Title>
              <Paragraph style={{ fontSize: 12, color: '#334155' }}>
                <strong>Quando o Gráfico é superior:</strong>
                <ul style={{ paddingLeft: 16, marginTop: 4, marginBottom: 8 }}>
                  <li>Para visualizar o cruzamento de escalas díspares (barras roxas de volume absoluto vs linha vermelha percentual).</li>
                  <li>Para reuniões de diretoria e tomada de ação imediata.</li>
                </ul>
              </Paragraph>
              <Paragraph style={{ fontSize: 12, color: '#334155', marginBottom: 0 }}>
                <strong>Quando a Tabela é superior:</strong>
                <ul style={{ paddingLeft: 16, marginTop: 4, marginBottom: 0 }}>
                  <li>Para consultas analíticas e conferência de valores exatos.</li>
                  <li>Para realizar ordenação interativa e filtros por múltiplos portes (RF12).</li>
                </ul>
              </Paragraph>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
