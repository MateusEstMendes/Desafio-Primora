import { useChartMotion, activeChartDot } from '../utils/chartMotion';
import React, { useId, useState } from 'react';
import { Empty } from 'antd';
import { motion } from 'motion/react';
import { RightOutlined } from '@ant-design/icons';
import { ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { calcularRiscoAbsoluto, calcularTaxaConversaoFunil, formatarNumero, formatarPercentual } from '../utils/metrics';
import { getRegionalColors, getTrendTone } from '../utils/themeTokens';
import { useChartAutoReset } from '../utils/useChartAutoReset';
import { PILL_TRANSITION } from '../components/MotionPrimitives';
import { ExecutiveKpiGrid, ExecutivePanel } from '../components/ExecutiveKpiGrid';
import ExecutiveChartTooltip, { usePieSliceRenderer } from '../components/ExecutiveChartTooltip';
import '../components/componentsCSS/VisaoGeral.css';

function Sparkline({ data, dataKey, color, label, isPercent = false, full = false, themeTokens }) {
  const chartMotion = useChartMotion();
  const gradient = useId().replace(/:/g, '');
  const { tooltipProps, containerRef, interactionProps } = useChartAutoReset(3000);
  return (
    <div
      ref={containerRef}
      className={full ? 'focus-chart' : 'reference-spark'}
      role="group"
      aria-label={label}
      {...interactionProps}
    >
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <AreaChart
          accessibilityLayer
          data={data}
          margin={full ? { top: 12, right: 16, left: -25, bottom: 0 } : { top: 7, right: 3, left: 3, bottom: 1 }}
        >
          <defs><linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.3} /><stop offset="100%" stopColor={color} stopOpacity={0.02} /></linearGradient></defs>
          {full && <CartesianGrid vertical={false} stroke={themeTokens.chartGrid} />}
          {full && <XAxis dataKey="periodo" tickFormatter={v => v.split('/')[0]} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: themeTokens.chartAxis }} />}
          <YAxis hide={!full} domain={full ? [0, 100] : ['dataMin - 3', 'dataMax + 3']} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: themeTokens.chartAxis }} />
          <Tooltip
            {...tooltipProps}
            isAnimationActive={false}
            wrapperStyle={{ zIndex: 100, pointerEvents: 'none' }}
            cursor={{ stroke: color, strokeWidth: 1.5, strokeDasharray: '3 3' }}
            content={
              <ExecutiveChartTooltip
                valueFormatter={v => [isPercent || dataKey === 'engajamento' ? formatarPercentual(v) : `${formatarNumero(v)} pts`, label]}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.mes || payload?.[0]?.payload?.periodo || ''}
              />
            }
          />
          <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} activeDot={tooltipProps.active === false ? false : { ...activeChartDot, fill: color }} fill={'url(#' + gradient + ')'} {...chartMotion} dot={full ? { r: 3, strokeWidth: 2, fill: color } : false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function VisaoGeral({ isMobile = false, dataset, selectedTenantId = 'todos', onSelectTenant, onNavigateTab, themeTokens, onOpenClient }) {
  const chartMotion = useChartMotion();
  const [period, setPeriod] = useState(3);
  const donutReset = useChartAutoReset(3000);
  const pieSliceRenderer = usePieSliceRenderer(selectedTenantId, donutReset.tooltipProps.active === false);
  const tenants = dataset?.tenants || [];
  const selected = tenants.filter(t => selectedTenantId === 'todos' || t.id === selectedTenantId);
  if (!selected.length) return <Empty description="Nenhuma unidade encontrada." />;
  const total = selected.reduce((sum, t) => sum + t.carteiraTotalClientes, 0);
  const risk = selected.reduce((sum, t) => sum + calcularRiscoAbsoluto(t.saudeCarteira), 0);
  const funnel = selected.reduce((sum, t) => ({ gerada: sum.gerada + t.funnel90d.gerada, vista: sum.vista + t.funnel90d.vista, sucesso: sum.sucesso + t.funnel90d.sucesso }), { gerada: 0, vista: 0, sucesso: 0 });
  const conversion = calcularTaxaConversaoFunil(funnel);
  const engagement = selected.reduce((sum, t) => sum + t.engajamentoMedio, 0) / selected.length;
  // Combina somente amostras existentes; o dataset não contém evolução da carteira.
  const history = (selected[0]?.historicoTendencia || []).map(h => {
    const amostras = selected.map(t => t.historicoTendencia.find(p => p.mes === h.mes)).filter(Boolean);
    return {
      mes: h.mes,
      engajamento: amostras.reduce((soma, ponto) => soma + ponto.engajamento, 0) / amostras.length,
      sucessoFunil: amostras.reduce((soma, ponto) => soma + ponto.sucessoFunil, 0) / amostras.length
    };
  });
  const series = history.slice(-Math.max(2, period));
  const colors = getRegionalColors(themeTokens);
  const regions = tenants.map(t => ({ ...t, value: t.carteiraTotalClientes, color: colors[t.id] }));
  const nationalTotal = regions.reduce((sum, t) => sum + t.value, 0);
  const changes = selected.map(t => {
    const points = (t.historicoTendencia || []).slice(-Math.max(2, period));
    return { ...t, points, change: points.length > 1 ? points.at(-1).engajamento - points[0].engajamento : 0 };
  }).sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 3);
  const client = (dataset.clientes || []).find(c => selectedTenantId === 'todos' || c.tenantId === selectedTenantId);
  const events = [...(client?.eventos || [])].sort((a, b) => new Date(b.data) - new Date(a.data)).slice(0, 3);
  const openClient = () => { if (onOpenClient) onOpenClient(client); else { onSelectTenant(client.tenantId); onNavigateTab('historico-clientes'); } };
  const deltaEngagement = series.length > 1
    ? Number((series.at(-1).engajamento - series[0].engajamento).toFixed(1))
    : 0;
  const metrics = [
    { title: 'Exposição a risco', rawValue: total ? (risk / total) * 100 : 0, isPercent: true, note: formatarNumero(risk) + ' contas sob risco', color: themeTokens.statusCritical, tone: 'negative' },
    { title: 'Conversão do funil', rawValue: conversion, isPercent: true, note: '90 dias · tarefas', color: themeTokens.brandCyan },
    { title: 'Engajamento médio', rawValue: engagement, isPercent: true, note: (deltaEngagement > 0 ? '+' : '') + deltaEngagement.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' p.p.', trend: deltaEngagement, color: themeTokens.brandPrimary },
    { title: 'Carteira ativa', rawValue: total, isPercent: false, note: selected.length + (selected.length === 1 ? ' regional' : ' regionais'), color: themeTokens.textSecondary }
  ];
  return <div className={`executive-dashboard${client ? '' : ' executive-dashboard--without-client'}`}>
    <div className="executive-heading">
      <h2 className="section-caption">Indicadores da operação</h2>
      <div className="period-control" role="group" aria-label="Período das tendências">
        {[{ value: 1, label: '30 dias' }, { value: 3, label: '90 dias' }, { value: 6, label: '6 meses' }].map(p => {
          const isActive = period === p.value;
          return (
            <button type="button" key={p.value} aria-pressed={isActive} onClick={() => setPeriod(p.value)}>
              {isActive && (
                <motion.span
                  layoutId="period-pill"
                  className="period-pill-bg"
                  transition={PILL_TRANSITION}
                  aria-hidden="true"
                />
              )}
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
    <ExecutiveKpiGrid metrics={metrics} ariaLabel="Indicadores executivos" />
    <ExecutivePanel className="reference-panel pulse-panel" delay={0.14} tabIndex={0} aria-labelledby="pulse-title">
      <h2 id="pulse-title">Pulso da operação</h2>
      {[
        { key: 'engajamento', label: 'Engajamento médio', value: formatarPercentual(engagement), isPercent: true, color: themeTokens.brandPrimary },
        { key: 'sucessoFunil', label: 'Conversão do funil', value: formatarPercentual(conversion), isPercent: true, color: themeTokens.brandCyan }
      ].map(row => (
        <div className="pulse-row" key={row.key} style={{ '--metric-accent': row.color }}>
          <span className="signal-label">{row.label}</span>
          <strong>{row.value}</strong>
          <Sparkline data={series} dataKey={row.key} color={row.color} label={row.label} isPercent={row.isPercent} themeTokens={themeTokens} />
        </div>
      ))}
      <p className="chart-context">Histórico de engajamento e conversão · {period === 1 ? 'Último mês vs. anterior' : 'Últimas ' + period + ' amostras mensais'} ({series[0]?.mes} a {series.at(-1)?.mes}).</p>
    </ExecutivePanel>
    <div className="reference-middle-grid">
      <section className="reference-panel territories-panel" tabIndex={0} aria-labelledby="territories-title"><h2 id="territories-title">Distribuição da carteira</h2><div className="reference-territories">
        <div
          ref={donutReset.containerRef}
          className="reference-donut"
          role="img"
          aria-label={'Distribuição da carteira: ' + formatarNumero(nationalTotal) + ' contas'}
          {...donutReset.interactionProps}
        >
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <PieChart accessibilityLayer={false}>
              <Pie
                data={regions}
                dataKey="value"
                nameKey="regiao"
                innerRadius={0}
                outerRadius="86%"
                startAngle={90}
                endAngle={-270}
                stroke={themeTokens.bgSurface}
                strokeWidth={2}
                shape={pieSliceRenderer}
                activeShape={pieSliceRenderer}
                {...chartMotion}
                onClick={entry => onSelectTenant(selectedTenantId === entry.id ? 'todos' : entry.id)}
              >
                {regions.map(t => (
                  <Cell
                    key={t.id}
                    fill={t.color}
                    cursor="pointer"
                    opacity={selectedTenantId === 'todos' || selectedTenantId === t.id ? 1 : 0.3}
                  />
                ))}
              </Pie>
              <Tooltip
                {...donutReset.tooltipProps}
                isAnimationActive={false}
                wrapperStyle={{ zIndex: 100, pointerEvents: 'none' }}
                content={
                  <ExecutiveChartTooltip
                    valueFormatter={(value, name) => [`${formatarNumero(value)} contas`, name || 'Contas']}
                  />
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="territory-list">{regions.map(t => <button type="button" key={t.id} aria-pressed={selectedTenantId === t.id} aria-label={`${t.regiao}: ${formatarNumero(t.value)} contas, ${formatarPercentual(nationalTotal ? t.value / nationalTotal * 100 : 0)}`} onClick={() => onSelectTenant(selectedTenantId === t.id ? 'todos' : t.id)}><span className="territory-dot" style={{ background: t.color }} /><span>{t.regiao}</span><strong>{formatarPercentual(nationalTotal ? t.value / nationalTotal * 100 : 0)}</strong></button>)}</div>
      </div><p className="chart-context">Total: {formatarNumero(nationalTotal)} contas · toque em uma regional para filtrar.</p></section>
      <section className="reference-panel changes-panel" tabIndex={0} aria-labelledby="changes-title"><div className="reference-panel-heading"><h2 id="changes-title">Maiores mudanças</h2><span className="period-badge">{period === 6 ? '6 meses' : period * 30 + ' dias'}</span></div>
        {changes.map(t => {
          const tone = getTrendTone(t.change);
          const color = tone === 'positive' ? themeTokens.statusSuccess : tone === 'negative' ? themeTokens.statusCritical : themeTokens.textMuted;
          return (
            <div className="change-row" key={t.id} style={{ '--metric-accent': color }}>
              <button type="button" className="signal-label" onClick={() => onSelectTenant(selectedTenantId === t.id ? 'todos' : t.id)}>{t.regiao}</button>
              <Sparkline data={t.points} dataKey="engajamento" color={color} label={t.regiao + ': engajamento'} themeTokens={themeTokens} />
              <strong className={`change-value is-${tone}`}>
                {t.change > 0 ? '+' : ''}{t.change.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}<small> p.p.</small>
              </strong>
            </div>
          );
        })}
        <p className="chart-context">Variação do engajamento no período.</p>
      </section>
    </div>
    {client && <section className="reference-panel company-panel" tabIndex={0} aria-labelledby="company-title"><button type="button" className="company-heading" onClick={openClient}><div><h2 id="company-title">Empresa em foco</h2><p>{client.nome}<span className="company-region">{tenants.find(t => t.id === client.tenantId)?.regiao}</span></p></div><span className={'mobile-focus-score ' + (client.scoreSaudeAtual >= 70 ? 'is-positive' : 'is-negative')}>{client.scoreSaudeAtual}/100</span><RightOutlined /></button>
      {!isMobile && <div className="company-details"><Sparkline data={client.historicoScore || []} dataKey="score" color={themeTokens.brandPrimary} label="Score de saúde" full themeTokens={themeTokens} /><div className="company-facts"><div className="company-metrics"><div className="score-ring" style={{ '--score': Math.min(100, Math.max(0, client.scoreSaudeAtual)) + '%' }}><strong>{client.scoreSaudeAtual}</strong></div><div><span>Score da conta</span><strong>{client.scoreSaudeAtual}/100</strong></div><div><span>Ticket médio</span><strong>{client.ticketMedioMensal}</strong></div></div><ul>{events.map(e => <li key={e.id}><span className="territory-dot" style={{ background: e.categoria === 'sucesso' ? themeTokens.statusSuccess : themeTokens.brandCyan }} /><span>{e.tipo}</span><time dateTime={e.data}>{new Date(e.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</time></li>)}</ul></div></div>}
    </section>}
  </div>;
}
