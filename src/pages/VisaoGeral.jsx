import React, { useMemo } from 'react';
import { Empty } from 'antd';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import {
  calcularRiscoAbsoluto,
  calcularTaxaRiscoProporcional,
  calcularTaxaConversaoFunil,
  calcularTaxaVisualizacaoFunil,
  classificarUnidadesPorRisco,
  formatarNumero,
  formatarPercentual
} from '../utils/metrics';
import { getRiskSemanticTokens } from '../utils/themeTokens';
import FlatFunnelHealth from '../components/FlatFunnelHealth';
import '../components/componentsCSS/VisaoGeral.css';

export default function VisaoGeral({
  dataset,
  isMobile = false,
  selectedTenantId = 'todos',
  onSelectTenant,
  onNavigateTab,
  themeTokens
}) {
  const tenants = dataset?.tenants || [];
  const clientes = dataset?.clientes || [];

  const unidadesClassificadas = useMemo(
    () => classificarUnidadesPorRisco(tenants),
    [tenants]
  );

  const contasPrioritarias = useMemo(() => {
    const criticasOuRisco = clientes.filter(
      (c) => c.statusSaude === 'Crítico' || c.statusSaude === 'Risco'
    );
    return criticasOuRisco.length > 0 ? criticasOuRisco.slice(0, 5) : clientes.slice(0, 5);
  }, [clientes]);

  const selectedTenant = useMemo(() => {
    if (selectedTenantId === 'todos') return null;
    return tenants.find((t) => t.id === selectedTenantId) || null;
  }, [selectedTenantId, tenants]);

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
      const hist = selectedTenant.historicoTendencia || [];
      const deltaEngajamento =
        hist.length >= 2
          ? Number((hist[hist.length - 1].engajamento - hist[0].engajamento).toFixed(1))
          : 0;

      return {
        nome: selectedTenant.nome,
        porte: `Porte ${selectedTenant.porte}`,
        carteiraTotal: selectedTenant.carteiraTotalClientes,
        engajamento: selectedTenant.engajamentoMedio,
        deltaEngajamento,
        riscoAbsoluto,
        taxaRisco,
        saude: selectedTenant.saudeCarteira,
        funil: selectedTenant.funnel90d,
        taxaConversao,
        taxaVisualizacao,
        tendencias: hist
      };
    }

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

    const deltaEngajamento =
      tendenciasConsolidadas.length >= 2
        ? Number(
            (
              tendenciasConsolidadas[tendenciasConsolidadas.length - 1].engajamento -
              tendenciasConsolidadas[0].engajamento
            ).toFixed(1)
          )
        : 0;

    return {
      nome: 'Consolidado Nacional',
      porte: '4 Regionais',
      carteiraTotal: totalClientes,
      engajamento: Number(mediaEngajamento.toFixed(1)),
      deltaEngajamento,
      riscoAbsoluto,
      taxaRisco,
      saude: saudeConsolidada,
      funil: funilConsolidado,
      taxaConversao,
      taxaVisualizacao,
      tendencias: tendenciasConsolidadas
    };
  }, [tenants, selectedTenant]);

  if (!tenants.length || !estatisticasAgregadas) {
    return (
      <div className="flat-card">
        <Empty description="Nenhuma unidade regional encontrada no dataset." />
      </div>
    );
  }

  return (
    <div className="visao-geral-container">
      {/* BLOCO 1: FAIXA CONTÍNUA DE INDICADORES (LEDGER STRIP SEM CAIXAS REDUNDANTES) */}
      <section className="kpi-ledger-strip" aria-label="Indicadores executivos consolidados">
        <div className="kpi-ledger-cell">
          <div className="kpi-ledger-header">
            <span className="kpi-ledger-label">Carteira Ativa</span>
            {selectedTenant ? (
              <button
                type="button"
                className="flat-action-btn"
                onClick={() => onSelectTenant('todos')}
              >
                Ver Consolidado
              </button>
            ) : (
              <span className="geo-badge">{estatisticasAgregadas.porte}</span>
            )}
          </div>
          <div className="kpi-ledger-main">
            <span className="kpi-ledger-number">
              {formatarNumero(estatisticasAgregadas.carteiraTotal)}
            </span>
            <span className="kpi-unit-tag">contas</span>
          </div>
          <div className="kpi-ledger-sub">
            <span>{estatisticasAgregadas.nome}</span>
          </div>
        </div>

        <div className="kpi-ledger-cell">
          <div className="kpi-ledger-header">
            <span className="kpi-ledger-label">Exposição a Risco</span>
            <span
              className={`geo-badge ${
                estatisticasAgregadas.taxaRisco >= 20
                  ? 'geo-badge--critical'
                  : estatisticasAgregadas.taxaRisco >= 10
                  ? 'geo-badge--warning'
                  : 'geo-badge--success'
              }`}
            >
              {estatisticasAgregadas.taxaRisco >= 20
                ? '▲ Crítico'
                : estatisticasAgregadas.taxaRisco >= 10
                ? '▲ Atenção'
                : '● Estável'}
            </span>
          </div>
          <div className="kpi-ledger-main">
            <span
              className="kpi-ledger-number"
              style={{
                color:
                  estatisticasAgregadas.taxaRisco >= 20
                    ? 'var(--status-critical-text)'
                    : estatisticasAgregadas.taxaRisco >= 10
                    ? 'var(--status-warning-text)'
                    : 'var(--status-success-text)'
              }}
            >
              {formatarPercentual(estatisticasAgregadas.taxaRisco)}
            </span>
          </div>
          <div className="kpi-ledger-sub">
            <span>{formatarNumero(estatisticasAgregadas.riscoAbsoluto)} contas em risco/crítico</span>
          </div>
        </div>

        <div className="kpi-ledger-cell">
          <div className="kpi-ledger-header">
            <span className="kpi-ledger-label">Conversão Funil (90d)</span>
            <span className="geo-badge geo-badge--cyan">
              {formatarNumero(estatisticasAgregadas.funil.sucesso)}/
              {formatarNumero(estatisticasAgregadas.funil.gerada)}
            </span>
          </div>
          <div className="kpi-ledger-main">
            <span className="kpi-ledger-number" style={{ color: 'var(--brand-primary)' }}>
              {formatarPercentual(estatisticasAgregadas.taxaConversao)}
            </span>
          </div>
          <div className="kpi-ledger-sub">
            <span>Visualização: {formatarPercentual(estatisticasAgregadas.taxaVisualizacao)}</span>
          </div>
        </div>

        <div className="kpi-ledger-cell">
          <div className="kpi-ledger-header">
            <span className="kpi-ledger-label">Engajamento Médio</span>
            <span
              className={`geo-delta ${
                estatisticasAgregadas.deltaEngajamento >= 0
                  ? 'geo-delta--positive'
                  : 'geo-delta--negative'
              }`}
            >
              {estatisticasAgregadas.deltaEngajamento >= 0
                ? `▲ +${estatisticasAgregadas.deltaEngajamento}`
                : `▼ ${estatisticasAgregadas.deltaEngajamento}`}{' '}
              pts (6m)
            </span>
          </div>
          <div className="kpi-ledger-main">
            <span className="kpi-ledger-number">
              {formatarPercentual(estatisticasAgregadas.engajamento)}
            </span>
          </div>
          <div className="kpi-ledger-sub">
            <span>Meta operacional: 75,0%</span>
          </div>
        </div>
      </section>

      {/* BLOCO 2: GRÁFICO DE PIZZA (DONUT FINANCEIRO) DE SAÚDE + FUNIL COMERCIAL */}
      <FlatFunnelHealth estatisticas={estatisticasAgregadas} themeTokens={themeTokens} />

      {/* BLOCO 3: QUADRO DIRETO DE UNIDADES (ATENÇÃO VS. BENCHMARK) + TENDÊNCIA SEMESTRAL */}
      <div className="bottom-summary-grid">
        {/* Esquerda: Resumo Direto das 4 Unidades Regionais */}
        <section className="flat-card" aria-labelledby="units-summary-heading">
          <div className="flat-card-header">
            <h2 id="units-summary-heading" className="flat-card-title">
              Desempenho por Unidade Regional
            </h2>
            <button
              type="button"
              className="flat-action-btn"
              onClick={() => onNavigateTab('comparativo')}
            >
              Análise Comparativa &rarr;
            </button>
          </div>

          <table className="minimal-units-table">
            <thead>
              <tr>
                <th>Unidade</th>
                <th>Porte</th>
                <th className="num-col">Carteira</th>
                <th className="num-col">Risco Prop.</th>
                <th className="num-col">Funil</th>
                <th className="num-col">Status</th>
              </tr>
            </thead>
            <tbody>
              {unidadesClassificadas.map((u) => {
                const active = selectedTenantId === u.id;
                const sem = getRiskSemanticTokens(u.taxaRiscoProporcional, themeTokens);
                return (
                  <tr
                    key={u.id}
                    className={active ? 'row-selected' : ''}
                    tabIndex={0}
                    role="button"
                    aria-pressed={active}
                    onClick={() => onSelectTenant(active ? 'todos' : u.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectTenant(active ? 'todos' : u.id);
                      }
                    }}
                    title="Clique ou pressione Enter para filtrar esta unidade"
                  >
                    <td>
                      <span className="units-table-unit-name">
                        {u.nome.replace('Unidade ', '')}
                      </span>
                    </td>
                    <td>
                      <span className="units-table-unit-porte">{u.porte}</span>
                    </td>
                    <td className="num-col">{formatarNumero(u.carteiraTotalClientes)}</td>
                    <td className="num-col" style={{ fontWeight: 700, color: sem.color }}>
                      {formatarPercentual(u.taxaRiscoProporcional)}
                      <span className="units-table-risk-sub">
                        ({u.riscoAbsolutoCalculado})
                      </span>
                    </td>
                    <td className="num-col">{formatarPercentual(u.taxaConversaoFunil)}</td>
                    <td className="num-col">
                      <span
                        className={`geo-badge ${
                          u.taxaRiscoProporcional >= 20
                            ? 'geo-badge--critical'
                            : u.taxaRiscoProporcional >= 10
                            ? 'geo-badge--warning'
                            : 'geo-badge--success'
                        }`}
                      >
                        {sem.symbol} {sem.level}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Atalho Rápido para Contas Prioritárias (Jornada de Clientes) */}
          <div className="compact-clients-strip">
            <span className="clients-strip-label">
              Contas Prioritárias:
            </span>
            <div className="clients-strip-pills">
              {contasPrioritarias.map((c) => {
                const isCrit = c.statusSaude === 'Crítico';
                const isRisk = c.statusSaude === 'Risco';
                const dotCls = isCrit
                  ? 'geo-dot--critical'
                  : isRisk
                  ? 'geo-dot--risk'
                  : 'geo-dot--success';
                return (
                  <button
                    key={c.id}
                    type="button"
                    className="compact-client-pill"
                    onClick={() => {
                      onSelectTenant(c.tenantId);
                      onNavigateTab('historico-clientes');
                    }}
                    title={`Ver histórico de ${c.nome}`}
                  >
                    <span className={`geo-dot ${dotCls}`} aria-hidden="true" />
                    <span>{c.nome.split(' ')[0]}</span>
                    <strong>{c.scoreSaudeAtual} pts</strong>
                  </button>
                );
              })}
              <button
                type="button"
                className="flat-action-btn"
                onClick={() => onNavigateTab('historico-clientes')}
              >
                Ver todas ({clientes.length}) na Jornada &rarr;
              </button>
            </div>
          </div>
        </section>

        {/* Direita: Série Temporal Semestral */}
        <section className="flat-card" aria-labelledby="trend-chart-heading">
          <div className="flat-card-header">
            <h2 id="trend-chart-heading" className="flat-card-title">
              Evolução Semestral (6m)
            </h2>
            <span className="chart-card-subtitle">
              {selectedTenant ? selectedTenant.nome : 'Média Nacional'}
            </span>
          </div>

          <div className="chart-container-responsive" style={{ height: isMobile ? 210 : 235 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={estatisticasAgregadas.tendencias}
                margin={{ top: 8, right: 16, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="2 2" stroke={themeTokens.chartGrid} />
                <XAxis
                  dataKey="mes"
                  stroke={themeTokens.chartAxis}
                  tick={{ fontSize: 11, fill: themeTokens.chartAxis }}
                />
                <YAxis
                  domain={[0, 100]}
                  unit="%"
                  stroke={themeTokens.chartAxis}
                  tick={{ fontSize: 11, fill: themeTokens.chartAxis }}
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
                  formatter={(val, name) => [`${val}%`, name]}
                />
                <Legend
                  verticalAlign="top"
                  height={28}
                  wrapperStyle={{ fontSize: 11, fontWeight: 600 }}
                />
                <Line
                  type="linear"
                  dataKey="engajamento"
                  name="Engajamento (%)"
                  stroke={themeTokens.brandPrimary}
                  strokeWidth={2}
                  dot={{ r: 3.5, fill: themeTokens.brandPrimary, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: themeTokens.brandPrimary, strokeWidth: 0 }}
                  isAnimationActive={false}
                />
                <Line
                  type="linear"
                  dataKey="sucessoFunil"
                  name="Sucesso Funil (%)"
                  stroke={themeTokens.brandCyan}
                  strokeWidth={2}
                  dot={{ r: 3.5, fill: themeTokens.brandCyan, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: themeTokens.brandCyan, strokeWidth: 0 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
