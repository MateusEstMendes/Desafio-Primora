import React, { useState, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Select,
  Typography,
  Tag,
  Timeline,
  Space,
  Empty,
  Statistic,
  Progress,
  Radio
} from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  PhoneOutlined,
  RiseOutlined,
  FallOutlined,
  CalendarOutlined,
  ToolOutlined
} from '@ant-design/icons';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip
} from 'recharts';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

// Mapeamento de Cores e Ícones no Padrão Primora Tech
const MAPA_CORES_EVENTOS = {
  comercial: { color: '#684cb1', bg: 'rgba(104, 76, 177, 0.08)', icon: <PhoneOutlined /> },
  operacional: { color: '#09b8d9', bg: 'rgba(14, 213, 250, 0.08)', icon: <ToolOutlined /> },
  sucesso: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)', icon: <CheckCircleOutlined /> },
  relacionamento: { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.08)', icon: <UserOutlined /> },
  alerta: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)', icon: <ExclamationCircleOutlined /> },
  suporte: { color: '#6366f1', bg: 'rgba(99, 102, 241, 0.08)', icon: <ClockCircleOutlined /> },
  critico: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)', icon: <CloseCircleOutlined /> }
};

export default function HistoricoClientes({ dataset, isMobile = false }) {
  const clientes = dataset?.clientes || [];

  // Inicia com o primeiro cliente ou null se não houver registros
  const [selectedClienteId, setSelectedClienteId] = useState(clientes[0]?.id || null);
  const [filtroCategoriaEvento, setFiltroCategoriaEvento] = useState('todos');

  // Cliente atualmente selecionado
  const clienteSelecionado = useMemo(() => {
    return clientes.find((c) => c.id === selectedClienteId) || null;
  }, [clientes, selectedClienteId]);

  // Eventos ordenados cronologicamente (RF07) e filtrados (se aplicável)
  const eventosOrdenados = useMemo(() => {
    if (!clienteSelecionado?.eventos) return [];

    let lista = [...clienteSelecionado.eventos];

    // Ordenação cronológica crescente (respeitando as datas do dataset - 3.5)
    lista.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

    if (filtroCategoriaEvento !== 'todos') {
      lista = lista.filter((e) => e.categoria === filtroCategoriaEvento);
    }

    return lista;
  }, [clienteSelecionado, filtroCategoriaEvento]);

  if (!clientes.length) {
    return (
      <Card style={{ borderRadius: 12 }}>
        <Empty description="Nenhum cliente cadastrado no dataset fornecido." />
      </Card>
    );
  }

  // Cor do status de saúde
  const getStatusColor = (status) => {
    switch (status) {
      case 'Saudável':
        return '#10b981';
      case 'Risco':
        return '#f97316';
      case 'Crítico':
        return '#ef4444';
      default:
        return '#684cb1';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 14 : 20 }}>
      {/* Seletor de Cliente e Cabeçalho (RF07) */}
      <Card
        style={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 16px -2px rgba(0,0,0,0.03)' }}
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
                  boxShadow: '0 4px 12px rgba(104, 76, 177, 0.25)'
                }}
              >
                <UserOutlined />
              </div>
              <div>
                <Title level={isMobile ? 5 : 4} style={{ margin: 0, fontSize: isMobile ? 16 : 19, fontWeight: 700 }}>
                  Jornada e Histórico do Cliente
                </Title>
                <Text type="secondary" style={{ fontSize: isMobile ? 11 : 12 }}>
                  Acompanhamento cronológico de eventos e evolução do score de saúde
                </Text>
              </div>
            </Space>
          </Col>

          <Col xs={24} md={12} style={{ textAlign: isMobile ? 'left' : 'right' }}>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'flex-end', gap: 8 }}>
              <Text strong style={{ fontSize: 13, color: '#334155' }}>Selecionar Cliente:</Text>
              <Select
                value={selectedClienteId}
                onChange={setSelectedClienteId}
                style={{ width: isMobile ? '100%' : 330, textAlign: 'left' }}
                options={clientes.map((c) => ({
                  value: c.id,
                  label: `${c.nome} — [${c.unidadeNome.replace('Unidade ', '')}]`
                }))}
              />
            </div>
          </Col>
        </Row>
      </Card>

      {!clienteSelecionado ? (
        <Card style={{ borderRadius: 12 }}>
          <Empty description="Por favor, selecione um cliente para consultar seu histórico." />
        </Card>
      ) : (
        <>
          {/* Cartão de Identificação do Cliente */}
          <Card
            style={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 16px -2px rgba(0,0,0,0.03)' }}
            styles={{ body: { padding: isMobile ? 14 : 24 } }}
          >
            <Row gutter={[isMobile ? 14 : 24, isMobile ? 14 : 24]} align="middle">
              <Col xs={24} md={14}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                  <Title level={isMobile ? 4 : 3} style={{ margin: 0, fontSize: isMobile ? 18 : 22, fontWeight: 700, color: '#0f172a' }}>
                    {clienteSelecionado.nome}
                  </Title>
                  <Tag
                    style={{
                      backgroundColor:
                        clienteSelecionado.statusSaude === 'Saudável'
                          ? '#dcfce7'
                          : clienteSelecionado.statusSaude === 'Risco'
                          ? '#ffedd5'
                          : '#fee2e2',
                      color:
                        clienteSelecionado.statusSaude === 'Saudável'
                          ? '#15803d'
                          : clienteSelecionado.statusSaude === 'Risco'
                          ? '#c2410c'
                          : '#b91c1c',
                      fontWeight: 700,
                      border: 'none',
                      fontSize: 12,
                      padding: '2px 8px'
                    }}
                  >
                    {clienteSelecionado.statusSaude}
                  </Tag>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? 8 : 16, fontSize: isMobile ? 12 : 13 }}>
                  <div>
                    <Text type="secondary">Código:</Text>{' '}
                    <Text strong style={{ color: '#0f172a' }}>{clienteSelecionado.id}</Text>
                  </div>
                  <div>
                    <Text type="secondary">Unidade Vinculada:</Text>{' '}
                    <Tag
                      style={{
                        margin: 0,
                        backgroundColor: 'rgba(104, 76, 177, 0.1)',
                        color: '#684cb1',
                        border: '1px solid rgba(104, 76, 177, 0.3)',
                        fontWeight: 600
                      }}
                    >
                      {clienteSelecionado.unidadeNome}
                    </Tag>
                  </div>
                  <div>
                    <Text type="secondary">Segmento:</Text>{' '}
                    <Text strong style={{ color: '#0f172a' }}>{clienteSelecionado.segmento}</Text>
                  </div>
                  <div>
                    <Text type="secondary">Tempo de Contrato:</Text>{' '}
                    <Text strong style={{ color: '#0f172a' }}>{clienteSelecionado.tempoContratoMeses} meses</Text>
                  </div>
                  <div>
                    <Text type="secondary">Ticket Médio:</Text>{' '}
                    <Text strong style={{ color: '#684cb1' }}>{clienteSelecionado.ticketMedioMensal}</Text>
                  </div>
                </div>
              </Col>

              <Col xs={24} md={10}>
                <div
                  style={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    padding: isMobile ? 12 : 16,
                    borderRadius: 10,
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <Row gutter={12} align="middle">
                    <Col span={14}>
                      <Statistic
                        title={<span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Score de Saúde Atual</span>}
                        value={clienteSelecionado.scoreSaudeAtual}
                        suffix={<span style={{ fontSize: 13, color: '#94a3b8' }}>/ 100</span>}
                        valueStyle={{
                          color: getStatusColor(clienteSelecionado.statusSaude),
                          fontWeight: 800,
                          fontSize: isMobile ? 24 : 30
                        }}
                        prefix={
                          clienteSelecionado.scoreSaudeAtual >= 70 ? (
                            <RiseOutlined />
                          ) : (
                            <FallOutlined />
                          )
                        }
                      />
                    </Col>
                    <Col span={10} style={{ textAlign: 'center' }}>
                      <Progress
                        type="circle"
                        percent={clienteSelecionado.scoreSaudeAtual}
                        size={isMobile ? 56 : 68}
                        strokeColor={getStatusColor(clienteSelecionado.statusSaude)}
                        strokeWidth={7}
                      />
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Gráfico de Evolução do Score de Saúde (RF10) */}
          <Card
            title={
              <Space size="small">
                <RiseOutlined style={{ color: '#684cb1' }} />
                <span style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700 }}>Evolução do Score de Saúde (RF10)</span>
              </Space>
            }
            extra={
              <Tag
                style={{
                  backgroundColor: clienteSelecionado.scoreSaudeAtual >= 70 ? '#dcfce7' : '#fee2e2',
                  color: clienteSelecionado.scoreSaudeAtual >= 70 ? '#15803d' : '#b91c1c',
                  border: 'none',
                  fontSize: 11,
                  fontWeight: 600
                }}
              >
                {clienteSelecionado.scoreSaudeAtual >= 70 ? 'Crescimento Contínuo' : 'Alerta de Churn'}
              </Tag>
            }
            style={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 16px -2px rgba(0,0,0,0.03)' }}
            styles={{ body: { padding: isMobile ? '12px 6px' : 20 } }}
          >
            <div style={{ height: isMobile ? 200 : 250, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={clienteSelecionado.historicoScore || []}
                  margin={{ top: 10, right: isMobile ? 10 : 30, left: isMobile ? -25 : 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="scorePrimoraGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={getStatusColor(clienteSelecionado.statusSaude)}
                        stopOpacity={0.7}
                      />
                      <stop
                        offset="95%"
                        stopColor={getStatusColor(clienteSelecionado.statusSaude)}
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="periodo" stroke="#94a3b8" tick={{ fontSize: isMobile ? 10 : 12 }} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: isMobile ? 10 : 12 }} />
                  <RechartsTooltip formatter={(val) => [`${val} pts`, 'Score de Saúde']} />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke={getStatusColor(clienteSelecionado.statusSaude)}
                    fillOpacity={1}
                    fill="url(#scorePrimoraGradient)"
                    strokeWidth={isMobile ? 2.5 : 3.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Timeline de Eventos da Jornada do Cliente (RF07, RF08) */}
          <Card
            title={
              <Space size="small">
                <ClockCircleOutlined style={{ color: '#684cb1' }} />
                <span style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700 }}>Linha do Tempo de Eventos (RF07, RF08)</span>
              </Space>
            }
            style={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 16px -2px rgba(0,0,0,0.03)' }}
            styles={{ body: { padding: isMobile ? '14px 10px' : 20 } }}
          >
            {/* Filtro de Categoria dos Eventos */}
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>
                Filtrar eventos ({eventosOrdenados.length} listados):
              </Text>
              <Radio.Group
                value={filtroCategoriaEvento}
                onChange={(e) => setFiltroCategoriaEvento(e.target.value)}
                size="small"
                buttonStyle="solid"
              >
                <Radio.Button value="todos">Todos</Radio.Button>
                <Radio.Button value="sucesso">Sucesso</Radio.Button>
                <Radio.Button value="comercial">Comercial</Radio.Button>
                <Radio.Button value="alerta">Alertas</Radio.Button>
                <Radio.Button value="critico">Críticos</Radio.Button>
              </Radio.Group>
            </div>

            {eventosOrdenados.length === 0 ? (
              <Empty description="Nenhum evento registrado para esta categoria." />
            ) : (
              <div style={{ padding: isMobile ? '8px 2px' : '16px 8px' }}>
                <Timeline
                  mode="left"
                  items={eventosOrdenados.map((evt) => {
                    const cfg = MAPA_CORES_EVENTOS[evt.categoria] || {
                      color: '#94a3b8',
                      bg: '#f8fafc',
                      icon: <ClockCircleOutlined />
                    };
                    const dataFormatada = dayjs(evt.data).format('DD/MM/YYYY [às] HH:mm');

                    return {
                      color: cfg.color,
                      dot: cfg.icon,
                      children: (
                        <div
                          style={{
                            backgroundColor: '#ffffff',
                            padding: isMobile ? '10px 12px' : '14px 18px',
                            borderRadius: 10,
                            borderLeft: `4px solid ${cfg.color}`,
                            borderTop: '1px solid #f1f5f9',
                            borderRight: '1px solid #f1f5f9',
                            borderBottom: '1px solid #f1f5f9',
                            marginBottom: 10,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: isMobile ? 'column' : 'row',
                              justifyContent: 'space-between',
                              alignItems: isMobile ? 'flex-start' : 'center',
                              marginBottom: 6,
                              gap: 4
                            }}
                          >
                            <Space wrap size={6}>
                              <Text strong style={{ fontSize: isMobile ? 13 : 15, color: '#0f172a' }}>{evt.tipo}</Text>
                              <Tag
                                style={{
                                  backgroundColor: cfg.bg,
                                  color: cfg.color,
                                  border: `1px solid ${cfg.color}40`,
                                  fontSize: 10,
                                  fontWeight: 700,
                                  margin: 0
                                }}
                              >
                                {evt.categoria.toUpperCase()}
                              </Tag>
                            </Space>
                            <Space style={{ color: '#94a3b8', fontSize: isMobile ? 11 : 12 }}>
                              <CalendarOutlined />
                              <span>{dataFormatada}</span>
                            </Space>
                          </div>
                          <Paragraph style={{ margin: 0, color: '#475569', fontSize: isMobile ? 12 : 13, lineHeight: '20px' }}>
                            {evt.descricao}
                          </Paragraph>
                        </div>
                      )
                    };
                  })}
                />
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
