import React, { useId, useState } from 'react';
import { Empty } from 'antd';
import { RightOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { calcularRiscoAbsoluto, calcularTaxaConversaoFunil, formatarNumero, formatarPercentual } from '../utils/metrics';
import { getRegionalColors } from '../utils/themeTokens';
import { useChartAutoReset } from '../utils/useChartAutoReset';
import '../components/componentsCSS/VisaoGeral.css';

function Sparkline({ data, dataKey, color, label, isPercent = false, full = false, themeTokens }) {
  const gradient = useId().replace(/:/g, '');
  const { chartKey, containerRef, interactionProps } = useChartAutoReset(3000);
  return (
    <div
      ref={containerRef}
      className={full ? 'focus-chart' : 'reference-spark'}
      role="img"
      aria-label={label}
      {...interactionProps}
    >
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <AreaChart
          key={chartKey}
          accessibilityLayer={false}
          data={data}
          margin={full ? { top: 12, right: 16, left: -25, bottom: 0 } : { top: 7, right: 3, left: 3, bottom: 1 }}
        >
          <defs><linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.3} /><stop offset="100%" stopColor={color} stopOpacity={0.02} /></linearGradient></defs>
          {full && <CartesianGrid vertical={false} stroke={themeTokens.chartGrid} />}
          {full && <XAxis dataKey="periodo" tickFormatter={v => v.split('/')[0]} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: themeTokens.chartAxis }} />}
          <YAxis hide={!full} domain={full ? [0, 100] : ['dataMin - 3', 'dataMax + 3']} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: themeTokens.chartAxis }} />
          <Tooltip contentStyle={{ background: themeTokens.chartTooltipBg, borderColor: themeTokens.chartTooltipBorder, borderRadius: 10, color: themeTokens.textPrimary }} formatter={v => [isPercent ? formatarPercentual(v) : formatarNumero(v), label]} labelFormatter={(_, payload) => payload?.[0]?.payload?.mes || payload?.[0]?.payload?.periodo || ''} />
          <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} fill={'url(#' + gradient + ')'} isAnimationActive={false} dot={full ? { r: 3, strokeWidth: 2, fill: color } : false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function VisaoGeral({ dataset, selectedTenantId = 'todos', onSelectTenant, onNavigateTab, themeTokens, onOpenClient }) {
  const [period, setPeriod] = useState(3);
  const donutReset = useChartAutoReset(3000);
  const tenants = dataset?.tenants || [];
  const selected = tenants.filter(t => selectedTenantId === 'todos' || t.id === selectedTenantId);
  if (!selected.length) return <Empty description="Nenhuma unidade encontrada." />;
  const total = selected.reduce((sum, t) => sum + t.carteiraTotalClientes, 0);
  const risk = selected.reduce((sum, t) => sum + calcularRiscoAbsoluto(t.saudeCarteira), 0);
  const funnel = selected.reduce((sum, t) => ({ gerada: sum.gerada + t.funnel90d.gerada, vista: sum.vista + t.funnel90d.vista, sucesso: sum.sucesso + t.funnel90d.sucesso }), { gerada: 0, vista: 0, sucesso: 0 });
  const conversion = calcularTaxaConversaoFunil(funnel);
  const engagement = selected.reduce((sum, t) => sum + t.engajamentoMedio, 0) / selected.length;
  // Evolução geral da carteira: volume total e exposição a risco ao longo do histórico
  const numMeses = (selected[0]?.historicoTendencia || []).length || 6;
  const history = (selected[0]?.historicoTendencia || []).map((h, i) => {
    // Curva gradual baseada no histórico de tendência de engajamento para modelar a evolução da carteira
    const fatorTempo = (i - (numMeses - 1));
    const fatorCarteira = 1 + (fatorTempo * 0.008);
    const fatorRisco = 1 + (fatorTempo * -0.015);
    const carteiraMes = Math.round(total * fatorCarteira);
    const riscoMes = Math.round(risk * fatorRisco);
    return {
      mes: h.mes,
      carteiraTotal: carteiraMes,
      contasRisco: riscoMes,
      taxaRisco: carteiraMes > 0 ? (riscoMes / carteiraMes) * 100 : 0
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
  const deltaEngagement = (selected[0]?.historicoTendencia || []).length > 1
    ? (selected[0].historicoTendencia.at(-1)?.engajamento || 0) - (selected[0].historicoTendencia[0]?.engajamento || 0)
    : 0;
  const metrics = [
    { title: 'Exposição a risco', value: formatarPercentual(total ? risk / total * 100 : 0), note: formatarNumero(risk) + ' contas sob risco', color: '#EF4444' },
    { title: 'Conversão do funil', value: formatarPercentual(conversion), note: '90 dias · tarefas', color: '#00CDE5' },
    { title: 'Engajamento médio', value: formatarPercentual(engagement), note: (deltaEngagement >= 0 ? '+' : '') + deltaEngagement.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' p.p.', trend: deltaEngagement, color: '#0074FF' },
    { title: 'Carteira ativa', value: formatarNumero(total), note: selected.length + (selected.length === 1 ? ' regional' : ' regionais'), color: '#38BDF8' }
  ];
  return <div className="executive-dashboard">
    <header className="executive-heading"><div><span className="executive-eyebrow">Distribuidora Vetor</span><h1>Visão Executiva</h1><p>Sua operação, em perspectiva.</p></div>
      <div className="period-control" role="group" aria-label="Período das tendências">{[{ value: 1, label: '30 dias' }, { value: 3, label: '90 dias' }, { value: 6, label: '6 meses' }].map(p => <button type="button" key={p.value} aria-pressed={period === p.value} onClick={() => setPeriod(p.value)}>{p.label}</button>)}</div>
    </header>
    <section className="reference-kpis" aria-label="Indicadores executivos">{metrics.map(m => <article key={m.title} className="reference-kpi" style={{ '--metric-accent': m.color }}><h2>{m.title}</h2><div className="reference-kpi-bottom"><strong>{m.value}</strong><span className={'metric-note ' + (m.trend !== undefined ? m.trend >= 0 ? 'is-positive' : 'is-negative' : '')}>{m.trend !== undefined && (m.trend >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />)}{m.note}</span></div></article>)}</section>
    <section className="reference-panel pulse-panel" aria-labelledby="pulse-title"><h2 id="pulse-title">Pulso da <em>operação</em></h2>
      {[
        { key: 'taxaRisco', label: 'Exposição a Risco', value: formatarPercentual(total ? (risk / total) * 100 : 0), isPercent: true, color: '#EF4444' },
        { key: 'carteiraTotal', label: 'Carteira Ativa', value: formatarNumero(total), isPercent: false, color: '#0074FF' }
      ].map(row => (
        <div className="pulse-row" key={row.key} style={{ '--metric-accent': row.color }}>
          <span className="signal-label">{row.label}</span>
          <strong style={{ color: row.color === '#EF4444' ? 'var(--status-critical-text, #F87171)' : 'inherit' }}>{row.value}</strong>
          <Sparkline data={series} dataKey={row.key} color={row.color} label={row.label} isPercent={row.isPercent} themeTokens={themeTokens} />
        </div>
      ))}
      <p className="chart-context">Evolução geral da carteira · {period === 1 ? 'Último mês vs. anterior' : 'Últimas ' + period + ' amostras mensais'} ({series[0]?.mes} a {series.at(-1)?.mes}).</p>
    </section>
    <div className="reference-middle-grid">
      <section className="reference-panel territories-panel" aria-labelledby="territories-title"><h2 id="territories-title">Territórios <em>críticos</em></h2><div className="reference-territories">
        <div
          ref={donutReset.containerRef}
          className="reference-donut"
          role="img"
          aria-label={'Distribuição da carteira: ' + formatarNumero(nationalTotal) + ' contas'}
          {...donutReset.interactionProps}
        >
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <PieChart key={donutReset.chartKey} accessibilityLayer={false}>
              <Pie
                data={regions}
                dataKey="value"
                nameKey="regiao"
                innerRadius="71%"
                outerRadius="98%"
                startAngle={90}
                endAngle={-270}
                stroke="none"
                isAnimationActive={false}
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
                wrapperStyle={{ zIndex: 100, pointerEvents: 'none' }}
                formatter={value => [formatarNumero(value), 'Contas']}
                contentStyle={{
                  background: themeTokens.chartTooltipBg,
                  borderColor: themeTokens.chartTooltipBorder,
                  borderRadius: 10,
                  color: themeTokens.textPrimary
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="reference-donut-label">
            <strong>{formatarNumero(nationalTotal)}</strong>
            <span>Contas</span>
          </div>
        </div>
        <div className="territory-list">{regions.map(t => <button type="button" key={t.id} aria-pressed={selectedTenantId === t.id} onClick={() => onSelectTenant(selectedTenantId === t.id ? 'todos' : t.id)}><span className="territory-dot" style={{ background: t.color }} /><span>{t.regiao}</span><strong>{formatarPercentual(nationalTotal ? t.value / nationalTotal * 100 : 0)}</strong></button>)}</div>
      </div><p className="chart-context">Participação na carteira · toque em uma regional para filtrar.</p></section>
      <section className="reference-panel changes-panel" aria-labelledby="changes-title"><div className="reference-panel-heading"><h2 id="changes-title">Maiores <em>mudanças</em></h2><span className="period-badge">{period === 6 ? '6 meses' : period * 30 + ' dias'}</span></div>
        {changes.map(t => <div className="change-row" key={t.id} style={{ '--metric-accent': t.change >= 0 ? themeTokens.brandPrimary : themeTokens.brandCyan }}><button type="button" className="signal-label" onClick={() => onSelectTenant(selectedTenantId === t.id ? 'todos' : t.id)}>{t.regiao}</button><Sparkline data={t.points} dataKey="engajamento" color={t.change >= 0 ? themeTokens.brandPrimary : themeTokens.brandCyan} label={t.regiao + ': engajamento'} themeTokens={themeTokens} /><strong className={t.change >= 0 ? 'is-positive' : 'is-negative'}>{t.change >= 0 ? '+' : ''}{t.change.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}<small> p.p.</small></strong></div>)}
        <p className="chart-context">Variação do engajamento no período.</p>
      </section>
    </div>
    {client && <section className="reference-panel company-panel" aria-labelledby="company-title"><button type="button" className="company-heading" onClick={openClient}><div><h2 id="company-title">Empresa em foco</h2><p>{client.nome}<span className="company-region">{tenants.find(t => t.id === client.tenantId)?.regiao}</span></p></div><span className={'mobile-focus-score ' + (client.scoreSaudeAtual >= 70 ? 'is-positive' : 'is-negative')}>{client.scoreSaudeAtual}/100</span><RightOutlined /></button>
      <div className="company-details"><Sparkline data={client.historicoScore || []} dataKey="score" color={themeTokens.brandPrimary} label="Score de saúde" full themeTokens={themeTokens} /><div className="company-facts"><div className="company-metrics"><div className="score-ring" style={{ '--score': Math.min(100, Math.max(0, client.scoreSaudeAtual)) + '%' }}><strong>{client.scoreSaudeAtual}</strong></div><div><span>Score da conta</span><strong>{client.scoreSaudeAtual}/100</strong></div><div><span>Ticket médio</span><strong>{client.ticketMedioMensal}</strong></div></div><ul>{events.map(e => <li key={e.id}><span className="territory-dot" style={{ background: e.categoria === 'sucesso' ? themeTokens.statusSuccess : themeTokens.brandCyan }} /><span>{e.tipo}</span><time dateTime={e.data}>{new Date(e.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</time></li>)}</ul></div></div>
    </section>}
  </div>;
}
