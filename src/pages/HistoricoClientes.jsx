import { useChartMotion, activeChartDot } from '../utils/chartMotion';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { EXECUTIVE_EASE } from '../components/MotionPrimitives';
import { ExecutiveKpiGrid, ExecutivePanel } from '../components/ExecutiveKpiGrid';
import ClientDirectory from '../components/ClientDirectory';
import SegmentedPill from '../components/SegmentedPill';
import ExecutiveChartTooltip, { usePieSliceRenderer } from '../components/ExecutiveChartTooltip';
import {
  Timeline,
  Typography,
  Row,
  Col,
  Statistic,
  Radio,
  Empty,
  Tooltip,
} from 'antd';
import {
  CheckCircleOutlined,
  AlertOutlined,
  ExclamationCircleOutlined,
  ShoppingCartOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ReferenceLine,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import dayjs from 'dayjs';
import { formatarNumero, formatarPercentual } from '../utils/metrics';
import { getRiskSemanticTokens } from '../utils/themeTokens';
import { useChartAutoReset } from '../utils/useChartAutoReset';
import '../components/componentsCSS/HistoricoClientes.css';

export default function HistoricoClientes({
  initialClientId,
  dataset,
  isMobile = false,
  selectedTenantId = 'todos',
  onSelectTenant,
  themeTokens
}) {
  const detailRef = useRef(null);
  const chartMotion = useChartMotion();
  const scoreChartReset = useChartAutoReset(3000);
  const eventosDonutReset = useChartAutoReset(3000);
  const todosClientes = dataset?.clientes || [];
  const tenants = dataset?.tenants || [];

  const clientesVisiveis = useMemo(() => {
    if (selectedTenantId === 'todos') return todosClientes;
    return todosClientes.filter((c) => c.tenantId === selectedTenantId);
  }, [todosClientes, selectedTenantId]);

  const [selectedClienteId, setSelectedClienteId] = useState(initialClientId || todosClientes[0]?.id || null);
  const [filtroCategoriaEvento, setFiltroCategoriaEvento] = useState('todos');
  const [activePieSlice, setActivePieSlice] = useState(-1);

  const pieSliceRenderer = usePieSliceRenderer(activePieSlice, eventosDonutReset.tooltipProps.active === false, 'index');
  useEffect(() => {
    if (clientesVisiveis.length > 0) {
      const exists = clientesVisiveis.some((c) => c.id === selectedClienteId);
      if (!exists) {
        setSelectedClienteId(clientesVisiveis[0].id);
      }
    }
  }, [clientesVisiveis, selectedClienteId]);

  const clienteSelecionado = useMemo(() => {
    return (
      clientesVisiveis.find((c) => c.id === selectedClienteId) ||
      todosClientes.find((c) => c.id === selectedClienteId) ||
      null
    );
  }, [clientesVisiveis, todosClientes, selectedClienteId]);

  useEffect(() => {
    setFiltroCategoriaEvento('todos');
    setActivePieSlice(-1);
  }, [clienteSelecionado?.id]);

  const eventosOrdenados = useMemo(() => {
    if (!clienteSelecionado?.eventos) return [];
    let lista = [...clienteSelecionado.eventos];
    lista.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

    if (filtroCategoriaEvento !== 'todos') {
      lista = lista.filter((e) => e.categoria === filtroCategoriaEvento);
    }
    return lista;
  }, [clienteSelecionado, filtroCategoriaEvento]);

  const getStatusTokens = (status) => getRiskSemanticTokens(status, themeTokens);

  const getEventoCategoryMeta = (categoria) => {
    switch (categoria) {
      case 'sucesso':
        return {
          label: 'SUCESSO',
          badgeClass: 'geo-badge--success',
          color: themeTokens.statusSuccess,
          symbol: '●'
        };
      case 'critico':
        return {
          label: 'CRÍTICO',
          badgeClass: 'geo-badge--critical',
          color: themeTokens.statusCritical,
          symbol: '▲'
        };
      case 'alerta':
        return {
          label: 'ALERTA',
          badgeClass: 'geo-badge--warning',
          color: themeTokens.statusWarning,
          symbol: '▲'
        };
      case 'operacional':
        return {
          label: 'OPERACIONAL',
          badgeClass: 'geo-badge--cyan',
          color: themeTokens.brandCyan,
          symbol: '●'
        };
      default:
        return {
          label: categoria.toUpperCase(),
          badgeClass: 'geo-badge--brand',
          color: themeTokens.brandPrimary,
          symbol: '●'
        };
    }
  };

  const getTimelineItemProps = (evt, index = 0) => {
    const meta = getEventoCategoryMeta(evt.categoria);
    const dataFormatada = dayjs(evt.data).format('DD/MM/YYYY HH:mm');

    const color = meta.color;
    let dotIcon = <InfoCircleOutlined style={{ fontSize: 15 }} />;
    if (evt.categoria === 'sucesso') {
      dotIcon = <CheckCircleOutlined style={{ fontSize: 15 }} />;
    } else if (evt.categoria === 'critico') {
      dotIcon = <AlertOutlined style={{ fontSize: 15 }} />;
    } else if (evt.categoria === 'alerta') {
      dotIcon = <ExclamationCircleOutlined style={{ fontSize: 15 }} />;
    } else if (evt.categoria === 'comercial') {
      dotIcon = <ShoppingCartOutlined style={{ fontSize: 15 }} />;
    }

    return {
      key: evt.id,
      color,
      dot: dotIcon,
      children: (
        <motion.div
          className="antd-timeline-card"
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.22, delay: Math.min(index * 0.04, 0.28), ease: EXECUTIVE_EASE }}
        >
          <div className="antd-timeline-card-header">
            <Typography.Text strong className="antd-timeline-title">
              {evt.tipo}
            </Typography.Text>
            <div className="timeline-event-meta">
              <span className={`geo-badge ${meta.badgeClass}`}>
                {meta.symbol} {meta.label}
              </span>
              <span className="antd-timeline-date">
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                {dataFormatada}
              </span>
            </div>
          </div>
          <Typography.Paragraph type="secondary" className="antd-timeline-desc">
            {evt.descricao}
          </Typography.Paragraph>
        </motion.div>
      )
    };
  };

  // Composição estatística dos eventos da conta para o Donut
  const mixEventosDonut = useMemo(() => {
    const evts = clienteSelecionado?.eventos || [];
    const total = evts.length;
    if (!total) return [];

    const grupos = {
      positivos: {
        name: 'Sucesso & Operação',
        value: 0,
        color: themeTokens.statusSuccess
      },
      comerciais: {
        name: 'Comercial & Suporte',
        value: 0,
        color: themeTokens.brandPrimary
      },
      alertas: {
        name: 'Alertas',
        value: 0,
        color: themeTokens.statusWarning
      },
      criticos: {
        name: 'Eventos Críticos',
        value: 0,
        color: themeTokens.statusCritical
      }
    };

    evts.forEach((e) => {
      if (e.categoria === 'sucesso' || e.categoria === 'operacional') {
        grupos.positivos.value += 1;
      } else if (e.categoria === 'alerta') {
        grupos.alertas.value += 1;
      } else if (e.categoria === 'critico') {
        grupos.criticos.value += 1;
      } else {
        grupos.comerciais.value += 1;
      }
    });

    return Object.values(grupos)
      .filter((g) => g.value > 0)
      .map((g) => ({
        ...g,
        pct: Number(((g.value / total) * 100).toFixed(1))
      }))
      .sort((a, b) => b.value - a.value);
  }, [clienteSelecionado, themeTokens]);

  if (!todosClientes.length) {
    return (
      <div className="clientes-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div>
            <span className="flat-section-eyebrow">AUDITORIA DE CONTAS B2B</span>
            <h2 className="flat-card-title" style={{ margin: 0 }}>Jornada e Monitoramento de Clientes</h2>
          </div>

        </div>

        <div className="flat-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <Empty
            description={
              <div>
                <Typography.Title level={5} style={{ color: 'var(--text-primary)', margin: '8px 0 4px' }}>
                  Nenhum cliente cadastrado no momento
                </Typography.Title>
                <Typography.Text type="secondary">
                  A API não retornou clientes para consulta.
                </Typography.Text>
              </div>
            }
          />

        </div>

      </div>
    );
  }

  if (selectedTenantId !== 'todos' && clientesVisiveis.length === 0) {
    const tenantAtual = tenants.find((t) => t.id === selectedTenantId);
    return (
      <div className="flat-card" style={{ textAlign: 'center', padding: '32px 20px' }}>
        <Empty
          description={
            <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
              A unidade <strong>{tenantAtual?.nome || selectedTenantId}</strong> não possui contas
              individuais na amostra atual.
            </span>
          }
        />
        <div style={{ marginTop: 12 }}>
          <button
            type="button"
            className="flat-action-btn"
            onClick={() => onSelectTenant('todos')}
          >
            Exibir todas as contas monitoradas
          </button>
        </div>
      </div>
    );
  }

  const statusMeta = getStatusTokens(clienteSelecionado?.statusSaude);
  const histScore = clienteSelecionado?.historicoScore || [];
  const deltaScore =
    histScore.length >= 2
      ? histScore[histScore.length - 1].score - histScore[0].score
      : 0;

  return (
    <div className="clientes-container">

      <ClientDirectory clientes={todosClientes} tenants={tenants} selectedTenantId={selectedTenantId}
        selectedClientId={clienteSelecionado?.id} themeTokens={themeTokens}
        onSelectClient={(client) => {
          setSelectedClienteId(client.id);
          requestAnimationFrame(() => {
            detailRef.current?.scrollIntoView({
              behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
              block: 'start'
            });
            detailRef.current?.focus({ preventScroll: true });
          });
        }} />

      {clienteSelecionado && (
        <React.Fragment key={clienteSelecionado.id}>
          <div className="client-detail-toolbar"><a className="flat-action-btn" href="#regional-clients-heading">Trocar cliente</a></div>
          {/* 2. FAIXA CONTÍNUA / GRID DE DADOS CONTRATUAIS E FINANCEIROS DA CONTA */}
          <section ref={detailRef} tabIndex={-1} className="account-ledger-strip" aria-label="Indicadores contratuais da conta">
            <div className="account-ledger-cell" style={{ '--cell-accent': 'var(--brand-primary, #0074FF)' }}>
              <span className="account-ledger-label">Razão Social · Código</span>
              <span className="account-ledger-val">
                {clienteSelecionado.nome}{' '}
                <span className="account-code-sub">
                  ({clienteSelecionado.id})
                </span>
              </span>
            </div>

            <div className="account-ledger-cell" style={{ '--cell-accent': 'var(--brand-cyan, #00CDE5)' }}>
              <span className="account-ledger-label">Unidade Vinculada</span>
              <span className="account-ledger-val">
                {clienteSelecionado.unidadeNome.replace('Unidade ', '')}
              </span>
            </div>

            <div className="account-ledger-cell" style={{ '--cell-accent': 'var(--brand-cyan, #00CDE5)' }}>
              <span className="account-ledger-label">Tempo de Contrato</span>
              <span className="account-ledger-val">
                {clienteSelecionado.tempoContratoMeses} meses
              </span>
            </div>

          </section>

          {/* 3. KPIs EXECUTIVOS DO CLIENTE (REUTILIZADO DA VISÃO EXECUTIVA) */}
          <ExecutiveKpiGrid
            ariaLabel="Indicadores do cliente selecionado"
            metrics={[
              {
                title: 'Score de saúde',
                rawValue: clienteSelecionado.scoreSaudeAtual,
                isPercent: false,
                note: clienteSelecionado.scoreSaudeAtual >= 70 ? 'Saudável' : clienteSelecionado.scoreSaudeAtual >= 40 ? 'Mediano' : 'Crítico',
                tone: clienteSelecionado.scoreSaudeAtual >= 70 ? 'positive' : clienteSelecionado.scoreSaudeAtual >= 40 ? 'warning' : 'negative'
              },
              {
                title: 'Variação (6m)',
                tone: 'trend',
                displayValue: `${deltaScore > 0 ? '+' : ''}${deltaScore} pts`,
                trend: deltaScore,
                note: 'vs. início da série',
                color: deltaScore > 0 ? themeTokens.statusSuccess : deltaScore < 0 ? themeTokens.statusCritical : themeTokens.textMuted
              },
              {
                title: 'Eventos na jornada',
                rawValue: (clienteSelecionado.eventos || []).length,
                isPercent: false,
                note: 'registros auditados',
                color: themeTokens.brandCyan
              },
              {
                title: 'Ticket médio mensal',
                displayValue: clienteSelecionado.ticketMedioMensal || '—',
                note: (clienteSelecionado.unidadeNome || '').replace('Unidade ', ''),
                color: themeTokens.brandPrimary
              }
            ]}
          />

          {/* 4. WORKSPACE ANALÍTICO EM 2 COLUNAS: GRÁFICOS À ESQUERDA + TIMELINE À DIREITA */}
          <div className="client-Workspace-grid">
            <div className="client-left-stack">
              {/* Evolução do Score */}
              <ExecutivePanel className="flat-card" delay={0.08} aria-labelledby="score-trend-heading">
                <div className="flat-card-header">
                  <h2 id="score-trend-heading" className="flat-card-title">
                    Evolução do Score de Saúde (6m)
                  </h2>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                    Meta Saudável: &ge; 70 pts
                  </span>
                </div>

                <div
                  ref={scoreChartReset.containerRef}
                  style={{ height: isMobile ? 190 : 210, width: '100%' }}
                  {...scoreChartReset.interactionProps}
                >
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <LineChart
                      accessibilityLayer
                      data={histScore}
                      margin={{ top: 8, right: 16, left: -22, bottom: 0 }}
                    >
                      <CartesianGrid vertical={false} strokeDasharray="2 2" stroke={themeTokens.chartGrid} />
                      <XAxis
                        dataKey="periodo"
                        stroke={themeTokens.chartAxis}
                        tick={{ fontSize: 12, fill: themeTokens.chartAxis }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        stroke={themeTokens.chartAxis}
                        tick={{ fontSize: 12, fill: themeTokens.chartAxis }}
                      />
                      <ReferenceLine
                        y={70}
                        stroke={themeTokens.statusSuccess}
                        strokeDasharray="4 4"
                        strokeWidth={1.5}
                        label={{ value: 'Saudável (≥70)', position: 'insideTopRight', fill: themeTokens.statusSuccessText, fontSize: 10, fontWeight: 600 }}
                      />
                      <ReferenceLine
                        y={40}
                        stroke={themeTokens.statusCritical}
                        strokeDasharray="3 3"
                        strokeWidth={1.5}
                        label={{ value: 'Crítico (<40)', position: 'insideBottomRight', fill: themeTokens.statusCriticalText, fontSize: 10, fontWeight: 600 }}
                      />
                      <RechartsTooltip
                        {...scoreChartReset.tooltipProps}
                        isAnimationActive={false}
                        wrapperStyle={{ zIndex: 100, pointerEvents: 'none' }}
                        cursor={{ stroke: statusMeta.color, strokeWidth: 1.5, strokeDasharray: '4 4' }}
                        content={
                          <ExecutiveChartTooltip
                            anchorRef={scoreChartReset.containerRef}
                            valueFormatter={(val) => [`${Number(val).toLocaleString('pt-BR')} pts`, 'Score']}
                          />
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        name="Score"
                        stroke={statusMeta.color}
                        strokeWidth={2.5}
                        dot={{ r: 5, fill: statusMeta.color, strokeWidth: 2, stroke: themeTokens.bgSurface }}
                        activeDot={scoreChartReset.tooltipProps.active === false ? false : { ...activeChartDot, fill: statusMeta.color }}
                        {...chartMotion}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ExecutivePanel>

              {/* Donut de Perfil de Eventos da Conta */}
              <ExecutivePanel className="flat-card" delay={0.14} aria-labelledby="events-mix-heading">
                <div className="flat-card-header">
                  <h2 id="events-mix-heading" className="flat-card-title">
                    Perfil de Interações da Conta
                  </h2>
                  <span className="tabular-nums" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {clienteSelecionado.eventos?.length || 0} eventos
                  </span>
                </div>

                <div className="regional-donut-layout">
                  <div
                    ref={eventosDonutReset.containerRef}
                    className="regional-donut-box"
                    style={{ width: 150, height: 150 }}
                    {...eventosDonutReset.interactionProps}
                  >
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <PieChart accessibilityLayer={false}>
                        <Pie
                          data={mixEventosDonut}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={0}
                          outerRadius={62}
                          startAngle={90}
                          endAngle={-270}
                          paddingAngle={0}
                          stroke={themeTokens.bgSurface}
                          strokeWidth={2}
                          shape={pieSliceRenderer}
                          activeShape={pieSliceRenderer}
                          onClick={(_, idx) => setActivePieSlice(prev => (prev === idx ? -1 : idx))}
                          {...chartMotion}
                        >
                          {mixEventosDonut.map((entry, idx) => (
                            <Cell
                              key={entry.name}
                              fill={entry.color}
                              cursor="pointer"
                              opacity={activePieSlice === -1 || activePieSlice === idx ? 1 : (themeTokens?.mode === 'dark' ? 0.65 : 0.35)}
                            />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          {...eventosDonutReset.tooltipProps}
                          isAnimationActive={false}
                          wrapperStyle={{ zIndex: 100, pointerEvents: 'none' }}
                          content={
                            <ExecutiveChartTooltip
                              anchorRef={eventosDonutReset.containerRef}
                              valueFormatter={(val, name, props) => [
                                `${formatarNumero(val)} eventos (${formatarPercentual(props.payload.pct)})`,
                                name
                              ]}
                            />
                          }
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <table className="regional-share-table">
                    <thead>
                      <tr>
                        <th>Natureza</th>
                        <th className="num-col">Qtd</th>
                        <th className="num-col">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mixEventosDonut.map((item, index) => (
                        <tr key={item.name}>
                          <td>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                              <span
                                className="geo-dot"
                                style={{ backgroundColor: item.color }}
                                aria-hidden="true"
                              />
                              <button type="button" className="chart-legend-button"
                                aria-pressed={activePieSlice === index}
                                aria-label={`${item.name}: ${formatarNumero(item.value)} eventos, ${formatarPercentual(item.pct)}`}
                                onClick={() => setActivePieSlice(prev => prev === index ? -1 : index)}>{item.name}</button>
                            </span>
                          </td>
                          <td className="num-col">{item.value}</td>
                          <td className="num-col" style={{ fontWeight: 700 }}>
                            {formatarPercentual(item.pct)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ExecutivePanel>
            </div>

            {/* Direita: Linha do Tempo Cronológica Oficial Ant Design (Timeline - Sprint 2) */}
            <ExecutivePanel className="flat-card" delay={0.2} aria-labelledby="timeline-heading">
              <div className="flat-card-header">
                <div>
                  <span className="flat-section-eyebrow">HISTÓRICO DE EVENTOS B2B</span>
                  <h2 id="timeline-heading" className="flat-card-title">
                    Histórico Cronológico de Eventos
                  </h2>
                </div>

                <SegmentedPill
                  size="sm"
                  ariaLabel="Filtrar eventos por categoria"
                  value={filtroCategoriaEvento}
                  onChange={setFiltroCategoriaEvento}
                  options={[
                    { value: 'todos', label: 'Todos' },
                    { value: 'sucesso', label: 'Sucesso' },
                    { value: 'comercial', label: 'Comercial' },
                    { value: 'alerta', label: 'Alertas' },
                    { value: 'critico', label: 'Críticos' }
                  ]}
                />
              </div>

              {eventosOrdenados.length === 0 ? (
                <div style={{ padding: '24px 0' }}>
                  <Empty description="Nenhum evento registrado para esta categoria." />
                </div>
              ) : (
                <div className="custom-timeline-container">
                  <Timeline
                    items={eventosOrdenados.map(getTimelineItemProps)}
                    className="antd-events-timeline"
                  />
                </div>
              )}
            </ExecutivePanel>
          </div>
        </React.Fragment>
      )}

    </div>
  );
}
