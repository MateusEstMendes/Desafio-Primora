import React, { useState, useMemo } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Select,
  Progress,
  Tag,
  Badge,
  Typography,
  Space,
  Empty,
  Tooltip,
  Divider,
  Alert
} from 'antd';
import {
  ShopOutlined,
  TeamOutlined,
  RiseOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  ThunderboltOutlined,
  InfoCircleOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  calcularRiscoAbsoluto,
  calcularTaxaRiscoProporcional,
  calcularTaxaConversaoFunil,
  calcularTaxaVisualizacaoFunil,
  formatarNumero,
  formatarPercentual
} from '../utils/metrics';

const { Title, Text, Paragraph } = Typography;

// Paleta Primora Tech para Categorias de Saúde
const CORES_SAUDE = {
  saudavel: '#10b981', // Verde Esmeralda
  atencao: '#f59e0b',  // Âmbar
  risco: '#f97316',    // Laranja
  critico: '#ef4444'   // Coral Red
};

export default function VisaoGeral({ dataset, isMobile = false }) {
  const [selectedTenantId, setSelectedTenantId] = useState('todos');

  const tenants = dataset?.tenants || [];

  // Dados consolidados ou da unidade filtrada
  const selectedTenant = useMemo(() => {
    if (selectedTenantId === 'todos') return null;
    return tenants.find((t) => t.id === selectedTenantId) || null;
  }, [selectedTenantId, tenants]);

  // Estatísticas agregadas quando "todos" está selecionado
  const estatisticasAgregadas = useMemo(() => {
    if (!tenants.length) return null;

    if (selectedTenant) {
      const riscoAbsoluto = calcularRiscoAbsoluto(selectedTenant.saudeCarteira);
      const taxaRisco = calcularTaxaRiscoProporcional(
        selectedTenant.saudeCarteira,
        selectedTenant.carteiraTotalClientes
      );
      const taxaConversao = calcularTaxaConversaoFunil(selectedTenant.funnel90d);
      const taxaVisualizacao = calcularTaxaVisualizacaoFunil(selectedTenant.funnel90d);

      return {
        nome: selectedTenant.nome,
        porte: selectedTenant.porte,
        carteiraTotal: selectedTenant.carteiraTotalClientes,
        engajamento: selectedTenant.engajamentoMedio,
        riscoAbsoluto,
        taxaRisco,
        saude: selectedTenant.saudeCarteira,
        funil: selectedTenant.funnel90d,
        taxaConversao,
        taxaVisualizacao,
        tendencias: selectedTenant.historicoTendencia || []
      };
    }

    // Soma e média para todas as unidades
    const totalClientes = tenants.reduce((acc, t) => acc + (t.carteiraTotalClientes || 0), 0);
    const mediaEngajamento =
      tenants.reduce((acc, t) => acc + (t.engajamentoMedio || 0), 0) / tenants.length;

    const saudeConsolidada = tenants.reduce(
      (acc, t) => ({
        saudavel: acc.saudavel + (t.saudeCarteira?.saudavel || 0),
        atencao: acc.atencao + (t.saudeCarteira?.atencao || 0),
        risco: acc.risco + (t.saudeCarteira?.risco || 0),
        critico: acc.critico + (t.saudeCarteira?.critico || 0)
      }),
      { saudavel: 0, atencao: 0, risco: 0, critico: 0 }
    );

    const funilConsolidado = tenants.reduce(
      (acc, t) => ({
        gerada: acc.gerada + (t.funnel90d?.gerada || 0),
        vista: acc.vista + (t.funnel90d?.vista || 0),
        sucesso: acc.sucesso + (t.funnel90d?.sucesso || 0)
      }),
      { gerada: 0, vista: 0, sucesso: 0 }
    );

    const riscoAbsoluto = calcularRiscoAbsoluto(saudeConsolidada);
    const taxaRisco = calcularTaxaRiscoProporcional(saudeConsolidada, totalClientes);
    const taxaConversao = calcularTaxaConversaoFunil(funilConsolidado);
    const taxaVisualizacao = calcularTaxaVisualizacaoFunil(funilConsolidado);

    // Média de tendência histórica por mês consolidado
    const meses = tenants[0]?.historicoTendencia?.map((h) => h.mes) || [];
    const tendenciasConsolidadas = meses.map((mes, idx) => {
      let somaEng = 0;
      let somaSucesso = 0;
      tenants.forEach((t) => {
        const item = t.historicoTendencia?.[idx];
        if (item) {
          somaEng += item.engajamento;
          somaSucesso += item.sucessoFunil;
        }
      });
      return {
        mes,
        engajamento: Number((somaEng / tenants.length).toFixed(1)),
        sucessoFunil: Number((somaSucesso / tenants.length).toFixed(1))
      };
    });

    return {
      nome: 'Todas as Unidades (Consolidado Nacional)',
      porte: 'Múltiplos Portes',
      carteiraTotal: totalClientes,
      engajamento: Number(mediaEngajamento.toFixed(1)),
      riscoAbsoluto,
      taxaRisco,
      saude: saudeConsolidada,
      funil: funilConsolidado,
      taxaConversao,
      taxaVisualizacao,
      tendencias: tendenciasConsolidadas
    };
  }, [tenants, selectedTenant]);

  if (!tenants.length) {
    return (
      <Card style={{ marginTop: 24, borderRadius: 12 }}>
        <Empty description="Nenhuma unidade regional encontrada no dataset." />
      </Card>
    );
  }

  // Dados para o gráfico de pizza de saúde da carteira
  const pieDataSaude = [
    { name: 'Saudável', value: estatisticasAgregadas.saude.saudavel, color: CORES_SAUDE.saudavel },
    { name: 'Atenção', value: estatisticasAgregadas.saude.atencao, color: CORES_SAUDE.atencao },
    { name: 'Risco', value: estatisticasAgregadas.saude.risco, color: CORES_SAUDE.risco },
    { name: 'Crítico', value: estatisticasAgregadas.saude.critico, color: CORES_SAUDE.critico }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 14 : 20 }}>
      {/* Barra de Filtro e Controle (RF04) */}
      <Card
        style={{
          borderRadius: 12,
          border: '1px solid rgba(226, 232, 240, 0.9)',
          boxShadow: '0 4px 20px -2px rgba(104, 76, 177, 0.06)'
        }}
        styles={{ body: { padding: isMobile ? '12px 16px' : '18px 24px' } }}
      >
        <Row align="middle" justify="space-between" gutter={[12, 12]}>
          <Col xs={24} md={12}>
            <Space align="center" size="middle">
              <div
                style={{
                  width: isMobile ? 36 : 42,
                  height: isMobile ? 36 : 42,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #684cb1 0%, #0ed5fa 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: isMobile ? 18 : 22,
                  boxShadow: '0 4px 12px rgba(14, 213, 250, 0.3)'
                }}
              >
                <ShopOutlined />
              </div>
              <div>
                <Title level={isMobile ? 5 : 4} style={{ margin: 0, fontSize: isMobile ? 16 : 19, fontWeight: 700 }}>
                  Visão Geral da Distribuidora Vetor
                </Title>
                <Text type="secondary" style={{ fontSize: isMobile ? 11 : 12 }}>
                  Inteligência de operações, funil de conversão e saúde da carteira
                </Text>
              </div>
            </Space>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: isMobile ? 'left' : 'right' }}>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'flex-end', gap: 8 }}>
              <Text strong style={{ fontSize: 13, color: '#334155' }}>Filtrar Unidade:</Text>
              <Select
                value={selectedTenantId}
                onChange={setSelectedTenantId}
                style={{ width: isMobile ? '100%' : 270, textAlign: 'left' }}
                options={[
                  { value: 'todos', label: '🌐 Todas as Unidades (Consolidado)' },
                  ...tenants.map((t) => ({
                    value: t.id,
                    label: `🏢 ${t.nome} (${t.porte})`
                  }))
                ]}
              />
            </div>
          </Col>
        </Row>
      </Card>

      {/* Cartões de Indicadores Chave no Estilo Primora (RF01, RF02, RF03) */}
      <Row gutter={[isMobile ? 10 : 16, isMobile ? 10 : 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 16px -2px rgba(0,0,0,0.03)',
              borderTop: '3px solid #684cb1'
            }}
            styles={{ body: { padding: isMobile ? 14 : 20 } }}
          >
            <Statistic
              title={
                <Space size={6}>
                  <TeamOutlined style={{ color: '#684cb1' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Carteira Total</span>
                </Space>
              }
              value={estatisticasAgregadas.carteiraTotal}
              formatter={(v) => formatarNumero(v)}
              suffix={<span style={{ fontSize: 12, color: '#94a3b8' }}>clientes</span>}
              valueStyle={{ fontSize: isMobile ? 24 : 30, fontWeight: 800, color: '#1e293b' }}
            />
            <div style={{ marginTop: 8 }}>
              <Tag
                style={{
                  backgroundColor: 'rgba(104, 76, 177, 0.1)',
                  color: '#684cb1',
                  border: '1px solid rgba(104, 76, 177, 0.3)',
                  fontWeight: 600,
                  fontSize: 11
                }}
              >
                {selectedTenant ? `Porte: ${selectedTenant.porte}` : '4 Unidades Regionais'}
              </Tag>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 16px -2px rgba(0,0,0,0.03)',
              borderTop: '3px solid #10b981'
            }}
            styles={{ body: { padding: isMobile ? 14 : 20 } }}
          >
            <Statistic
              title={
                <Space size={6}>
                  <RiseOutlined style={{ color: '#10b981' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Engajamento Médio</span>
                </Space>
              }
              value={estatisticasAgregadas.engajamento}
              precision={1}
              valueStyle={{
                color: '#10b981',
                fontSize: isMobile ? 24 : 30,
                fontWeight: 800
              }}
              suffix="%"
            />
            <div style={{ marginTop: 8 }}>
              <Progress
                percent={estatisticasAgregadas.engajamento}
                showInfo={false}
                strokeColor="#10b981"
                size="small"
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 16px -2px rgba(0,0,0,0.03)',
              borderTop: '3px solid #ef4444'
            }}
            styles={{ body: { padding: isMobile ? 14 : 20 } }}
          >
            <Statistic
              title={
                <Space size={6}>
                  <AlertOutlined style={{ color: '#ef4444' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Em Risco / Crítico</span>
                  <Tooltip title="Soma simples de clientes em Risco + Crítico (Risco Absoluto).">
                    <InfoCircleOutlined style={{ color: '#94a3b8', fontSize: 12 }} />
                  </Tooltip>
                </Space>
              }
              value={estatisticasAgregadas.riscoAbsoluto}
              formatter={(v) => formatarNumero(v)}
              valueStyle={{ color: '#ef4444', fontSize: isMobile ? 24 : 30, fontWeight: 800 }}
              suffix={
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                  ({formatarPercentual(estatisticasAgregadas.taxaRisco)})
                </span>
              }
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 11 }}>
                Risco proporcional normalizado
              </Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 16px -2px rgba(0,0,0,0.03)',
              borderTop: '3px solid #0ed5fa'
            }}
            styles={{ body: { padding: isMobile ? 14 : 20 } }}
          >
            <Statistic
              title={
                <Space size={6}>
                  <ThunderboltOutlined style={{ color: '#09b8d9' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Conversão do Funil</span>
                  <Tooltip title="Fórmula adotada: (Sucesso / Geradas) × 100 no ciclo de 90 dias.">
                    <InfoCircleOutlined style={{ color: '#94a3b8', fontSize: 12 }} />
                  </Tooltip>
                </Space>
              }
              value={estatisticasAgregadas.taxaConversao}
              precision={1}
              valueStyle={{ color: '#09b8d9', fontSize: isMobile ? 24 : 30, fontWeight: 800 }}
              suffix="%"
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {estatisticasAgregadas.funil.sucesso} concluídas de {estatisticasAgregadas.funil.gerada} tarefas
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Cartões das 4 Unidades (RF01 - Exibir as quatro unidades) */}
      {selectedTenantId === 'todos' && (
        <Card
          title={
            <Space size="small">
              <BarChartOutlined style={{ color: '#684cb1' }} />
              <span style={{ fontWeight: 700 }}>Resumo das Quatro Unidades Regionais (Tenants)</span>
            </Space>
          }
          style={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 16px -2px rgba(0,0,0,0.03)' }}
          styles={{ body: { padding: isMobile ? 12 : 18 } }}
        >
          <Row gutter={[isMobile ? 10 : 16, isMobile ? 10 : 16]}>
            {tenants.map((t) => {
              const risco = calcularRiscoAbsoluto(t.saudeCarteira);
              const taxaRisco = calcularTaxaRiscoProporcional(t.saudeCarteira, t.carteiraTotalClientes);
              const taxaConv = calcularTaxaConversaoFunil(t.funnel90d);

              return (
                <Col xs={24} sm={12} xl={6} key={t.id}>
                  <Card
                    hoverable
                    onClick={() => setSelectedTenantId(t.id)}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: 10,
                      backgroundColor: '#ffffff',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                    }}
                    styles={{ body: { padding: isMobile ? 12 : 16 } }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Title level={5} style={{ margin: 0, fontSize: isMobile ? 14 : 15, fontWeight: 700, color: '#1e293b' }}>
                        {t.nome}
                      </Title>
                      <Tag
                        style={{
                          margin: 0,
                          backgroundColor: t.porte === 'Grande' ? '#fef3c7' : t.porte === 'Médio' ? '#e0f2fe' : '#dcfce7',
                          color: t.porte === 'Grande' ? '#b45309' : t.porte === 'Médio' ? '#0369a1' : '#15803d',
                          border: 'none',
                          fontWeight: 600,
                          fontSize: 11
                        }}
                      >
                        {t.porte}
                      </Tag>
                    </div>

                    <Divider style={{ margin: '10px 0' }} />

                    <div style={{ fontSize: 12, lineHeight: '22px' }}>
                      <div>
                        <Text type="secondary">Carteira:</Text>{' '}
                        <Text strong style={{ color: '#0f172a' }}>{formatarNumero(t.carteiraTotalClientes)} clientes</Text>
                      </div>
                      <div>
                        <Text type="secondary">Engajamento:</Text>{' '}
                        <Text strong style={{ color: '#10b981' }}>{t.engajamentoMedio}%</Text>
                      </div>
                      <div>
                        <Text type="secondary">Risco Absoluto:</Text>{' '}
                        <Text strong style={{ color: '#ef4444' }}>{risco}</Text>{' '}
                        <Text type="secondary" style={{ fontSize: 11 }}>({taxaRisco}%)</Text>
                      </div>
                      <div>
                        <Text type="secondary">Sucesso no Funil:</Text>{' '}
                        <Text strong style={{ color: '#684cb1' }}>{taxaConv}%</Text>
                      </div>
                    </div>

                    <div style={{ marginTop: 10, textAlign: 'right' }}>
                      <Text style={{ fontSize: 11, color: '#684cb1', fontWeight: 600 }}>
                        Filtrar unidade &rarr;
                      </Text>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Card>
      )}

      {/* Seção Central: Funil Comercial e Saúde da Carteira (RF02, RF03) */}
      <Row gutter={[isMobile ? 12 : 16, isMobile ? 12 : 16]}>
        {/* Funil Comercial */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space size="small">
                <ThunderboltOutlined style={{ color: '#684cb1' }} />
                <span style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700 }}>Funil Comercial de Tarefas (90d)</span>
              </Space>
            }
            extra={
              <Tooltip title="O funil acompanha a jornada: Geradas -> Vistas -> Sucesso (concluídas).">
                <InfoCircleOutlined style={{ color: '#94a3b8', cursor: 'pointer' }} />
              </Tooltip>
            }
            style={{ borderRadius: 12, height: '100%', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px -2px rgba(0,0,0,0.03)' }}
            styles={{ body: { padding: isMobile ? 14 : 20 } }}
          >
            <Alert
              message={
                <Text style={{ fontSize: 11, color: '#334155' }}>
                  <strong>Regra (RF02):</strong> Conversão Final = (Sucesso / Geradas) × 100.
                  Denominador: {estatisticasAgregadas.funil.gerada} tarefas geradas.
                </Text>
              }
              type="info"
              showIcon
              style={{
                marginBottom: 16,
                padding: '8px 12px',
                borderRadius: 8,
                background: 'rgba(104, 76, 177, 0.05)',
                border: '1px solid rgba(104, 76, 177, 0.2)'
              }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                  <Text strong style={{ color: '#334155' }}>1. Tarefas Geradas (Base do Funil)</Text>
                  <Text strong>{formatarNumero(estatisticasAgregadas.funil.gerada)} (100%)</Text>
                </div>
                <Progress
                  percent={100}
                  strokeColor="#684cb1"
                  status="active"
                  format={() => `${estatisticasAgregadas.funil.gerada} un.`}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                  <Space size={4}>
                    <EyeOutlined style={{ color: '#09b8d9' }} />
                    <Text strong style={{ color: '#334155' }}>2. Visualizadas</Text>
                  </Space>
                  <Text strong>
                    {formatarNumero(estatisticasAgregadas.funil.vista)} ({estatisticasAgregadas.taxaVisualizacao}%)
                  </Text>
                </div>
                <Progress
                  percent={estatisticasAgregadas.taxaVisualizacao}
                  strokeColor="#0ed5fa"
                  format={() => `${estatisticasAgregadas.funil.vista} un.`}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                  <Space size={4}>
                    <CheckCircleOutlined style={{ color: '#10b981' }} />
                    <Text strong style={{ color: '#334155' }}>3. Sucesso (Convertidas)</Text>
                  </Space>
                  <Text strong style={{ color: '#10b981' }}>
                    {formatarNumero(estatisticasAgregadas.funil.sucesso)} ({estatisticasAgregadas.taxaConversao}%)
                  </Text>
                </div>
                <Progress
                  percent={estatisticasAgregadas.taxaConversao}
                  strokeColor="#10b981"
                  format={() => `${estatisticasAgregadas.funil.sucesso} un.`}
                />
              </div>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', textAlign: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <Text type="secondary" style={{ fontSize: 11 }}>Taxa de Perda</Text>
                <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 800, color: '#ef4444' }}>
                  {(100 - estatisticasAgregadas.taxaConversao).toFixed(1)}%
                </div>
              </div>
              <Divider type="vertical" style={{ height: 32 }} />
              <div>
                <Text type="secondary" style={{ fontSize: 11 }}>Eficiência Vistas &rarr; Sucesso</Text>
                <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 800, color: '#684cb1' }}>
                  {estatisticasAgregadas.funil.vista > 0
                    ? ((estatisticasAgregadas.funil.sucesso / estatisticasAgregadas.funil.vista) * 100).toFixed(1)
                    : 0}%
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Distribuição de Saúde da Carteira (RF03) */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space size="small">
                <AlertOutlined style={{ color: '#09b8d9' }} />
                <span style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700 }}>Saúde da Carteira (RF03)</span>
              </Space>
            }
            extra={
              <Tooltip title="Classificação dos clientes em 4 níveis de risco operacional e financeiro.">
                <InfoCircleOutlined style={{ color: '#94a3b8', cursor: 'pointer' }} />
              </Tooltip>
            }
            style={{ borderRadius: 12, height: '100%', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px -2px rgba(0,0,0,0.03)' }}
            styles={{ body: { padding: isMobile ? 14 : 20 } }}
          >
            <Row align="middle" gutter={[12, 12]}>
              <Col xs={24} sm={12} style={{ height: isMobile ? 180 : 210 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieDataSaude}
                      cx="50%"
                      cy="50%"
                      innerRadius={isMobile ? 42 : 52}
                      outerRadius={isMobile ? 68 : 82}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieDataSaude.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(val, name) => [`${formatarNumero(val)} clientes`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </Col>

              <Col xs={24} sm={12}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                    <Space size={6}>
                      <Badge color={CORES_SAUDE.saudavel} />
                      <Text strong style={{ color: '#334155' }}>Saudável:</Text>
                    </Space>
                    <Text strong>
                      {formatarNumero(estatisticasAgregadas.saude.saudavel)}{' '}
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        ({((estatisticasAgregadas.saude.saudavel / estatisticasAgregadas.carteiraTotal) * 100).toFixed(1)}%)
                      </Text>
                    </Text>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                    <Space size={6}>
                      <Badge color={CORES_SAUDE.atencao} />
                      <Text strong style={{ color: '#334155' }}>Atenção:</Text>
                    </Space>
                    <Text strong>
                      {formatarNumero(estatisticasAgregadas.saude.atencao)}{' '}
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        ({((estatisticasAgregadas.saude.atencao / estatisticasAgregadas.carteiraTotal) * 100).toFixed(1)}%)
                      </Text>
                    </Text>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                    <Space size={6}>
                      <Badge color={CORES_SAUDE.risco} />
                      <Text strong style={{ color: '#f97316' }}>Risco:</Text>
                    </Space>
                    <Text strong style={{ color: '#f97316' }}>
                      {formatarNumero(estatisticasAgregadas.saude.risco)}{' '}
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        ({((estatisticasAgregadas.saude.risco / estatisticasAgregadas.carteiraTotal) * 100).toFixed(1)}%)
                      </Text>
                    </Text>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                    <Space size={6}>
                      <Badge color={CORES_SAUDE.critico} />
                      <Text strong style={{ color: '#ef4444' }}>Crítico:</Text>
                    </Space>
                    <Text strong style={{ color: '#ef4444' }}>
                      {formatarNumero(estatisticasAgregadas.saude.critico)}{' '}
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        ({((estatisticasAgregadas.saude.critico / estatisticasAgregadas.carteiraTotal) * 100).toFixed(1)}%)
                      </Text>
                    </Text>
                  </div>
                </div>
              </Col>
            </Row>

            <Divider orientation="left" plain style={{ margin: '12px 0 8px 0', fontSize: 11 }}>
              Resumo da Saúde
            </Divider>
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', padding: 10, borderRadius: 8, fontSize: 11 }}>
              <Text type="secondary">
                Clientes em faixa de perigo (Risco + Crítico):{' '}
                <Text strong style={{ color: '#ef4444' }}>
                  {formatarNumero(estatisticasAgregadas.riscoAbsoluto)} clientes
                </Text>{' '}
                representando{' '}
                <Text strong style={{ color: '#ef4444' }}>
                  {formatarPercentual(estatisticasAgregadas.taxaRisco)}
                </Text>{' '}
                do volume desta carteira.
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Tendência Histórica (RF10) */}
      <Card
        title={
          <Space size="small">
            <RiseOutlined style={{ color: '#684cb1' }} />
            <span style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700 }}>Tendência Histórica: Engajamento vs. Funil (RF10)</span>
          </Space>
        }
        extra={
          <Tag
            style={{
              backgroundColor: 'rgba(104, 76, 177, 0.1)',
              color: '#684cb1',
              border: '1px solid rgba(104, 76, 177, 0.3)',
              fontSize: 11,
              fontWeight: 600
            }}
          >
            {selectedTenant ? selectedTenant.nome : 'Média Consolidada'}
          </Tag>
        }
        style={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 16px -2px rgba(0,0,0,0.03)' }}
        styles={{ body: { padding: isMobile ? '12px 8px' : 20 } }}
      >
        <div style={{ height: isMobile ? 250 : 280, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={estatisticasAgregadas.tendencias}
              margin={{ top: 10, right: isMobile ? 10 : 30, left: isMobile ? -20 : 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mes" stroke="#94a3b8" tick={{ fontSize: isMobile ? 10 : 12 }} />
              <YAxis domain={[0, 100]} unit="%" stroke="#94a3b8" tick={{ fontSize: isMobile ? 10 : 12 }} />
              <RechartsTooltip formatter={(val, name) => [`${val}%`, name]} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: isMobile ? 11 : 12, fontWeight: 600 }} />
              <Line
                type="monotone"
                dataKey="engajamento"
                name="Engajamento Médio (%)"
                stroke="#684cb1"
                strokeWidth={isMobile ? 2.5 : 3.5}
                dot={{ r: isMobile ? 3 : 5, fill: '#684cb1' }}
                activeDot={{ r: isMobile ? 5 : 7 }}
              />
              <Line
                type="monotone"
                dataKey="sucessoFunil"
                name="Taxa de Sucesso no Funil (%)"
                stroke="#0ed5fa"
                strokeWidth={isMobile ? 2.5 : 3.5}
                dot={{ r: isMobile ? 3 : 5, fill: '#0ed5fa' }}
                activeDot={{ r: isMobile ? 5 : 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <Paragraph type="secondary" style={{ fontSize: 11, marginTop: 10, marginBottom: 0, padding: isMobile ? '0 8px' : 0 }}>
          💡 Demonstra a correlação entre o engajamento dos consultores e a efetividade na conclusão das tarefas do funil comercial nos últimos 6 meses.
        </Paragraph>
      </Card>
    </div>
  );
}
