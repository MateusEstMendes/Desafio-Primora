import React, { useState, useMemo, useEffect } from 'react';
import { Radio, Empty } from 'antd';
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
import { formatarPercentual } from '../utils/metrics';
import { getRiskSemanticTokens } from '../utils/themeTokens';
import '../components/componentsCSS/HistoricoClientes.css';

export default function HistoricoClientes({
  dataset,
  isMobile = false,
  selectedTenantId = 'todos',
  onSelectTenant,
  themeTokens
}) {
  const todosClientes = dataset?.clientes || [];
  const tenants = dataset?.tenants || [];

  const clientesVisiveis = useMemo(() => {
    if (selectedTenantId === 'todos') return todosClientes;
    return todosClientes.filter((c) => c.tenantId === selectedTenantId);
  }, [todosClientes, selectedTenantId]);

  const [selectedClienteId, setSelectedClienteId] = useState(todosClientes[0]?.id || null);
  const [filtroCategoriaEvento, setFiltroCategoriaEvento] = useState('todos');

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

  const handleTabKeyDown = (e, index) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (index + 1) % todosClientes.length;
      const nextClient = todosClientes[nextIndex];
      setSelectedClienteId(nextClient.id);
      if (selectedTenantId !== 'todos' && selectedTenantId !== nextClient.tenantId) {
        onSelectTenant(nextClient.tenantId);
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (index - 1 + todosClientes.length) % todosClientes.length;
      const prevClient = todosClientes[prevIndex];
      setSelectedClienteId(prevClient.id);
      if (selectedTenantId !== 'todos' && selectedTenantId !== prevClient.tenantId) {
        onSelectTenant(prevClient.tenantId);
      }
    }
  };

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
      <div className="flat-card">
        <Empty description="Nenhum cliente cadastrado no dataset fornecido." />
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
            Exibir todas as 3 contas monitoradas
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
      {/* 1. SELETOR DIRETO DE CONTAS MONITORADAS */}
      <div className="client-tabs-bar" role="tablist" aria-label="Contas monitoradas">
        {todosClientes.map((c, idx) => {
          const active = c.id === clienteSelecionado?.id;
          const st = getStatusTokens(c.statusSaude);
          const h = c.historicoScore || [];
          const d = h.length >= 2 ? h[h.length - 1].score - h[0].score : 0;

          return (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onClick={() => {
                setSelectedClienteId(c.id);
                if (selectedTenantId !== 'todos' && selectedTenantId !== c.tenantId) {
                  onSelectTenant(c.tenantId);
                }
              }}
              onKeyDown={(e) => handleTabKeyDown(e, idx)}
              className={`client-tab-item ${active ? 'client-tab-item--active' : ''}`}
            >
              <div>
                <div className="client-tab-title-row">
                  <span className={`geo-dot ${st.dotClass}`} aria-hidden="true" />
                  <span>{c.nome}</span>
                </div>
                <span className="client-tab-subtitle">
                  {c.unidadeNome.replace('Unidade ', '')} · {c.segmento}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span
                  className="client-tab-score"
                  style={{ color: st.color }}
                >
                  {c.scoreSaudeAtual}/100
                </span>
                <span
                  className={`geo-delta ${
                    d >= 0 ? 'geo-delta--positive' : 'geo-delta--negative'
                  }`}
                >
                  {d >= 0 ? `▲ +${d}` : `▼ ${d}`} pts
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {clienteSelecionado && (
        <>
          {/* 2. FAIXA CONTÍNUA DE DADOS CONTRATUAIS E FINANCEIROS DA CONTA */}
          <section className="account-ledger-strip" aria-label="Indicadores contratuais da conta">
            <div className="account-ledger-cell">
              <span className="account-ledger-label">Razão Social · Código</span>
              <span className="account-ledger-val">
                {clienteSelecionado.nome}{' '}
                <span className="account-code-sub">
                  ({clienteSelecionado.id})
                </span>
              </span>
            </div>

            <div className="account-ledger-cell">
              <span className="account-ledger-label">Unidade Vinculada</span>
              <span className="account-ledger-val">
                {clienteSelecionado.unidadeNome.replace('Unidade ', '')}
              </span>
            </div>

            <div className="account-ledger-cell">
              <span className="account-ledger-label">Ticket Médio Mensal</span>
              <span className="account-ledger-val" style={{ color: 'var(--brand-primary)' }}>
                {clienteSelecionado.ticketMedioMensal}
              </span>
            </div>

            <div className="account-ledger-cell">
              <span className="account-ledger-label">Tempo de Contrato</span>
              <span className="account-ledger-val">
                {clienteSelecionado.tempoContratoMeses} meses
              </span>
            </div>

            <div className="account-ledger-cell">
              <span className="account-ledger-label">Score de Saúde</span>
              <span className="account-ledger-val" style={{ color: statusMeta.color }}>
                {statusMeta.symbol} {clienteSelecionado.scoreSaudeAtual} / 100 ({clienteSelecionado.statusSaude})
              </span>
            </div>

            <div className="account-ledger-cell">
              <span className="account-ledger-label">Variação (6m)</span>
              <span
                className="account-ledger-val"
                style={{
                  color: deltaScore >= 0 ? 'var(--status-success-text)' : 'var(--status-critical-text)'
                }}
              >
                {deltaScore >= 0 ? `▲ +${deltaScore} pts` : `▼ ${deltaScore} pts`}
              </span>
            </div>
          </section>

          {/* 3. WORKSPACE ANALÍTICO EM 2 COLUNAS: GRÁFICOS À ESQUERDA + TIMELINE À DIREITA */}
          <div className="client-Workspace-grid">
            <div className="client-left-stack">
              {/* Evolução do Score */}
              <section className="flat-card" aria-labelledby="score-trend-heading">
                <div className="flat-card-header">
                  <h2 id="score-trend-heading" className="flat-card-title">
                    Evolução do Score de Saúde (6m)
                  </h2>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                    Meta Saudável: &ge; 70 pts
                  </span>
                </div>

                <div style={{ height: isMobile ? 190 : 210, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={histScore}
                      margin={{ top: 8, right: 16, left: -22, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="2 2" stroke={themeTokens.chartGrid} />
                      <XAxis
                        dataKey="periodo"
                        stroke={themeTokens.chartAxis}
                        tick={{ fontSize: 11, fill: themeTokens.chartAxis }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        stroke={themeTokens.chartAxis}
                        tick={{ fontSize: 11, fill: themeTokens.chartAxis }}
                      />
                      <ReferenceLine
                        y={70}
                        stroke={themeTokens.statusSuccess}
                        strokeDasharray="3 3"
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: themeTokens.chartTooltipBg,
                          border: `1px solid ${themeTokens.chartTooltipBorder}`,
                          borderRadius: 4,
                          boxShadow: 'none',
                          color: themeTokens.textPrimary,
                          fontSize: 12
                        }}
                        formatter={(val) => [`${val} pts`, 'Score']}
                      />
                      <Line
                        type="linear"
                        dataKey="score"
                        name="Score"
                        stroke={statusMeta.color}
                        strokeWidth={2}
                        dot={{ r: 4, fill: statusMeta.color, strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: statusMeta.color, strokeWidth: 0 }}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Donut de Perfil de Eventos da Conta */}
              <section className="flat-card" aria-labelledby="events-mix-heading">
                <div className="flat-card-header">
                  <h2 id="events-mix-heading" className="flat-card-title">
                    Perfil de Interações da Conta
                  </h2>
                  <span className="tabular-nums" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {clienteSelecionado.eventos?.length || 0} eventos
                  </span>
                </div>

                <div className="regional-donut-layout">
                  <div className="regional-donut-box" style={{ width: 150, height: 150 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={mixEventosDonut}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={42}
                          outerRadius={64}
                          startAngle={90}
                          endAngle={-270}
                          paddingAngle={1}
                          stroke={themeTokens.bgSurface}
                          strokeWidth={2}
                          isAnimationActive={false}
                        >
                          {mixEventosDonut.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: themeTokens.chartTooltipBg,
                            border: `1px solid ${themeTokens.chartTooltipBorder}`,
                            borderRadius: 4,
                            boxShadow: 'none',
                            color: themeTokens.textPrimary,
                            fontSize: 12
                          }}
                          formatter={(val, name, props) => [
                            `${val} eventos (${formatarPercentual(props.payload.pct)})`,
                            name
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="donut-center-label">
                      <span className="donut-center-value" style={{ fontSize: 17 }}>
                        {clienteSelecionado.eventos?.length || 0}
                      </span>
                      <span className="donut-center-sub">Total</span>
                    </div>
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
                      {mixEventosDonut.map((item) => (
                        <tr key={item.name}>
                          <td>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                              <span
                                className="geo-dot"
                                style={{ backgroundColor: item.color }}
                                aria-hidden="true"
                              />
                              <span>{item.name}</span>
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
              </section>
            </div>

            {/* Direita: Linha do Tempo Cronológica Direta */}
            <section className="flat-card" aria-labelledby="timeline-heading">
              <div className="flat-card-header">
                <h2 id="timeline-heading" className="flat-card-title">
                  Histórico Cronológico de Eventos
                </h2>

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
                <div style={{ padding: '24px 0' }}>
                  <Empty description="Nenhum evento registrado para esta categoria." />
                </div>
              ) : (
                <div className="minimal-timeline">
                  {eventosOrdenados.map((evt) => {
                    const meta = getEventoCategoryMeta(evt.categoria);
                    const dataFormatada = dayjs(evt.data).format('DD/MM/YYYY HH:mm');

                    return (
                      <article key={evt.id} className="minimal-timeline-row">
                        <time className="minimal-timeline-time" dateTime={evt.data}>
                          {dataFormatada}
                        </time>
                        <div className="minimal-timeline-content">
                          <div className="minimal-timeline-title-row">
                            <span className="minimal-timeline-title">{evt.tipo}</span>
                            <span className={`geo-badge ${meta.badgeClass}`}>
                              {meta.symbol} {meta.label}
                            </span>
                          </div>
                          <p className="minimal-timeline-desc">{evt.descricao}</p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
